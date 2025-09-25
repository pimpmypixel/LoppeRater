import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { NavigationParamList } from '../types';
import { useAppStore } from '../store';

// Import screens (we'll create these next)
import WelcomeScreen from '../screens/WelcomeScreen';
import MarketsScreen from '../screens/MarketsScreen';
import MarketDetailScreen from '../screens/MarketDetailScreen';
import CreateStallScreen from '../screens/CreateStallScreen';
import CameraScreen from '../screens/CameraScreen';
import RateStallScreen from '../screens/RateStallScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Markets') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Rate') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Markets" 
        component={MarketsScreen}
        options={{
          tabBarLabel: t('markets.title'),
        }}
      />
      <Tab.Screen 
        name="Rate" 
        component={RateStallScreen}
        options={{
          tabBarLabel: 'Rate boden',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: t('common.settings'),
        }}
      />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const { isAuthenticated } = useAppStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="MarketDetail" 
              component={MarketDetailScreen}
              options={{
                headerShown: true,
                title: '',
              }}
            />
            <Stack.Screen 
              name="CreateStall" 
              component={CreateStallScreen}
              options={{
                headerShown: true,
                title: '',
              }}
            />
            <Stack.Screen 
              name="CameraScreen" 
              component={CameraScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="RateStall" 
              component={RateStallScreen}
              options={{
                headerShown: true,
                title: '',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}