import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// import { LoginScreen } from '../screens/auth/LoginScreen'; // Removed
import { WelcomeScreen } from '../screens/welcome/WelcomeScreen'; // Added
// import { MediaUploadScreen } from '../screens/media-upload/MediaUploadScreen'; // Removed
import { IllustrationScreen } from '../screens/illustration/IllustrationScreen';
import { ExportScreen } from '../screens/export/ExportScreen';

// Define the parameter list for the stack navigator
export type RootStackParamList = {
  Welcome: undefined; // Added Welcome route
  // Login: undefined; // Removed Login route
  // MediaUpload: { selectedStyle: string }; // Removed
  Illustration: { selectedStyle: string }; // Only needs style now
  Export: {
    illustrationUri: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          // Common screen options
          headerShown: false, // Hide default header
          cardStyleInterpolator: ({ current: { progress } }) => ({ // Basic fade transition
            cardStyle: {
              opacity: progress,
            },
          }),
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        {/* <Stack.Screen name="Login" component={LoginScreen} /> Removed */}
        {/* <Stack.Screen name="MediaUpload" component={MediaUploadScreen} /> Removed */}
        <Stack.Screen name="Illustration" component={IllustrationScreen} />
        <Stack.Screen name="Export" component={ExportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
