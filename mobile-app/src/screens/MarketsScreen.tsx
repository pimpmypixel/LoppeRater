import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { useAppStore } from '../store';
import { Market } from '../types';
import { formatDistance, calculateDistance, debounce } from '../utils';
import apiService from '../services/api';
import AppLogoIcon from '../components/app-logo-icon';

export default function MarketsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const {
    markets,
    setMarkets,
    userLocation,
    setUserLocation,
    isLoading,
    setLoading,
    setError,
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMarkets();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    filterMarkets();
  }, [markets, searchQuery, userLocation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('location.permissionRequired'),
          'Vi har brug for din placering for at vise nærliggende loppemarkeder.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(t('common.error'), t('location.locationError'));
    }
  };

  const loadMarkets = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data until backend is ready
      const mockMarkets: Market[] = [
        {
          id: '1',
          name: 'Frederiksberg Loppemarked',
          description: 'Stort loppemarked med mange spændende boder',
          location: {
            latitude: 55.6761,
            longitude: 12.5683,
            address: 'Frederiksberg Allé 1',
            city: 'Frederiksberg',
            postalCode: '2000',
          },
          startDate: '2025-09-26T08:00:00Z',
          endDate: '2025-09-26T16:00:00Z',
          isActive: true,
          stalls: [],
        },
        {
          id: '2',
          name: 'Nørrebro Genbrugsloppemarked',
          description: 'Bæredygtigt loppemarked med unikke fund',
          location: {
            latitude: 55.6867,
            longitude: 12.5700,
            address: 'Nørrebrogade 100',
            city: 'København N',
            postalCode: '2200',
          },
          startDate: '2025-09-27T09:00:00Z',
          endDate: '2025-09-27T15:00:00Z',
          isActive: true,
          stalls: [],
        },
        {
          id: '3',
          name: 'Amager Strand Loppemarked',
          description: 'Loppemarked ved stranden med hyggelig stemning',
          location: {
            latitude: 55.6586,
            longitude: 12.6232,
            address: 'Amager Strandpark',
            city: 'København S',
            postalCode: '2300',
          },
          startDate: '2025-09-28T10:00:00Z',
          endDate: '2025-09-28T17:00:00Z',
          isActive: true,
          stalls: [],
        },
      ];

      setMarkets(mockMarkets);
      
    } catch (error) {
      console.error('Load markets error:', error);
      setError('Kunne ikke indlæse markeder');
    } finally {
      setLoading(false);
    }
  };

  const filterMarkets = () => {
    let filtered = [...markets];

    if (searchQuery) {
      filtered = filtered.filter(market =>
        market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.location.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered = filtered.map(market => ({
        ...market,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          market.location.latitude,
          market.location.longitude
        ),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredMarkets(filtered);
  };

  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 300);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarkets();
    setRefreshing(false);
  };

  const renderMarketItem = ({ item }: { item: Market & { distance?: number } }) => (
    <TouchableOpacity
      style={styles.marketCard}
      onPress={() => navigation.navigate('MarketDetail', { marketId: item.id })}
    >
      <View style={styles.marketHeader}>
        <Text style={styles.marketName}>{item.name}</Text>
        {item.distance && (
          <Text style={styles.distance}>
            {formatDistance(item.distance)}
          </Text>
        )}
      </View>
      
      <Text style={styles.marketDescription}>{item.description}</Text>
      
      <View style={styles.marketFooter}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.locationText}>
            {item.location.city}
          </Text>
        </View>
        
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.dateText}>
            {new Date(item.startDate).toLocaleDateString('da-DK', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppLogoIcon />
        <Text style={styles.title}>{t('markets.title')}</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('markets.searchPlaceholder')}
            onChangeText={debouncedSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredMarkets}
        renderItem={renderMarketItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>{t('markets.noMarkets')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  marketCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  marketDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  marketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});