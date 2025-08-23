import { Clock, Cpu, Info, Layers, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { PricingChart } from "@/components/charts/PricingChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Prices() {
    // Updated 2025 Claude API Pricing
    const models = [
        {
            name: "Claude Opus 4.1",
            version: "4.1",
            tier: "Premium",
            description: "World-class performance for the most demanding tasks",
            inputPrice: 15,
            outputPrice: 75,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        },
        {
            name: "Claude 4 Opus",
            version: "4.0",
            tier: "Premium",
            description: "Advanced reasoning and analysis for complex tasks",
            inputPrice: 15,
            outputPrice: 75,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        },
        {
            name: "Claude Sonnet 4",
            version: "4.0",
            tier: "Balanced",
            description: "Excellent balance of performance and speed",
            inputPrice: 3,
            outputPrice: 15,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        },
        {
            name: "Claude Sonnet 4 (1M Context)",
            version: "4.0-1M",
            tier: "Premium Long Context",
            description: "Extended context for processing large documents",
            inputPrice: 6,
            outputPrice: 22.5,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "1M",
            special: "Premium pricing applies to ALL tokens when >200K input tokens"
        },
        {
            name: "Claude Sonnet 3.7",
            version: "3.7",
            tier: "Balanced",
            description: "Enhanced Sonnet with improved capabilities",
            inputPrice: 3,
            outputPrice: 15,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        },
        {
            name: "Claude 3.5 Sonnet",
            version: "3.5",
            tier: "Balanced",
            description: "Strong performance with efficient processing",
            inputPrice: 3,
            outputPrice: 15,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        },
        {
            name: "Claude 3.5 Haiku",
            version: "3.5",
            tier: "Fast",
            description: "Ultra-fast responses for high-volume tasks",
            inputPrice: 0.8,
            outputPrice: 4,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        },
        {
            name: "Claude 3 Opus",
            version: "3.0",
            tier: "Premium",
            description: "Legacy premium model with strong performance",
            inputPrice: 15,
            outputPrice: 75,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        },
        {
            name: "Claude 3 Sonnet",
            version: "3.0",
            tier: "Balanced",
            description: "Legacy balanced model",
            inputPrice: 3,
            outputPrice: 15,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        },
        {
            name: "Claude 3 Haiku",
            version: "3.0",
            tier: "Fast",
            description: "Legacy fast model",
            inputPrice: 0.25,
            outputPrice: 1.25,
            cacheWriteMultiplier: 1.25,
            cacheReadMultiplier: 0.1,
            contextWindow: "200K"
        }
    ];

    const specialFeatures = [
        {
            name: "Web Search",
            price: "$10 per 1,000 searches",
            description: "Real-time web search capability",
            icon: <Zap className="h-5 w-5" />
        },
        {
            name: "Code Execution",
            price: "$0.05 per session-hour",
            description: "Sandboxed code execution environment",
            icon: <Cpu className="h-5 w-5" />
        },
        {
            name: "Batch API Discount",
            price: "50% off input & output",
            description: "Asynchronous processing discount",
            icon: <TrendingDown className="h-5 w-5" />
        }
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Claude API Pricing</h1>
                    <p className="text-muted-foreground">Complete pricing information for all Claude models and features (2025)</p>
                </div>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Pricing Update</AlertTitle>
                <AlertDescription>
                    Pricing information updated for 2025. All prices are per million tokens unless specified otherwise. Cache pricing
                    includes 25% premium for writes and 90% discount for reads.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="models" className="space-y-4">
                <TabsList className="rounded-xl bg-zinc-800">
                    <TabsTrigger value="models" className="rounded-lg">
                        Models
                    </TabsTrigger>
                    <TabsTrigger value="features" className="rounded-lg">
                        Special Features
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="models" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Model Comparison Table</CardTitle>
                            <CardDescription>Complete pricing and performance comparison for all Claude models</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead className="text-right">Input ($/MTok)</TableHead>
                                        <TableHead className="text-right">Output ($/MTok)</TableHead>
                                        <TableHead className="text-right">Cache 5m Write</TableHead>
                                        <TableHead className="text-right">Cache 1h Write</TableHead>
                                        <TableHead className="text-right">Cache Read</TableHead>
                                        <TableHead className="text-right">Context</TableHead>
                                        <TableHead>Tier</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {models.map((model) => (
                                        <TableRow key={model.name}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <div className="font-semibold">{model.name}</div>
                                                    <div className="text-xs text-muted-foreground">{model.description}</div>
                                                    {model.special && <div className="text-xs text-orange-600 mt-1">{model.special}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{model.version}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">${model.inputPrice}</TableCell>
                                            <TableCell className="text-right font-mono">${model.outputPrice}</TableCell>
                                            <TableCell className="text-right font-mono text-orange-600">
                                                ${(model.inputPrice * 1.25).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-orange-600">
                                                ${(model.inputPrice * 2).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-green-600">
                                                ${(model.inputPrice * model.cacheReadMultiplier).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">{model.contextWindow}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        model.tier === "Premium" || model.tier === "Premium Long Context"
                                                            ? "default"
                                                            : model.tier === "Balanced"
                                                                ? "secondary"
                                                                : "outline"
                                                    }>
                                                    {model.tier}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <PricingChart data={models} />
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                    <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertTitle>Long Context Pricing (Claude Sonnet 4 1M)</AlertTitle>
                        <AlertDescription>
                            Premium pricing: $6 input/$22.50 output (vs $3/$15 standard). When input exceeds 200K tokens, ALL tokens are
                            charged at premium rates. Requires Tier 4+ access and "context-1m-2025-08-07" beta flag.
                        </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-3">
                        {specialFeatures.map((feature) => (
                            <Card key={feature.name}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {feature.icon}
                                        {feature.name}
                                    </CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{feature.price}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="h-5 w-5" />
                                    Cache Write
                                </CardTitle>
                                <CardDescription>Creating new cache entries</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-500">+25%</div>
                                <p className="text-sm text-muted-foreground">Premium over base input token price</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingDown className="h-5 w-5" />
                                    Cache Read
                                </CardTitle>
                                <CardDescription>Reading from existing cache</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">-90%</div>
                                <p className="text-sm text-muted-foreground">Discount from base input token price</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Cache Duration
                                </CardTitle>
                                <CardDescription>Available cache types</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">5-minute cache</span>
                                    <Badge variant="outline">1.25x</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">1-hour cache</span>
                                    <Badge variant="outline">2x</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
