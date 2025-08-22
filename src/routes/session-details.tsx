import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { SessionDetails } from "@/components/SessionDetails";

export const Route = createFileRoute("/session-details")({
    component: SessionDetailsComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        sessionId: (search.sessionId as string) || ""
    })
});

export function SessionDetailsComponent() {
    const { sessionId } = Route.useSearch();

    return (
        <PageLayout>
            <SessionDetails sessionId={sessionId} />
        </PageLayout>
    );
}
