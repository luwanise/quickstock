export type CartStatus = 'active' | 'completed' | 'cancelled';

export interface Cart {
    id: string;
    user_id: string;
    customer_name: string;
    status: CartStatus;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    total_amount: number;
    notes?: string;
    items?: CartItem[]; // Optional, for when we need to load items
}

export interface NewCart {
    user_id: string;
    customer_name: string;
    notes?: string;
}

export interface CartItem {
    id: number;
    cart_id: string;
    item_id: string;
    quantity: number;
    price_at_time: number;
    subtotal: number;
    created_at: string;
    item?: { // Optional joined item data
        item_name: string;
        stock_quantity: number;
    };
}

export interface AddToCartPayload {
    cart_id: string;
    item_id: string;
    quantity: number;
}

export interface UpdateCartItemPayload {
    cart_item_id: string;
    quantity: number;
}

export interface CompleteCartPayload {
    cart_id: string;
    // Optionally reduce inventory immediately or after payment confirmation
    reduce_inventory?: boolean;
}