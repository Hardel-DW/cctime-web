import { createFileRoute } from "@tanstack/react-router";
import { ConversationActivity } from "@/components/ConversationActivity";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/daily")({
    component: DailyComponent
});

export function DailyComponent() {
    return (
        <PageLayout>
            <ConversationActivity />
        </PageLayout>
    );
}
