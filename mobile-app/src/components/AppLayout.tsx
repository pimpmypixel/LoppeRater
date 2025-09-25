import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLogoIcon from './app-logo-icon';
import AppFooter from './app-footer';

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  headerTitle?: string;
  onBackPress?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  headerTitle,
  onBackPress,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Logo/Brand */}
            <AppLogoIcon />

            {/* Header Actions */}
            <View style={styles.headerActions}>
              {onBackPress && (
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
              )}
              {headerTitle && (
                <Text style={styles.headerTitle}>{headerTitle}</Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer Section */}
      {showFooter && <AppFooter />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
});

export default AppLayout;