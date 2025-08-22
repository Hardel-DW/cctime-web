import type React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { SiteHeader } from "@/components/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface PageLayoutProps {
    children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)"
                } as React.CSSProperties
            }>
            <AppSidebar />
            <SidebarInset className="p-2 bg-sidebar">
                <div className="flex flex-1 flex-col bg-background rounded-xl overflow-hidden relative">
                    <BackgroundPattern />
                    <SiteHeader />
                    <div className="flex flex-1 flex-col p-6 relative z-10">
                        <div className="@container/main flex flex-1 flex-col">{children}</div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
