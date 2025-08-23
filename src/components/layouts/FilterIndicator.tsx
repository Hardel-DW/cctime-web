"use client";

import { Badge } from "@/components/ui/badge";
import { useFilterStore } from "@/lib/store";

export function FilterIndicator() {
    const { selectedProject, startDate, endDate } = useFilterStore();
    if (!(selectedProject || startDate || endDate)) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filtered by:</span>

            {selectedProject && <Badge variant="secondary">Project: {selectedProject}</Badge>}

            {startDate && (
                <Badge variant="secondary">
                    From:{" "}
                    {new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(startDate))}
                </Badge>
            )}

            {endDate && (
                <Badge variant="secondary">
                    To: {new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(endDate))}
                </Badge>
            )}
        </div>
    );
}
