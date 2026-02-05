import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
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

interface WorkOrderDetail {
  id: string;
  orderNumber: string | null;
  status: string;
  description: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number | null;
    vin: string | null;
    licensePlate: string | null;
  } | null;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    companyName: string | null;
  } | null;
  assignedTechnician: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export default function WorkOrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: workOrder, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['workOrder', id],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/work-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch work order');
      return response.json() as Promise<WorkOrderDetail>;
    },
    enabled: !!id,
  });

  const handleCallCustomer = () => {
    if (workOrder?.customer?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`tel:${workOrder.customer.phone}`);
    }
  };

  const handleEmailCustomer = () => {
    if (workOrder?.customer?.email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`mailto:${workOrder.customer.email}`);
    }
  };

  const handleViewVehicle = () => {
    if (workOrder?.vehicle?.id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/vehicle/${workOrder.vehicle.id}`);
    }
  };

  const handleViewCustomer = () => {
    if (workOrder?.customer?.id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/customers/${workOrder.customer.id}`);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Work Order' }} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (error || !workOrder) {
    return (
      <>
        <Stack.Screen options={{ title: 'Work Order' }} />
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.errorText}>Failed to load work order</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const totalAmount = workOrder.lineItems?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: `#${workOrder.orderNumber || workOrder.id.slice(0, 8)}`,
        }}
      />
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
          {/* Header Card */}
          <Card style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.orderNumber}>
                  #{workOrder.orderNumber || workOrder.id.slice(0, 8)}
                </Text>
                <Text style={styles.dateText}>
                  Created {new Date(workOrder.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <StatusBadge status={workOrder.status} size="large" />
            </View>

            {workOrder.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>{workOrder.description}</Text>
              </View>
            )}
          </Card>

          {/* Vehicle Section */}
          {workOrder.vehicle && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle</Text>
              <TouchableOpacity onPress={handleViewVehicle} activeOpacity={0.7}>
                <Card style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Ionicons name="car" size={24} color={colors.primary} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>
                        {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                      </Text>
                      {workOrder.vehicle.vin && (
                        <Text style={styles.infoSubtitle}>VIN: {workOrder.vehicle.vin}</Text>
                      )}
                      {workOrder.vehicle.licensePlate && (
                        <Text style={styles.infoSubtitle}>
                          Plate: {workOrder.vehicle.licensePlate}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </View>
                </Card>
              </TouchableOpacity>
            </View>
          )}

          {/* Customer Section */}
          {workOrder.customer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer</Text>
              <TouchableOpacity onPress={handleViewCustomer} activeOpacity={0.7}>
                <Card style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {workOrder.customer.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoTitle}>{workOrder.customer.name}</Text>
                      {workOrder.customer.companyName && (
                        <Text style={styles.infoSubtitle}>
                          {workOrder.customer.companyName}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </View>
                </Card>
              </TouchableOpacity>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                {workOrder.customer.phone && (
                  <TouchableOpacity style={styles.actionButton} onPress={handleCallCustomer}>
                    <Ionicons name="call" size={20} color={colors.primary} />
                    <Text style={styles.actionText}>Call</Text>
                  </TouchableOpacity>
                )}
                {workOrder.customer.email && (
                  <TouchableOpacity style={styles.actionButton} onPress={handleEmailCustomer}>
                    <Ionicons name="mail" size={20} color={colors.primary} />
                    <Text style={styles.actionText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Technician Section */}
          {workOrder.assignedTechnician && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assigned Technician</Text>
              <Card style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>
                      {workOrder.assignedTechnician.firstName}{' '}
                      {workOrder.assignedTechnician.lastName}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* Line Items */}
          {workOrder.lineItems && workOrder.lineItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services & Parts</Text>
              <Card style={styles.itemsCard}>
                {workOrder.lineItems.map((item, index) => (
                  <View key={item.id}>
                    {index > 0 && <View style={styles.itemDivider} />}
                    <View style={styles.lineItem}>
                      <View style={styles.lineItemInfo}>
                        <Text style={styles.lineItemDescription}>{item.description}</Text>
                        <Text style={styles.lineItemQuantity}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={styles.lineItemPrice}>
                        ${item.total.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
                </View>
              </Card>
            </View>
          )}

          {/* Notes */}
          {workOrder.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Card style={styles.notesCard}>
                <Text style={styles.notesText}>{workOrder.notes}</Text>
              </Card>
            </View>
          )}

          <View style={styles.footer} />
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
  headerCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  descriptionContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  infoSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  itemsCard: {
    padding: spacing.md,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  lineItemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  lineItemDescription: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  lineItemQuantity: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lineItemPrice: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  notesCard: {
    padding: spacing.md,
  },
  notesText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    height: spacing.xxl,
  },
});
