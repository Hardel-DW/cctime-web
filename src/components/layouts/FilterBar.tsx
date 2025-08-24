"use client";

import { CalendarDays, Filter, FolderOpen, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilterStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function FilterBar() {
    const {
        selectedProject,
        startDate,
        endDate,
        setSelectedProject,
        setStartDate,
        setEndDate,
        clearFilters,
        projects,
        isLoadingProjects,
        loadProjects
    } = useFilterStore();
    const [startDateOpen, setStartDateOpen] = React.useState(false);
    const [endDateOpen, setEndDateOpen] = React.useState(false);
    const hasActiveFilters = selectedProject || startDate || endDate;

    return (
        <>
            {/* Clear Filters - Always visible */}
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                </Button>
            )}

            {/* Desktop view - full filters */}
            <div className="hidden md:flex items-center gap-2">
                <Select
                    value={selectedProject || "all"}
                    onValueChange={(value) => setSelectedProject(value === "all" ? null : value)}
                    onOpenChange={(open) => open && loadProjects()}>
                    <SelectTrigger className="w-[180px] h-8 cursor-pointer">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            <SelectValue placeholder="All Projects" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {isLoadingProjects ? (
                            <SelectItem value="loading" disabled>
                                Loading projects...
                            </SelectItem>
                        ) : projects.length === 0 ? (
                            <SelectItem value="empty" disabled>
                                No projects found
                            </SelectItem>
                        ) : (
                            projects.map((project) => (
                                <SelectItem key={project.name} value={project.name}>
                                    {project.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>

                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("h-8 justify-start text-left font-normal cursor-pointer", !startDate && "text-muted-foreground")}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {startDate ? new Intl.DateTimeFormat("fr-FR").format(new Date(startDate)) : "Start date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={startDate ? new Date(startDate) : undefined}
                            onSelect={(date: Date | undefined) => {
                                setStartDate(date ? date.toISOString().split("T")[0] : null);
                                setStartDateOpen(false);
                            }}
                            disabled={(date: Date) => date > new Date() || (endDate ? date > new Date(endDate) : false)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("h-8 justify-start text-left font-normal cursor-pointer", !endDate && "text-muted-foreground")}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {endDate ? new Intl.DateTimeFormat("fr-FR").format(new Date(endDate)) : "End date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={endDate ? new Date(endDate) : undefined}
                            onSelect={(date: Date | undefined) => {
                                setEndDate(date ? date.toISOString().split("T")[0] : null);
                                setEndDateOpen(false);
                            }}
                            disabled={(date: Date) => date > new Date() || (startDate ? date < new Date(startDate) : false)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Mobile view - compact dropdown */}
            <div className="md:hidden">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            <Filter className="h-4 w-4" />
                            <span className="ml-2">Filters</span>
                            {hasActiveFilters && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                                    {[selectedProject, startDate, endDate].filter(Boolean).length}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="end">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="project-select" className="text-sm font-medium mb-2 block">
                                    Project
                                </label>
                                <Select
                                    value={selectedProject || "all"}
                                    onValueChange={(value) => setSelectedProject(value === "all" ? null : value)}
                                    onOpenChange={(open) => open && loadProjects()}>
                                    <SelectTrigger id="project-select" className="w-full">
                                        <div className="flex items-center gap-2">
                                            <FolderOpen className="h-4 w-4" />
                                            <SelectValue placeholder="All Projects" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Projects</SelectItem>
                                        {isLoadingProjects ? (
                                            <SelectItem value="loading" disabled>
                                                Loading projects...
                                            </SelectItem>
                                        ) : projects.length === 0 ? (
                                            <SelectItem value="empty" disabled>
                                                No projects found
                                            </SelectItem>
                                        ) : (
                                            projects.map((project) => (
                                                <SelectItem key={project.name} value={project.name}>
                                                    {project.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label htmlFor="start-date-trigger" className="text-sm font-medium mb-2 block">
                                    Start Date
                                </label>
                                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="start-date-trigger"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !startDate && "text-muted-foreground"
                                            )}>
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            {startDate ? new Intl.DateTimeFormat("fr-FR").format(new Date(startDate)) : "Select start date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate ? new Date(startDate) : undefined}
                                            onSelect={(date: Date | undefined) => {
                                                setStartDate(date ? date.toISOString().split("T")[0] : null);
                                                setStartDateOpen(false);
                                            }}
                                            disabled={(date: Date) => date > new Date() || (endDate ? date > new Date(endDate) : false)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <label htmlFor="end-date-trigger" className="text-sm font-medium mb-2 block">
                                    End Date
                                </label>
                                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="end-date-trigger"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !endDate && "text-muted-foreground"
                                            )}>
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            {endDate ? new Intl.DateTimeFormat("fr-FR").format(new Date(endDate)) : "Select end date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate ? new Date(endDate) : undefined}
                                            onSelect={(date: Date | undefined) => {
                                                setEndDate(date ? date.toISOString().split("T")[0] : null);
                                                setEndDateOpen(false);
                                            }}
                                            disabled={(date: Date) => date > new Date() || (startDate ? date < new Date(startDate) : false)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </>
    );
}
