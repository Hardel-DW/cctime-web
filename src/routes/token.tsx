import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { TokenUsage } from "@/components/TokenUsage";

export const Route = createFileRoute("/token")({
    component: TokenComponent
});

export function TokenComponent() {
    return (
        <PageLayout>
            <TokenUsage />
        </PageLayout>
    );
}
