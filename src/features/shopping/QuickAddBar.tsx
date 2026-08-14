import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldError } from "@/components/ui/field";
import { CreatableCombobox } from "@/components/shared/CreatableCombobox";

import { quickAddSchema, type QuickAddValues } from "./schemas";
import { useAddShoppingItem, useShoppingCategoriesQuery, useCreateShoppingCategory } from "./hooks";

export function QuickAddBar() {
    const addItem = useAddShoppingItem();
    const { data: categories = [] } = useShoppingCategoriesQuery();
    const createCategory = useCreateShoppingCategory();

    const form = useForm<QuickAddValues>({
        resolver: zodResolver(quickAddSchema),
        defaultValues: {
            name: "",
            quantity: "",
            category_id: null,
        },
    });

    const onSubmit = (values: QuickAddValues) => {
        addItem.mutate(
            {
                name: values.name.trim(),
                quantity: values.quantity?.trim() || null,
                category_id: values.category_id || null,
            },
            {
                onSuccess: () => {
                    form.reset({ name: "", quantity: "", category_id: values.category_id });
                },
            },
        );
    };

    return (
        <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
            <CardContent className="p-3">
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2.5">
                    <FieldGroup className="gap-2">
                        {/* Top: Name & Qty */}
                        <div className="flex items-center gap-2">
                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="flex-1 min-w-0">
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Add item (e.g., Oat Milk)..."
                                            aria-invalid={fieldState.invalid}
                                            className="h-9 text-xs"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <Field className="w-24 shrink-0">
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            id={field.name}
                                            placeholder="Qty (2L)"
                                            className="h-9 text-xs"
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Bottom: Category + Add Action */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <Controller
                                    control={form.control}
                                    name="category_id"
                                    render={({ field }) => (
                                        <CreatableCombobox
                                            options={categories}
                                            value={field.value ?? null}
                                            onChange={field.onChange}
                                            onCreateNew={(name) => createCategory.mutateAsync(name)}
                                            placeholder="Category..."
                                            className="h-9 text-xs"
                                        />
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={addItem.isPending}
                                className="h-9 px-3.5 shrink-0"
                            >
                                {addItem.isPending ? (
                                    <>
                                        <Loader2 data-icon="inline-start" className="animate-spin" />
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus data-icon="inline-start" />
                                        <span>Add</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
