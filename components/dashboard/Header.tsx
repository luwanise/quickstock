import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

interface HeaderProps {
  userName?: string;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  notificationCount?: number;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'User',
  onProfilePress,
  onNotificationsPress,
  notificationCount = 0,
  showBackButton = false,
  onBackPress,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Truncate long names
  const displayName = userName.length > 15 
    ? `${userName.substring(0, 12)}...` 
    : userName;

  return (
    <View 
      style={[
        styles.header,
        { 
          backgroundColor: theme.background,
        }
      ]}
    >
      <View style={styles.content}>
        {/* Left section - Back button or welcome message */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.card }]}
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={theme.text} 
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.welcomeSection}>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>
                Welcome back,
              </Text>
              <Text style={[styles.userName, { color: theme.tint }]} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          )}
        </View>

        {/* Right section - Notification and profile */}
        <View style={styles.actions}>
          {!showBackButton && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.card }]}
              onPress={onNotificationsPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons 
                name="bell-outline" 
                size={22} 
                color={theme.text} 
              />
              {notificationCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: theme.tint }]}
            onPress={onProfilePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.profileInitial, { color: theme.tintText }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  welcomeSection: {
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 13,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
    includeFontPadding: false,
  },
});