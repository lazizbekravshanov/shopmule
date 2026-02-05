import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/lib/theme';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string;
  destructive?: boolean;
}

function MenuItem({ icon, label, onPress, badge, destructive }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, destructive && styles.destructiveIcon]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.error : colors.primary}
        />
      </View>
      <Text style={[styles.menuLabel, destructive && styles.destructiveLabel]}>
        {label}
      </Text>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrator',
    MANAGER: 'Manager',
    MECHANIC: 'Mechanic',
    FRONT_DESK: 'Front Desk',
  };

  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {roleLabels[user?.role || ''] || user?.role}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="people"
              label="Customers"
              onPress={() => router.push('/customers')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="car"
              label="Vehicles"
              onPress={() => router.push('/scan')}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="document-text"
              label="Work Orders"
              onPress={() => router.push('/work-orders')}
            />
          </Card>
        </View>

        {/* Management Section - Only for managers/admins */}
        {isManager && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Management</Text>
            <Card style={styles.menuCard}>
              <MenuItem
                icon="bar-chart"
                label="Reports"
                onPress={() => {
                  Alert.alert('Coming Soon', 'Reports will be available in the next update.');
                }}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="receipt"
                label="Invoices"
                onPress={() => {
                  Alert.alert('Coming Soon', 'Invoices will be available in the next update.');
                }}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon="cube"
                label="Inventory"
                onPress={() => {
                  Alert.alert('Coming Soon', 'Inventory will be available in the next update.');
                }}
              />
            </Card>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.menuCard}>
            <View style={styles.accountInfo}>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Email</Text>
                <Text style={styles.accountValue}>{user?.email}</Text>
              </View>
              <View style={styles.menuDivider} />
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Role</Text>
                <Text style={styles.accountValue}>
                  {roleLabels[user?.role || ''] || user?.role}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="help-circle"
              label="Help & FAQ"
              onPress={() => {
                Alert.alert('Help', 'Contact support at support@shopmule.com');
              }}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="information-circle"
              label="About"
              onPress={() => {
                Alert.alert('ShopMule', 'Version 1.0.0\n\nThe modern auto shop management app.');
              }}
            />
          </Card>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="log-out"
              label="Sign Out"
              onPress={handleLogout}
              destructive
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>ShopMule v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  email: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  destructiveLabel: {
    color: colors.error,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#fff',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 56,
  },
  accountInfo: {
    // no padding - handled by rows
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  accountLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  accountValue: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  versionText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
});
