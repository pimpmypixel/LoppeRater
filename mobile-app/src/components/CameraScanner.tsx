import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView, CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

interface CameraScannerProps {
  onPhotoTaken?: (uri: string) => void;
  onPhoneDetected?: (phones: string[]) => void;
  onClose?: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({
  onPhotoTaken,
  onPhoneDetected,
  onClose,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedPhones, setDetectedPhones] = useState<string[]>([]);
  const [lastProcessedFrame, setLastProcessedFrame] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.warn('Camera permission request failed:', error);
      setHasPermission(false);
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current && hasPermission) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        onPhotoTaken?.(photo.uri);
        onClose?.();
      } catch (error) {
        console.error('Photo capture error:', error);
        Alert.alert('Fejl', 'Kunne ikke tage billede');
      }
    }
  };

  // OCR processing function - Expo compatible mock with realistic behavior
  const processFrameForOCR = async () => {
    if (isProcessing || Date.now() - lastProcessedFrame < 1000) {
      return; // Throttle processing to once per second
    }

    setIsProcessing(true);
    setLastProcessedFrame(Date.now());

    try {
      // Simulate realistic OCR processing with different scenarios
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing delay

      // Mock OCR results that simulate real-world scenarios
      const mockScenarios = [
        {
          phones: ["+45 12345678"]
        },
        {
          phones: ["87654321"]
        },
        {
          phones: ["+45 55556666"]
        },
        {
          phones: [] // No phones found
        }
      ];

      // Randomly select a scenario (weighted towards finding phones)
      const randomIndex = Math.random() < 0.7 ? Math.floor(Math.random() * 3) : 3;
      const selectedScenario = mockScenarios[randomIndex];

      setDetectedPhones(selectedScenario.phones);
      onPhoneDetected?.(selectedScenario.phones);

      // Show feedback
      if (selectedScenario.phones.length > 0) {
        Alert.alert(
          'Telefonnummer fundet!',
          `Fundet: ${selectedScenario.phones[0]}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Ingen telefonnummer',
          'Prøv at scanne teksten tættere på eller fra en anden vinkel',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      Alert.alert('OCR Fejl', 'Kunne ikke behandle billedet. Prøv igen.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraReady = () => {
    console.log('Camera ready for OCR processing');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Anmoder om kamera tilladelse...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Kamera adgang nægtet</Text>
        <TouchableOpacity onPress={requestCameraPermission} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Prøv igen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={handleCameraReady}
      />

      {/* Overlay UI with absolute positioning */}
      <View style={styles.cameraOverlay}>
        {/* OCR Status Indicator */}
        <View style={styles.ocrStatusContainer}>
          <View style={[styles.ocrStatusIndicator, isProcessing && styles.ocrStatusActive]}>
            <Ionicons
              name={isProcessing ? "scan" : "scan-outline"}
              size={20}
              color={isProcessing ? "#4CAF50" : "#fff"}
            />
            <Text style={styles.ocrStatusText}>
              {isProcessing ? 'Behandler...' : 'OCR Klar'}
            </Text>
          </View>
        </View>

        {/* Detected Phone Numbers Overlay */}
        {detectedPhones.length > 0 && (
          <View style={styles.detectedPhonesContainer}>
            <Text style={styles.detectedPhonesTitle}>Fundne telefonnumre:</Text>
            {detectedPhones.map((phone, index) => (
              <TouchableOpacity
                key={index}
                style={styles.detectedPhoneItem}
                onPress={() => {
                  onPhoneDetected?.([phone]);
                  onClose?.();
                }}
              >
                <Ionicons name="call" size={16} color="#4CAF50" />
                <Text style={styles.detectedPhoneText}>{phone}</Text>
                <Text style={styles.detectedPhoneAction}>Tryk for at vælge</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Camera Controls */}
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.cameraCloseButton}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}
            style={styles.cameraFlipButton}
          >
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraFooter}>
          <TouchableOpacity
            onPress={takePhoto}
            style={styles.captureButton}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* OCR Processing Button */}
          <TouchableOpacity
            onPress={processFrameForOCR}
            style={styles.ocrButton}
            disabled={isProcessing}
          >
            <Ionicons name="scan" size={20} color="white" />
            <Text style={styles.ocrButtonText}>
              {isProcessing ? 'Behandler...' : 'Scan OCR'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* OCR Instructions */}
        <View style={styles.ocrInstructions}>
          <Text style={styles.ocrInstructionsText}>
            Peg kameraet mod bod information eller telefonnummer
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  permissionContainer: {
    width: Math.min(Dimensions.get('window').width * 0.9, 400),
    height: Math.min(Dimensions.get('window').width * 0.9, 400),
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraContainer: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 16,
  },
  camera: {
    width: Math.min(Dimensions.get('window').width * 0.9, 400),
    height: Math.min(Dimensions.get('window').width * 0.9, 400),
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cameraCloseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  cameraFooter: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
  },
  ocrStatusContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
  },
  ocrStatusIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ocrStatusActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  ocrStatusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  detectedPhonesContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    maxHeight: 200,
  },
  detectedPhonesTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detectedPhoneItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detectedPhoneText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  detectedPhoneAction: {
    color: 'white',
    fontSize: 12,
  },
  cameraFlipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  ocrInstructions: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
  ocrInstructionsText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  ocrButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  ocrButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CameraScanner;