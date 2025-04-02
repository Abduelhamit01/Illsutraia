import React, { useState, useCallback } from 'react';
import {
  useColorScheme,
  useWindowDimensions,
  Image,
  Alert,
  View,
  TouchableOpacityProps,
} from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator'; // Adjust path if needed
import { Image as ExpoImage } from 'expo-image'; // Use expo-image

// --- Types ---
const ART_STYLES = ['Cozy', 'Comic', 'Animation'] as const;
type ArtStyle = typeof ART_STYLES[number];

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

type Props = {
  navigation: WelcomeScreenNavigationProp;
};

// Re-use or import Theme interface
interface Theme {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  placeholderText: string;
  buttonText: string;
  shadowColor: string;
  activeOption: string;
  inputBackground: string;
}

// --- Themes (Adjust as needed, similar to other screens) ---
const lightTheme: Theme = {
  background: '#F8F0E3',
  text: '#333333',
  primary: '#A0D2DB',
  secondary: '#E1BECB',
  placeholderText: '#A9A9A9',
  buttonText: '#FFFFFF',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  activeOption: '#A0D2DB',
  inputBackground: '#FFFFFF',
};

const darkTheme: Theme = {
  background: '#2C3E50',
  text: '#ECF0F1',
  primary: '#5D9CEC',
  secondary: '#E1BECB',
  placeholderText: '#BDC3C7',
  buttonText: '#FFFFFF',
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  activeOption: '#5D9CEC',
  inputBackground: '#34495E',
};

// --- Styled Components ---
const ScreenContainer = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    padding: 30, // More padding for welcome screen
    justifyContent: 'center',
    alignItems: 'center',
  },
}))<{ theme: Theme }>`
  background-color: ${(props: { theme: Theme }) => props.theme.background};
  flex: 1;
`;

const WelcomeImage = styled(ExpoImage)`
  width: 150px;
  height: 150px;
  margin-bottom: 30px;
  /* Add require('path/to/your/logo.png') or a remote URI */
  background-color: ${(props: { theme: Theme }) => props.theme.placeholderText};
`;

const Title = styled.Text<{ theme: Theme; fontSize: number }>`
  font-size: ${(props: { fontSize: number }) => props.fontSize}px;
  font-weight: bold;
  color: ${(props: { theme: Theme }) => props.theme.text};
  text-align: center;
  margin-bottom: 15px;
`;

const Description = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  color: ${(props: { theme: Theme }) => props.theme.text};
  text-align: center;
  margin-bottom: 30px;
  line-height: 24px;
`;

const Section = styled.View`
  margin-bottom: 30px;
  width: 100%; /* Ensure section takes width */
  align-items: center; /* Center title within section */
`;

const SectionTitle = styled.Text<{ theme: Theme }>`
  font-size: 18px;
  font-weight: 600;
  color: ${(props: { theme: Theme }) => props.theme.text};
  margin-bottom: 15px;
`;

const StyleSelectorContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%; /* Take full width */
`;

// Refined Style Button with subtle shadow/border
interface StyleOptionButtonProps extends TouchableOpacityProps {
  theme: Theme;
  isActive: boolean;
}

const StyleOptionButton = styled.TouchableOpacity<StyleOptionButtonProps>`
  background-color: ${(props: { theme: Theme; isActive: boolean }) =>
    props.isActive ? props.theme.activeOption : props.theme.inputBackground};
  padding: 12px 20px;
  border-radius: 25px;
  /* Restore border */
  border: 1px solid
    ${(props: { theme: Theme; isActive: boolean }) =>
      props.isActive ? props.theme.activeOption : props.theme.placeholderText};
  /* Restore shadow/elevation */
  shadow-color: ${(props: { theme: Theme }) => props.theme.shadowColor};
  shadow-offset: 0px 2px; 
  shadow-opacity: ${(props: { isActive: boolean }) => (props.isActive ? 0.2 : 0.1)};
  shadow-radius: 3px;
  elevation: ${(props: { isActive: boolean }) => (props.isActive ? 4 : 2)};
  /* Add transition properties if using Reanimated */
`;

const StyleOptionText = styled.Text<{ theme: Theme; isActive: boolean }>`
  color: ${(props: { theme: Theme; isActive: boolean }) =>
    props.isActive ? props.theme.buttonText : props.theme.text};
  font-size: 16px;
  font-weight: 500;
`;

// Consistent Button Style (can be moved to a shared components file later)
interface BaseButtonProps extends TouchableOpacityProps {
  theme: Theme;
  backgroundColor?: string;
  disabled?: boolean;
}

const BaseButton = styled.TouchableOpacity<BaseButtonProps>`
  background-color: ${(props: { theme: Theme; backgroundColor?: string; disabled?: boolean }) =>
    props.disabled
      ? props.theme.placeholderText
      : props.backgroundColor || props.theme.primary};
  padding: 15px 40px;
  border-radius: 10px;
  align-items: center;
  margin-top: 10px;
  shadow-color: ${(props: { theme: Theme }) => props.theme.shadowColor};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.8;
  shadow-radius: 2px;
  elevation: 3;
  opacity: ${(props: { disabled?: boolean }) => (props.disabled ? 0.6 : 1)};
`;

const ButtonText = styled.Text<{ theme: Theme }>`
  color: ${(props: { theme: Theme }) => props.theme.buttonText};
  font-size: 16px;
  font-weight: bold;
`;

// --- Component ---
// Use React.memo for performance optimization
const WelcomeScreenComponent: React.FC<Props> = ({ navigation }) => {
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | null>(null);
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const titleFontSize = width > 600 ? 32 : 28; // Slightly larger title

  // Use useCallback for event handlers passed to children or used in effects
  const handleGetStarted = useCallback(() => {
    if (!selectedStyle) {
      Alert.alert('Select a Style', 'Please choose an art style to get started.');
      return;
    }
    // Navigate directly to IllustrationScreen
    navigation.navigate('Illustration', { selectedStyle }); 
  }, [navigation, selectedStyle]); // Dependencies: navigation and selectedStyle

  const handleSelectStyle = useCallback((style: ArtStyle) => {
    setSelectedStyle(style);
  }, []); // No dependencies needed if just setting state

  return (
    <ThemeProvider theme={theme}>
      <ScreenContainer theme={theme}>
        <WelcomeImage
          theme={theme}
          source={require('../../assets/logo.png')}
          contentFit="contain"
          transition={300}
        />

        <Title theme={theme} fontSize={titleFontSize}>
          Welcome to Illustraia!
        </Title>

        <Description theme={theme}>
          Turn your photos into beautiful illustrations in your favorite style.
          Choose a style below to begin your creative journey.
        </Description>

        <Section>
          <SectionTitle theme={theme}>Choose Your Art Style</SectionTitle>
          <StyleSelectorContainer>
            {ART_STYLES.map((style) => (
              <StyleOptionButton
                key={style}
                theme={theme}
                isActive={selectedStyle === style}
                onPress={() => handleSelectStyle(style)} // Use memoized handler
                accessibilityLabel={`Select ${style} style`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedStyle === style }}
              >
                <StyleOptionText theme={theme} isActive={selectedStyle === style}>
                  {style}
                </StyleOptionText>
              </StyleOptionButton>
            ))}
          </StyleSelectorContainer>
        </Section>

        <BaseButton
          theme={theme}
          onPress={handleGetStarted} // Use memoized handler
          disabled={!selectedStyle}
          accessibilityLabel="Get Started Button"
        >
          <ButtonText theme={theme}>Get Started</ButtonText>
        </BaseButton>
      </ScreenContainer>
    </ThemeProvider>
  );
};

export const WelcomeScreen = React.memo(WelcomeScreenComponent); 