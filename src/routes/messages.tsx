import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/messages")({
    validateSearch: (search: Record<string, unknown>) => ({
        sessionId: (search.sessionId as string) || ""
    })
});
