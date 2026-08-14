import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
    Sunrise,
    Sun,
    Sunset,
    Moon,
    CloudSun,
    Dumbbell,
    Briefcase,
    Coffee,
    Activity,
    BookOpen,
    Utensils,
    GraduationCap,
    Laptop,
    Sparkles,
    Bed,
    Droplets,
    Car,
    AlarmClock,
    Flame,
    HeartPulse,
    Clock,
} from "lucide-react";

const CUSTOM_ICON_POOL: LucideIcon[] = [
    Dumbbell,
    Briefcase,
    Coffee,
    Activity,
    BookOpen,
    Utensils,
    GraduationCap,
    Laptop,
    Sparkles,
    Bed,
    Droplets,
    Car,
    AlarmClock,
    Flame,
    HeartPulse,
    Moon,
    Sun,
    Clock,
];

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function resolvePrayerIcon(name: string, isSystem: boolean): LucideIcon {
    const clean = (name || "").toLowerCase().trim();

    if (isSystem) {
        if (clean.includes("fajr") || clean.includes("sunrise") || clean.includes("shuruq")) return Sunrise;
        if (clean.includes("dhuhr") || clean.includes("zuhr")) return Sun;
        if (clean.includes("asr")) return CloudSun;
        if (clean.includes("maghrib")) return Sunset;
        if (clean.includes("isha")) return Moon;
        return Clock;
    }

    if (clean.includes("gym") || clean.includes("workout") || clean.includes("fit") || clean.includes("train"))
        return Dumbbell;
    if (clean.includes("work") || clean.includes("office") || clean.includes("job") || clean.includes("corp"))
        return Briefcase;
    if (clean.includes("coffee") || clean.includes("tea") || clean.includes("cafe") || clean.includes("break"))
        return Coffee;
    if (clean.includes("sleep") || clean.includes("bed") || clean.includes("rest") || clean.includes("nap")) return Bed;
    if (clean.includes("eat") || clean.includes("food") || clean.includes("dinner") || clean.includes("lunch"))
        return Utensils;
    if (clean.includes("study") || clean.includes("read") || clean.includes("book") || clean.includes("quran"))
        return BookOpen;
    if (clean.includes("code") || clean.includes("dev") || clean.includes("laptop") || clean.includes("tech"))
        return Laptop;
    if (clean.includes("med") || clean.includes("pill") || clean.includes("health") || clean.includes("doctor"))
        return HeartPulse;
    if (clean.includes("water") || clean.includes("hydrate")) return Droplets;
    if (clean.includes("drive") || clean.includes("commute") || clean.includes("car")) return Car;

    const index = hashString(clean) % CUSTOM_ICON_POOL.length;
    return CUSTOM_ICON_POOL[index] ?? Clock;
}

export function PrayerIcon({ name, isSystem, className }: { name: string; isSystem: boolean; className?: string }) {
    const icon = resolvePrayerIcon(name, isSystem);
    return React.createElement(icon, { className });
}
