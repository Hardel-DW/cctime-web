import { BarChart3, Eye } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface ModelPricingData {
    name: string;
    version: string;
    tier: string;
    description: string;
    inputPrice: number;
    outputPrice: number;
    cacheWriteMultiplier: number;
    cacheReadMultiplier: number;
    contextWindow: string;
    special?: string;
}

interface PricingChartProps {
    data: ModelPricingData[];
}

export function PricingChart({ data }: PricingChartProps) {
    const [selectedPriceTypes, setSelectedPriceTypes] = useState<string[]>(["input", "output"]);

    const togglePriceType = (priceType: string) => {
        setSelectedPriceTypes((prev) => (prev.includes(priceType) ? prev.filter((type) => type !== priceType) : [...prev, priceType]));
    };

    // Price type definitions
    const priceTypes = [
        { id: "input", label: "Input Price", getValue: (model: ModelPricingData) => model.inputPrice },
        { id: "output", label: "Output Price", getValue: (model: ModelPricingData) => model.outputPrice },
        { id: "cacheWrite5m", label: "Cache Write 5m", getValue: (model: ModelPricingData) => model.inputPrice * 1.25 },
        { id: "cacheWrite1h", label: "Cache Write 1h", getValue: (model: ModelPricingData) => model.inputPrice * 2 },
        { id: "cacheRead", label: "Cache Read", getValue: (model: ModelPricingData) => model.inputPrice * model.cacheReadMultiplier }
    ];

    // Prepare chart data - each model with all price types
    const chartData = data.map((model, index) => {
        const dataPoint: any = {
            modelIndex: index,
            modelName: model.name.replace("Claude ", "").replace(" (1M Context)", " 1M"),
            fullModelName: model.name,
            tier: model.tier,
            version: model.version,
            contextWindow: model.contextWindow
        };

        priceTypes.forEach((priceType) => {
            dataPoint[priceType.id] = priceType.getValue(model);
        });

        return dataPoint;
    });

    const maxPrice = Math.max(...chartData.flatMap((item) => priceTypes.map((priceType) => item[priceType.id])));

    return (
        <Card className="@container/pricing">
            <CardHeader>
                <div className="flex flex-col gap-3 @[640px]/pricing:flex-row @[640px]/pricing:items-center @[640px]/pricing:justify-between">
                    <div>
                        <CardTitle className="flex flex-wrap items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden @[400px]/pricing:inline">Model Pricing Comparison</span>
                            <span className="@[400px]/pricing:hidden">Pricing</span>
                            <Badge variant="secondary">{data.length} models</Badge>
                        </CardTitle>
                        <CardDescription className="hidden @[640px]/pricing:block">
                            Price comparison across all Claude models with connecting lines
                        </CardDescription>
                        <CardDescription className="@[640px]/pricing:hidden">Model price comparison</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-2 @[640px]/pricing:space-y-6 @[640px]/pricing:px-6">
                {/* Price Type Selection */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                            <span className="hidden @[480px]/pricing:inline">Price Types to Display</span>
                            <span className="@[480px]/pricing:hidden">Price Types</span>
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 @[640px]/pricing:grid-cols-3 @[1024px]/pricing:flex @[1024px]/pricing:flex-wrap @[1024px]/pricing:gap-4">
                        {priceTypes.map((priceType) => (
                            <div key={priceType.id} className="flex items-center space-x-2 min-w-0">
                                <Checkbox
                                    id={priceType.id}
                                    checked={selectedPriceTypes.includes(priceType.id)}
                                    onCheckedChange={() => togglePriceType(priceType.id)}
                                    className="flex-shrink-0"
                                />
                                <label htmlFor={priceType.id} className="text-sm font-medium leading-none cursor-pointer truncate">
                                    <span className="hidden @[640px]/pricing:inline">{priceType.label}</span>
                                    <span className="@[640px]/pricing:hidden">
                                        {priceType.label.replace("Cache Write ", "Write ").replace("Cache Read", "Read")}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground hidden @[640px]/pricing:block">
                        X-axis: Models (ordered by tier) | Y-axis: Price ($/MTok) | Lines connect price points for each model
                    </div>
                </div>

                {/* Chart */}
                <div className="aspect-video h-[300px] w-full @[640px]/pricing:h-[400px] @[1024px]/pricing:h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                left: 5,
                                right: 5,
                                top: 20,
                                bottom: 60
                            }}
                            className="@[640px]/pricing:!ml-[10px] @[640px]/pricing:!mr-[10px] @[1024]/pricing:!ml-[20px] @[1024]/pricing:!mr-[20px] @[1024]/pricing:!mb-[80px]">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                            <XAxis
                                dataKey="modelName"
                                tick={{ fontSize: 9, fill: "var(--foreground)" }}
                                tickLine={{ stroke: "var(--border)" }}
                                axisLine={{ stroke: "var(--border)" }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                interval={0}
                                className="@[640px]/pricing:!text-[10px] @[1024px]/pricing:!text-[11px]"
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "var(--foreground)" }}
                                tickLine={{ stroke: "var(--border)" }}
                                axisLine={{ stroke: "var(--border)" }}
                                domain={[0, Math.ceil(maxPrice * 1.1)]}
                                tickFormatter={(value) => `$${value}`}
                                width={35}
                                label={{
                                    value: "$/MTok",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: "middle", fill: "var(--foreground)", fontSize: "9px" },
                                    className: "@[640px]/pricing:!text-[10px]"
                                }}
                                className="@[640px]/pricing:!w-[45px] @[1024px]/pricing:!w-[55px]"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    color: "var(--foreground)"
                                }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length > 0) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                                                <p className="font-semibold text-foreground text-sm">{data.fullModelName}</p>
                                                <p className="text-xs text-muted-foreground">Version: {data.version}</p>
                                                <p className="text-xs text-muted-foreground">Tier: {data.tier}</p>
                                                <p className="text-xs text-muted-foreground">Context: {data.contextWindow}</p>
                                                <div className="mt-2 space-y-1">
                                                    {payload.map((entry) => (
                                                        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
                                                            {priceTypes.find((pt) => pt.id === entry.dataKey)?.label}: ${entry.value}/MTok
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {selectedPriceTypes.map((priceTypeId, index) => {
                                const priceType = priceTypes.find((pt) => pt.id === priceTypeId);
                                const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
                                return (
                                    <Line
                                        key={priceTypeId}
                                        type="monotone"
                                        dataKey={priceTypeId}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={2}
                                        dot={{ fill: colors[index % colors.length], strokeWidth: 1, r: 4 }}
                                        activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                                        name={priceType?.label || priceTypeId}
                                        className="@[640px]/pricing:!stroke-[2.5px] @[1024px]/pricing:!stroke-[3px] @[640px]/pricing:dot:!r-[5px] @[1024px]/pricing:dot:!r-[6px] @[640px]/pricing:activeDot:!r-[7px] @[1024px]/pricing:activeDot:!r-[8px]"
                                    />
                                );
                            })}
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                iconType="line"
                                wrapperStyle={{ paddingTop: "10px", color: "var(--foreground)", fontSize: "12px" }}
                                className="@[640px]/pricing:!h-[36px] @[640px]/pricing:!pt-[20px]"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t @[640px]/pricing:grid-cols-4 @[640px]/pricing:gap-4">
                    <div className="text-center">
                        <div className="text-sm font-semibold @[640px]/pricing:text-lg">
                            ${Math.min(...data.map((m) => m.inputPrice)).toFixed(2)} - $
                            {Math.max(...data.map((m) => m.inputPrice)).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <span className="hidden @[480px]/pricing:inline">Input price range ($/MTok)</span>
                            <span className="@[480px]/pricing:hidden">Input range</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-semibold @[640px]/pricing:text-lg">
                            ${Math.min(...data.map((m) => m.outputPrice)).toFixed(2)} - $
                            {Math.max(...data.map((m) => m.outputPrice)).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <span className="hidden @[480px]/pricing:inline">Output price range ($/MTok)</span>
                            <span className="@[480px]/pricing:hidden">Output range</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-semibold @[640px]/pricing:text-lg">
                            {selectedPriceTypes.length}/{priceTypes.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <span className="hidden @[480px]/pricing:inline">Price types shown</span>
                            <span className="@[480px]/pricing:hidden">Types shown</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-semibold @[640px]/pricing:text-lg">{new Set(data.map((m) => m.tier)).size}</div>
                        <div className="text-xs text-muted-foreground">
                            <span className="hidden @[480px]/pricing:inline">Different tiers</span>
                            <span className="@[480px]/pricing:hidden">Tiers</span>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="text-xs text-muted-foreground space-y-1 hidden @[640px]/pricing:block">
                    <div>• Each line connects price points across all 8 Claude models</div>
                    <div>• Select/deselect price types to compare different pricing tiers</div>
                    <div>• Lower lines represent more cost-effective pricing</div>
                </div>
            </CardContent>
        </Card>
    );
}
