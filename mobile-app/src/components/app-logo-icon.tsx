import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const AppLogoIcon: React.FC = () => {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
});

export default AppLogoIcon;