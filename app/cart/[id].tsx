import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { AddToCartPayload, Cart, CartItem } from '@/models/cart';
import { Item } from '@/models/item';
import { cartService } from '@/services/cart.service';
import { LinearGradient } from 'expo-linear-gradient';

export default function CartDetailScreen() {
  const { id } = useLocalSearchParams();
  const cartId = Array.isArray(id) ? id[0] : id;
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const {
    activeCart, 
    setActiveCart,
    updateQuantity, 
    removeFromCart, 
    completeCart,
  } = useCart();
  
  const { session } = useAuth();
  
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartData, setCartData] = useState<Cart | null>(null);

  // Load cart if not in context
  const loadCart = async () => {
    if (!cartId) return;
    
    setIsLoading(true);
    const { data, error } = await cartService.getCartWithItems(cartId);
    
    if (error) {
      Alert.alert('Error', 'Failed to load cart');
    } else if (data) {
      setCartData(data);

      if (setActiveCart) {
        setActiveCart(data);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!activeCart && cartId) {
      loadCart();
    } else if (activeCart) {
      setCartData(activeCart);
      setIsLoading(false);
    }
  }, [cartId, activeCart]);

  // Fix 4: Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 1) {
        searchItems(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchItems = async (query: string) => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await cartService.searchItems(session.user.id, query);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedItem || !quantity || !cartId) return;
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      Alert.alert('Error', 'Quantity must be at least 1');
      return;
    }

    if (qty > selectedItem.stock_quantity) {
      Alert.alert('Error', `Only ${selectedItem.stock_quantity} items in stock`);
      return;
    }

    const payload: AddToCartPayload = {
      cart_id: cartId,
      item_id: selectedItem.id,
      quantity: qty,
    };

    try {
      const { error } = await cartService.addToCart(payload);
      
      if (error) throw error;
      
      // Fix 5: Refresh cart data after adding item
      await loadCart();
      
      Alert.alert('Success', 'Item added to cart');
      setQuantityModalVisible(false);
      setSearchModalVisible(false);
      setSelectedItem(null);
      setQuantity('1');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add item');
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (!cartId) return;

    if (newQuantity < 1) {
      // Fix 6: Handle removal properly
      const { error } = await removeFromCart(cartItemId);
      if (!error) {
        await loadCart(); // Refresh data
      }
    } else {
      // Fix 7: Update quantity and refresh
      const { error } = await updateQuantity(cartItemId, newQuantity);
      if (!error) {
        await loadCart(); // Refresh data
      }
    }
  };

  const handleCheckout = () => {
    if (!cartData?.total_amount) return;

    Alert.alert(
      'Complete Checkout',
      `Total amount: ${formatCurrency(cartData.total_amount)}\n\nThis will reduce inventory and mark the cart as paid.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Payment',
          style: 'default',
          onPress: async () => {
            try {
              await completeCart();
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to complete checkout');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const stockQuantity = item.item?.stock_quantity ?? 0;
    const itemName = item.item?.item_name ?? 'Unknown Item';
    
    return (
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? ['#2c2c2e', '#1c1c1e']
          : ['#ffffff', '#f8f9fa']}
        style={[styles.cartItem, { borderColor: theme.border }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cartItemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{itemName}</Text>
            <Text style={[styles.itemPrice, { color: theme.textSecondary }]}>
              {formatCurrency(item.price_at_time)} each
            </Text>
          </View>
          <TouchableOpacity 
            onPress={async () => {
              const { error } = await removeFromCart(item.id);
              if (!error) await loadCart();
            }}
          >
            <MaterialCommunityIcons name="trash-can" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.cartItemFooter}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              style={[styles.quantityButton, { borderColor: theme.border }]}
            >
              <MaterialCommunityIcons name="minus" size={16} color={theme.text} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              style={[styles.quantityButton, { borderColor: theme.border }]}
              disabled={item.quantity >= stockQuantity}
            >
              <MaterialCommunityIcons 
                name="plus" 
                size={16} 
                color={item.quantity >= stockQuantity ? theme.textSecondary : theme.text} 
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.itemSubtotal, { color: theme.tint }]}>
            {formatCurrency(item.quantity * item.price_at_time)}
          </Text>
        </View>

        {item.quantity > stockQuantity && (
          <View style={[styles.warningBadge, { backgroundColor: theme.warning + '20' }]}>
            <MaterialCommunityIcons name="alert" size={14} color={theme.warning} />
            <Text style={[styles.warningText, { color: theme.warning }]}>
              Only {stockQuantity} in stock
            </Text>
          </View>
        )}
      </LinearGradient>
    );
  };

  // Show loading state
  if (isLoading) {
    return <Loading text="Loading cart..." />;
  }

  // Show empty state if no cart
  if (!cartData) {
    return (
      <View style={styles.container}>
        <EmptyState
          text="Cart not found"
          description="This cart may have been deleted"
          icon="cart-remove"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{cartData.customer_name}</Text>
          {cartData.notes && (
            <Text style={[styles.headerNotes, { color: theme.textSecondary }]}>
              {cartData.notes}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => setSearchModalVisible(true)} style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color={theme.tint} />
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <FlatList
        data={cartData.items || []}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            text="Cart is empty"
            description="Add items to start checkout"
            icon="cart-outline"
          />
        }
      />

      {/* Footer with total and checkout */}
      {cartData.items && cartData.items.length > 0 && (
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <View style={styles.totalSection}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              Total
            </Text>
            <Text style={[styles.totalAmount, { color: theme.tint }]}>
              {formatCurrency(cartData.total_amount)}
            </Text>
          </View>
          <Button
            title="PAID"
            variant="primary"
            iconName="check"
            onPress={handleCheckout}
            containerStyle={styles.checkoutButton}
          />
        </View>
      )}

      {/* Search Items Modal (unchanged) */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Items</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.searchContainer}>
            <MaterialCommunityIcons 
              name="magnify" 
              size={20} 
              color={theme.textSecondary}
              style={styles.searchIcon}
            />
            <RNTextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f5',
                  color: theme.text,
                }
              ]}
              placeholder="Search items..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.searchResult, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setSelectedItem(item);
                  setQuantityModalVisible(true);
                }}
              >
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{item.item_name}</Text>
                  <Text style={[styles.resultStock, { color: theme.textSecondary }]}>
                    Stock: {item.stock_quantity} units
                  </Text>
                </View>
                <View style={styles.resultPrice}>
                  <Text style={[styles.priceText, { color: theme.tint }]}>
                    {formatCurrency(item.price)}
                  </Text>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color={theme.textSecondary} 
                  />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searchQuery.length > 0 && !isSearching ? (
                <EmptyState
                  text="No items found"
                  description="Try a different search term"
                  icon="file-search-outline"
                />
              ) : isSearching ? (
                <Loading text="Searching..." />
              ) : null
            }
          />
        </View>
      </Modal>

      {/* Quantity Selection Modal (unchanged) */}
      <Modal
        visible={quantityModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.quantityModalOverlay}>
          <View style={[styles.quantityModal, { backgroundColor: theme.background }]}>
            <Text style={styles.quantityModalTitle}>
              Add {selectedItem?.item_name}
            </Text>
            
            <Text style={[styles.quantityLabel, { color: theme.textSecondary }]}>
              QUANTITY
            </Text>
            
            <View style={styles.quantityInputContainer}>
              <TouchableOpacity
                onPress={() => setQuantity(prev => Math.max(1, parseInt(prev) - 1).toString())}
                style={[styles.quantityControlButton, { borderColor: theme.border }]}
              >
                <MaterialCommunityIcons name="minus" size={20} color={theme.text} />
              </TouchableOpacity>
              
              <RNTextInput
                style={[
                  styles.quantityInput,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f5',
                    color: theme.text,
                    borderColor: theme.border,
                  }
                ]}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                textAlign="center"
              />
              
              <TouchableOpacity
                onPress={() => setQuantity(prev => (parseInt(prev) + 1).toString())}
                style={[styles.quantityControlButton, { borderColor: theme.border }]}
              >
                <MaterialCommunityIcons name="plus" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <Text style={[styles.stockInfo, { color: theme.textSecondary }]}>
                Available: {selectedItem.stock_quantity} units
              </Text>
            )}

            <View style={styles.quantityModalFooter}>
              <Button
                title="CANCEL"
                variant="outline"
                onPress={() => {
                  setQuantityModalVisible(false);
                  setSelectedItem(null);
                  setQuantity('1');
                }}
                containerStyle={styles.quantityModalButton}
              />
              <Button
                title="ADD TO CART"
                variant="primary"
                onPress={handleAddToCart}
                containerStyle={styles.quantityModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Keep your existing styles
const styles = StyleSheet.create({
  // ... your existing styles (unchanged)
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerNotes: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  itemInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  checkoutButton: {
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultStock: {
    fontSize: 12,
  },
  resultPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quantityModal: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },
  quantityModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  quantityLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  quantityControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  stockInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  quantityModalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityModalButton: {
    flex: 1,
  },
});