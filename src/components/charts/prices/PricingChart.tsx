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
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Model Pricing Comparison
                            <Badge variant="secondary">{data.length} models</Badge>
                        </CardTitle>
                        <CardDescription>Price comparison across all Claude models with connecting lines</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Price Type Selection */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Price Types to Display</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {priceTypes.map((priceType) => (
                            <div key={priceType.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={priceType.id}
                                    checked={selectedPriceTypes.includes(priceType.id)}
                                    onCheckedChange={() => togglePriceType(priceType.id)}
                                />
                                <label htmlFor={priceType.id} className="text-sm font-medium leading-none cursor-pointer">
                                    {priceType.label}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        X-axis: Models (ordered by tier) | Y-axis: Price ($/MTok) | Lines connect price points for each model
                    </div>
                </div>

                {/* Chart */}
                <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ left: 60, right: 60, top: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                            <XAxis
                                dataKey="modelName"
                                tick={{ fontSize: 10, fill: "var(--foreground)" }}
                                tickLine={{ stroke: "var(--border)" }}
                                axisLine={{ stroke: "var(--border)" }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "var(--foreground)" }}
                                tickLine={{ stroke: "var(--border)" }}
                                axisLine={{ stroke: "var(--border)" }}
                                domain={[0, Math.ceil(maxPrice * 1.1)]}
                                tickFormatter={(value) => `$${value}`}
                                label={{
                                    value: "Price ($/MTok)",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: "middle", fill: "var(--foreground)" }
                                }}
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
                                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                                <p className="font-semibold text-foreground">{data.fullModelName}</p>
                                                <p className="text-sm text-muted-foreground">Version: {data.version}</p>
                                                <p className="text-sm text-muted-foreground">Tier: {data.tier}</p>
                                                <p className="text-sm text-muted-foreground">Context: {data.contextWindow}</p>
                                                <div className="mt-2 space-y-1">
                                                    {payload.map((entry) => (
                                                        <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
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
                                        strokeWidth={3}
                                        dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 6 }}
                                        activeDot={{ r: 8, stroke: colors[index % colors.length], strokeWidth: 2 }}
                                        name={priceType?.label || priceTypeId}
                                    />
                                );
                            })}
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="line"
                                wrapperStyle={{ paddingTop: "20px", color: "var(--foreground)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                        <div className="text-lg font-semibold">
                            ${Math.min(...data.map((m) => m.inputPrice)).toFixed(2)} - $
                            {Math.max(...data.map((m) => m.inputPrice)).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Input price range ($/MTok)</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold">
                            ${Math.min(...data.map((m) => m.outputPrice)).toFixed(2)} - $
                            {Math.max(...data.map((m) => m.outputPrice)).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Output price range ($/MTok)</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold">
                            {selectedPriceTypes.length}/{priceTypes.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Price types shown</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold">{new Set(data.map((m) => m.tier)).size}</div>
                        <div className="text-xs text-muted-foreground">Different tiers</div>
                    </div>
                </div>

                {/* Legend */}
                <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Each line connects price points across all 8 Claude models</div>
                    <div>• Select/deselect price types to compare different pricing tiers</div>
                    <div>• Lower lines represent more cost-effective pricing</div>
                </div>
            </CardContent>
        </Card>
    );
}
