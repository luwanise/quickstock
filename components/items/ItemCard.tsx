import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Item } from '@/models/item';
import { View as RNView, StyleSheet, useColorScheme } from 'react-native';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Determine stock status
  const isLowStock = item.stock_quantity <= item.low_stock_threshold;
  const isOutOfStock = item.stock_quantity === 0;

  return (
    <RNView style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      {/* Header with item name and stock badge */}
      <View style={styles.header}>
        <Text style={styles.itemName}>{item.item_name}</Text>
        <View style={[
          styles.stockBadge,
          { 
            backgroundColor: isOutOfStock ? theme.danger : 
                           isLowStock ? theme.warning : theme.success 
          }
        ]}>
          <Text style={styles.stockBadgeText}>
            {isOutOfStock ? 'Out of Stock' : 
             isLowStock ? 'Low Stock' : 'In Stock'}
          </Text>
        </View>
      </View>

      {/* Stock details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Current Stock:</Text>
          <Text style={[
            styles.detailValue,
            isLowStock && { color: isOutOfStock ? theme.danger : theme.warning }
          ]}>
            {item.stock_quantity} units
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Low Stock Threshold:</Text>
          <Text style={styles.detailValue}>{item.low_stock_threshold} units</Text>
        </View>

        {/* Progress bar for stock level */}
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: theme.progressBackground,
                width: '100%' 
              }
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

      {/* Footer with price */}
      <View style={styles.footer}>
        <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Price:</Text>
        <Text style={[styles.price, { color: theme.tint }]}>
          ${item.price.toLocaleString()}
        </Text>
      </View>
    </RNView>
  );
}

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
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
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
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  priceLabel: {
    fontSize: 14,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
});