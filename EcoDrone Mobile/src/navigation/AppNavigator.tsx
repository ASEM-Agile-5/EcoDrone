import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import VendorBrowseScreen from '../screens/VendorBrowseScreen';
import MenuOrderScreen from '../screens/MenuOrderScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderBreakdownScreen from '../screens/OrderBreakdownScreen';
import DroneTemperatureScreen from '../screens/DroneTemperatureScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  MenuOrder: { vendor: { id: number; name: string; rating: number; deliveryTime: string; imageUrl: string } };
  Checkout: { vendor: any; deliveryLocation: string; cartItems: any[] };
  OrderTracking: { orderId: string };
  OrderBreakdown: { orderId: string };
};

export type HomeStackParamList = {
  VendorBrowse: undefined;
  MenuOrder: { vendor: any };
  Checkout: { vendor: any; deliveryLocation: string; cartItems: any[] };
};

export type OrdersStackParamList = {
  Orders: undefined;
  OrderTracking: { orderId: string };
  OrderBreakdown: { orderId: string };
};

export type TemperatureStackParamList = {
  DroneTemperature: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const TemperatureStack = createNativeStackNavigator<TemperatureStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="VendorBrowse" component={VendorBrowseScreen} />
      <HomeStack.Screen name="MenuOrder" component={MenuOrderScreen} />
      <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
    </HomeStack.Navigator>
  );
}

function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} />
      <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <OrdersStack.Screen name="OrderBreakdown" component={OrderBreakdownScreen} />
    </OrdersStack.Navigator>
  );
}

function TemperatureStackNavigator() {
  return (
    <TemperatureStack.Navigator screenOptions={{ headerShown: false }}>
      <TemperatureStack.Screen name="DroneTemperature" component={DroneTemperatureScreen} />
    </TemperatureStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TemperatureTab"
        component={TemperatureStackNavigator}
        options={{
          tabBarLabel: 'Temp',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="thermostat" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="SignUp" component={SignUpScreen} />
      <RootStack.Screen name="Main" component={MainTabs} />
    </RootStack.Navigator>
  );
}
