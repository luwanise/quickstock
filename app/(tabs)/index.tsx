// app/(tabs)/dashboard.tsx
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import { Header } from '@/components/dashboard/Header';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { Action, QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Cart } from '@/models/cart';
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

interface DashboardStats {
  totalCarts: number;
  completedToday: number;
  totalRevenue: number;
  averageCartValue: number;
  pendingLowStock: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
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
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCarts, setAllCarts] = useState<Cart[]>([]);

  const loadDashboardData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setError(null);

      // Load all carts (completed + active)
      const { data: allCartsData, error: allCartsError } =
        await cartService.getAllCarts(session.user.id);

      if (allCartsError) throw allCartsError;
      setAllCarts(allCartsData || []);

      // Load active carts for context
      await loadCarts();

      // Load items for low stock alerts
      const { data: itemsData, error: itemsError } =
        await cartService.searchItems(session.user.id, '');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      const now = new Date();

      // ---------------------------
      // Date boundaries (UTC safe)
      // ---------------------------

      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).toISOString();

      const tomorrowStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      ).toISOString();

      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      ).toISOString();

      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();

      const nextMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      ).toISOString();

      // ---------------------------
      // Derived datasets
      // ---------------------------

      const activeCarts =
        allCartsData?.filter(c => c.status === 'active') || [];

      const completedCarts =
        allCartsData?.filter(c => c.status === 'completed') || [];

      const completedToday =
        completedCarts.filter(c =>
          c.completed_at &&
          c.completed_at >= todayStart &&
          c.completed_at < tomorrowStart
        );

      const revenueToday =
        completedCarts
          .filter(c =>
            c.completed_at &&
            c.completed_at >= todayStart &&
            c.completed_at < tomorrowStart
          )
          .reduce((sum, cart) => sum + (cart.total_amount || 0), 0);

      const revenueThisWeek =
        completedCarts
          .filter(c =>
            c.completed_at &&
            c.completed_at >= weekStart
          )
          .reduce((sum, cart) => sum + (cart.total_amount || 0), 0);

      const revenueThisMonth =
        completedCarts
          .filter(c =>
            c.completed_at &&
            c.completed_at >= monthStart &&
            c.completed_at < nextMonthStart
          )
          .reduce((sum, cart) => sum + (cart.total_amount || 0), 0);

      const totalRevenue =
        completedCarts.reduce(
          (sum, cart) => sum + (cart.total_amount || 0),
          0
        );

      const lowStockItems =
        itemsData?.filter(
          item => item.stock_quantity <= item.low_stock_threshold
        ) || [];

      const averageCartValue =
        completedCarts.length > 0
          ? Math.round(totalRevenue / completedCarts.length)
          : 0;

      setStats({
        totalCarts: activeCarts.length,
        completedToday: completedToday.length,
        totalRevenue,
        averageCartValue,
        pendingLowStock: lowStockItems.length,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
      });

      // ---------------------------
      // Recent Activity
      // ---------------------------

      const activities: Activity[] = (allCartsData || [])
        .sort((a, b) => {
          const dateA = new Date(a.completed_at || a.created_at);
          const dateB = new Date(b.completed_at || b.created_at);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5)
        .map(cart => ({
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
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Pull down to refresh.'
      );
    } finally {
      setIsInitialLoad(false);
    }
  }, [session?.user?.id, loadCarts]);

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
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
  if (isInitialLoad && cartsLoading && carts.length === 0 && allCarts.length === 0) {
    return <Loading text="Loading dashboard..." />;
  }

  // Show error state
  if (error && carts.length === 0 && allCarts.length === 0) {
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

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            title="Active Carts"
            value={stats.totalCarts}
            icon="cart-outline"
            onPress={() => router.push('/checkout')}
            containerStyle={styles.statCardLeft}
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon="calendar-check"
            containerStyle={styles.statCardRight}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Avg. Cart Value"
            value={`$${stats.averageCartValue.toLocaleString()}`}
            icon="shopping"
            containerStyle={styles.statCardLeft}
          />
          <StatCard
            title="Low Stock Items"
            value={stats.pendingLowStock}
            icon="alert-circle"
            containerStyle={styles.statCardRight}
          />
        </View>
      </View>

      {/* Revenue Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Revenue Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Today"
              value={`$${stats.revenueToday.toLocaleString()}`}
              icon="cash-fast"
              containerStyle={styles.statCardLeft}
            />
            <StatCard
              title="This Week"
              value={`$${stats.revenueThisWeek.toLocaleString()}`}
              icon="cash"
              containerStyle={styles.statCardRight}
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatCard
              title="This Month"
              value={`$${stats.revenueThisMonth.toLocaleString()}`}
              icon="cash-multiple"
              containerStyle={styles.statCardLeft}
            />
            <StatCard
              title="All Time"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon="chart-line"
              containerStyle={styles.statCardRight}
            />
          </View>
        </View>
      </View>

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
    paddingBottom: 8,
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
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  revenueCard: {
    width: (width - 40) / 2, // 2 columns with padding
    marginBottom: 8,
  },
  footer: {
    height: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'transparent',
  },
});