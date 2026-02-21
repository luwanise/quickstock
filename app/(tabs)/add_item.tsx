import { StyleSheet } from 'react-native';

import Button from '@/components/common/Button';
import CustomTextInput from '@/components/common/CustomTextInput';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/hooks/useAuth';
import { Item } from '@/models/item';
import { insertItem } from '@/services/items.service';
import { useState } from 'react';

export default function AddItemScreen() {
  const [itemName, setItemName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  const onAddItem = async () => {
    setIsLoading(true);
    const newItem: Item = {
      item_name: itemName,
      stock_quantity: parseInt(stockQuantity),
      low_stock_threshold: parseInt(lowStockThreshold),
      price: parseFloat(price),
      user_id: session?.user.id
    }
    const result = await insertItem(newItem);
    setIsLoading(false);
    
    if (result.error) {
      alert(result.error.message);
      return;
    }

    alert('Item added successfully!');
    setItemName('');
    setStockQuantity('');
    setLowStockThreshold('');
    setPrice('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.textInputHeader}>ITEM NAME</Text>
        <CustomTextInput
          placeholder="Enter item name"
          value={itemName}
          onChangeText={setItemName}
        />
        <Text style={styles.textInputHeader}>STOCK QUANTITY</Text>
        <CustomTextInput
          placeholder="Enter stock quantity"
          value={stockQuantity}
          onChangeText={setStockQuantity}
          inputMode='numeric'
        />
        <Text style={styles.textInputHeader}>LOW STOCK THRESHOLD</Text>
        <CustomTextInput
          placeholder="Set low-stock threshold"
          value={lowStockThreshold}
          onChangeText={setLowStockThreshold}
          inputMode='numeric'
        />
        <Text style={styles.textInputHeader}>PRICE</Text>
        <CustomTextInput
          placeholder="Set item price"
          value={price}
          onChangeText={setPrice}
          inputMode='decimal'
          iconName='attach-money'
        />
      </View>
      <View style={styles.footer}>
        <Button
          title={isLoading && 'ADDING ITEM...' || '+ ADD ITEM'}
          onPress={onAddItem}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 20
  },
  form: {
    flex: 1,
    width: "100%"
  },
  textInputHeader: {
    marginBottom: 16,
    fontWeight: "500"
  },
  footer: {
    paddingBottom: 20,
    width: "100%"
  }
});
