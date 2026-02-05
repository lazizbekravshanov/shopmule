import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import type { Vehicle } from '@/types';

export default function NewWorkOrderScreen() {
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const router = useRouter();

  const [vehicleId, setVehicleId] = useState(params.vehicleId || '');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vehicle details if vehicleId is provided
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => api.getVehicle(vehicleId),
    enabled: !!vehicleId,
  });

  const handleSubmit = async () => {
    if (!vehicleId) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    setIsSubmitting(true);
    try {
      const workOrder = await api.createWorkOrder({
        vehicleId,
        description: description.trim(),
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Work order created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayVehicle = vehicle
    ? `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim()
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Vehicle Info */}
          {vehicleId && (
            <View style={styles.section}>
              <Text style={styles.label}>Vehicle</Text>
              {isLoadingVehicle ? (
                <View style={styles.vehicleCard}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              ) : vehicle ? (
                <View style={styles.vehicleCard}>
                  <Text style={styles.vehicleName}>{displayVehicle}</Text>
                  <Text style={styles.vehicleVin}>{vehicle.vin}</Text>
                  {vehicle.customer && (
                    <Text style={styles.customerName}>
                      Customer: {vehicle.customer.name}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.vehicleCard}>
                  <Text style={styles.errorText}>Vehicle not found</Text>
                </View>
              )}
            </View>
          )}

          {!vehicleId && (
            <View style={styles.section}>
              <Text style={styles.noVehicleText}>
                No vehicle selected. Go back and select a vehicle first.
              </Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/(auth)/scan')}
              >
                <Text style={styles.secondaryButtonText}>Scan VIN</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the work to be performed..."
              placeholderTextColor="#6b7280"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional notes..."
              placeholderTextColor="#6b7280"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!vehicleId || !description.trim() || isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!vehicleId || !description.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Work Order</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  vehicleCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  vehicleVin: {
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 8,
  },
  noVehicleText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
});
