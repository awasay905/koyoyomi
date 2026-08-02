import { CalendarDays, List, ShoppingCart, BarChart2, Settings, CalendarCheck } from "lucide-react";

export const NAV_ITEMS = [
    { to: "/today", label: "Today", icon: CalendarCheck },
    { to: "/week", label: "Week", icon: CalendarDays },
    { to: "/backlog", label: "Backlog", icon: List },
    { to: "/shopping", label: "Shopping", icon: ShoppingCart },
    { to: "/summary", label: "Summary", icon: BarChart2 },
    { to: "/settings", label: "Settings", icon: Settings },
];
