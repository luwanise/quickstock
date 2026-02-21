import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  TextInput as RNTextInput,
  RefreshControl,
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
import { Cart } from '@/models/cart';
import { LinearGradient } from 'expo-linear-gradient';

export default function CheckoutScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { carts, isLoading, loadCarts, createNewCart, deleteCart, setActiveCart } = useCart();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCartNotes, setNewCartNotes] = useState('');

  useEffect(() => {
    loadCarts();
  }, []);

  const handleCreateCart = async () => {
    if (!newCustomerName.trim()) {
      Alert.alert('Error', 'Please enter a customer name');
      return;
    }

    await createNewCart(newCustomerName.trim(), newCartNotes.trim());
    
    // This will be handled by the context
    setModalVisible(false);
    setNewCustomerName('');
    setNewCartNotes('');
  };

  const handleCartPress = (cart: Cart) => {
    setActiveCart(cart);
    router.push({
      pathname: '/cart/[id]',
      params: { id: cart.id.toString() },
    });
  };

  const handleDeleteCart = (cart: Cart) => {
    Alert.alert(
      'Delete Cart',
      `Are you sure you want to delete ${cart.customer_name}'s cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCart(cart.id);
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderCartItem = ({ item }: { item: Cart }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleCartPress(item)}
      style={styles.cartItemContainer}
    >
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? ['#2c2c2e', '#1c1c1e']
          : ['#ffffff', '#f8f9fa']}
        style={[styles.cartItem, { borderColor: theme.border }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cartHeader}>
          <View style={styles.customerInfo}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={24} 
              color={theme.tint} 
            />
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{item.customer_name}</Text>
              {item.notes && (
                <Text style={[styles.cartNotes, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.notes}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.cartMeta}>
            <Text style={[styles.itemCount, { color: theme.textSecondary }]}>
              {item.items?.length || 0} items
            </Text>
            <Text style={[styles.timeAgo, { color: theme.textSecondary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
        </View>

        <View style={styles.cartFooter}>
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              Total:
            </Text>
            <Text style={[styles.totalAmount, { color: theme.tint }]}>
              {formatCurrency(item.total_amount)}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleCartPress(item)}
              style={[styles.iconButton, { backgroundColor: theme.tint + '20' }]}
            >
              <MaterialCommunityIcons name="cart" size={20} color={theme.tint} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleDeleteCart(item)}
              style={[styles.iconButton, { backgroundColor: theme.danger + '20' }]}
            >
              <MaterialCommunityIcons name="delete" size={20} color={theme.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (isLoading && carts.length === 0) {
    return <Loading text="Loading carts..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Checkout</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage multiple customer carts
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.newCartButton, { backgroundColor: theme.tint }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="cart-plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Carts List */}
      <FlatList
        data={carts}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadCarts} />
        }
        ListEmptyComponent={
          <EmptyState
            text="No active carts"
            description="Create a new cart to start checkout"
            icon="cart-off"
          />
        }
      />

      {/* New Cart Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Cart</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  CUSTOMER NAME *
                </Text>
                <RNTextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f5',
                      color: theme.text,
                      borderColor: theme.border,
                    }
                  ]}
                  placeholder="Enter customer name"
                  placeholderTextColor={theme.textSecondary}
                  value={newCustomerName}
                  onChangeText={setNewCustomerName}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  NOTES (OPTIONAL)
                </Text>
                <RNTextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f5f5f5',
                      color: theme.text,
                      borderColor: theme.border,
                    }
                  ]}
                  placeholder="Add any notes about this cart"
                  placeholderTextColor={theme.textSecondary}
                  value={newCartNotes}
                  onChangeText={setNewCartNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="CANCEL"
                variant="outline"
                onPress={() => setModalVisible(false)}
                containerStyle={styles.modalButton}
              />
              <Button
                title="CREATE CART"
                variant="primary"
                onPress={handleCreateCart}
                containerStyle={styles.modalButton}
                disabled={!newCustomerName.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  newCartButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  cartItemContainer: {
    marginBottom: 12,
  },
  cartItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  customerDetails: {
    marginLeft: 12,
    flex: 1,
    backgroundColor: 'transparent',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cartNotes: {
    fontSize: 12,
    marginTop: 2,
  },
  cartMeta: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  itemCount: {
    fontSize: 12,
  },
  timeAgo: {
    fontSize: 11,
    marginTop: 2,
  },
  cartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    backgroundColor: 'transparent',
  },
  inputGroup: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  modalButton: {
    flex: 1,
  },
});