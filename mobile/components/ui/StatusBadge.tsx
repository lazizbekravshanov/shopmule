import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing, workOrderStatusConfig } from '@/lib/theme';
import type { WorkOrderStatus } from '@/types';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  size = 'medium',
  showIcon = false,
}: StatusBadgeProps) {
  const config = workOrderStatusConfig[status];

  return (
    <View style={[styles.badge, styles[`${size}Badge`], { backgroundColor: `${config.color}20` }]}>
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={size === 'small' ? 10 : size === 'medium' ? 12 : 14}
          color={config.color}
        />
      )}
      <Text style={[styles.text, styles[`${size}Text`], { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.full,
  },
  smallBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  mediumBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  largeBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
  smallText: {
    fontSize: fontSize.xs,
  },
  mediumText: {
    fontSize: fontSize.sm,
  },
  largeText: {
    fontSize: fontSize.md,
  },
});
