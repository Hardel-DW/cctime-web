import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { Sessions } from "@/components/Sessions";

export const Route = createFileRoute("/sessions")({
    component: SessionsComponent
});

export function SessionsComponent() {
    return (
        <PageLayout>
            <Sessions />
        </PageLayout>
    );
}
