import type { PropsWithChildren } from "react";
import { AppSidebar } from "@/components/layouts/sidebar/AppSidebar";
import { BackgroundPattern } from "@/components/layouts/BackgroundPattern";
import { SiteHeader } from "@/components/layouts/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function PageLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
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
