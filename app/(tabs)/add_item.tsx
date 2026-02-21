import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from 'react-native';

import Button from '@/components/common/Button';
import CustomTextInput from '@/components/common/CustomTextInput';
import Loading from '@/components/common/Loading';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { NewItem } from '@/models/item';
import { insertItem } from '@/services/items.service';
import { useColorScheme } from 'react-native';

export default function AddItemScreen() {
  const [itemName, setItemName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { session } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

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

  const showSuccessAlert = () => {
    Alert.alert(
      '🎉 Success!',
      'Item has been added successfully',
      [
        {
          text: 'Add Another',
          onPress: () => {
            setItemName('');
            setStockQuantity('');
            setLowStockThreshold('');
            setPrice('');
            setErrors({});
          },
          style: 'cancel',
        },
        {
          text: 'Done',
          onPress: () => {
            // Navigate back or to items list
          },
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  };

  const showErrorAlert = (message: string) => {
    Alert.alert(
      '❌ Error',
      message,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  };

  const onAddItem = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const newItem: NewItem = {
      item_name: itemName.trim(),
      stock_quantity: parseInt(stockQuantity),
      low_stock_threshold: parseInt(lowStockThreshold),
      price: parseFloat(price),
      user_id: session?.user.id
    };

    const result = await insertItem(newItem);
    setIsLoading(false);
    
    if (result.error) {
      showErrorAlert(result.error.message);
      return;
    }

    showSuccessAlert();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading text="Adding your item..." />
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
          {/* Item Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              ITEM NAME <Text style={styles.required}>*</Text>
            </Text>
            <CustomTextInput
              placeholder="e.g., Wireless Headphones"
              value={itemName}
              onChangeText={(text) => {
                setItemName(text);
                if (errors.itemName) {
                  setErrors(prev => ({ ...prev, itemName: '' }));
                }
              }}
              iconName="lead-pencil"
              error={errors.itemName}
              touched={!!errors.itemName}
            />
          </View>

          {/* Stock Quantity */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              STOCK QUANTITY <Text style={styles.required}>*</Text>
            </Text>
            <CustomTextInput
              placeholder="e.g., 50"
              value={stockQuantity}
              onChangeText={(text) => {
                setStockQuantity(text);
                if (errors.stockQuantity) {
                  setErrors(prev => ({ ...prev, stockQuantity: '' }));
                }
              }}
              inputMode="numeric"
              iconName="package"
              error={errors.stockQuantity}
              touched={!!errors.stockQuantity}
            />
          </View>

          {/* Low Stock Threshold */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              LOW STOCK THRESHOLD <Text style={styles.required}>*</Text>
            </Text>
            <CustomTextInput
              placeholder="e.g., 10"
              value={lowStockThreshold}
              onChangeText={(text) => {
                setLowStockThreshold(text);
                if (errors.lowStockThreshold) {
                  setErrors(prev => ({ ...prev, lowStockThreshold: '' }));
                }
              }}
              inputMode="numeric"
              iconName="package-variant"
              error={errors.lowStockThreshold}
              touched={!!errors.lowStockThreshold}
            />
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              PRICE <Text style={styles.required}>*</Text>
            </Text>
            <CustomTextInput
              placeholder="e.g., 99.99"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) {
                  setErrors(prev => ({ ...prev, price: '' }));
                }
              }}
              inputMode="decimal"
              iconName="currency-usd"
              error={errors.price}
              touched={!!errors.price}
            />
          </View>

          {/* Form Hint */}
          <View style={[styles.hintContainer, { backgroundColor: theme.progressBackground }]}>
            <Text style={[styles.hintText, { color: theme.textSecondary }]}>
              All fields marked with <Text style={styles.required}>*</Text> are required
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer with Button */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button
          title="ADD ITEM"
          onPress={onAddItem}
          variant="primary"
          iconName="plus"
          fullWidth
          disabled={isLoading}
        />
      </View>
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
    fontWeight: '600',
  },
  hintContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
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
});