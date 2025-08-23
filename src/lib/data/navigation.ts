import { BarChart3, Calendar, Coins, DollarSign, Timer } from "lucide-react";
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
        title: "Sessions",
        url: "/sessions",
        icon: Timer
    },
    {
        title: "Prices",
        url: "/prices",
        icon: DollarSign
    }
];