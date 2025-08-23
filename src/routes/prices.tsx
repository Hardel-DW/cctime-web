import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/PageLayout";
import { Prices } from "@/components/Prices";

export const Route = createFileRoute("/prices")({
    component: PricesComponent
});

export function PricesComponent() {
    return (
        <PageLayout>
            <Prices />
        </PageLayout>
    );
}
