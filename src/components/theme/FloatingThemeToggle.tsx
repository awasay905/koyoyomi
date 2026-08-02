// src/components/ThemeToggle.tsx
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
    const { theme, toggleTheme, isLoaded } = useTheme();

    // Prevent layout shifts during initialization
    if (!isLoaded) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="icon"
            // Floating classes: bottom-right corner of the viewport
            className="fixed bottom-4 right-4 h-10 w-10 rounded-full shadow-lg z-50 bg-background border border-border"
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5" />}
        </Button>
    );
}
