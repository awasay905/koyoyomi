import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
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
}

// Compact inline selector — used per-row in the Weekly Pattern settings screen.
export function DayTypeDropdown({
    dayTypes,
    value,
    onChange,
    placeholder = "Not set",
    disabled,
}: DayTypeDropdownProps) {
    const selected = dayTypes.find((dt) => dt.id === value) ?? null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        className="h-8 justify-between text-xs font-normal min-w-36 bg-background gap-2"
                    />
                }
            >
                <span className="flex items-center gap-2 min-w-0">
                    {selected?.color && (
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
                    )}
                    <span className={cn("truncate", !selected && "text-muted-foreground")}>
                        {selected?.name ?? placeholder}
                    </span>
                </span>
                <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {dayTypes.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">No day-types yet.</div>
                ) : (
                    dayTypes.map((dt) => (
                        <DropdownMenuItem key={dt.id} onClick={() => onChange(dt.id)} className="justify-between">
                            <span className="flex items-center gap-2 min-w-0">
                                {dt.color && (
                                    <span
                                        className="size-2 rounded-full shrink-0"
                                        style={{ backgroundColor: dt.color }}
                                    />
                                )}
                                <span className="truncate">{dt.name}</span>
                            </span>
                            {dt.id === value && <Check className="size-3.5 text-primary shrink-0" />}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
