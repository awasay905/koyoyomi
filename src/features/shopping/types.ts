export interface ShoppingItem {
    id: string;
    user_id: string;
    name: string;
    category_id: string | null;
    quantity: string | null;
    notes: string | null;
    status: "pending" | "bought";
    bought_at: string | null;
    is_frequent: boolean;
    created_at: string;
    // joined
    category?: import("@/features/tasks/types").Category | null;
}

export interface CreateShoppingItemInput {
    name: string;
    category_id?: string | null;
    quantity?: string | null;
    notes?: string | null;
}
