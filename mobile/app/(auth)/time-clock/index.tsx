import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { getToken } from '@/lib/storage';
import { Card, Button } from '@/components/ui';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/lib/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function TimeClockScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current time entry status
  const { data: timeStatus, isLoading } = useQuery({
    queryKey: ['timeStatus'],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/time-entries/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const clockMutation = useMutation({
    mutationFn: async (action: 'in' | 'out') => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/time-entries/clock-${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clock ' + action);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeStatus'] });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleClockIn = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clockMutation.mutate('in');
  };

  const handleClockOut = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Clock Out',
      'Are you sure you want to clock out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clock Out', style: 'destructive', onPress: () => clockMutation.mutate('out') },
      ]
    );
  };

  const isClockedIn = !!timeStatus?.clockIn && !timeStatus?.clockOut;

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

  const calculateDuration = (startTime: string) => {
    const start = new Date(startTime);
    const diff = currentTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Time Clock' }} />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.content}>
          {/* Current Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
          </View>

          {/* Status Card */}
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isClockedIn ? colors.success : colors.textTertiary },
                ]}
              />
              <Text style={styles.statusText}>
                {isClockedIn ? 'Currently Clocked In' : 'Not Clocked In'}
              </Text>
            </View>

            {isClockedIn && timeStatus?.clockIn && (
              <View style={styles.shiftInfo}>
                <View style={styles.shiftRow}>
                  <Text style={styles.shiftLabel}>Started</Text>
                  <Text style={styles.shiftValue}>
                    {new Date(timeStatus.clockIn).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.shiftRow}>
                  <Text style={styles.shiftLabel}>Duration</Text>
                  <Text style={[styles.shiftValue, styles.duration]}>
                    {calculateDuration(timeStatus.clockIn)}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* Clock Button */}
          <TouchableOpacity
            style={[
              styles.clockButton,
              { backgroundColor: isClockedIn ? colors.error : colors.success },
            ]}
            onPress={isClockedIn ? handleClockOut : handleClockIn}
            disabled={clockMutation.isPending}
            activeOpacity={0.8}
          >
            {clockMutation.isPending ? (
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

          {/* User Info */}
          <Text style={styles.userInfo}>
            Logged in as {user?.email}
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  timeDisplay: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
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
  statusCard: {
    width: '100%',
    marginBottom: spacing.xxl,
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
  duration: {
    color: colors.success,
  },
  clockButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  clockButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: '#fff',
    marginTop: spacing.sm,
  },
  userInfo: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
});
