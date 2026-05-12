import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from '../shared/components/Card';
import { Button } from '../shared/components/Button';

const ShopScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Shop</Text>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceValue}>🪙 1,250 💎 50</Text>
        </View>

        <Text style={styles.sectionTitle}>Food</Text>
        <Card style={styles.itemCard}>
          <Text style={styles.itemName}>Premium Food</Text>
          <Text style={styles.itemDescription}>+30 Hunger</Text>
          <Text style={styles.itemPrice}>💎 10</Text>
          <Button title="Buy" variant="primary" size="small" />
        </Card>

        <Card style={styles.itemCard}>
          <Text style={styles.itemName}>Delicious Treat</Text>
          <Text style={styles.itemDescription}>+20 Hunger +10 Mood</Text>
          <Text style={styles.itemPrice}>🪙 100</Text>
          <Button title="Buy" variant="primary" size="small" />
        </Card>

        <Text style={styles.sectionTitle}>Toys</Text>
        <Card style={styles.itemCard}>
          <Text style={styles.itemName}>Toy Ball</Text>
          <Text style={styles.itemDescription}>+25 Mood</Text>
          <Text style={styles.itemPrice}>🪙 200</Text>
          <Button title="Buy" variant="primary" size="small" />
        </Card>

        <Card style={styles.itemCard}>
          <Text style={styles.itemName}>Plushie</Text>
          <Text style={styles.itemDescription}>+40 Mood</Text>
          <Text style={styles.itemPrice}>💎 25</Text>
          <Button title="Buy" variant="primary" size="small" />
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
  balanceCard: {
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.3)',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  itemCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  itemDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
    marginRight: 12,
  },
});

export default ShopScreen;
