import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription } from "@/components/ui/field";
import { CreatableCombobox } from "@/components/shared/CreatableCombobox";
import { quickAddSchema, type QuickAddValues } from "./schemas";
import { useAddShoppingItem, useShoppingCategoriesQuery, useCreateShoppingCategory } from "./hooks";

export function QuickAddBar() {
    const addItem = useAddShoppingItem();
    const { data: categories = [] } = useShoppingCategoriesQuery();
    const createCategory = useCreateShoppingCategory();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<QuickAddValues>({
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
                    reset({ name: "", quantity: "", category_id: values.category_id });
                },
            },
        );
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-card border border-border/80 rounded-xl p-2.5 shadow-2xs flex flex-col gap-2"
        >
            <Field data-invalid={Boolean(errors.name)} className="gap-1.5">
                <div className="flex flex-col gap-2">
                    {/* Top Row: Name & Quantity */}
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Add item (e.g., Milk)..."
                            aria-invalid={Boolean(errors.name)}
                            {...register("name")}
                            className="h-9 text-xs placeholder:text-xs flex-1 bg-background"
                        />
                        <Input
                            placeholder="Qty (2L)"
                            {...register("quantity")}
                            className="h-9 text-xs placeholder:text-xs w-24 bg-background shrink-0"
                        />
                    </div>

                    {/* Bottom Row: Category Combobox & Add Button */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <Controller
                                control={control}
                                name="category_id"
                                render={({ field }) => (
                                    <CreatableCombobox
                                        options={categories}
                                        value={field.value ?? null}
                                        onChange={field.onChange}
                                        onCreateNew={(name) => createCategory.mutateAsync(name)}
                                        placeholder="Category..."
                                        className="h-9 text-xs placeholder:text-xs bg-background"
                                    />
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={addItem.isPending}
                            size="sm"
                            className="h-9 px-3.5 text-xs shrink-0 font-medium"
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
                </div>

                {errors.name && (
                    <FieldDescription className="text-[11px] text-destructive px-0.5">
                        {errors.name.message}
                    </FieldDescription>
                )}
            </Field>
        </form>
    );
}
