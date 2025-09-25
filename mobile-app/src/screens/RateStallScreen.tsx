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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useAppStore } from '../store';
import { Rating } from '../types';
import CameraScanner from '../components/CameraScanner';
import MultiRatingSliders from '../components/StarRating';

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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ratings, setRatings] = useState({
    selection: 5,
    friendliness: 5,
    creativity: 5,
  });

  // Camera state - only for native platforms
  const [showCamera, setShowCamera] = useState(false);

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

  const handlePhotoTaken = (uri: string) => {
    setPhotoUri(uri);
    setShowCamera(false);
  };

  const handlePhoneDetected = (phones: string[]) => {
    if (phones.length > 0 && !phoneNumber.trim()) {
      setPhoneNumber(phones[0]);
    }
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

  if (showCamera) {
    return (
      <CameraScanner
        onPhotoTaken={handlePhotoTaken}
        onPhoneDetected={handlePhoneDetected}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Bedøm bod</Text>
              <Text style={styles.subtitle}>Bedøm boden!</Text>
            </View>
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefonnummer</Text>
            <TextInput
              style={[styles.textInput, phoneError ? styles.inputError : null]}
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (phoneError) validatePhoneNumber(text);
              }}
              placeholder="f.eks. 12345678 eller +45 12345678"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              onBlur={() => validatePhoneNumber(phoneNumber)}
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>

          {/* Camera Section for OCR */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vis hvad der er godt eller mindre godt.</Text>
            {photoUri ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                <TouchableOpacity
                  onPress={() => setShowCamera(true)}
                  style={styles.retakeButton}
                >
                  <Ionicons name="camera-reverse" size={20} color="white" />
                  <Text style={styles.retakeText}>Scan igen</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowCamera(true)}
                style={styles.cameraButton}
              >
                <Ionicons name="camera" size={24} color="#2196F3" />
                <Text style={styles.cameraButtonText}>Skyd et billede af boden!</Text><br />
              </TouchableOpacity>
            )}
          </View>

          {/* Stall Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bod navn</Text>
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
    </SafeAreaView>
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
});