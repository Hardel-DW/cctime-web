import { createFileRoute } from "@tanstack/react-router";
import { ConversationActivity } from "@/components/ConversationActivity";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/daily-activity")({
    component: DailyActivityComponent
});

export function DailyActivityComponent() {
    return (
        <PageLayout>
            <ConversationActivity />
        </PageLayout>
    );
}
