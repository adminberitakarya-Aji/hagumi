import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { getStatColor } from '../utils';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  style?: ViewStyle;
  showValue?: boolean;
  icon?: string;
  color?: string;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue = 100,
  style,
  showValue = true,
  icon,
  color: customColor,
}) => {
  const percentage = Math.min(Math.max(value / maxValue, 0), 1);
  const color = customColor || getStatColor(value);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.label}>{label}</Text>
        {showValue && (
          <Text style={[styles.value, { color }]}>
            {Math.round(value)}/{maxValue}
          </Text>
        )}
      </View>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  barContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});