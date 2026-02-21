export interface NewItem {
    item_name: string;
    stock_quantity: number;
    low_stock_threshold: number;
    price: number;
    user_id?: string;
}

export interface Item {
    id: string;
    item_name: string;
    stock_quantity: number;
    low_stock_threshold: number;
    price: number;
    user_id: string;
}

export interface UpdateItem {
    item_name?: string;
    stock_quantity?: number;
    low_stock_threshold?: number;
    price?: number;
}