import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PlantNavigator from './PlantNavigator';
import PlantAssistantScreen from '../screens/tools/PlantAssistantScreen';
import ProfileNavigator from './ProfileNavigator';
import FertilizerCalculatorScreen from '../screens/tools/FertilizerCalculatorScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DiseaseLibraryScreen from '../screens/DiseaseLibraryScreen';
import CustomTabBar from '../components/CustomTabBar';
import CommunityScreen from '../screens/CommunityScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import PostDetailScreen from '../screens/PostDetailScreen'; // ✅ Only once, here

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const CommunityNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="CommunityFeed" component={CommunityScreen} options={{ animationEnabled: false }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ animationEnabled: true }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ animationEnabled: true }} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={PlantNavigator} />
      <Tab.Screen name="Community" component={CommunityNavigator} />
      <Tab.Screen name="Tools" component={FertilizerCalculatorScreen} />
      <Tab.Screen name="Chat" component={PlantAssistantScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="DiseaseLibrary" component={DiseaseLibraryScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;