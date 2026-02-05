import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Card, StatusBadge } from '@/components/ui';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/lib/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: summary, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/work-orders?summary=true`,
        {
          headers: {
            Authorization: `Bearer ${await import('@/lib/storage').then(m => m.getToken())}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const handleQuickAction = async (action: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (action === 'scan') router.push('/(auth)/scan');
    if (action === 'workorder') router.push('/(auth)/work-order/new');
    if (action === 'clock') router.push('/(auth)/time-clock');
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.userName}>{user?.email?.split('@')[0]}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{summary?.open ?? '-'}</Text>
            <Text style={styles.statLabel}>Open Jobs</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.statusInProgress }]}>
              {summary?.byStatus?.IN_PROGRESS ?? '-'}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {summary?.byStatus?.COMPLETED ?? '-'}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction('scan')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="scan" size={28} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Scan VIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction('workorder')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="add-circle" size={28} color={colors.success} />
            </View>
            <Text style={styles.actionText}>New Job</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction('clock')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="time" size={28} color={colors.warning} />
            </View>
            <Text style={styles.actionText}>Clock In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(auth)/work-orders')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.info}20` }]}>
              <Ionicons name="list" size={28} color={colors.info} />
            </View>
            <Text style={styles.actionText}>All Jobs</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Work Orders */}
        {summary?.recent && summary.recent.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/work-orders')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {summary.recent.slice(0, 5).map((order: any) => (
              <Card
                key={order.id}
                style={styles.recentCard}
                onPress={() => router.push(`/work-orders/${order.id}`)}
              >
                <View style={styles.recentHeader}>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentVehicle} numberOfLines={1}>
                      {order.vehicle
                        ? `${order.vehicle.make} ${order.vehicle.model}`
                        : 'Unknown Vehicle'}
                    </Text>
                    <Text style={styles.recentDescription} numberOfLines={1}>
                      {order.description}
                    </Text>
                  </View>
                  <StatusBadge status={order.status} size="small" />
                </View>
              </Card>
            ))}
          </>
        )}
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  recentCard: {
    marginBottom: spacing.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  recentVehicle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  recentDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
