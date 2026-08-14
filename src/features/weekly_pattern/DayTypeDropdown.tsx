import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DayType } from "@/features/day_types/types";

interface DayTypeDropdownProps {
    dayTypes: DayType[];
    value: string | null;
    onChange: (id: string) => void;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
}

export function DayTypeDropdown({
    dayTypes,
    value,
    onChange,
    placeholder = "Select template",
    disabled,
    loading,
}: DayTypeDropdownProps) {
    const selected = dayTypes.find((dt) => dt.id === value) ?? null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled || loading}
                        className="h-8 justify-between text-xs font-normal min-w-36 max-w-44 bg-background gap-2"
                    />
                }
            >
                {loading ? (
                    <span className="flex items-center gap-2 text-muted-foreground min-w-0">
                        <Loader2 data-icon="inline-start" className="animate-spin" />
                        <span className="truncate">Updating...</span>
                    </span>
                ) : (
                    <span className="flex items-center gap-2 min-w-0">
                        {selected?.color ? (
                            <span
                                className="size-2.5 rounded-full shrink-0 ring-1 ring-border/50"
                                style={{ backgroundColor: selected.color }}
                            />
                        ) : null}
                        <span className={cn("truncate", !selected && "text-muted-foreground")}>
                            {selected?.name ?? placeholder}
                        </span>
                    </span>
                )}
                <ChevronsUpDown data-icon="inline-end" className="text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                    {dayTypes.map((dt) => (
                        <DropdownMenuItem
                            key={dt.id}
                            onClick={() => onChange(dt.id)}
                            className="flex items-center justify-between"
                        >
                            <span className="flex items-center gap-2 min-w-0">
                                <span
                                    className="size-2.5 rounded-full shrink-0 ring-1 ring-border/50"
                                    style={{ backgroundColor: dt.color ?? undefined }}
                                />
                                <span className="truncate text-foreground">{dt.name}</span>
                            </span>
                            {dt.id === value && <Check data-icon="inline-end" className="text-primary shrink-0" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
