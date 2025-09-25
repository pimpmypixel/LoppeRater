import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppLogoIcon: React.FC = () => {
  return (
    <View style={styles.logoContainer}>
      <Ionicons name="storefront" size={32} color="#2196F3" />
      <Text style={styles.logoText}>LoppeRater</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default AppLogoIcon;