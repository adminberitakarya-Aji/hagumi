import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TopBar = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>H</Text>
        </View>
        <View>
          <Text style={styles.username}>Hagumi User</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LV. 12</Text>
          </View>
        </View>
      </View>

      <View style={styles.currencySection}>
        <TouchableOpacity style={styles.currencyItem}>
          <Ionicons name="cash-outline" size={16} color="#FBBF24" />
          <Text style={styles.currencyText}>1,240</Text>
          <Ionicons name="add-circle" size={14} color="#FBBF24" style={styles.plusIcon} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.currencyItem}>
          <Ionicons name="diamond-outline" size={16} color="#60A5FA" />
          <Text style={styles.currencyText}>50</Text>
          <Ionicons name="add-circle" size={14} color="#60A5FA" style={styles.plusIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  username: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  levelText: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '900',
  },
  currencySection: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  currencyText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  plusIcon: {
    marginLeft: 2,
  },
});
