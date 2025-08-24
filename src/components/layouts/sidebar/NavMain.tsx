import { Link, useRouterState } from "@tanstack/react-router";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { NavItem } from "@/lib/data/navigation";

export function NavMain({ items }: { items: NavItem[] }) {
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Analytics</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton tooltip={item.title} isActive={currentPath === item.url} asChild>
                            <Link to={item.url}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
