"use client";

import { CalendarDays, FolderOpen, X } from "lucide-react";
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
            {/* Clear Filters - Left side */}
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            )}

            <div className="flex items-center gap-2">
                {/* Project Filter */}
                <Select
                    value={selectedProject || "all"}
                    onValueChange={(value) => setSelectedProject(value === "all" ? null : value)}
                    onOpenChange={(open) => open && loadProjects()}>
                    <SelectTrigger className="w-[180px] h-8">
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

                {/* Start Date Filter */}
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("h-8 justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
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

                {/* End Date Filter */}
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn("h-8 justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
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
        </>
    );
}
