import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, ViewStyle } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
  gradientColors?: readonly [string, string, ...string[]];
  size?: 'normal' | 'large';
  containerStyle?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  onPress,
  gradientColors,
  size = 'normal',
  containerStyle,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const defaultGradient = [
    colorScheme === 'dark' ? '#2c2c2e' : '#ffffff',
    colorScheme === 'dark' ? '#1c1c1e' : '#f8f9fa',
  ] as const;

  const colors = gradientColors || defaultGradient;

  const CardWrapper = onPress ? TouchableOpacity : View;

  const getIconSize = () => {
    return size === 'large' ? 32 : 24;
  };

  const getValueFontSize = () => {
    return size === 'large' ? 28 : 20;
  };

  return (
    <CardWrapper 
      onPress={onPress} 
      style={[styles.cardWrapper, containerStyle]}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={colors}
        style={[styles.card, { borderColor: theme.border }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={getIconSize()} 
            color={theme.tint} 
          />
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textSecondary }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.value, { color: theme.text, fontSize: getValueFontSize() }]}>
            {value}
          </Text>
          
          {trend && (
            <View style={styles.trendContainer}>
              <MaterialCommunityIcons
                name={trend.isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={trend.isPositive ? theme.success : theme.danger}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: trend.isPositive ? theme.success : theme.danger }
                ]}
              >
                {trend.value}%
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontWeight: '700',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});