import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VINScanner } from '@/components/VINScanner';
import { VehicleCard } from '@/components/VehicleCard';
import { CustomerPicker } from '@/components/CustomerPicker';
import { api, getErrorMessage } from '@/lib/api';
import type { VehicleSearchResult, VINDecodeResult, Customer } from '@/types';

type ScanState =
  | { type: 'idle' }
  | { type: 'scanning' }
  | { type: 'loading'; vin: string }
  | { type: 'found'; result: VehicleSearchResult }
  | { type: 'not_found'; vin: string; decoded?: VINDecodeResult }
  | { type: 'error'; message: string };

export default function ScanScreen() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>({ type: 'idle' });
  const [manualVin, setManualVin] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleScan = async (vin: string) => {
    setState({ type: 'loading', vin });

    try {
      // First, search for existing vehicle
      const result = await api.searchVehicleByVIN(vin);

      if (result) {
        setState({ type: 'found', result });
      } else {
        // Vehicle not found, decode from NHTSA
        try {
          const decoded = await api.decodeVIN(vin);
          setState({ type: 'not_found', vin, decoded });
        } catch {
          setState({ type: 'not_found', vin });
        }
      }
    } catch (error) {
      setState({ type: 'error', message: getErrorMessage(error) });
    }
  };

  const handleManualSubmit = () => {
    const vin = manualVin.trim().toUpperCase();
    if (vin.length !== 17) {
      Alert.alert('Invalid VIN', 'VIN must be exactly 17 characters');
      return;
    }
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(vin)) {
      Alert.alert('Invalid VIN', 'VIN contains invalid characters');
      return;
    }
    handleScan(vin);
  };

  const handleSaveNewVehicle = async () => {
    if (state.type !== 'not_found' || !selectedCustomer) return;

    const { vin, decoded } = state;

    setIsSaving(true);
    try {
      const vehicle = await api.createVehicle(selectedCustomer.id, {
        vin,
        make: decoded?.make || 'Unknown',
        model: decoded?.model || 'Unknown',
        year: decoded?.year,
      });

      // Navigate to the new vehicle
      router.push(`/(auth)/vehicle/${vehicle.id}`);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setState({ type: 'idle' });
    setManualVin('');
    setSelectedCustomer(null);
  };

  // Scanning mode
  if (state.type === 'scanning') {
    return (
      <VINScanner
        onScan={handleScan}
        onClose={() => setState({ type: 'idle' })}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {state.type === 'idle' && (
          <>
            {/* Scan Button */}
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setState({ type: 'scanning' })}
            >
              <Text style={styles.scanIcon}>📷</Text>
              <Text style={styles.scanButtonText}>Scan VIN Barcode</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Manual Entry */}
            <View style={styles.manualEntry}>
              <Text style={styles.label}>Enter VIN Manually</Text>
              <TextInput
                style={styles.input}
                placeholder="17-character VIN"
                placeholderTextColor="#6b7280"
                value={manualVin}
                onChangeText={(text) => setManualVin(text.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={17}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  manualVin.length !== 17 && styles.submitButtonDisabled,
                ]}
                onPress={handleManualSubmit}
                disabled={manualVin.length !== 17}
              >
                <Text style={styles.submitButtonText}>Look Up</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {state.type === 'loading' && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Looking up VIN...</Text>
            <Text style={styles.vinText}>{state.vin}</Text>
          </View>
        )}

        {state.type === 'found' && (
          <View>
            <Text style={styles.sectionTitle}>Vehicle Found</Text>
            <VehicleCard
              vehicle={state.result.vehicle}
              workOrderCount={state.result.workOrders.length}
              latestWorkOrderStatus={state.result.workOrders[0]?.status}
              onPress={() =>
                router.push(`/(auth)/vehicle/${state.result.vehicle.id}`)
              }
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push(`/(auth)/vehicle/${state.result.vehicle.id}`)
              }
            >
              <Text style={styles.primaryButtonText}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
              <Text style={styles.secondaryButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        )}

        {state.type === 'not_found' && (
          <View>
            <Text style={styles.sectionTitle}>New Vehicle</Text>
            <Text style={styles.subtitle}>
              This VIN is not in the system. Add it to a customer account.
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>VIN</Text>
                <Text style={styles.infoValue}>{state.vin}</Text>
              </View>
              {state.decoded && (
                <>
                  {state.decoded.year && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Year</Text>
                      <Text style={styles.infoValue}>{state.decoded.year}</Text>
                    </View>
                  )}
                  {state.decoded.make && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Make</Text>
                      <Text style={styles.infoValue}>{state.decoded.make}</Text>
                    </View>
                  )}
                  {state.decoded.model && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Model</Text>
                      <Text style={styles.infoValue}>{state.decoded.model}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.customerPickerButton}
              onPress={() => setShowCustomerPicker(true)}
            >
              <Text style={styles.customerPickerLabel}>Customer</Text>
              <Text style={styles.customerPickerValue}>
                {selectedCustomer?.name || 'Select a customer...'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!selectedCustomer || isSaving) && styles.primaryButtonDisabled,
              ]}
              onPress={handleSaveNewVehicle}
              disabled={!selectedCustomer || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Add Vehicle</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {state.type === 'error' && (
          <View style={styles.centerContent}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{state.message}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={reset}>
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CustomerPicker
        visible={showCustomerPicker}
        onSelect={(customer) => {
          setSelectedCustomer(customer);
          setShowCustomerPicker(false);
        }}
        onClose={() => setShowCustomerPicker(false)}
        selectedId={selectedCustomer?.id}
      />
    </SafeAreaView>
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
    flexGrow: 1,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  scanIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2d2d3d',
  },
  dividerText: {
    color: '#6b7280',
    marginHorizontal: 16,
    fontSize: 14,
  },
  manualEntry: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  input: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2d2d3d',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  submitButton: {
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
  },
  vinText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 8,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  customerPickerButton: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  customerPickerLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  customerPickerValue: {
    fontSize: 16,
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d3d',
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
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
