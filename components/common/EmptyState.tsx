import { StyleSheet } from 'react-native';
import { Text, View } from '../Themed';

export default function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <Text>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40
  }
});