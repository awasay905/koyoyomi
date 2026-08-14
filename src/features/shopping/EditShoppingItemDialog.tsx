import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";

import type { ShoppingItem } from "./types";
import { quickAddSchema, type QuickAddValues } from "./schemas";
import { useUpdateShoppingItem } from "./hooks";

interface EditShoppingItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: ShoppingItem | null;
}

export function EditShoppingItemDialog({ open, onOpenChange, item }: EditShoppingItemDialogProps) {
    const updateItem = useUpdateShoppingItem();

    const form = useForm<QuickAddValues>({
        resolver: zodResolver(quickAddSchema),
        defaultValues: {
            name: "",
            quantity: "",
            category_id: null,
        },
    });

    React.useEffect(() => {
        if (!open || !item) return;
        form.reset({
            name: item.name,
            quantity: item.quantity ?? "",
            category_id: item.category_id ?? null,
        });
    }, [open, item, form]);

    const onSubmit = (values: QuickAddValues) => {
        if (!item) return;
        updateItem.mutate(
            {
                id: item.id,
                name: values.name.trim(),
                quantity: values.quantity?.trim() || null,
            },
            {
                onSuccess: () => onOpenChange(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                    <DialogDescription>Update the item title or quantity.</DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-2">
                    <FieldGroup className="gap-4">
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Item Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        placeholder="e.g., Oat Milk, Coffee beans"
                                        aria-invalid={fieldState.invalid}
                                        autoFocus
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="quantity"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Quantity / Note</FieldLabel>
                                    <Input
                                        {...field}
                                        id={field.name}
                                        value={field.value ?? ""}
                                        placeholder="e.g., 2 packs, 500g"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateItem.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateItem.isPending}>
                            {updateItem.isPending ? (
                                <>
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
