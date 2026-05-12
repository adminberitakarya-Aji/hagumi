import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Card } from '../shared/components/Card';
import { Button } from '../shared/components/Button';

const MarketScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Marketplace</Text>
        
        <Card style={styles.listingCard}>
          <Text style={styles.itemName}>Rare Egg</Text>
          <Text style={styles.itemPrice}>🪙 500</Text>
          <Button title="Buy" variant="primary" size="small" style={styles.buyButton} />
        </Card>

        <Card style={styles.listingCard}>
          <Text style={styles.itemName}>Premium Food</Text>
          <Text style={styles.itemPrice}>💎 10</Text>
          <Button title="Buy" variant="primary" size="small" style={styles.buyButton} />
        </Card>

        <Card style={styles.listingCard}>
          <Text style={styles.itemName}>Toy Ball</Text>
          <Text style={styles.itemPrice}>🪙 200</Text>
          <Button title="Buy" variant="primary" size="small" style={styles.buyButton} />
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
  listingCard: {
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
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
    marginRight: 12,
  },
  buyButton: {
    minWidth: 80,
  },
});

export default MarketScreen;
