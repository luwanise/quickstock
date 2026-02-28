import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

interface Activity {
  id: string;
  type: 'cart_created' | 'cart_completed' | 'item_added' | 'item_removed';
  customerName: string;
  amount?: number;
  time: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'cart_created':
        return 'cart-plus';
      case 'cart_completed':
        return 'cart-check';
      case 'item_added':
        return 'basket-plus';
      case 'item_removed':
        return 'basket-minus';
      default:
        return 'cart';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'cart_created':
        return theme.tint;
      case 'cart_completed':
        return theme.success;
      case 'item_added':
        return theme.tint;
      case 'item_removed':
        return theme.warning;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <LinearGradient
      colors={colorScheme === 'dark' ? ['#2c2c2e', '#1c1c1e'] : ['#ffffff', '#f8f9fa']}
      style={[styles.card, { borderColor: theme.border }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Activity</Text>

      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="history" size={32} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No recent activity
          </Text>
        </View>
      ) : (
        activities.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.iconCircle, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
              <MaterialCommunityIcons
                name={getActivityIcon(activity.type)}
                size={20}
                color={getActivityColor(activity.type)}
              />
            </View>

            <View style={styles.activityContent}>
              <Text style={[styles.activityText, { color: theme.text }]}>
                {activity.customerName}
              </Text>
              <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                {activity.time}
              </Text>
            </View>

            {activity.amount && (
              <Text style={[styles.activityAmount, { color: theme.tint }]}>
                ${activity.amount.toLocaleString()}
              </Text>
            )}
          </View>
        ))
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});