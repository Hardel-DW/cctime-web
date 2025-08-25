import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bug, ChevronDown, ChevronRight, Copy, FileText, Filter, FolderOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DataStateWrapper } from "@/components/layouts/DataStateWrapper";
import { FilterIndicator } from "@/components/layouts/FilterIndicator";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { DataService } from "@/lib/models/DataService";
import { useFilterStore } from "@/lib/store";

export const Route = createLazyFileRoute("/debug")({
    component: DebugComponent
});

interface DebugEntry {
    raw: Record<string, unknown>;
    isValid: boolean;
    error?: string;
    fileName?: string;
    lineNumber?: number;
}

interface ParseError {
    line: string;
    error: string;
    fileName?: string;
    lineNumber?: number;
}

interface FileStats {
    fileName: string;
    validCount: number;
    invalidCount: number;
    errorCount: number;
    project: string;
    entries: DebugEntry[];
}

export function DebugComponent() {
    const { dataRefreshKey, selectedProject, startDate, endDate, directoryHandle } = useFilterStore();
    const hasDirectoryHandle = directoryHandle !== null;

    // Pagination and filtering state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [filter, setFilter] = useState<"all" | "valid" | "invalid" | "errors">("invalid");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEntry, setSelectedEntry] = useState<DebugEntry | null>(null);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
    const [fileEntryPages, setFileEntryPages] = useState<Map<string, number>>(new Map());

    const {
        data: debugData,
        isLoading,
        error
    } = useQuery({
        queryKey: ["debug-data", dataRefreshKey, selectedProject, startDate, endDate],
        queryFn: () => DataService.create(directoryHandle).loadRawDebugData(selectedProject, startDate, endDate),
        staleTime: 5 * 60 * 1000,
        enabled: hasDirectoryHandle
    });

    // Sort and filter data - prioritize invalid entries
    const filteredData = useMemo(() => {
        if (!debugData) return [];

        if (filter === "errors") {
            const errors = debugData.parseErrors;
            if (searchTerm) {
                return errors.filter(
                    (error) =>
                        error.line.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        error.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        error.error.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            return errors;
        }

        let entries: DebugEntry[] = [];
        if (filter === "all") {
            entries = [...debugData.invalidEntries, ...debugData.validEntries]; // Invalid first
        } else if (filter === "valid") {
            entries = debugData.validEntries;
        } else if (filter === "invalid") {
            entries = debugData.invalidEntries;
        }

        // Filter by search term
        if (searchTerm) {
            entries = entries.filter(
                (entry) =>
                    JSON.stringify(entry.raw).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.error?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return entries;
    }, [debugData, filter, searchTerm]);

    // Pagination
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatJson = (obj: Record<string, unknown>) => {
        return JSON.stringify(obj, null, 2);
    };

    const toggleProjectExpansion = (projectName: string) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectName)) {
            newExpanded.delete(projectName);
        } else {
            newExpanded.add(projectName);
        }
        setExpandedProjects(newExpanded);
    };

    const toggleFileExpansion = (fileName: string) => {
        const newExpanded = new Set(expandedFiles);
        if (newExpanded.has(fileName)) {
            newExpanded.delete(fileName);
        } else {
            newExpanded.add(fileName);
            // Initialize page for this file
            if (!fileEntryPages.has(fileName)) {
                setFileEntryPages(new Map(fileEntryPages.set(fileName, 1)));
            }
        }
        setExpandedFiles(newExpanded);
    };

    const setFileEntryPage = (fileName: string, page: number) => {
        setFileEntryPages(new Map(fileEntryPages.set(fileName, page)));
    };

    const renderFileEntries = (file: FileStats) => {
        const entriesPerPage = 10;
        const currentPage = fileEntryPages.get(file.fileName) || 1;
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        const paginatedEntries = file.entries.slice(startIndex, endIndex);
        const totalPages = Math.ceil(file.entries.length / entriesPerPage);

        return (
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        {file.entries.length} entries • Page {currentPage} of {totalPages}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === 1}
                                className="cursor-pointer"
                                onClick={() => setFileEntryPage(file.fileName, currentPage - 1)}>
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={currentPage === totalPages}
                                className="cursor-pointer"
                                onClick={() => setFileEntryPage(file.fileName, currentPage + 1)}>
                                Next
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    {paginatedEntries.map((entry: DebugEntry, index: number) => (
                        <div
                            key={`${file.fileName}-${entry.lineNumber}-${startIndex + index}`}
                            className="border rounded-lg overflow-hidden">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 border-0 bg-transparent text-left"
                                onClick={() => setSelectedEntry(selectedEntry === entry ? null : entry)}>
                                <div className="flex items-center gap-3">
                                    <Badge variant={entry.isValid ? "default" : "destructive"} className="text-xs">
                                        {entry.isValid ? "Valid" : "Invalid"}
                                    </Badge>
                                    <div className="text-sm">
                                        <div className="font-mono text-xs text-muted-foreground">Line {entry.lineNumber}</div>
                                        <div className="font-mono text-xs">{(entry.raw.timestamp as string) || "No timestamp"}</div>
                                    </div>
                                    {entry.error && (
                                        <div className="text-xs text-destructive max-w-xs truncate" title={entry.error}>
                                            {entry.error}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(formatJson(entry.raw));
                                        }}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                    {selectedEntry === entry ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                            </button>
                            {selectedEntry === entry && (
                                <div className="border-t bg-muted/10 p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="font-semibold text-sm">Raw JSON Data</h5>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="cursor-pointer"
                                            onClick={() => copyToClipboard(formatJson(entry.raw))}>
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copy JSON
                                        </Button>
                                    </div>
                                    <pre className="text-xs p-3 bg-background rounded border overflow-x-auto max-h-96">
                                        {formatJson(entry.raw)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (!hasDirectoryHandle) {
        return (
            <PageLayout>
                <WelcomeScreen />
            </PageLayout>
        );
    }

    const stats = debugData
        ? {
              total: debugData.validEntries.length + debugData.invalidEntries.length,
              valid: debugData.validEntries.length,
              invalid: debugData.invalidEntries.length,
              parseErrors: debugData.parseErrors.length
          }
        : { total: 0, valid: 0, invalid: 0, parseErrors: 0 };

    return (
        <PageLayout>
            <DataStateWrapper
                isLoading={isLoading}
                error={error}
                loadingMessage="Loading debug data..."
                noDirectoryIcon={<Bug className="h-12 w-12" />}
                noDirectoryMessage="Please select your Claude data directory to debug data parsing.">
                {!debugData ? null : (
                    <div className="flex flex-1 flex-col gap-6 px-6 py-6">
                        <div className="flex flex-col space-y-3">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                    <Bug className="h-8 w-8" />
                                    Debug Data Parsing
                                </h1>
                                <p className="text-muted-foreground">Analyze raw JSONL data and identify parsing issues</p>
                            </div>
                            <FilterIndicator />
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">JSONL entries found</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Valid Entries</CardTitle>
                                    <div className="h-4 w-4 rounded-full bg-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{stats.valid.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0}% of total
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Invalid Entries</CardTitle>
                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-destructive">{stats.invalid.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.total > 0 ? Math.round((stats.invalid / stats.total) * 100) : 0}% of total
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Parse Errors</CardTitle>
                                    <Bug className="h-4 w-4 text-orange-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-600">{stats.parseErrors.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">JSON parsing failures</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters and Search */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4 items-center flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <Label>Filter:</Label>
                                    </div>

                                    <Select
                                        value={filter}
                                        onValueChange={(value: typeof filter) => {
                                            setFilter(value);
                                            setCurrentPage(1);
                                        }}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="invalid">Invalid First ({stats.invalid})</SelectItem>
                                            <SelectItem value="all">All Entries ({stats.total})</SelectItem>
                                            <SelectItem value="valid">Valid Only ({stats.valid})</SelectItem>
                                            <SelectItem value="errors">Parse Errors ({stats.parseErrors})</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4" />
                                        <Input
                                            placeholder="Search in entries..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-64"
                                        />
                                    </div>

                                    <div className="ml-auto text-sm text-muted-foreground">
                                        {filteredData.length.toLocaleString()} entries found
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Data Table */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Debug Entries</CardTitle>
                                        <CardDescription>
                                            Page {currentPage} of {totalPages} • {filteredData.length.toLocaleString()} total entries
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            className="cursor-pointer"
                                            onClick={() => setCurrentPage(currentPage - 1)}>
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            className="cursor-pointer"
                                            onClick={() => setCurrentPage(currentPage + 1)}>
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filter === "errors" ? (
                                    <div className="space-y-4">
                                        {(paginatedData as ParseError[]).map((error, index) => (
                                            <div
                                                key={`${error.fileName}-${error.lineNumber}-${index}`}
                                                className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-destructive mb-1">
                                                            {error.fileName}:{error.lineNumber}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mb-2">{error.error}</div>
                                                        <pre className="text-xs p-2 bg-muted rounded overflow-x-auto">{error.line}</pre>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="cursor-pointer"
                                                        onClick={() => copyToClipboard(error.line)}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">Status</TableHead>
                                                <TableHead className="w-32">Timestamp</TableHead>
                                                <TableHead className="w-32">File</TableHead>
                                                <TableHead>Error/Details</TableHead>
                                                <TableHead className="w-24">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(paginatedData as DebugEntry[]).map((entry, index) => (
                                                <>
                                                    <TableRow key={`${entry.fileName}-${entry.lineNumber}-${index}`}>
                                                        <TableCell>
                                                            <Badge variant={entry.isValid ? "default" : "destructive"}>
                                                                {entry.isValid ? "Valid" : "Invalid"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs">
                                                            {(entry.raw.timestamp as string) || "N/A"}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {entry.fileName}:{entry.lineNumber}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {entry.error ? (
                                                                <span className="text-destructive">{entry.error}</span>
                                                            ) : (
                                                                <span className="text-green-600">Valid entry</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="cursor-pointer"
                                                                    onClick={() =>
                                                                        setSelectedEntry(selectedEntry === entry ? null : entry)
                                                                    }>
                                                                    {selectedEntry === entry ? "Hide JSON" : "Show JSON"}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="cursor-pointer"
                                                                    onClick={() => copyToClipboard(formatJson(entry.raw))}>
                                                                    <Copy className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {selectedEntry === entry && (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="bg-muted/30 p-0">
                                                                <div className="p-4">
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <h4 className="font-semibold text-sm">Raw JSON Data</h4>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="cursor-pointer"
                                                                            onClick={() => copyToClipboard(formatJson(entry.raw))}>
                                                                            <Copy className="h-3 w-3 mr-1" />
                                                                            Copy JSON
                                                                        </Button>
                                                                    </div>
                                                                    <pre className="text-xs p-3 bg-background rounded border overflow-x-auto max-h-96">
                                                                        {formatJson(entry.raw)}
                                                                    </pre>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
                                            {filteredData.length.toLocaleString()}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === 1}
                                                className="cursor-pointer"
                                                onClick={() => setCurrentPage(1)}>
                                                First
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === 1}
                                                className="cursor-pointer"
                                                onClick={() => setCurrentPage(currentPage - 1)}>
                                                Previous
                                            </Button>
                                            <span className="px-3 py-1 text-sm">
                                                {currentPage} / {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === totalPages}
                                                className="cursor-pointer"
                                                onClick={() => setCurrentPage(currentPage + 1)}>
                                                Next
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === totalPages}
                                                className="cursor-pointer"
                                                onClick={() => setCurrentPage(totalPages)}>
                                                Last
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Project Data Explorer */}
                        {debugData.projectStats && debugData.projectStats.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FolderOpen className="h-5 w-5" />
                                        Project Data Explorer
                                    </CardTitle>
                                    <CardDescription>Explore JSONL entries organized by project and file</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {debugData.projectStats.map((project) => (
                                            <Collapsible key={project.project} open={expandedProjects.has(project.project)}>
                                                <div className="border rounded-lg">
                                                    <CollapsibleTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 border-0 bg-transparent text-left"
                                                            onClick={() => toggleProjectExpansion(project.project)}>
                                                            <div className="flex items-center gap-3">
                                                                {expandedProjects.has(project.project) ? (
                                                                    <ChevronDown className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4" />
                                                                )}
                                                                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                                                <div>
                                                                    <div className="font-medium">{project.project}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {project.files.length} files
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Badge variant="default" className="text-xs">
                                                                    {project.totalValidCount} valid
                                                                </Badge>
                                                                <Badge variant="destructive" className="text-xs">
                                                                    {project.totalInvalidCount} invalid
                                                                </Badge>
                                                                {project.totalErrorCount > 0 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {project.totalErrorCount} errors
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="border-t bg-muted/20">
                                                            {project.files.map((file) => (
                                                                <Collapsible key={file.fileName} open={expandedFiles.has(file.fileName)}>
                                                                    <div className="border-b last:border-b-0">
                                                                        <CollapsibleTrigger asChild>
                                                                            <button
                                                                                type="button"
                                                                                className="w-full flex items-center justify-between p-3 pl-9 pr-3 cursor-pointer hover:bg-muted/50 border-0 bg-transparent text-left"
                                                                                onClick={() => toggleFileExpansion(file.fileName)}>
                                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                    {expandedFiles.has(file.fileName) ? (
                                                                                        <ChevronDown className="h-3 w-3" />
                                                                                    ) : (
                                                                                        <ChevronRight className="h-3 w-3" />
                                                                                    )}
                                                                                    <FileText className="h-3 w-3 text-muted-foreground" />
                                                                                    <div
                                                                                        className="font-medium text-sm truncate"
                                                                                        title={file.fileName}>
                                                                                        {file.fileName}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex gap-2 flex-shrink-0">
                                                                                    <Badge variant="default" className="text-xs">
                                                                                        {file.validCount} valid
                                                                                    </Badge>
                                                                                    <Badge variant="destructive" className="text-xs">
                                                                                        {file.invalidCount} invalid
                                                                                    </Badge>
                                                                                    {file.errorCount > 0 && (
                                                                                        <Badge variant="outline" className="text-xs">
                                                                                            {file.errorCount} errors
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </button>
                                                                        </CollapsibleTrigger>
                                                                        <CollapsibleContent>
                                                                            <div className="ml-12 p-4 bg-background/50">
                                                                                {renderFileEntries(file)}
                                                                            </div>
                                                                        </CollapsibleContent>
                                                                    </div>
                                                                </Collapsible>
                                                            ))}
                                                        </div>
                                                    </CollapsibleContent>
                                                </div>
                                            </Collapsible>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </DataStateWrapper>
        </PageLayout>
    );
}
