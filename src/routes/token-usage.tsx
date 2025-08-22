import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { TokenUsage } from "@/components/TokenUsage";

export const Route = createFileRoute("/token-usage")({
    component: TokenUsageComponent
});

export function TokenUsageComponent() {
    return (
        <PageLayout>
            <TokenUsage />
        </PageLayout>
    );
}
