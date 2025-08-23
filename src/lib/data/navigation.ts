export interface NavItem {
    title: string;
    url: string;
    iconName: string;
}

export const navigationItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/",
        iconName: "BarChart3"
    },
    {
        title: "Daily",
        url: "/daily",
        iconName: "Calendar"
    },
    {
        title: "Token",
        url: "/token",
        iconName: "Coins"
    },
    {
        title: "Projects",
        url: "#",
        iconName: "FolderOpen"
    },
    {
        title: "Sessions",
        url: "/sessions",
        iconName: "Timer"
    },
    {
        title: "Prices",
        url: "/prices",
        iconName: "DollarSign"
    },
    {
        title: "Analytics",
        url: "#",
        iconName: "TrendingUp"
    }
];