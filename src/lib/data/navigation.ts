import { BarChart3, Calendar, Coins, DollarSign, FolderOpen, Timer, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
    title: string;
    url: string;
    icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/",
        icon: BarChart3
    },
    {
        title: "Daily",
        url: "/daily",
        icon: Calendar
    },
    {
        title: "Token",
        url: "/token",
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
];