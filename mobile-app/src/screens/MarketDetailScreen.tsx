import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '../store';
import { Market } from '../types';
import { formatDistance, calculateDistance } from '../utils';
import AppLogoIcon from '../components/app-logo-icon';

interface RouteParams {
  marketId: string;
}

export default function MarketDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { marketId } = route.params as RouteParams;
  
  const { markets, userLocation } = useAppStore();
  const [market, setMarket] = useState<Market | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    // Find the market by ID
    const foundMarket = markets.find(m => m.id === marketId);
    if (foundMarket) {
      setMarket(foundMarket);
      
      // Calculate distance if user location is available
      if (userLocation) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          foundMarket.location.latitude,
          foundMarket.location.longitude
        );
        setDistance(dist);
      }
    }
  }, [marketId, markets, userLocation]);

  const handleIAmHere = () => {
    if (!market) return;
    
    Alert.alert(
      'Jeg er her!',
      `Du er nu registreret som værende på ${market.name}. Nu kan du oprette en bod eller se andre boder på markedet.`,
      [
        {
          text: 'Se boder',
          onPress: () => {
            // TODO: Navigate to stalls view when implemented
            console.log('Navigate to stalls view');
          }
        },
        {
          text: 'Opret bod',
          style: 'default',
          onPress: () => navigation.navigate('CreateStall', { marketId: market.id })
        }
      ]
    );
  };

  if (!market) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Loppemarked ikke fundet</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Gå tilbage</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <AppLogoIcon />
          <Text style={styles.title}>{market.name}</Text>
          {distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={16} color="#2196F3" />
              <Text style={styles.distance}>{formatDistance(distance)}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {market.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{market.description}</Text>
          </View>
        )}

        {/* Location Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color="#333" />
            <Text style={styles.sectionTitle}>Placering</Text>
          </View>
          <Text style={styles.locationText}>{market.location.address}</Text>
          <Text style={styles.locationText}>
            {market.location.postalCode} {market.location.city}
          </Text>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#333" />
            <Text style={styles.sectionTitle}>Dato & Tid</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(market.startDate)}</Text>
          <Text style={styles.timeText}>
            {formatTime(market.startDate)} - {formatTime(market.endDate)}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: market.isActive ? '#4CAF50' : '#FF9800' }]} />
            <Text style={styles.statusText}>
              {market.isActive ? 'Aktivt' : 'Ikke aktivt'}
            </Text>
          </View>
        </View>

        {/* Stalls Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront" size={20} color="#333" />
            <Text style={styles.sectionTitle}>Boder</Text>
          </View>
          <Text style={styles.stallsText}>
            {market.stalls?.length || 0} boder registreret
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.iAmHereButton}
          onPress={handleIAmHere}
          activeOpacity={0.8}
        >
          <Ionicons name="location" size={24} color="white" />
          <Text style={styles.iAmHereButtonText}>Jeg er her</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  stallsText: {
    fontSize: 16,
    color: '#666',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  iAmHereButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iAmHereButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});