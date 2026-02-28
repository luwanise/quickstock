// context/CartContext.tsx
import { useAuth } from '@/hooks/useAuth';
import { Cart } from '@/models/cart';
import { cartService } from '@/services/cart.service';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface CartContextType {
  carts: Cart[];  // Changed from activeCarts to carts
  activeCart: Cart | null;
  setActiveCart: (cart: Cart | null) => void;
  isLoading: boolean;  // Changed from loading to isLoading
  loadCarts: () => Promise<void>;  // Added this function
  refreshCarts: () => Promise<void>;
  createNewCart: (customerName: string, notes?: string) => Promise<{ data: Cart | null, error: any }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<{ error: any }>;
  removeFromCart: (cartItemId: string) => Promise<{ error: any }>;
  completeCart: () => Promise<void>;
  deleteCart: (cartId: string) => Promise<void>;  // Added this function
  selectCart: (cartId: string) => Promise<void>;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carts, setCarts] = useState<Cart[]>([]);  // Changed from activeCarts to carts
  const [activeCart, setActiveCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);  // Changed from loading to isLoading
  const { session } = useAuth();

  // Renamed from refreshCarts to loadCarts to match CheckoutScreen
  const loadCarts = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await cartService.getActiveCarts(session.user.id);
      if (error) throw error;
      setCarts(data || []);
    } catch (error) {
      console.error('Error loading carts:', error);
      Alert.alert('Error', 'Failed to load carts');
    } finally {
      setIsLoading(false);
    }
  };

  // Keep refreshCarts as an alias for loadCarts
  const refreshCarts = loadCarts;

  const createNewCart = async (customerName: string, notes?: string) => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return { data: null, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await cartService.createCart(
        session.user.id,
        customerName,
        notes
      );

      if (error) throw error;
      
      await loadCarts(); // Refresh the list
      Alert.alert('Success', 'Cart created successfully');
      return { data, error: null };
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create cart');
      return { data: null, error };
    }
  };

  const deleteCart = async (cartId: string) => {
    try {
      const { error } = await cartService.deleteCart(cartId);
      
      if (error) throw error;
      
      // If the deleted cart was the active cart, clear it
      if (activeCart?.id === cartId) {
        setActiveCart(null);
      }
      
      await loadCarts(); // Refresh the list
      Alert.alert('Success', 'Cart deleted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete cart');
    }
  };

  const selectCart = async (cartId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await cartService.getCartWithItems(cartId);
      if (error) throw error;
      setActiveCart(data);
    } catch (error) {
      console.error('Error selecting cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      if (!activeCart?.id) {
        throw new Error('No active cart');
      }

      const { error } = await cartService.updateCartItemQuantity({
        cart_item_id: cartItemId,
        quantity
      });

      if (error) throw error;

      // Refresh the active cart to get updated data
      await selectCart(activeCart.id);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      if (!activeCart?.id) {
        throw new Error('No active cart');
      }

      const { error } = await cartService.removeFromCart(cartItemId, activeCart.id);

      if (error) throw error;

      // Refresh the active cart
      await selectCart(activeCart.id);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const completeCart = async () => {
    try {
      if (!activeCart?.id) {
        throw new Error('No active cart');
      }

      const { error } = await cartService.completeCart(activeCart.id, true);

      if (error) throw error;

      // Clear active cart and refresh list
      setActiveCart(null);
      await loadCarts();
      Alert.alert('Success', 'Cart completed successfully');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete cart');
      throw error;
    }
  };

  // Load carts on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadCarts();
    }
  }, [session?.user?.id]);

  return (
    <CartContext.Provider value={{
      carts,
      activeCart,
      setActiveCart,
      isLoading,
      loadCarts,
      refreshCarts,
      createNewCart,
      updateQuantity,
      removeFromCart,
      completeCart,
      deleteCart,
      selectCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}