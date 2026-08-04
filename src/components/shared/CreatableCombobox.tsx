import * as React from "react";
import { Plus, Loader2, Check } from "lucide-react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

export interface CategoryOption {
    id: string;
    name: string;
    color?: string | null;
    label?: string;
    value?: string;
}

interface CreatableComboboxProps {
    options: CategoryOption[];
    value: string | null; // selected category id
    onChange: (id: string | null) => void;
    onCreateNew: (name: string) => Promise<string>; // returns created ID
    placeholder?: string;
    className?: string;
}

export function CreatableCombobox({
    options,
    value,
    onChange,
    onCreateNew,
    placeholder = "Select category...",
    className,
}: CreatableComboboxProps) {
    const [inputValue, setInputValue] = React.useState("");
    const [isCreating, setIsCreating] = React.useState(false);
    const [createdOption, setCreatedOption] = React.useState<CategoryOption | null>(null);

    // Merge options with recently created option and format items for Base UI ({ label, value })
    const allOptions = React.useMemo(() => {
        const rawList =
            createdOption && !options.some((opt) => opt.id === createdOption.id)
                ? [...options, createdOption]
                : options;

        return rawList.map((opt) => ({
            ...opt,
            label: opt.name,
            value: opt.id,
        }));
    }, [options, createdOption]);

    // Find the selected CategoryOption object from allOptions using the string ID
    const selectedOption = React.useMemo(() => {
        if (!value) return null;
        return allOptions.find((opt) => opt.id === value || opt.value === value) ?? null;
    }, [allOptions, value]);

    // Check if typed text exact-matches an existing category (case-insensitive)
    const trimmedInput = inputValue.trim();
    const hasMatch = React.useMemo(() => {
        if (!trimmedInput) return true;
        return allOptions.some((opt) => opt.name.toLowerCase() === trimmedInput.toLowerCase());
    }, [allOptions, trimmedInput]);

    const showCreateOption = trimmedInput.length > 0 && !hasMatch;

    const handleCreate = async (e?: React.MouseEvent | React.KeyboardEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (!trimmedInput || isCreating) return;
        try {
            setIsCreating(true);
            const newId = await onCreateNew(trimmedInput);
            const newOpt: CategoryOption = {
                id: newId,
                name: trimmedInput,
                label: trimmedInput,
                value: newId,
            };
            setCreatedOption(newOpt);
            onChange(newId);
            setInputValue("");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Combobox
            items={allOptions}
            value={selectedOption}
            onValueChange={(selected: CategoryOption | null) => {
                onChange(selected?.id ?? selected?.value ?? null);
                setInputValue("");
            }}
            inputValue={inputValue}
            onInputValueChange={setInputValue}
            itemToStringLabel={(item: CategoryOption | null) =>
                typeof item === "string" ? item : (item?.name ?? item?.label ?? "")
            }
            itemToStringValue={(item: CategoryOption | null) =>
                typeof item === "string" ? item : (item?.id ?? item?.value ?? "")
            }
        >
            <ComboboxInput
                placeholder={placeholder}
                className={cn(
                    "h-9 text-xs placeholder:text-xs [&_input]:text-xs [&_input]:placeholder:text-xs",
                    className,
                )}
            />

            <ComboboxContent>
                <ComboboxList>
                    {(item: CategoryOption) => {
                        const isSelected = item.id === value || item.value === value;
                        return (
                            <ComboboxItem
                                key={item.id}
                                value={item}
                                className="text-xs py-1.5 px-2.5 flex items-center justify-between gap-2 cursor-pointer"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {item.color && (
                                        <span
                                            className="size-2 rounded-full shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    )}
                                    <span className="truncate text-xs">{item.name}</span>
                                </div>
                                {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                            </ComboboxItem>
                        );
                    }}
                </ComboboxList>

                {!showCreateOption && (
                    <ComboboxEmpty className="text-xs py-3 text-center text-muted-foreground">
                        No categories found.
                    </ComboboxEmpty>
                )}

                {/* Inline Create Option */}
                {showCreateOption && (
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={handleCreate}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                handleCreate(e);
                            }
                        }}
                        className="flex items-center gap-2 w-full px-2.5 py-2 text-xs font-medium text-primary hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors border-t border-border mt-0.5"
                    >
                        {isCreating ? (
                            <Loader2 className="size-3.5 animate-spin shrink-0" />
                        ) : (
                            <Plus className="size-3.5 shrink-0" />
                        )}
                        <span className="truncate text-xs">
                            {isCreating ? "Creating category..." : `Create "${trimmedInput}"`}
                        </span>
                    </div>
                )}
            </ComboboxContent>
        </Combobox>
    );
}
