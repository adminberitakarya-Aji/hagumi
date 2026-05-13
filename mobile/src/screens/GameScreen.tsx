import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  withTiming
} from 'react-native-reanimated';

import { Card } from '../shared/components/Card';
import { StatBar } from '../shared/components/StatBar';
import { TopBar } from '../shared/components/TopBar';

// const { width } = Dimensions.get('window'); // Removed unused variable

const GameScreen = () => {
  const insets = useSafeAreaInsets();
  
  // Animations
  const petScale = useSharedValue(1);
  const petTranslateY = useSharedValue(0);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    petTranslateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1, // infinity for withRepeat is usually -1 or similar depending on version, keeping it active
      true
    );
  }, [petTranslateY]);

  const petAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: petScale.value },
      { translateY: petTranslateY.value }
    ],
  }));

  const handleInteraction = (type: string) => {
    // eslint-disable-next-line react-hooks/immutability
    petScale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    console.log(`Interacting: ${type}`);
  };

  return (
    <View style={styles.container}>
      <TopBar />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Pet Stage */}
        <View style={styles.stageContainer}>
          <Animated.View style={[styles.petWrapper, petAnimatedStyle]}>
            <View style={styles.petShadow} />
            <Text style={styles.petEmoji}>🐱</Text>
            <View style={styles.moodBubble}>
              <Text style={styles.moodEmoji}>❤️</Text>
            </View>
          </Animated.View>
          
          <View style={styles.petInfo}>
            <Text style={styles.petName}>Mochi</Text>
            <Text style={styles.petStage}>Child • 5 Days Old</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <StatBar label="Hunger" value={75} color="#60A5FA" />
            <StatBar label="Mood" value={90} color="#C084FC" />
          </Card>
          <Card style={styles.statCard}>
            <StatBar label="Energy" value={60} color="#FBBF24" />
            <StatBar label="Health" value={100} color="#FF6B9D" />
          </Card>
        </View>

        {/* Experience Section */}
        <Card variant="glass" style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Growth Progress</Text>
            <Text style={styles.xpValue}>450 / 1000 XP</Text>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: '45%' }]} />
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ActionButton 
            icon="restaurant" 
            label="Feed" 
            color="#60A5FA" 
            onPress={() => handleInteraction('feed')} 
          />
          <ActionButton 
            icon="game-controller" 
            label="Play" 
            color="#C084FC" 
            onPress={() => handleInteraction('play')} 
          />
          <ActionButton 
            icon="bed" 
            label="Rest" 
            color="#FBBF24" 
            onPress={() => handleInteraction('rest')} 
          />
          <ActionButton 
            icon="medkit" 
            label="Heal" 
            color="#FF6B9D" 
            onPress={() => handleInteraction('heal')} 
          />
        </View>
      </ScrollView>

      {/* Floating Menu Toggle (Placeholder) */}
      <TouchableOpacity style={[styles.floatingMenu, { bottom: insets.bottom + 80 }]}>
        <Ionicons name="apps" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

const ActionButton = ({ icon, label, color, onPress }: ActionButtonProps) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <View style={[styles.actionIconBg, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  stageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  petWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petEmoji: {
    fontSize: 120,
    zIndex: 2,
  },
  petShadow: {
    position: 'absolute',
    bottom: -10,
    width: 80,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 40,
    transform: [{ scaleX: 1.5 }],
  },
  moodBubble: {
    position: 'absolute',
    top: -20,
    right: -20,
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  moodEmoji: {
    fontSize: 20,
  },
  petInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  petName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  petStage: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
  },
  xpCard: {
    marginBottom: 24,
    padding: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
  },
  xpValue: {
    color: '#C084FC',
    fontSize: 12,
    fontWeight: '800',
  },
  xpBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#C084FC',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  floatingMenu: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});

export default GameScreen;
