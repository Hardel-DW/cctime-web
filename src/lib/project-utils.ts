/**
 * Format project name for display
 */
export function formatProjectName(rawName: string): string {
    if (!rawName) return "Unknown Project";

    // Handle encoded paths (URL-encoded)
    let decoded = rawName;
    try {
        decoded = decodeURIComponent(rawName);
    } catch {
        // If decoding fails, use raw name
    }

    // If it's a full path, extract just the last meaningful part
    if (decoded.includes("/") || decoded.includes("\\")) {
        const parts = decoded.split(/[/\\]/);
        // Take the last non-empty part
        const lastPart = parts.filter((p) => p.length > 0).pop() || "Unknown Project";
        decoded = lastPart;
    }

    // Clean up the name
    return (
        decoded
            .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
            .replace(/\s+/g, " ") // Normalize whitespace
            .trim()
            .replace(/\b\w/g, (l) => l.toUpperCase()) || // Capitalize first letter of each word
        "Unknown Project"
    );
}

/**
 * Extract and format project name from file path
 */
export function getProjectNameFromPath(filePath: string): string {
    // Normalize path separators and split
    const normalizedPath = filePath.replace(/\\/g, "/");
    const pathParts = normalizedPath.split("/");

    // Look for "projects" in the path and take the next folder
    const projectsIndex = pathParts.findIndex((part) => part === "projects");
    if (projectsIndex !== -1 && projectsIndex + 1 < pathParts.length) {
        const rawProjectName = pathParts[projectsIndex + 1];
        return formatProjectName(rawProjectName);
    }

    // Fallback: use parent directory
    const parentDir = pathParts[pathParts.length - 2];
    if (parentDir && parentDir !== "projects") {
        return formatProjectName(parentDir);
    }

    return "Unknown Project";
}
