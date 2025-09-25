import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '../store';
import { Rating } from '../types';
import MultiRatingSliders from '../components/StarRating';
import AppLayout from '../components/AppLayout';

interface RouteParams {
  stallId: string;
}

const DANISH_PHONE_REGEX = /^(\+45|0045)?[2-9]\d{7}$/;

export default function RateStallScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { addRating } = useAppStore();

  // Form state
  const [stallName, setStallName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [ratings, setRatings] = useState({
    selection: 5,
    friendliness: 5,
    creativity: 5,
  });

  const validatePhoneNumber = (phone: string) => {
    if (!phone.trim()) {
      setPhoneError('Telefonnummer er påkrævet');
      return false;
    }
    if (!DANISH_PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
      setPhoneError('Ugyldigt dansk telefonnummer');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!stallName.trim()) {
      Alert.alert(t('common.error'), 'Bod navn er påkrævet');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    if (ratings.selection === 0 || ratings.friendliness === 0 || ratings.creativity === 0) {
      Alert.alert(t('common.error'), 'Vælg venligst bedømmelser for alle kategorier');
      return;
    }

    try {
      // Create a temporary stall ID for now - in a real app this would be generated or looked up
      const tempStallId = `stall-${Date.now()}`;

      const newRating: Omit<Rating, 'id' | 'createdAt'> = {
        stallId: tempStallId,
        userId: 'current-user', // TODO: Get from auth
        selection: ratings.selection,
        friendliness: ratings.friendliness,
        creativity: ratings.creativity,
        comment: `Stall: ${stallName}, Phone: ${phoneNumber}, Ratings: Selection ${ratings.selection}/10, Friendliness ${ratings.friendliness}/10, Creativity ${ratings.creativity}/10`,
      };

      await addRating(newRating);

      Alert.alert(
        'Tak for din bedømmelse!',
        'Din bedømmelse er sendt!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Submit rating error:', error);
      Alert.alert(t('common.error'), 'Kunne ikke sende bedømmelse');
    }
  };

  return (
    <AppLayout
      showHeader={true}
      showFooter={true}
      onBackPress={() => navigation.goBack()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Bedøm boden!</Text>
            <Text style={styles.subtitle}>Er der noget, der er værd at eje?</Text>
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bodens betalingsnummer</Text>
            <Text style={styles.micro}>Anonymiseres i henhold til GDPR</Text>
            <TextInput
              style={[styles.textInput, phoneError ? styles.inputError : null]}
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (phoneError) validatePhoneNumber(text);
              }}
              placeholder="12345678"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              onBlur={() => validatePhoneNumber(phoneNumber)}
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>

          {/* Photo Section with Fake Buttons */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vis hvad der er godt eller mindre godt.</Text>
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => Alert.alert('Info', 'Dette ville åbne kameraet for at tage et billede')}
              >
                <Ionicons name="camera" size={24} color="#2196F3" />
                <Text style={styles.photoButtonText}>Tag billede</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => Alert.alert('Info', 'Dette ville åbne galleriet for at vælge et billede')}
              >
                <Ionicons name="images" size={24} color="#2196F3" />
                <Text style={styles.photoButtonText}>Vælg fra galleri</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => Alert.alert('Info', 'Dette ville scanne QR-koden for MobilePay')}
              >
                <Ionicons name="qr-code" size={24} color="#2196F3" />
                <Text style={styles.photoButtonText}>Scan QR-kode</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stall Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bod navn</Text>
            <Text style={styles.micro}>Evt. indehaver eller alias</Text>
            <TextInput
              style={styles.textInput}
              value={stallName}
              onChangeText={setStallName}
              placeholder="Indtast bod navn..."
              placeholderTextColor="#999"
            />
          </View>

          {/* Multi Rating Sliders */}
          <MultiRatingSliders
            ratings={ratings}
            onRatingsChange={setRatings}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Send bedømmelse</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  micro: {
    fontSize: 8,
    fontWeight: '500',
    color: '#666',
    textAlign: 'left',
    marginTop: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 0,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  cameraButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cameraButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  retakeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  retakeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    textAlign: 'center',
  },
});