import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Item } from '@/models/item';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

interface LowStockAlertProps {
  items: Item[];
  onViewAll?: () => void;
  onItemPress?: (item: Item) => void;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  items,
  onViewAll,
  onItemPress,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const lowStockItems = items.filter(
    (item) => item.stock_quantity <= item.low_stock_threshold
  );

  const getStockLevel = (item: Item) => {
    const percentage = (item.stock_quantity / item.low_stock_threshold) * 100;
    if (percentage <= 25) return 'critical';
    if (percentage <= 50) return 'warning';
    return 'attention';
  };

  const getStockColor = (level: string) => {
    switch (level) {
      case 'critical':
        return theme.danger;
      case 'warning':
        return theme.warning;
      default:
        return theme.tint;
    }
  };

  return (
    <LinearGradient
      colors={colorScheme === 'dark' ? ['#2c2c2e', '#1c1c1e'] : ['#ffffff', '#f8f9fa']}
      style={[styles.card, { borderColor: theme.border }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="alert-circle" size={20} color={theme.warning} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>Low Stock Alert</Text>
        </View>
        
        {lowStockItems.length > 3 && onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={[styles.viewAll, { color: theme.tint }]}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {lowStockItems.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="check-circle" size={32} color={theme.success} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            All items are well stocked
          </Text>
        </View>
      ) : (
        lowStockItems.slice(0, 3).map((item) => {
          const level = getStockLevel(item);
          const stockColor = getStockColor(level);
          
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onPress={() => onItemPress?.(item)}
              disabled={!onItemPress}
            >
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.text }]}>
                  {item.item_name}
                </Text>
                <View style={styles.stockInfo}>
                  <Text style={[styles.stockText, { color: theme.textSecondary }]}>
                    Stock: {item.stock_quantity} / {item.low_stock_threshold}
                  </Text>
                  <View style={[styles.stockBadge, { backgroundColor: stockColor + '20' }]}>
                    <Text style={[styles.stockBadgeText, { color: stockColor }]}>
                      {level}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: theme.progressBackground }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: stockColor,
                        width: `${(item.stock_quantity / item.low_stock_threshold) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  itemRow: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockText: {
    fontSize: 12,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressContainer: {
    backgroundColor: 'transparent',
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
});