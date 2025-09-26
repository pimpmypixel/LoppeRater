import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const AppFooter: React.FC = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.footerLogo}
          resizeMode="contain"
        />
        <Text style={styles.footerText}>
          ©2025 LoppeRater - Sammen hæver vi værdien
        </Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Privatliv</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerContent: {
    alignItems: 'center',
  },
  footerLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  footerLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  footerLinkText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default AppFooter;