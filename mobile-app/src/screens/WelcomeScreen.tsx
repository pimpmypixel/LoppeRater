import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as AuthSession from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '../store';
import apiService from '../services/api';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const { setUser, setLoading, isLoading } = useAppStore();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement Google OAuth with AuthSession
      // For now, we'll simulate a login
      /* Alert.alert(
        'Google Login',
        'Google login will be implemented when backend is ready',
        [{ text: 'OK' }]
      ); */
      
      // Simulate successful login for development
      const mockUser = {
        id: '1',
        name: 'Test Bruger',
        email: 'test@example.com',
        authProvider: 'google' as const,
        roles: ['buyer' as const],
      };
      
      setUser(mockUser);
      
    } catch (error) {
      Alert.alert(
        t('common.error'),
        'Der opstod en fejl under login. Prøv igen.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement Facebook Login with AuthSession
      Alert.alert(
        'Facebook Login',
        'Facebook login will be implemented when backend is ready',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert(
        t('common.error'),
        'Der opstod en fejl under login. Prøv igen.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Illustration placeholder */}
        <View style={styles.logoContainer}>
          <Ionicons name="storefront" size={80} color="#2196F3" />
        </View>
        
        <Text style={styles.title}>{t('welcome.title')}</Text>
        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        <Text style={styles.description}>{t('welcome.cta')}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.loginButton, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={24} color="white" />
            <Text style={styles.buttonText}>
              {t('auth.signInWith')} {t('auth.google')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.loginButton, styles.facebookButton]}
            onPress={handleFacebookLogin}
            disabled={isLoading}
          >
            <Ionicons name="logo-facebook" size={24} color="white" />
            <Text style={styles.buttonText}>
              {t('auth.signInWith')} {t('auth.facebook')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});