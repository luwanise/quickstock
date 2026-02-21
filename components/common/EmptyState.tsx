import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '../Themed';

interface EmptyStateProps {
  text: string;
  description?: string;
  icon?: ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export default function EmptyState({ text, description, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text>{text}</Text>
      {icon && (
          <MaterialCommunityIcons
              name={icon}
              size={20}
          />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40
  }
});