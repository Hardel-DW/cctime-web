"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useFilterStore } from "@/lib/store";

export function FilterIndicator() {
    const { selectedProject, startDate, endDate } = useFilterStore();

    const hasFilters = selectedProject || startDate || endDate;

    if (!hasFilters) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filtered by:</span>

            {selectedProject && <Badge variant="secondary">Project: {selectedProject}</Badge>}

            {startDate && <Badge variant="secondary">From: {format(new Date(startDate), "MMM d, yyyy")}</Badge>}

            {endDate && <Badge variant="secondary">To: {format(new Date(endDate), "MMM d, yyyy")}</Badge>}
        </div>
    );
}
