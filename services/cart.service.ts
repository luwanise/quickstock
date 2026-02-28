import { supabase } from '@/lib/supabase';
import { AddToCartPayload, UpdateCartItemPayload } from '@/models/cart';

export const cartService = {

    // Create a new cart
    async createCart(userId: string, customerName: string, notes?: string) {
        try {
            const { data, error } = await supabase
                .from('carts')
                .insert([{
                    user_id: userId,
                    customer_name: customerName,
                    notes,
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };

        } catch (error) {
            return { data: null, error };
        }
    },

    // Get all active carts for a user
    async getActiveCarts(userId: string) {
        try {
            const { data, error } = await supabase
                .from('carts')
                .select(`
                    *,
                    items:cart_items(
                        *,
                        item:items(item_name, stock_quantity)
                    )
                `)
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };

        } catch (error) {
            return { data: null, error };
        }
    },

    // Get all carts for a user (for revenue calculations)
    async getAllCarts(userId: string) {
        try {
            const { data, error } = await supabase
                .from('carts')
                .select(`
                    *,
                    items:cart_items(
                        *,
                        item:items(item_name, stock_quantity)
                    )
                `)
                .eq('user_id', userId)
                .in('status', ['active', 'completed'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };

        } catch (error) {
            return { data: null, error };
        }
    },

    // Get cart details
    async getCartWithItems(cartId: string) {
        try {
            const { data, error } = await supabase
                .from('carts')
                .select(`
                    *,
                    items:cart_items(
                        *,
                        item:items(item_name, stock_quantity)
                    )
                `)
                .eq('id', cartId)
                .single();

            if (error) throw error;
            return { data, error: null };

        } catch (error) {
            return { data: null, error };
        }
    },

    // Add item to cart (uses atomic RPC)
    async addToCart(payload: AddToCartPayload) {
        try {

            const { error } = await supabase.rpc('add_to_cart', {
                p_cart_id: payload.cart_id,
                p_item_id: payload.item_id,
                p_quantity: payload.quantity
            });

            if (error) throw error;

            await this.updateCartTotal(payload.cart_id);

            return { data: true, error: null };

        } catch (error: any) {
            return { data: null, error };
        }
    },

    // Update cart item quantity
    async updateCartItemQuantity(payload: UpdateCartItemPayload) {
        try {

            // Get cart_id first
            const { data: existing, error: fetchError } = await supabase
                .from('cart_items')
                .select('cart_id')
                .eq('id', payload.cart_item_id)
                .single();

            if (fetchError) throw fetchError;

            // Update quantity
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: payload.quantity })
                .eq('id', payload.cart_item_id);

            if (updateError) throw updateError;

            // Recalculate total
            await this.updateCartTotal(existing.cart_id);

            return { data: true, error: null };

        } catch (error) {
            return { data: null, error };
        }
    },

    // Remove item from cart
    async removeFromCart(cartItemId: string, cartId: string) {
        try {

            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItemId);

            if (error) throw error;

            await this.updateCartTotal(cartId);

            return { error: null };

        } catch (error) {
            return { error };
        }
    },

    // Recalculate cart total via SQL function
    async updateCartTotal(cartId: string) {
        const { error } = await supabase.rpc('update_cart_total', {
            p_cart_id: cartId
        });

        if (error) throw error;
    },

    // Complete cart
    async completeCart(cartId: string, reduceInventory: boolean = true) {
        try {

            if (reduceInventory) {
                const { data: items, error: itemsError } = await supabase
                    .from('cart_items')
                    .select('item_id, quantity')
                    .eq('cart_id', cartId);

                if (itemsError) throw itemsError;

                for (const item of items || []) {
                    const { error: updateError } = await supabase.rpc(
                        'decrement_item_stock',
                        {
                            item_id: item.item_id,
                            quantity: item.quantity
                        }
                    );

                    if (updateError) throw updateError;
                }
            }

            const { data, error } = await supabase
                .from('carts')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', cartId)
                .select()
                .single();

            if (error) throw error;

            return { data, error: null };

        } catch (error) {
            return { data: null, error };
        }
    },

    // Cancel cart
    async deleteCart(cartId: string) {
        try {
            const { error } = await supabase
                .from('carts')
                .update({ status: 'cancelled' })
                .eq('id', cartId);

            if (error) throw error;

            return { error: null };

        } catch (error) {
            return { error };
        }
    },

    // Search items
    async searchItems(userId: string, searchTerm: string) {
        try {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('user_id', userId)
                .ilike('item_name', `%${searchTerm}%`)
                .order('item_name')
                .limit(10);

            if (error) throw error;

            return { data, error: null };

        } catch (error) {
            return { data: null, error };
        }
    }
};