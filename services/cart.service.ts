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

    // Get cart details with items
    async getCartWithItems(cartId: number) {
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

    // Add item to cart
    async addToCart(payload: AddToCartPayload) {
        try {
            // First check if item already exists in cart
            const { data: existing } = await supabase
                .from('cart_items')
                .select('*')
                .eq('cart_id', payload.cart_id)
                .eq('item_id', payload.item_id)
                .single();

            if (existing) {
                // Update quantity instead of inserting
                return await this.updateCartItemQuantity({
                    cart_item_id: existing.id,
                    quantity: existing.quantity + payload.quantity
                });
            }

            // Get current item price
            const { data: item } = await supabase
                .from('items')
                .select('price')
                .eq('id', payload.item_id)
                .single();

            if (!item) throw new Error('Item not found');

            const { data, error } = await supabase
                .from('cart_items')
                .insert([{
                    cart_id: payload.cart_id,
                    item_id: payload.item_id,
                    quantity: payload.quantity,
                    price_at_time: item.price
                }])
                .select()
                .single();

            if (error) throw error;

            // Update cart total
            await this.updateCartTotal(payload.cart_id);

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Update cart item quantity
    async updateCartItemQuantity(payload: UpdateCartItemPayload) {
        try {
            const { data, error } = await supabase
                .from('cart_items')
                .update({ quantity: payload.quantity })
                .eq('id', payload.cart_item_id)
                .select()
                .single();

            if (error) throw error;

            // Get cart_id to update total
            if (data) {
                await this.updateCartTotal(data.cart_id);
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Remove item from cart
    async removeFromCart(cartItemId: number, cartId: number) {
        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItemId);

            if (error) throw error;

            // Update cart total
            await this.updateCartTotal(cartId);

            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    // Update cart total
    async updateCartTotal(cartId: number) {
        try {
            const { data: items } = await supabase
                .from('cart_items')
                .select('subtotal')
                .eq('cart_id', cartId);

            const total = items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;

            const { error } = await supabase
                .from('carts')
                .update({ 
                    total_amount: total,
                    updated_at: new Date().toISOString()
                })
                .eq('id', cartId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating cart total:', error);
        }
    },

    // Complete cart (payment received)
    async completeCart(cartId: number, reduceInventory: boolean = true) {
        try {
            // Start a transaction
            if (reduceInventory) {
                // Get cart items
                const { data: items } = await supabase
                    .from('cart_items')
                    .select('item_id, quantity')
                    .eq('cart_id', cartId);

                if (items) {
                    // Reduce inventory for each item
                    for (const item of items) {
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
            }

            // Update cart status
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

    // Delete/cancel cart
    async deleteCart(cartId: number) {
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

    // Search items for adding to cart
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