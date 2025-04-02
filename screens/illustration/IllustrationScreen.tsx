import React, { useState, useCallback } from 'react';
import {
  useColorScheme,
  useWindowDimensions,
  Image,
  ActivityIndicator,
  Alert,
  View,
  TouchableOpacityProps,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateImageFromPrompt } from '../../api/leonardo';

// --- Types ---
type IllustrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Illustration'
>;

type IllustrationScreenRouteProp = RouteProp<RootStackParamList, 'Illustration'>;

// Define ArtStyle type (matches MediaUploadScreen)
const ART_STYLES = ['Cozy', 'Comic', 'Animation'] as const;
type ArtStyle = typeof ART_STYLES[number];

type Props = {
  navigation: IllustrationScreenNavigationProp;
  route: IllustrationScreenRouteProp;
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
  spinnerColor: string;
  inputBackground: string; // Added for consistency
}

// --- Themes (Adjust as needed) ---
const lightTheme: Theme = {
  background: '#F8F0E3',
  text: '#333333',
  primary: '#A0D2DB',
  secondary: '#E1BECB',
  placeholderText: '#A9A9A9',
  buttonText: '#FFFFFF',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  spinnerColor: '#A0D2DB',
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
  spinnerColor: '#5D9CEC',
  inputBackground: '#34495E',
};

// --- Styled Components ---
const StyledSafeAreaView = styled(SafeAreaView)<{ theme: Theme }>`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.background};
`;

const ScreenScrollView = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  keyboardShouldPersistTaps: 'handled',
}))`
  flex: 1;
`;

const Header = styled.View`
  align-items: center;
  margin-bottom: 15px;
`;

const Title = styled.Text<{ theme: Theme; fontSize: number }>`
  font-size: ${(props: { fontSize: number }) => props.fontSize}px;
  font-weight: bold;
  color: ${(props: { theme: Theme }) => props.theme.text};
  text-align: center;
`;

const PreviewContainer = styled.View<{ theme: Theme; height: number }>`
  position: relative;
  height: ${(props: { height: number }) => props.height}px;
  width: 100%;
  margin-bottom: 15px;
  border-radius: 10px;
  overflow: hidden;
  background-color: ${(props: { theme: Theme }) => props.theme.inputBackground};
  border: 1px solid ${(props: { theme: Theme }) => props.theme.placeholderText};
  justify-content: center;
  align-items: center;
`;

const PromptInput = styled.TextInput.attrs<{ theme: Theme }>((props: { theme: Theme }) => ({
  placeholderTextColor: props.theme.placeholderText,
}))<{ theme: Theme }>`
  min-height: 80px; /* Adjust height as needed */
  background-color: ${(props: { theme: Theme }) => props.theme.inputBackground};
  color: ${(props: { theme: Theme }) => props.theme.text};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  font-size: 16px;
  text-align-vertical: top;
  border: 1px solid ${(props: { theme: Theme }) => props.theme.placeholderText};
`;

const PlaceholderText = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  color: ${(props: { theme: Theme }) => props.theme.placeholderText};
  text-align: center;
`;

const StyledImage = styled(ExpoImage)`
  width: 100%;
  height: 100%;
`;

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;

const LoadingText = styled.Text<{ theme: Theme }>`
  color: #ffffff;
  margin-top: 10px;
  font-size: 16px;
`;

const StyleInfoContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const StyleInfoText = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  color: ${(props: { theme: Theme }) => props.theme.text};
  font-style: italic;
`;

const ButtonContainer = styled.View`
  /* Buttons at bottom */
`;

// Consistent Button Style
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
  padding: 15px 20px;
  border-radius: 10px;
  align-items: center;
  margin-bottom: 10px;
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
const IllustrationScreenComponent: React.FC<Props> = ({ navigation, route }) => {
  const { selectedStyle } = route.params;
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImageUri, setGeneratedImageUri] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const titleFontSize = width > 600 ? 28 : 24;
  const previewHeight = height * 0.4;

  const generateIllustration = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      Alert.alert('Missing Prompt', 'Please enter a description for the image.');
      return;
    }
    Keyboard.dismiss(); 
    
    console.log(`Generating illustration for: "${trimmedPrompt}" in style: ${selectedStyle}...`);
    setIsLoading(true);
    setGeneratedImageUri(null);

    const resultUri = await generateImageFromPrompt(trimmedPrompt, selectedStyle);

    if (resultUri) {
      setGeneratedImageUri(resultUri);
      console.log('Image generated successfully:', resultUri);
    } else {
      Alert.alert('Generation Failed', 'Could not generate the image. Please try again or check the console for errors.');
    }
    setIsLoading(false);
  }, [prompt, selectedStyle]);

  const handleProceedToExport = useCallback(() => {
    if (!generatedImageUri) {
      Alert.alert("Not Ready", "Please generate the illustration first.");
      return;
    }
    if (isLoading) {
       Alert.alert("Please Wait", "Illustration generation is still in progress.");
       return;
    }
    navigation.navigate('Export', { illustrationUri: generatedImageUri });
  }, [navigation, generatedImageUri, isLoading]);

  return (
    <ThemeProvider theme={theme}>
      <StyledSafeAreaView theme={theme}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
             <ScreenScrollView>
                <View>
                  <Header>
                    <Title theme={theme} fontSize={titleFontSize}>
                      Describe Your Image
                    </Title>
                  </Header>

                  <StyleInfoContainer>
                    <StyleInfoText theme={theme}>
                      Selected Style: {selectedStyle}
                    </StyleInfoText>
                  </StyleInfoContainer>
                  <PreviewContainer theme={theme} height={previewHeight}>
                    {generatedImageUri ? (
                      <StyledImage
                        source={{ uri: generatedImageUri }}
                        contentFit="contain"
                        transition={300}
                      />
                    ) : (
                      <PlaceholderText theme={theme}>
                         {isLoading ? 'Generating...' : 'Image will appear here'}
                      </PlaceholderText>
                    )}
                    {isLoading && !generatedImageUri && (
                      <LoadingOverlay>
                        <ActivityIndicator size="large" color={theme.spinnerColor} />
                        <LoadingText theme={theme}>Generating {selectedStyle} style...</LoadingText>
                      </LoadingOverlay>
                    )}
                  </PreviewContainer>
                </View>

                <PromptInput
                    theme={theme}
                    placeholder="Enter a prompt (e.g., a cat wearing a wizard hat)"
                    value={prompt}
                    onChangeText={setPrompt}
                    multiline
                    editable={!isLoading}
                    accessibilityLabel="Image Prompt Input"
                  />

                <ButtonContainer>
                  <BaseButton
                    theme={theme}
                    onPress={generateIllustration}
                    disabled={isLoading || !prompt.trim()}
                    accessibilityLabel="Generate Illustration Button"
                  >
                    <ButtonText theme={theme}>Generate Illustration</ButtonText>
                  </BaseButton>

                  <BaseButton
                    theme={theme}
                    backgroundColor={theme.secondary}
                    onPress={handleProceedToExport}
                    disabled={isLoading || !generatedImageUri}
                    accessibilityLabel="Proceed to Export Button"
                  >
                    <ButtonText theme={theme}>Proceed to Export</ButtonText>
                  </BaseButton>
                </ButtonContainer>
              </ScreenScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </StyledSafeAreaView>
      </ThemeProvider>
  );
};

export const IllustrationScreen = React.memo(IllustrationScreenComponent);
