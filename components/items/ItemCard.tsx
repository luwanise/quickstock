import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Item } from '@/models/item';
import { deleteItem } from '@/services/items.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  View as RNView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme
} from 'react-native';

interface ItemCardProps {
  item: Item;
  onDelete?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

const ItemCard = memo(({ item, onDelete, onEdit, showActions = true }: ItemCardProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Determine stock status
  const isLowStock = item.stock_quantity <= item.low_stock_threshold;
  const isOutOfStock = item.stock_quantity === 0;

  const getStockStatusText = () => {
    if (isOutOfStock) return 'Out of Stock';
    if (isLowStock) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusColor = () => {
    if (isOutOfStock) return theme.danger;
    if (isLowStock) return theme.warning;
    return theme.success;
  };

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.item_name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const result = await deleteItem(item.id);
              if (result.error) {
                Alert.alert('Error', result.error.message);
              } else {
                onDelete?.();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [item.id, item.item_name, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit?.();
    // Navigate to edit screen with item data
    router.push({
      pathname: '/items/edit/[id]',
      params: { 
        id: item.id,
        item: JSON.stringify(item) 
      }
    });
  }, [item, onEdit]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      delayPressIn={100}
    >
      <RNView style={[
        styles.card, 
        { 
          backgroundColor: theme.background, 
          borderColor: theme.border,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        }
      ]}>
        {/* Header with item name and stock badge */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
              {item.item_name}
            </Text>
          </View>
          <View style={[
            styles.stockBadge,
            { backgroundColor: getStockStatusColor() }
          ]}>
            <Text style={styles.stockBadgeText}>
              {getStockStatusText()}
            </Text>
          </View>
        </View>

        {/* Stock details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Current Stock:
            </Text>
            <Text style={[
              styles.detailValue,
              isLowStock && { color: isOutOfStock ? theme.danger : theme.warning },
              styles.detailValueBold
            ]}>
              {item.stock_quantity} units
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Low Stock Threshold:
            </Text>
            <Text style={styles.detailValue}>
              {item.low_stock_threshold} units
            </Text>
          </View>

          {/* Progress bar for stock level */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                Stock Level
              </Text>
              <Text style={[styles.progressPercentage, { color: theme.tint }]}>
                {Math.min(Math.round((item.stock_quantity / (item.low_stock_threshold * 2)) * 100), 100)}%
              </Text>
            </View>
            <View 
              style={[
                styles.progressBar, 
                { backgroundColor: theme.progressBackground }
              ]}
            >
              <View 
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: isLowStock ? theme.warning : theme.tint,
                    width: `${Math.min((item.stock_quantity / (item.low_stock_threshold * 2)) * 100, 100)}%`
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Footer with price and actions */}
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
              Price:
            </Text>
            <Text style={[styles.price, { color: theme.tint }]}>
              ${item.price.toLocaleString()}
            </Text>
          </View>

          {showActions && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={handleEdit}
                style={[styles.actionButton, { backgroundColor: theme.tint + '20' }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons 
                  name="pencil" 
                  size={18} 
                  color={theme.tint} 
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                style={[styles.actionButton, { backgroundColor: theme.danger + '20' }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={theme.danger} />
                ) : (
                  <MaterialCommunityIcons 
                    name="delete" 
                    size={18} 
                    color={theme.danger} 
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </RNView>
    </TouchableOpacity>
  );
});

ItemCard.displayName = 'ItemCard';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
  },
  detailValueBold: {
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  priceLabel: {
    fontSize: 14,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ItemCard;