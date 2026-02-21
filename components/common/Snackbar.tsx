import Colors from "@/constants/Colors";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme
} from "react-native";
import { Text, View } from "../Themed";

export type SnackBarType = 'success' | 'error' | 'info'

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: SnackBarType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export default function Snackbar({ 
  visible, 
  message, 
  type = 'info',
  duration = 4000,
  onDismiss,
  action 
}: SnackbarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.success;
      case 'error':
        return theme.danger;
      default:
        return theme.tint;
    }
  };

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.content, { backgroundColor: 'transparent' }]}>
        <Text style={styles.message}>{message}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress}>
            <Text style={[styles.actionText, { color: '#fff' }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 16,
  },
});