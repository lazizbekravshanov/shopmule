import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Card } from '@/components/ui';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '@/lib/theme';
import type { AttendanceStatus, Location as LocationType } from '@/types';

const getDeviceInfo = () => {
  return `${Platform.OS} ${Platform.Version}`;
};

export default function TimeClockScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<LocationType | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Request location permission and get current location
  const requestLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const loc: LocationType = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy ?? undefined,
      };

      setLocation(loc);
      return loc;
    } catch (error) {
      console.error('Location error:', error);
      setLocationError('Failed to get location');
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  // Get location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Fetch current attendance status
  const { data: status, isLoading: isLoadingStatus, error: statusError } = useQuery({
    queryKey: ['attendanceStatus', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      return api.getAttendanceStatus(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Clock In mutation
  const clockInMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      const loc = await requestLocation();
      return api.clockIn({
        employeeId: user.id,
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        accuracy: loc?.accuracy,
        punchMethod: 'APP',
        deviceInfo: getDeviceInfo(),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceStatus'] });
      Alert.alert('Success', data.message);
    },
    onError: (error: Error & { distance?: number }) => {
      if (error.message.includes('Outside geofence')) {
        Alert.alert(
          'Outside Work Area',
          `You are ${error.distance || 'too far'} meters from the allowed clock-in area. Please move closer.`
        );
      } else {
        Alert.alert('Error', error.message);
      }
    },
  });

  // Clock Out mutation
  const clockOutMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      const loc = await requestLocation();
      return api.clockOut({
        employeeId: user.id,
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        accuracy: loc?.accuracy,
        punchMethod: 'APP',
        deviceInfo: getDeviceInfo(),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceStatus'] });
      Alert.alert('Shift Complete', `Total time worked: ${data.shiftSummary.formatted}`);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  // Start Break mutation
  const startBreakMutation = useMutation({
    mutationFn: async (breakType: 'LUNCH' | 'REST') => {
      if (!user?.id) throw new Error('No user ID');
      const loc = await requestLocation();
      return api.startBreak({
        employeeId: user.id,
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        accuracy: loc?.accuracy,
        breakType,
        punchMethod: 'APP',
        deviceInfo: getDeviceInfo(),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceStatus'] });
      Alert.alert('Break Started', data.message);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  // End Break mutation
  const endBreakMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      const loc = await requestLocation();
      return api.endBreak({
        employeeId: user.id,
        latitude: loc?.latitude,
        longitude: loc?.longitude,
        accuracy: loc?.accuracy,
        punchMethod: 'APP',
        deviceInfo: getDeviceInfo(),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceStatus'] });
      Alert.alert('Break Ended', data.message);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleClockIn = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clockInMutation.mutate();
  };

  const handleClockOut = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Clock Out',
      'Are you sure you want to clock out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clock Out', style: 'destructive', onPress: () => clockOutMutation.mutate() },
      ]
    );
  };

  const handleStartBreak = async () => {
    await Haptics.selectionAsync();
    Alert.alert(
      'Start Break',
      'What type of break?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rest Break', onPress: () => startBreakMutation.mutate('REST') },
        { text: 'Lunch Break', onPress: () => startBreakMutation.mutate('LUNCH') },
      ]
    );
  };

  const handleEndBreak = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    endBreakMutation.mutate();
  };

  const isClockedIn = status?.isClockedIn || false;
  const isOnBreak = status?.isOnBreak || false;
  const isAnyMutationPending =
    clockInMutation.isPending ||
    clockOutMutation.isPending ||
    startBreakMutation.isPending ||
    endBreakMutation.isPending;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (attendanceStatus: AttendanceStatus | undefined) => {
    switch (attendanceStatus) {
      case 'CLOCKED_IN':
        return colors.success;
      case 'ON_BREAK':
        return colors.warning;
      default:
        return colors.textTertiary;
    }
  };

  const getStatusText = (attendanceStatus: AttendanceStatus | undefined) => {
    switch (attendanceStatus) {
      case 'CLOCKED_IN':
        return 'Working';
      case 'ON_BREAK':
        return 'On Break';
      default:
        return 'Clocked Out';
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Time Clock' }} />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
          </View>

          {/* Location Status */}
          <View style={styles.locationStatus}>
            {isLoadingLocation ? (
              <View style={styles.locationRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.locationText}>Getting location...</Text>
              </View>
            ) : locationError ? (
              <TouchableOpacity style={styles.locationRow} onPress={requestLocation}>
                <Ionicons name="warning" size={16} color={colors.warning} />
                <Text style={[styles.locationText, { color: colors.warning }]}>
                  {locationError} - Tap to retry
                </Text>
              </TouchableOpacity>
            ) : location ? (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={colors.success} />
                <Text style={styles.locationText}>
                  Location ready ({location.accuracy?.toFixed(0)}m accuracy)
                </Text>
              </View>
            ) : null}
          </View>

          {/* Status Card */}
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(status?.status) },
                ]}
              />
              <Text style={styles.statusText}>{getStatusText(status?.status)}</Text>
            </View>

            {status?.currentShift && (
              <View style={styles.shiftInfo}>
                <View style={styles.shiftRow}>
                  <Text style={styles.shiftLabel}>Clock In</Text>
                  <Text style={styles.shiftValue}>
                    {new Date(status.currentShift.clockInTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                {status.currentShift.shop && (
                  <View style={styles.shiftRow}>
                    <Text style={styles.shiftLabel}>Location</Text>
                    <Text style={styles.shiftValue}>{status.currentShift.shop.name}</Text>
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.shiftRow}>
                  <Text style={styles.shiftLabel}>Time Worked</Text>
                  <Text style={[styles.shiftValue, styles.workTime]}>
                    {status.currentShift.workFormatted}
                  </Text>
                </View>
                {status.currentShift.breakMinutes > 0 && (
                  <View style={styles.shiftRow}>
                    <Text style={styles.shiftLabel}>Break Time</Text>
                    <Text style={[styles.shiftValue, { color: colors.warning }]}>
                      {status.currentShift.breakFormatted}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* Main Action Button */}
          {isOnBreak ? (
            <TouchableOpacity
              style={[styles.clockButton, { backgroundColor: colors.warning }]}
              onPress={handleEndBreak}
              disabled={isAnyMutationPending}
              activeOpacity={0.8}
            >
              {endBreakMutation.isPending ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <>
                  <Ionicons name="play" size={40} color="#fff" />
                  <Text style={styles.clockButtonText}>End Break</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.clockButton,
                { backgroundColor: isClockedIn ? colors.error : colors.brand },
              ]}
              onPress={isClockedIn ? handleClockOut : handleClockIn}
              disabled={isAnyMutationPending}
              activeOpacity={0.8}
            >
              {(clockInMutation.isPending || clockOutMutation.isPending) ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <>
                  <Ionicons
                    name={isClockedIn ? 'log-out' : 'log-in'}
                    size={40}
                    color="#fff"
                  />
                  <Text style={styles.clockButtonText}>
                    {isClockedIn ? 'Clock Out' : 'Clock In'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Break Button (only when clocked in and not on break) */}
          {isClockedIn && !isOnBreak && (
            <TouchableOpacity
              style={styles.breakButton}
              onPress={handleStartBreak}
              disabled={isAnyMutationPending}
              activeOpacity={0.8}
            >
              {startBreakMutation.isPending ? (
                <ActivityIndicator color={colors.warning} size="small" />
              ) : (
                <>
                  <Ionicons name="pause" size={20} color={colors.warning} />
                  <Text style={styles.breakButtonText}>Take a Break</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Today's Activity */}
          {status?.todayPunches && status.todayPunches.length > 0 && (
            <Card style={styles.activityCard}>
              <Text style={styles.activityTitle}>Today's Activity</Text>
              {status.todayPunches.map((punch, index) => (
                <View key={punch.id} style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={
                        punch.type === 'CLOCK_IN' ? 'log-in' :
                        punch.type === 'CLOCK_OUT' ? 'log-out' :
                        punch.type === 'BREAK_START' ? 'pause' : 'play'
                      }
                      size={16}
                      color={
                        punch.type === 'CLOCK_IN' ? colors.success :
                        punch.type === 'CLOCK_OUT' ? colors.error :
                        colors.warning
                      }
                    />
                  </View>
                  <Text style={styles.activityType}>
                    {punch.type === 'CLOCK_IN' ? 'Clock In' :
                     punch.type === 'CLOCK_OUT' ? 'Clock Out' :
                     punch.type === 'BREAK_START' ? 'Break Start' : 'Break End'}
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(punch.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {punch.location?.isWithinGeofence === false && (
                    <Ionicons
                      name="warning"
                      size={14}
                      color={colors.warning}
                      style={styles.geofenceWarning}
                    />
                  )}
                </View>
              ))}
            </Card>
          )}

          {/* User Info */}
          <Text style={styles.userInfo}>
            Logged in as {user?.email}
          </Text>
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
  scrollContent: {
    padding: spacing.lg,
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  timeDisplay: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  currentTime: {
    fontSize: 56,
    fontWeight: fontWeight.bold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  currentDate: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  locationStatus: {
    marginBottom: spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusCard: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  shiftInfo: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shiftLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  shiftValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  workTime: {
    color: colors.success,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.sm,
  },
  clockButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  clockButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
    marginTop: spacing.sm,
  },
  breakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: spacing.xl,
  },
  breakButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.warning,
  },
  activityCard: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  activityTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityType: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  activityTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  geofenceWarning: {
    marginLeft: spacing.sm,
  },
  userInfo: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.lg,
  },
});
