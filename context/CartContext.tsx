import { useAuth } from '@/hooks/useAuth';
import { Cart } from '@/models/cart';
import { cartService } from '@/services/cart.service';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface CartContextType {
  carts: Cart[];
  activeCart: Cart | null;
  isLoading: boolean;
  loadCarts: () => Promise<void>;
  setActiveCart: (cart: Cart | null) => void;
  createNewCart: (customerName: string, notes?: string) => Promise<void>;
  addToCart: (itemId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  completeCart: () => Promise<void>;
  deleteCart: (cartId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [activeCart, setActiveCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  const loadCarts = useCallback(async () => {
    if (!session?.user.id) return;
    
    setIsLoading(true);
    const { data, error } = await cartService.getActiveCarts(session.user.id);
    if (!error && data) {
      setCarts(data);
    }
    setIsLoading(false);
  }, [session?.user.id]);

  const createNewCart = useCallback(async (customerName: string, notes?: string) => {
    if (!session?.user.id) return;

    const { data, error } = await cartService.createCart(session.user.id, customerName, notes);
    if (!error && data) {
      setCarts(prev => [data, ...prev]);
      setActiveCart(data);
    }
  }, [session?.user.id]);

  const addToCart = useCallback(async (itemId: string, quantity: number) => {
    if (!activeCart) return;

    const { data, error } = await cartService.addToCart({
      cart_id: activeCart.id,
      item_id: itemId,
      quantity
    });

    if (!error && data) {
      // Refresh active cart items
      const { data: updatedCart } = await cartService.getCartWithItems(activeCart.id);
      if (updatedCart) {
        setActiveCart(updatedCart);
      }
    }
  }, [activeCart]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    const { data, error } = await cartService.updateCartItemQuantity({
      cart_item_id: cartItemId,
      quantity
    });

    if (!error && data && activeCart) {
      const { data: updatedCart } = await cartService.getCartWithItems(activeCart.id);
      if (updatedCart) {
        setActiveCart(updatedCart);
      }
    }
  }, [activeCart]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (!activeCart) return;

    const { error } = await cartService.removeFromCart(cartItemId, activeCart.id);
    if (!error) {
      const { data: updatedCart } = await cartService.getCartWithItems(activeCart.id);
      if (updatedCart) {
        setActiveCart(updatedCart);
      }
    }
  }, [activeCart]);

  const completeCart = useCallback(async () => {
    if (!activeCart) return;

    const { data, error } = await cartService.completeCart(activeCart.id);
    if (!error && data) {
      setCarts(prev => prev.filter(c => c.id !== activeCart.id));
      setActiveCart(null);
    }
  }, [activeCart]);

  const deleteCart = useCallback(async (cartId: string) => {
    const { error } = await cartService.deleteCart(cartId);
    if (!error) {
      setCarts(prev => prev.filter(c => c.id !== cartId));
      if (activeCart?.id === cartId) {
        setActiveCart(null);
      }
    }
  }, [activeCart]);

  return (
    <CartContext.Provider value={{
      carts,
      activeCart,
      isLoading,
      loadCarts,
      setActiveCart,
      createNewCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      completeCart,
      deleteCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};