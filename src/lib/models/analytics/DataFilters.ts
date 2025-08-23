import { ClaudeEntry } from "../core/ClaudeEntry";

export class DataFilters {
    static filterTokenEntries(
        allEntries: any[],
        selectedProject?: string | null,
        startDate?: string | null,
        endDate?: string | null
    ): any[] {
        return (allEntries || []).filter((entry) => {
            // Filter by timestamp (must have valid timestamp)
            if (!entry.timestamp) return false;

            // Filter by project
            if (selectedProject) {
                if (!entry.cwd) return false;
                const projectName = ClaudeEntry.formatProjectName(entry.cwd);
                if (projectName !== selectedProject) return false;
            }

            // Filter by date range
            if (startDate || endDate) {
                const entryDate = new Date(entry.timestamp).toISOString().split("T")[0];
                if (startDate && entryDate < startDate) return false;
                if (endDate && entryDate > endDate) return false;
            }

            return true;
        });
    }
}