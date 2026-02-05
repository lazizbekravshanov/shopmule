import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import type { WorkOrderStatus } from '@/types';

const statusColors: Record<WorkOrderStatus, string> = {
  DIAGNOSED: '#f59e0b',
  APPROVED: '#3b82f6',
  IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#10b981',
};

const statusLabels: Record<WorkOrderStatus, string> = {
  DIAGNOSED: 'Diagnosed',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: vehicle,
    isLoading: isLoadingVehicle,
    error: vehicleError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => api.getVehicle(id!),
    enabled: !!id,
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery({
    queryKey: ['vehicleWorkOrders', id],
    queryFn: () => api.getVehicleWorkOrders(id!),
    enabled: !!id,
  });

  if (isLoadingVehicle) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (vehicleError || !vehicle) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>
          {vehicleError ? getErrorMessage(vehicleError) : 'Vehicle not found'}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayYear = vehicle.year ? vehicle.year.toString() : '';
  const displayName = `${displayYear} ${vehicle.make} ${vehicle.model}`.trim();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Vehicle Header */}
        <View style={styles.header}>
          <Text style={styles.vehicleName}>{displayName}</Text>
          <Text style={styles.vin}>{vehicle.vin}</Text>
        </View>

        {/* Vehicle Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            <DetailRow label="VIN" value={vehicle.vin} monospace />
            {vehicle.unitNumber && (
              <DetailRow label="Unit Number" value={vehicle.unitNumber} />
            )}
            {vehicle.licensePlate && (
              <DetailRow label="License Plate" value={vehicle.licensePlate} />
            )}
            {vehicle.mileage !== null && vehicle.mileage !== undefined && (
              <DetailRow
                label="Mileage"
                value={`${vehicle.mileage.toLocaleString()} mi`}
              />
            )}
            {vehicle.customer && (
              <DetailRow label="Customer" value={vehicle.customer.name} />
            )}
          </View>
        </View>

        {/* Work Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work Orders</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                router.push({
                  pathname: '/(auth)/work-order/new',
                  params: { vehicleId: vehicle.id },
                })
              }
            >
              <Text style={styles.addButtonText}>+ New</Text>
            </TouchableOpacity>
          </View>

          {isLoadingWorkOrders ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : workOrders && workOrders.length > 0 ? (
            <View style={styles.workOrdersList}>
              {workOrders.map((wo) => (
                <View key={wo.id} style={styles.workOrderCard}>
                  <View style={styles.workOrderHeader}>
                    <Text style={styles.workOrderDescription} numberOfLines={2}>
                      {wo.description}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors[wo.status] },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {statusLabels[wo.status]}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.workOrderDetails}>
                    <Text style={styles.workOrderDate}>
                      {new Date(wo.createdAt).toLocaleDateString()}
                    </Text>
                    {wo.laborHours > 0 && (
                      <Text style={styles.workOrderMeta}>
                        {wo.laborHours} hrs
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No work orders yet</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: '/(auth)/work-order/new',
              params: { vehicleId: vehicle.id },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Create Work Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  monospace,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, monospace && styles.monospace]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  vehicleName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  vin: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d2d3d',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  workOrdersList: {
    gap: 12,
  },
  workOrderCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  workOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workOrderDescription: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  workOrderDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  workOrderDate: {
    fontSize: 13,
    color: '#9ca3af',
  },
  workOrderMeta: {
    fontSize: 13,
    color: '#9ca3af',
  },
  emptyState: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
});
