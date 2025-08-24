import { Github, Heart } from "lucide-react";
import type React from "react";
import { NavMain } from "@/components/layouts/sidebar/NavMain";
import { SettingsPopover } from "@/components/layouts/sidebar/SettingsPopover";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import { navigationItems } from "@/lib/data/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                <img src="/logo.svg" alt="Claude Time" className="size-8" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-base">Claude Time</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navigationItems} />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Button asChild variant="ghost" className="w-full justify-start p-2">
                            <a href=" https://github.com/sponsors/Hardel-DW" target="_blank" rel="noopener noreferrer">
                                <Heart className="size-4 animate-pulse" />
                                <span className="font-medium">Donation</span>
                            </a>
                        </Button>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a
                                href="https://github.com/Hardel-DW/ctime.hardel.io"
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
