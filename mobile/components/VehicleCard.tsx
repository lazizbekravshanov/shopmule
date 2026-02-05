import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import type { Vehicle, WorkOrderStatus } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  workOrderCount?: number;
  latestWorkOrderStatus?: WorkOrderStatus;
  onPress?: () => void;
}

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

export function VehicleCard({
  vehicle,
  workOrderCount,
  latestWorkOrderStatus,
  onPress,
}: VehicleCardProps) {
  const displayYear = vehicle.year ? vehicle.year.toString() : '';
  const displayName = `${displayYear} ${vehicle.make} ${vehicle.model}`.trim();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.vehicleName} numberOfLines={1}>
          {displayName}
        </Text>
        {latestWorkOrderStatus && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[latestWorkOrderStatus] },
            ]}
          >
            <Text style={styles.statusText}>
              {statusLabels[latestWorkOrderStatus]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>VIN</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {vehicle.vin}
          </Text>
        </View>

        {vehicle.unitNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unit #</Text>
            <Text style={styles.detailValue}>{vehicle.unitNumber}</Text>
          </View>
        )}

        {vehicle.licensePlate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plate</Text>
            <Text style={styles.detailValue}>{vehicle.licensePlate}</Text>
          </View>
        )}

        {vehicle.mileage !== null && vehicle.mileage !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mileage</Text>
            <Text style={styles.detailValue}>
              {vehicle.mileage.toLocaleString()} mi
            </Text>
          </View>
        )}

        {vehicle.customer && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {vehicle.customer.name}
            </Text>
          </View>
        )}
      </View>

      {workOrderCount !== undefined && workOrderCount > 0 && (
        <View style={styles.footer}>
          <Text style={styles.workOrderCount}>
            {workOrderCount} work order{workOrderCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    gap: 8,
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
    color: '#e5e7eb',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2d2d3d',
  },
  workOrderCount: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
