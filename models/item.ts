export interface Item {
    id?: number;
    item_name: string;
    stock_quantity: number;
    low_stock_threshold: number;
    price: number;
    user_id?: string;
}