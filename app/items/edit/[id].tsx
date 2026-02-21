import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    useColorScheme
} from 'react-native';

import Button from '@/components/common/Button';
import CustomTextInput from '@/components/common/CustomTextInput';
import Snackbar, { SnackBarType } from '@/components/common/Snackbar';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { Item, UpdateItem } from '@/models/item';
import { getItemById, updateItem } from '@/services/items.service';

export default function EditItemScreen() {
  const { id, item: itemParam } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { session } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'error' as SnackBarType,
  });

  // Form state
  const [itemName, setItemName] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load item data
  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    // If item was passed via params, use that first
    if (itemParam) {
      try {
        const parsedItem = JSON.parse(itemParam as string);
        setItem(parsedItem);
        populateForm(parsedItem);
        setIsLoading(false);
        return;
      } catch (error) {
        // If parsing fails, fetch from API
      }
    }

    // Fetch from API
    if (!id) return;
    
    const result = await getItemById(String(id));
    if (result.error) {
      showSnackbar(result.error.message);
      router.back();
    } else if (result.data) {
      setItem(result.data);
      populateForm(result.data);
    }
    setIsLoading(false);
  };

  const populateForm = (item: Item) => {
    setItemName(item.item_name);
    setStockQuantity(item.stock_quantity.toString());
    setLowStockThreshold(item.low_stock_threshold.toString());
    setPrice(item.price.toString());
  };

  const showSnackbar = (message: string, type: SnackBarType = 'error') => {
    setSnackbar({ visible: true, message, type });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    const stock = parseInt(stockQuantity);
    if (!stockQuantity || isNaN(stock) || stock < 0) {
      newErrors.stockQuantity = 'Valid stock quantity is required';
    }

    const threshold = parseInt(lowStockThreshold);
    if (!lowStockThreshold || isNaN(threshold) || threshold < 0) {
      newErrors.lowStockThreshold = 'Valid threshold is required';
    }

    const itemPrice = parseFloat(price);
    if (!price || isNaN(itemPrice) || itemPrice < 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !item) return;

    setIsSaving(true);

    const updatedItem: UpdateItem = {
      item_name: itemName.trim(),
      stock_quantity: parseInt(stockQuantity),
      low_stock_threshold: parseInt(lowStockThreshold),
      price: parseFloat(price),
    };

    const result = await updateItem(item.id, updatedItem);
    setIsSaving(false);

    if (result.error) {
      showSnackbar(result.error.message);
      return;
    }

    showSnackbar('Item updated successfully!', 'success');
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item?.item_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Handle delete from edit screen
            router.setParams({ action: 'delete' });
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              ITEM NAME <Text style={styles.required}>*</Text>
            </Text>
            <CustomTextInput
              placeholder="Enter item name"
              value={itemName}
              onChangeText={(text) => {
                setItemName(text);
                if (errors.itemName) setErrors(prev => ({ ...prev, itemName: '' }));
              }}
              iconName="lead-pencil"
              error={errors.itemName}
              touched={!!errors.itemName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              STOCK QUANTITY <Text style={styles.required}>*</Text>
            </Text>
            <CustomTextInput
              placeholder="Enter stock quantity"
              value={stockQuantity}
              onChangeText={(text) => {
                setStockQuantity(text);
                if (errors.stockQuantity) setErrors(prev => ({ ...prev, stockQuantity: '' }));
              }}
              inputMode="numeric"
              iconName="package"
              error={errors.stockQuantity}
              touched={!!errors.stockQuantity}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              LOW STOCK THRESHOLD <Text style={styles.required}>*</Text>
            </Text>
            <CustomTextInput
              placeholder="Enter threshold"
              value={lowStockThreshold}
              onChangeText={(text) => {
                setLowStockThreshold(text);
                if (errors.lowStockThreshold) setErrors(prev => ({ ...prev, lowStockThreshold: '' }));
              }}
              inputMode="numeric"
              iconName="package-variant"
              error={errors.lowStockThreshold}
              touched={!!errors.lowStockThreshold}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              PRICE <Text style={styles.required}>*</Text>
            </Text>
            <CustomTextInput
              placeholder="Enter price"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
              }}
              inputMode="decimal"
              iconName="currency-usd"
              error={errors.price}
              touched={!!errors.price}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer with actions */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button
          title="DELETE"
          onPress={handleDelete}
          variant="danger"
          iconName="delete"
          containerStyle={styles.deleteButton}
        />
        <Button
          title="SAVE CHANGES"
          onPress={handleSave}
          variant="primary"
          iconName="content-save"
          loading={isSaving}
          disabled={isSaving}
          containerStyle={styles.saveButton}
        />
      </View>

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={() => setSnackbar(prev => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  form: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  required: {
    color: '#ff3b30',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    gap: 12,
    backgroundColor: 'transparent',
  },
  deleteButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});