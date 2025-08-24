import { createLazyFileRoute } from "@tanstack/react-router";
import { Clock, Info, Layers, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import { PricingChart } from "@/components/charts/prices/PricingChart";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { specialFeatures } from "@/lib/data/features";
import { claudeModels } from "@/lib/data/models";

export const Route = createLazyFileRoute("/prices")({
    component: PricesComponent
});

export function PricesComponent() {
    return (
        <PageLayout>
            <div className="space-y-6">
                <div className="@container/page space-y-3">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight @[640px]/page:text-3xl">Claude API Pricing</h1>
                        <p className="text-muted-foreground text-sm @[640px]/page:text-base">
                            <span className="hidden @[480px]/page:inline">
                                Complete pricing information for all Claude models and features (2025)
                            </span>
                            <span className="@[480px]/page:hidden">Claude models pricing (2025)</span>
                        </p>
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

                <Tabs defaultValue="models" className="@container/tabs space-y-4">
                    <div className="overflow-x-auto">
                        <TabsList className="flex min-w-max rounded-xl bg-zinc-800 @[640px]/tabs:w-full @[640px]/tabs:min-w-0 mx-auto @[640px]/tabs:mx-0">
                            <TabsTrigger value="models" className="rounded-lg whitespace-nowrap px-3 @[640px]/tabs:px-4">
                                Models
                            </TabsTrigger>
                            <TabsTrigger value="features" className="rounded-lg whitespace-nowrap px-3 @[640px]/tabs:px-4">
                                <span className="hidden @[480px]/tabs:inline">Special Features</span>
                                <span className="@[480px]/tabs:hidden">Features</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="models" className="space-y-6">
                        <Card className="@container/table">
                            <CardHeader>
                                <CardTitle>
                                    <span className="hidden @[480px]/table:inline">Model Comparison Table</span>
                                    <span className="@[480px]/table:hidden">Models</span>
                                </CardTitle>
                                <CardDescription className="hidden @[640px]/table:block">
                                    Complete pricing and performance comparison for all Claude models
                                </CardDescription>
                                <CardDescription className="@[640px]/table:hidden">Pricing comparison</CardDescription>
                            </CardHeader>
                            <CardContent className="px-2 @[640px]/table:px-6">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[200px]">Model</TableHead>
                                                <TableHead className="hidden @[480px]/table:table-cell min-w-[80px]">Version</TableHead>
                                                <TableHead className="text-right min-w-[80px]">Input</TableHead>
                                                <TableHead className="text-right min-w-[80px]">Output</TableHead>
                                                <TableHead className="text-right hidden @[640px]/table:table-cell min-w-[80px]">
                                                    5m Write
                                                </TableHead>
                                                <TableHead className="text-right hidden @[768px]/table:table-cell min-w-[80px]">
                                                    1h Write
                                                </TableHead>
                                                <TableHead className="text-right hidden @[896px]/table:table-cell min-w-[80px]">
                                                    Read
                                                </TableHead>
                                                <TableHead className="text-right hidden @[640px]/table:table-cell min-w-[80px]">
                                                    Context
                                                </TableHead>
                                                <TableHead className="min-w-[80px]">Tier</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {claudeModels.map((model) => (
                                                <TableRow key={model.name}>
                                                    <TableCell className="font-medium">
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-sm">{model.name}</div>
                                                            <div className="text-xs text-muted-foreground line-clamp-2 @[640px]/table:line-clamp-none">
                                                                {model.description}
                                                            </div>
                                                            {model.special && (
                                                                <div className="text-xs text-orange-600">{model.special}</div>
                                                            )}
                                                            <div className="@[640px]/table:hidden text-xs text-muted-foreground">
                                                                Context: {model.contextWindow}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden @[480px]/table:table-cell">
                                                        <Badge variant="outline">{model.version}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="font-mono text-sm">${model.inputPrice}</div>
                                                        <div className="@[640px]/table:hidden text-xs text-muted-foreground">
                                                            Write: ${(model.inputPrice * 1.25).toFixed(1)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="font-mono text-sm">${model.outputPrice}</div>
                                                        <div className="@[896px]/table:hidden text-xs text-green-600">
                                                            Read: ${(model.inputPrice * model.cacheReadMultiplier).toFixed(2)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-orange-600 hidden @[640px]/table:table-cell">
                                                        <div className="text-sm">${(model.inputPrice * 1.25).toFixed(2)}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-orange-600 hidden @[768px]/table:table-cell">
                                                        <div className="text-sm">${(model.inputPrice * 2).toFixed(2)}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-green-600 hidden @[896px]/table:table-cell">
                                                        <div className="text-sm">
                                                            ${(model.inputPrice * model.cacheReadMultiplier).toFixed(2)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right hidden @[640px]/table:table-cell">
                                                        {model.contextWindow}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                model.tier === "Premium" || model.tier === "Premium Long Context"
                                                                    ? "default"
                                                                    : model.tier === "Balanced"
                                                                      ? "secondary"
                                                                      : "outline"
                                                            }
                                                            className="text-xs">
                                                            <span className="hidden @[480px]/table:inline">{model.tier}</span>
                                                            <span className="@[480px]/table:hidden">
                                                                {model.tier === "Premium Long Context"
                                                                    ? "P.Long"
                                                                    : model.tier === "Premium"
                                                                      ? "Prem"
                                                                      : model.tier === "Balanced"
                                                                        ? "Bal"
                                                                        : "Fast"}
                                                            </span>
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <PricingChart data={claudeModels} />
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
                                            {feature.iconName && React.createElement(feature.iconName, { className: "h-5 w-5" })}
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
        </PageLayout>
    );
}
