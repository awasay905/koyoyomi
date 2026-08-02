import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
    // Initialize the state directly on the first render
    const [theme, setTheme] = useState<Theme>(() => {
        // Safe check for environments that might run code during a build step
        if (typeof window === "undefined") return "light";

        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme === "dark" || savedTheme === "light") {
            return savedTheme;
        }

        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return systemPrefersDark ? "dark" : "light";
    });

    // Update DOM and LocalStorage when theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    // Since the state is initialized on render, it is always loaded.
    return { theme, setTheme, toggleTheme, isLoaded: true };
}
