import { View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useColorScheme } from 'react-native';

interface SkeletonLoadingProps {
  count?: number;
}

export default function SkeletonLoading({ count = 3 }: SkeletonLoadingProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeletonItem = (index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.skeletonCard,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
          opacity: shimmerOpacity,
        },
      ]}
    >
      {/* Header skeleton */}
      <View style={styles.skeletonHeader}>
        <View style={[styles.skeletonTitle, { backgroundColor: theme.textSecondary }]} />
        <View style={[styles.skeletonBadge, { backgroundColor: theme.textSecondary }]} />
      </View>

      {/* Content skeleton */}
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonLabel, { backgroundColor: theme.textSecondary }]} />
          <View style={[styles.skeletonValue, { backgroundColor: theme.textSecondary }]} />
        </View>
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonLabel, { backgroundColor: theme.textSecondary }]} />
          <View style={[styles.skeletonValue, { backgroundColor: theme.textSecondary }]} />
        </View>
        
        {/* Progress bar skeleton */}
        <View style={[styles.skeletonProgress, { backgroundColor: theme.progressBackground }]}>
          <View style={[styles.skeletonProgressFill, { backgroundColor: theme.textSecondary }]} />
        </View>
      </View>

      {/* Footer skeleton */}
      <View style={styles.skeletonFooter}>
        <View style={[styles.skeletonPriceLabel, { backgroundColor: theme.textSecondary }]} />
        <View style={[styles.skeletonPrice, { backgroundColor: theme.tint }]} />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {Array(count).fill(0).map((_, index) => renderSkeletonItem(index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skeletonCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  skeletonTitle: {
    width: '60%',
    height: 24,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  skeletonContent: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  skeletonLabel: {
    width: '30%',
    height: 16,
    borderRadius: 4,
  },
  skeletonValue: {
    width: '20%',
    height: 16,
    borderRadius: 4,
  },
  skeletonProgress: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  skeletonProgressFill: {
    width: '60%',
    height: '100%',
    borderRadius: 3,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  skeletonPriceLabel: {
    width: 40,
    height: 16,
    borderRadius: 4,
  },
  skeletonPrice: {
    width: 80,
    height: 24,
    borderRadius: 4,
  },
});