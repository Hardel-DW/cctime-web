import { ChevronDown, ChevronRight, Copy, Filter } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DebugEntry {
    raw: any;
    isValid: boolean;
    error?: string;
    fileName?: string;
    lineNumber?: number;
}

interface DebugPanelProps {
    debugData: {
        validEntries: DebugEntry[];
        invalidEntries: DebugEntry[];
        parseErrors: Array<{ line: string; error: string; fileName?: string; lineNumber?: number }>;
        fileStats: Array<{ fileName: string; validCount: number; invalidCount: number; errorCount: number }>;
    };
}

export function DebugPanel({ debugData }: DebugPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "valid" | "invalid" | "errors">("all");
    const [dateFilter, setDateFilter] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    const [selectedEntry, setSelectedEntry] = useState<DebugEntry | null>(null);

    const allEntries = [...debugData.validEntries, ...debugData.invalidEntries];

    const filteredEntries = allEntries.filter((entry) => {
        if (filter === "valid" && !entry.isValid) return false;
        if (filter === "invalid" && entry.isValid) return false;

        if (dateFilter) {
            const entryDate = entry.raw.timestamp ? new Date(entry.raw.timestamp).toISOString().split("T")[0] : "";
            if (!entryDate.includes(dateFilter)) return false;
        }

        if (projectFilter) {
            const projectName = entry.raw.cwd || "";
            if (!projectName.toLowerCase().includes(projectFilter.toLowerCase())) return false;
        }

        return true;
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatJson = (obj: any) => {
        return JSON.stringify(obj, null, 2);
    };

    const totalStats = {
        valid: debugData.validEntries.length,
        invalid: debugData.invalidEntries.length,
        parseErrors: debugData.parseErrors.length,
        total: allEntries.length
    };

    return (
        <Card className="w-full">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                Debug Panel - Raw JSONL Data
                            </CardTitle>
                            <div className="flex gap-2">
                                <Badge variant="secondary">{totalStats.total} total</Badge>
                                <Badge variant="default">{totalStats.valid} valid</Badge>
                                <Badge variant="destructive">{totalStats.invalid} invalid</Badge>
                                {totalStats.parseErrors > 0 && <Badge variant="outline">{totalStats.parseErrors} errors</Badge>}
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex gap-4 items-center flex-wrap p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <Label>Filters:</Label>
                            </div>

                            <Select value={filter} onValueChange={(value: typeof filter) => setFilter(value)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All ({totalStats.total})</SelectItem>
                                    <SelectItem value="valid">Valid ({totalStats.valid})</SelectItem>
                                    <SelectItem value="invalid">Invalid ({totalStats.invalid})</SelectItem>
                                    <SelectItem value="errors">Parse Errors ({totalStats.parseErrors})</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Filter by date (2025-07-15)"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-48"
                            />

                            <Input
                                placeholder="Filter by project"
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value)}
                                className="w-48"
                            />
                        </div>

                        {/* File Statistics */}
                        {debugData.fileStats.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">File Statistics:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {debugData.fileStats.map((stat) => (
                                        <div key={stat.fileName} className="p-3 border rounded-lg">
                                            <div className="font-medium text-sm truncate" title={stat.fileName}>
                                                {stat.fileName}
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="default" className="text-xs">
                                                    {stat.validCount} valid
                                                </Badge>
                                                <Badge variant="destructive" className="text-xs">
                                                    {stat.invalidCount} invalid
                                                </Badge>
                                                {stat.errorCount > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {stat.errorCount} errors
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Parse Errors */}
                        {filter === "errors" && debugData.parseErrors.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">Parse Errors:</h3>
                                {debugData.parseErrors.map((error) => (
                                    <div key={error.line} className="p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-destructive">
                                                    {error.fileName}:{error.lineNumber}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">{error.error}</div>
                                                <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">{error.line}</pre>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(error.line)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Entries List */}
                        {filter !== "errors" && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">Entries ({filteredEntries.length} shown)</h3>
                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {filteredEntries.map((entry) => (
                                        <div
                                            key={entry.raw.timestamp}
                                            className={`p-3 border rounded-lg ${
                                                entry.isValid ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
                                            }`}>
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant={entry.isValid ? "default" : "destructive"}>
                                                            {entry.isValid ? "Valid" : "Invalid"}
                                                        </Badge>
                                                        {entry.raw.timestamp && (
                                                            <span className="text-sm text-muted-foreground">{entry.raw.timestamp}</span>
                                                        )}
                                                        {entry.fileName && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {entry.fileName}:{entry.lineNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {entry.error && (
                                                        <div className="text-sm text-destructive mb-2">Error: {entry.error}</div>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedEntry(selectedEntry === entry ? null : entry)}>
                                                        {selectedEntry === entry ? "Hide" : "Show"} JSON
                                                    </Button>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(formatJson(entry.raw))}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            {selectedEntry === entry && (
                                                <pre className="text-xs mt-3 p-3 bg-muted rounded overflow-x-auto">
                                                    {formatJson(entry.raw)}
                                                </pre>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
