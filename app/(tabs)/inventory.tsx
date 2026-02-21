import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import ItemCard from '@/components/items/ItemCard';
import SkeletonLoading from '@/components/items/SkeletonLoading';
import { View } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';
import { Item } from '@/models/item';
import { getItems } from '@/services/items.service';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

export default function InventoryScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { session } = useAuth();

  const loadItems = async () => {
    if (!session?.user.id) return;

    setIsLoading(true);

    const result = await getItems(session.user.id);

    setIsLoading(false);
    setIsFirstLoad(false);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    setItems(result.data || []);
  };

  const handleDelete = useCallback((deletedItemId: string) => {
    setItems(prev => prev.filter(item => item.id !== deletedItemId));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  // Show skeleton loading on first load, then animated loading for refreshes
  if (isFirstLoad && isLoading) {
    return <SkeletonLoading count={5} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ItemCard 
            item={item} 
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <Loading text="Loading items" />
          ) : (
            <EmptyState text="No items yet" />
          )
        }
        ListFooterComponent={
          isLoading && !isFirstLoad ? (
            <View style={styles.footerLoader}>
              <Loading text="Refreshing..." />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 20,
          flexGrow: 1,
        }}
        refreshing={isLoading && !isFirstLoad}
        onRefresh={loadItems}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});