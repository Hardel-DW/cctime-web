"use client";

import { BarChart3, Calendar, Coins, DollarSign, FolderOpen, Github, Timer, TrendingUp } from "lucide-react";
import type * as React from "react";

import { NavMain } from "@/components/NavMain";
import { SettingsPopover } from "@/components/SettingsPopover";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/",
            icon: BarChart3
        },
        {
            title: "Daily Activity",
            url: "/daily-activity",
            icon: Calendar
        },
        {
            title: "Token Usage",
            url: "/token-usage",
            icon: Coins
        },
        {
            title: "Projects",
            url: "#",
            icon: FolderOpen
        },
        {
            title: "Sessions",
            url: "/sessions",
            icon: Timer
        },
        {
            title: "Prices",
            url: "/prices",
            icon: DollarSign
        },
        {
            title: "Analytics",
            url: "#",
            icon: TrendingUp
        }
    ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Timer className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">CCTime</span>
                                <span className="truncate text-xs">Claude Code Analytics</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a
                                href="https://github.com/claude-code/cctime"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2">
                                <Github className="size-4" />
                                <span>GitHub</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SettingsPopover />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
