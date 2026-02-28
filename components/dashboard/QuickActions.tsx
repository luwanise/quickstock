import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

export interface Action {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  color?: string;
}

interface QuickActionsProps {
  actions: Action[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <LinearGradient
      colors={colorScheme === 'dark' ? ['#2c2c2e', '#1c1c1e'] : ['#ffffff', '#f8f9fa']}
      style={[styles.card, { borderColor: theme.border }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.cardTitle, { color: theme.text }]}>Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionItem}
            onPress={action.onPress}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: (action.color || theme.tint) + '20' },
              ]}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={24}
                color={action.color || theme.tint}
              />
            </View>
            <Text style={[styles.actionTitle, { color: theme.text }]}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    backgroundColor: 'transparent',
  },
  actionItem: {
    width: '22%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 11,
    textAlign: 'center',
  },
});