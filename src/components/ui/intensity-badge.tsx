import { Badge } from "@/components/ui/badge";
import { getIntensityLevel } from "@/lib/utils";

interface IntensityBadgeProps {
    messages: number;
}

export function IntensityBadge({ messages }: IntensityBadgeProps) {
    const level = getIntensityLevel(messages);

    if (level === "high") return <Badge variant="destructive">High</Badge>;
    if (level === "medium") return <Badge variant="default">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
}
