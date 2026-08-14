import { Button } from "@/components/ui/button";
import type { Category } from "./hooks";

interface CategoryFilterBarProps {
    categories: Category[];
    selectedCategory: string | null;
    onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilterBar({ categories, selectedCategory, onSelectCategory }: CategoryFilterBarProps) {
    if (categories.length === 0) return null;

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectCategory(null)}
                className="h-7 text-xs rounded-full px-3 shrink-0 font-medium"
            >
                All
            </Button>

            {categories.map((cat) => (
                <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelectCategory(cat.id)}
                    className="h-7 text-xs rounded-full px-3 shrink-0 gap-1.5 font-normal"
                >
                    {cat.color && (
                        <span className="size-2 rounded-full shrink-0 ring-1 ring-border/50" style={{ backgroundColor: cat.color }} />
                    )}
                    <span>{cat.name}</span>
                </Button>
            ))}
        </div>
    );
}