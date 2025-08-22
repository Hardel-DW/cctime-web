import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/")({
    component: IndexComponent
});

export function IndexComponent() {
    return (
        <PageLayout>
            <Dashboard />
        </PageLayout>
    );
}
