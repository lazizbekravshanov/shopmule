import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getToken } from '@/lib/storage';
import { Card, StatusBadge } from '@/components/ui';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/lib/theme';
import type { WorkOrder, WorkOrderStatus } from '@/types';

const statusFilters: (WorkOrderStatus | 'ALL')[] = [
  'ALL',
  'DIAGNOSED',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
];

const statusLabels: Record<string, string> = {
  ALL: 'All',
  DIAGNOSED: 'Diagnosed',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export default function WorkOrdersScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<WorkOrderStatus | 'ALL'>('ALL');

  const { data: workOrders, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['workOrders'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/work-orders?fields=id,vehicleId,status,description,createdAt,vehicle`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const filteredOrders = workOrders?.filter((wo: WorkOrder) =>
    selectedFilter === 'ALL' ? true : wo.status === selectedFilter
  ) || [];

  const handleFilterChange = async (filter: WorkOrderStatus | 'ALL') => {
    await Haptics.selectionAsync();
    setSelectedFilter(filter);
  };

  const renderWorkOrder = ({ item }: { item: any }) => (
    <Card
      style={styles.workOrderCard}
      onPress={() => router.push(`/work-orders/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {item.vehicle
              ? `${item.vehicle.year || ''} ${item.vehicle.make} ${item.vehicle.model}`.trim()
              : 'Unknown Vehicle'}
          </Text>
          {item.vehicle?.vin && (
            <Text style={styles.vin} numberOfLines={1}>
              {item.vehicle.vin}
            </Text>
          )}
        </View>
        <StatusBadge status={item.status} size="small" />
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Work Orders',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(auth)/work-order/new')}
              style={styles.headerButton}
            >
              <Ionicons name="add" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={statusFilters}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  selectedFilter === item && styles.filterPillActive,
                ]}
                onPress={() => handleFilterChange(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === item && styles.filterTextActive,
                  ]}
                >
                  {statusLabels[item]}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Work Orders List */}
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderWorkOrder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="construct-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No work orders found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: spacing.sm,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: spacing.lg,
  },
  workOrderCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vehicleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  vehicleName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  vin: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
