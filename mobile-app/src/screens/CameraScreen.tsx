import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import AppLogoIcon from '../components/app-logo-icon';

export default function CameraScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppLogoIcon />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Camera</Text>
        <Text style={styles.subtitle}>This screen will handle camera functionality for photos and OCR</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
});