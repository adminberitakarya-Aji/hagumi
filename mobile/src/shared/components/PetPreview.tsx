import React from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';

interface PetPreviewProps {
  name: string;
  stage: string;
  health: number;
  mood: number;
  hunger: number;
}

export const PetPreview: React.FC<PetPreviewProps> = ({ 
  name, 
  stage, 
  health, 
  mood, 
  hunger 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.stage}>{stage.toUpperCase()}</Text>
        </View>
        
        <View style={styles.petContainer}>
          {/* Placeholder for Pet Sprite */}
          <View style={styles.spritePlaceholder}>
            <Text style={styles.emoji}>🐾</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatBar label="Health" value={health} color="#FF6B9D" />
          <StatBar label="Mood" value={mood} color="#C084FC" />
          <StatBar label="Hunger" value={hunger} color="#60A5FA" />
        </View>
      </View>
    </Animated.View>
  );
};

const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.barBackground}>
      <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  stage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  petContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 20,
  },
  spritePlaceholder: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    width: 60,
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
