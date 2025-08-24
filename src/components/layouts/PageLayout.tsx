import type { PropsWithChildren } from "react";
import { BackgroundPattern } from "@/components/layouts/BackgroundPattern";
import { SiteHeader } from "@/components/layouts/SiteHeader";
import { AppSidebar } from "@/components/layouts/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DonationBar } from "./DonationBar";

export function PageLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="p-1 sm:p-2 bg-sidebar">
                <div className="flex flex-1 flex-col bg-background rounded-xl overflow-hidden relative">
                    <DonationBar />
                    <BackgroundPattern />
                    <SiteHeader />
                    <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-6 relative z-10">
                        <div className="@container/main flex flex-1 flex-col">{children}</div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
