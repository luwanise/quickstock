// app/(tabs)/dashboard.tsx
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import { Header } from '@/components/dashboard/Header';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { Action, QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Item } from '@/models/item';
import { cartService } from '@/services/cart.service';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface DashboardStats {
  totalCarts: number;
  completedToday: number;
  totalRevenue: number;
  averageCartValue: number;
  pendingLowStock: number;
}

interface Activity {
  id: string;
  type: 'cart_created' | 'cart_completed' | 'item_added' | 'item_removed';
  customerName: string;
  amount?: number;
  time: string;
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const { session } = useAuth();
  const { carts, isLoading: cartsLoading, loadCarts } = useCart();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalCarts: 0,
    completedToday: 0,
    totalRevenue: 0,
    averageCartValue: 0,
    pendingLowStock: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setError(null);
      
      // Load carts
      await loadCarts();

      // Load items for low stock alerts
      const { data: itemsData, error: itemsError } = await cartService.searchItems(
        session.user.id,
        ''
      );
      
      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Calculate stats - use the latest carts data
      const activeCarts = carts.filter(c => c.status === 'active');
      const completedToday = carts.filter(c => {
        if (!c.completed_at) return false;
        const today = new Date().toDateString();
        return new Date(c.completed_at).toDateString() === today;
      });

      const totalRevenue = carts.reduce((sum, cart) => sum + cart.total_amount, 0);
      const lowStockItems = itemsData?.filter(
        item => item.stock_quantity <= item.low_stock_threshold
      ) || [];
      
      setStats({
        totalCarts: activeCarts.length,
        completedToday: completedToday.length,
        totalRevenue,
        averageCartValue: activeCarts.length > 0 
          ? Math.round(totalRevenue / activeCarts.length) 
          : 0,
        pendingLowStock: lowStockItems.length,
      });

      // Generate recent activity from real cart data
      const activities: Activity[] = carts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((cart) => ({
          id: cart.id,
          type: cart.completed_at ? 'cart_completed' : 'cart_created',
          customerName: cart.customer_name,
          amount: cart.total_amount,
          time: getRelativeTime(cart.completed_at || cart.created_at),
        }));

      setRecentActivity(activities);

    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      setError(error.message || 'Failed to load dashboard data');
      Alert.alert('Error', 'Failed to load dashboard data. Pull down to refresh.');
    } finally {
      setIsInitialLoad(false);
    }
  }, [session?.user?.id, carts, loadCarts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleProfilePress = () => {
    Alert.alert(
      'Profile',
      'Profile settings coming soon',
      [{ text: 'OK' }]
    );
  };

  const handleNotificationsPress = () => {
    const lowStockItemsList = items.filter(
      item => item.stock_quantity <= item.low_stock_threshold
    );
    
    if (lowStockItemsList.length > 0) {
      Alert.alert(
        'Low Stock Alerts',
        `You have ${lowStockItemsList.length} item${lowStockItemsList.length > 1 ? 's' : ''} that need attention:\n\n${lowStockItemsList.slice(0, 3).map(i => `• ${i.item_name} (${i.stock_quantity} left)`).join('\n')}${lowStockItemsList.length > 3 ? `\n• and ${lowStockItemsList.length - 3} more...` : ''}`,
        [
          { text: 'Later', style: 'cancel' },
          { 
            text: 'View Inventory',
            onPress: () => router.push('/(tabs)/inventory')
          }
        ]
      );
    } else {
      Alert.alert('Notifications', 'No new notifications');
    }
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const quickActions: Action[] = [
    {
      id: 'new-cart',
      title: 'New Cart',
      icon: 'cart-plus',
      onPress: () => router.push('/checkout'),
    },
    {
      id: 'add-item',
      title: 'Add Item',
      icon: 'package-variant',
      onPress: () => router.push('/(tabs)/add_item'),
    },
    {
      id: 'inventory',
      title: 'Inventory',
      icon: 'store',
      onPress: () => router.push('/(tabs)/inventory'),
    },
  ];

  // Show loading only on initial load
  if (isInitialLoad && cartsLoading && carts.length === 0) {
    return <Loading text="Loading dashboard..." />;
  }

  // Show error state
  if (error && carts.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.tint}
          />
        }
      >
        <Header
          userName={session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User'}
          onProfilePress={handleProfilePress}
          onNotificationsPress={handleNotificationsPress}
          notificationCount={stats.pendingLowStock}
        />
        <EmptyState
          text="Something went wrong"
          description={error}
          icon="alert-circle"
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={theme.tint}
          colors={[theme.tint]}
          progressBackgroundColor={theme.card}
        />
      }
    >
      <Header
        userName={session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'User'}
        onProfilePress={handleProfilePress}
        onNotificationsPress={handleNotificationsPress}
        notificationCount={stats.pendingLowStock}
      />

      {/* Stats Grid - Now in 2x2 layout */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            title="Active Carts"
            value={stats.totalCarts}
            icon="cart-outline"
            trend={stats.totalCarts > 0 ? { 
              value: Math.round((stats.totalCarts / (carts.length || 1)) * 100), 
              isPositive: true 
            } : undefined}
            onPress={() => router.push('/checkout')}
            containerStyle={styles.statCardLeft}
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon="calendar-check"
            trend={stats.completedToday > 0 ? { 
              value: stats.completedToday, 
              isPositive: true 
            } : undefined}
            containerStyle={styles.statCardRight}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon="cash"
            trend={stats.totalRevenue > 0 ? { 
              value: 100, 
              isPositive: true 
            } : undefined}
            containerStyle={styles.statCardLeft}
          />
          <StatCard
            title="Avg. Cart"
            value={`$${stats.averageCartValue.toLocaleString()}`}
            icon="shopping"
            containerStyle={styles.statCardRight}
          />
        </View>
      </View>

      {/* Key Metric Highlight for better visibility */}
      {stats.totalRevenue > 0 && (
        <View style={styles.keyMetricContainer}>
          <StatCard
            title="Total Revenue (All Time)"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon="cash-multiple"
            size="large"
            containerStyle={styles.keyMetricCard}
          />
        </View>
      )}

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />

      {/* Low Stock Alerts */}
      {items.filter(i => i.stock_quantity <= i.low_stock_threshold).length > 0 && (
        <LowStockAlert
          items={items}
          onViewAll={() => router.push('/(tabs)/inventory')}
          onItemPress={(item) => {
            Alert.alert(
              'Restock Item',
              `${item.item_name} has only ${item.stock_quantity} units left. Would you like to restock?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Restock',
                  onPress: () => {
                    router.push({
                      pathname: '/items/edit/[id]',
                      params: { id: item.id }
                    });
                  },
                },
              ]
            );
          }}
        />
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 ? (
        <RecentActivityCard activities={recentActivity} />
      ) : (
        <EmptyState
          text="No Recent Activity"
          description="Your recent cart activity will appear here"
          icon="history"
        />
      )}

      {/* Footer spacing */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  statCardLeft: {
    flex: 1,
    marginRight: 6,
  },
  statCardRight: {
    flex: 1,
    marginLeft: 6,
  },
  keyMetricContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  keyMetricCard: {
    width: '100%',
  },
  footer: {
    height: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'transparent',
  },
});