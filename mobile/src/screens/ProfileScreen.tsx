import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from '../shared/components/Card';
import { Button } from '../shared/components/Button';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <Text style={styles.username}>Username</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level 5</Text>
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Pets</Text>
            <Text style={styles.statValue}>3</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Coins Earned</Text>
            <Text style={styles.statValue}>🪙 5,000</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Gems Earned</Text>
            <Text style={styles.statValue}>💎 100</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Days Played</Text>
            <Text style={styles.statValue}>7</Text>
          </View>
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Button title="Edit Profile" variant="ghost" style={styles.settingButton} />
          <Button title="Notifications" variant="ghost" style={styles.settingButton} />
          <Button title="Privacy" variant="ghost" style={styles.settingButton} />
          <Button title="Help & Support" variant="ghost" style={styles.settingButton} />
          <Button title="Log Out" variant="danger" style={styles.settingButton} />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  content: {
    padding: 16,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  statsCard: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  settingButton: {
    marginBottom: 8,
  },
});

export default ProfileScreen;
