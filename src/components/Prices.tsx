import { Calculator, Clock, Coins, Cpu, DollarSign, Info, Layers, TrendingDown, TrendingUp, Zap } from "lucide-react";
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
            contextWindow: "200K",
            tokensPerSecond: "15-20"
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
            contextWindow: "200K",
            tokensPerSecond: "40-50"
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
            tokensPerSecond: "30-40",
            special: "Premium pricing applies to ALL tokens when >200K input tokens"
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
            contextWindow: "200K",
            tokensPerSecond: "35-45"
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
            contextWindow: "200K",
            tokensPerSecond: "100-150"
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
            contextWindow: "200K",
            tokensPerSecond: "12-18"
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
            contextWindow: "200K",
            tokensPerSecond: "25-35"
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
            contextWindow: "200K",
            tokensPerSecond: "80-120"
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

    const pricingTiers = [
        {
            name: "Tier 1",
            monthly: "$100",
            deposit: "$5",
            rateLimit: "20 RPM, 4K tokens/min",
            description: "Entry level usage"
        },
        {
            name: "Tier 2",
            monthly: "$500",
            deposit: "$40",
            rateLimit: "40 RPM, 8K tokens/min",
            description: "Moderate usage"
        },
        {
            name: "Tier 4",
            monthly: "$5,000",
            deposit: "$400",
            rateLimit: "200 RPM, 40K tokens/min",
            description: "High volume usage"
        },
        {
            name: "Enterprise",
            monthly: "Custom",
            deposit: "Custom",
            rateLimit: "Custom limits",
            description: "Contact sales for pricing"
        }
    ];

    const calculateCachePrice = (basePrice: number, multiplier: number) => (basePrice * multiplier).toFixed(2);

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
                    <TabsTrigger value="cache" className="rounded-lg">
                        Cache Pricing
                    </TabsTrigger>
                    <TabsTrigger value="features" className="rounded-lg">
                        Special Features
                    </TabsTrigger>
                    <TabsTrigger value="tiers" className="rounded-lg">
                        Usage Tiers
                    </TabsTrigger>
                    <TabsTrigger value="calculator" className="rounded-lg">
                        Calculator
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
                                        <TableHead className="text-right">Speed (tok/s)</TableHead>
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
                                            <TableCell className="text-right font-mono">{model.tokensPerSecond}</TableCell>
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

                <TabsContent value="cache" className="space-y-6">
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Cache Pricing Examples</CardTitle>
                            <CardDescription>Cost comparison for different models with cache usage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Model</TableHead>
                                        <TableHead className="text-right">Base Input</TableHead>
                                        <TableHead className="text-right">Cache Write (+25%)</TableHead>
                                        <TableHead className="text-right">Cache Read (-90%)</TableHead>
                                        <TableHead className="text-right">Savings</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {models.slice(0, 4).map((model) => (
                                        <TableRow key={model.name}>
                                            <TableCell className="font-medium">{model.name}</TableCell>
                                            <TableCell className="text-right font-mono">${model.inputPrice}</TableCell>
                                            <TableCell className="text-right font-mono text-orange-600">
                                                ${calculateCachePrice(model.inputPrice, model.cacheWriteMultiplier)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-green-600">
                                                ${calculateCachePrice(model.inputPrice, model.cacheReadMultiplier)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-green-600">
                                                $
                                                {(
                                                    model.inputPrice -
                                                    parseFloat(calculateCachePrice(model.inputPrice, model.cacheReadMultiplier))
                                                ).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
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

                    <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertTitle>Long Context Pricing (Claude Sonnet 4 1M)</AlertTitle>
                        <AlertDescription>
                            Premium pricing: $6 input/$22.50 output (vs $3/$15 standard). When input exceeds 200K tokens, ALL tokens are
                            charged at premium rates. Requires Tier 4+ access and "context-1m-2025-08-07" beta flag.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cache Pricing Details</CardTitle>
                            <CardDescription>Comprehensive cache pricing breakdown for all models</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-medium mb-2">5-Minute Cache</h4>
                                        <p className="text-sm text-muted-foreground mb-2">Write: 1.25x base input price (+25%)</p>
                                        <p className="text-sm text-muted-foreground">Read: 0.1x base input price (-90%)</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">1-Hour Cache</h4>
                                        <p className="text-sm text-muted-foreground mb-2">Write: 2x base input price (+100%)</p>
                                        <p className="text-sm text-muted-foreground">Read: 0.1x base input price (-90%)</p>
                                    </div>
                                </div>
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Cache Stacking</AlertTitle>
                                    <AlertDescription>
                                        Cache pricing multipliers stack with long context and batch API discounts. Cache reads can save up
                                        to 90% on repeated content.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tiers" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {pricingTiers.map((tier) => (
                            <Card key={tier.name} className={tier.name === "Enterprise" ? "border-2 border-primary" : ""}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {tier.name === "Enterprise" && <DollarSign className="h-5 w-5" />}
                                        {tier.name}
                                    </CardTitle>
                                    <CardDescription>{tier.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium">Monthly Spend</p>
                                        <p className="text-xl font-bold">{tier.monthly}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Initial Deposit</p>
                                        <p className="text-lg font-semibold">{tier.deposit}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Rate Limits</p>
                                        <p className="text-sm text-muted-foreground">{tier.rateLimit}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Tier Progression</CardTitle>
                            <CardDescription>Automatic tier progression based on usage history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Automatic Progression</AlertTitle>
                                    <AlertDescription>
                                        Tiers automatically upgrade based on your usage history and deposits. Higher tiers offer increased
                                        rate limits and better support.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Key Benefits by Tier:</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>
                                            • <strong>Tier 1:</strong> Basic access, suitable for small projects
                                        </li>
                                        <li>
                                            • <strong>Tier 2:</strong> Increased limits, better for regular development
                                        </li>
                                        <li>
                                            • <strong>Tier 4:</strong> High-volume usage, production applications
                                        </li>
                                        <li>
                                            • <strong>Enterprise:</strong> Custom limits, dedicated support, SLA
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calculator" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Cost Optimization Tips
                            </CardTitle>
                            <CardDescription>Strategies to minimize your Claude API costs</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-green-600">Cost Reduction Strategies</h4>
                                    <ul className="text-sm space-y-1">
                                        <li>
                                            • Use <strong>prompt caching</strong> for repeated content (90% savings)
                                        </li>
                                        <li>
                                            • Leverage <strong>Batch API</strong> for non-urgent tasks (50% discount)
                                        </li>
                                        <li>
                                            • Choose the <strong>right model</strong> for your task complexity
                                        </li>
                                        <li>
                                            • Optimize prompts to be <strong>concise and clear</strong>
                                        </li>
                                        <li>
                                            • Use <strong>Haiku</strong> for simple, high-volume tasks
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-medium text-blue-600">Model Selection Guide</h4>
                                    <ul className="text-sm space-y-1">
                                        <li>
                                            • <strong>Haiku 3.5:</strong> Customer support, content moderation
                                        </li>
                                        <li>
                                            • <strong>Sonnet 4:</strong> Coding, analysis, writing
                                        </li>
                                        <li>
                                            • <strong>Opus 4:</strong> Research, complex reasoning
                                        </li>
                                        <li>• Start small and scale up as needed</li>
                                        <li>• Monitor usage patterns regularly</li>
                                    </ul>
                                </div>
                            </div>

                            <Alert>
                                <Coins className="h-4 w-4" />
                                <AlertTitle>Pro Tip</AlertTitle>
                                <AlertDescription>
                                    Claude's tokenizer produces ~33% more tokens than word count. Plan for 1.33 tokens per English word.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
