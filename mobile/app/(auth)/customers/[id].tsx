import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { getToken } from '@/lib/storage';
import { Card, StatusBadge } from '@/components/ui';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/lib/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  licensePlate: string | null;
}

interface WorkOrder {
  id: string;
  orderNumber: string | null;
  status: string;
  description: string | null;
  createdAt: string;
  vehicle: {
    make: string;
    model: string;
    year: number | null;
  } | null;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
}

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: customer, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch customer');
      return response.json() as Promise<CustomerDetail>;
    },
    enabled: !!id,
  });

  const handleCall = () => {
    if (customer?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`mailto:${customer.email}`);
    }
  };

  const handleVehiclePress = async (vehicleId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/vehicle/${vehicleId}`);
  };

  const handleWorkOrderPress = async (workOrderId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/work-orders/${workOrderId}`);
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Customer' }} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (error || !customer) {
    return (
      <>
        <Stack.Screen options={{ title: 'Customer' }} />
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.errorText}>Failed to load customer</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const fullAddress = [customer.address, customer.city, customer.state, customer.zipCode]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <Stack.Screen options={{ title: customer.name }} />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {/* Customer Info Card */}
          <Card style={styles.infoCard}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {customer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{customer.name}</Text>
                {customer.companyName && (
                  <Text style={styles.company}>{customer.companyName}</Text>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actions}>
              {customer.phone && (
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                  <Ionicons name="call" size={20} color={colors.primary} />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>
              )}
              {customer.email && (
                <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                  <Ionicons name="mail" size={20} color={colors.primary} />
                  <Text style={styles.actionText}>Email</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Contact Details */}
            <View style={styles.details}>
              {customer.phone && (
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{customer.phone}</Text>
                </View>
              )}
              {customer.email && (
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{customer.email}</Text>
                </View>
              )}
              {fullAddress && (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{fullAddress}</Text>
                </View>
              )}
            </View>
          </Card>

          {/* Vehicles Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vehicles</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/vehicle/new?customerId=${customer.id}`);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {customer.vehicles.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="car-outline" size={32} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No vehicles</Text>
              </Card>
            ) : (
              customer.vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  onPress={() => handleVehiclePress(vehicle.id)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      <Ionicons name="car" size={24} color={colors.primary} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Text>
                        {vehicle.vin && (
                          <Text style={styles.itemSubtitle}>VIN: {vehicle.vin}</Text>
                        )}
                        {vehicle.licensePlate && (
                          <Text style={styles.itemSubtitle}>
                            Plate: {vehicle.licensePlate}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Work Orders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Work Orders</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/work-order/new?customerId=${customer.id}`);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {customer.workOrders.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="document-text-outline" size={32} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No work orders</Text>
              </Card>
            ) : (
              customer.workOrders.slice(0, 5).map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => handleWorkOrderPress(order.id)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <View style={styles.orderHeader}>
                          <Text style={styles.itemTitle}>
                            #{order.orderNumber || order.id.slice(0, 8)}
                          </Text>
                          <StatusBadge status={order.status} />
                        </View>
                        {order.vehicle && (
                          <Text style={styles.itemSubtitle}>
                            {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
                          </Text>
                        )}
                        {order.description && (
                          <Text style={styles.description} numberOfLines={1}>
                            {order.description}
                          </Text>
                        )}
                        <Text style={styles.date}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}

            {customer.workOrders.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/work-orders?customerId=${customer.id}`);
                }}
              >
                <Text style={styles.viewAllText}>
                  View all {customer.workOrders.length} work orders
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: '#fff',
  },
  infoCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  company: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  actionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  details: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  viewAllText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
});
