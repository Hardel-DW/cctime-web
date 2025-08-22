"use client";

import { useRouter, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function NavMain({
    items
}: {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
    }[];
}) {
    const router = useRouter();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Analytics</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            tooltip={item.title}
                            isActive={currentPath === item.url}
                            onClick={() => {
                                if (item.url !== "#") {
                                    router.navigate({ to: item.url });
                                }
                            }}
                            className={item.url === "#" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
