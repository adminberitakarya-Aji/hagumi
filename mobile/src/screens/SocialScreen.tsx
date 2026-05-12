import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from '../shared/components/Card';
import { Button } from '../shared/components/Button';

const SocialScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Social</Text>
        
        <Card style={styles.friendCard}>
          <View style={styles.friendInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
            <View style={styles.friendDetails}>
              <Text style={styles.friendName}>Alice</Text>
              <Text style={styles.friendStatus}>Online</Text>
            </View>
          </View>
          <Button title="Visit" variant="primary" size="small" />
        </Card>

        <Card style={styles.friendCard}>
          <View style={styles.friendInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>B</Text>
            </View>
            <View style={styles.friendDetails}>
              <Text style={styles.friendName}>Bob</Text>
              <Text style={styles.friendStatus}>Last seen 2h ago</Text>
            </View>
          </View>
          <Button title="Visit" variant="primary" size="small" />
        </Card>

        <Card style={styles.friendCard}>
          <View style={styles.friendInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>C</Text>
            </View>
            <View style={styles.friendDetails}>
              <Text style={styles.friendName}>Charlie</Text>
              <Text style={styles.friendStatus}>Last seen 1d ago</Text>
            </View>
          </View>
          <Button title="Visit" variant="primary" size="small" />
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  friendCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default SocialScreen;
