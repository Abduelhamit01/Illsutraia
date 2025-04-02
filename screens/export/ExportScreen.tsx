import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  TouchableOpacityProps,
  ScrollView,
} from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Types ---
type ExportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Export'>;
type ExportScreenRouteProp = RouteProp<RootStackParamList, 'Export'>;

type Props = {
  navigation: ExportScreenNavigationProp;
  route: ExportScreenRouteProp;
};

// Define state for download/save status
type ActionStatus = 'idle' | 'downloading' | 'saving' | 'sharing' | 'error';

// --- Theme Definition (reuse or import) ---
interface Theme {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  placeholderText: string;
  buttonText: string;
  shadowColor: string;
  inputBackground: string;
  success: string;
  error: string;
}

// --- Themes ---
const lightTheme: Theme = {
  background: '#F8F0E3',
  text: '#333333',
  primary: '#A0D2DB',
  secondary: '#E1BECB',
  placeholderText: '#A9A9A9',
  buttonText: '#FFFFFF',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  inputBackground: '#FFFFFF',
  success: '#2ecc71',
  error: '#e74c3c',
};

const darkTheme: Theme = {
  background: '#2C3E50',
  text: '#ECF0F1',
  primary: '#5D9CEC',
  secondary: '#E1BECB',
  placeholderText: '#BDC3C7',
  buttonText: '#FFFFFF',
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  inputBackground: '#34495E',
  success: '#27ae60',
  error: '#c0392b',
};

// --- Styled Components ---
const StyledSafeAreaView = styled(SafeAreaView)<{ theme: Theme }>`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.background};
`;

// Using ScrollView here mainly for consistency, though content might not overflow
const ScreenScrollView = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
}))`
  flex: 1;
`;

const Header = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.Text<{ theme: Theme; fontSize: number }>`
  font-size: ${(props: { fontSize: number }) => props.fontSize}px;
  font-weight: bold;
  color: ${(props: { theme: Theme }) => props.theme.text};
  text-align: center;
`;

const ContentContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const FinalIllustration = styled.View<{ theme: Theme; height: number }>`
  height: ${(props: { height: number }) => props.height}px;
  width: 90%; /* Slightly wider */
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
  background-color: ${(props: { theme: Theme }) => props.theme.inputBackground};
  border: 1px solid ${(props: { theme: Theme }) => props.theme.placeholderText};
`;

const StyledImage = styled(ExpoImage)`
  width: 100%;
  height: 100%;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-around; /* Space out save/share */
  width: 100%;
  margin-bottom: 15px;
`;

// Consistent Button Style
interface BaseButtonProps extends TouchableOpacityProps {
  theme: Theme;
  backgroundColor?: string;
  disabled?: boolean;
}

const ActionButton = styled.TouchableOpacity<BaseButtonProps>`
  background-color: ${(props: { theme: Theme; backgroundColor?: string; disabled?: boolean }) =>
    props.disabled
      ? props.theme.placeholderText
      : props.backgroundColor || props.theme.primary};
  padding: 12px 25px;
  border-radius: 10px;
  align-items: center;
  flex: 1;
  margin: 0 5px;
  flex-direction: row;
  justify-content: center;
  shadow-color: ${(props: { theme: Theme }) => props.theme.shadowColor};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.8;
  shadow-radius: 2px;
  elevation: 3;
  opacity: ${(props: { disabled?: boolean }) => (props.disabled ? 0.6 : 1)};
`;

const StartOverButton = styled(ActionButton)`
  margin: 10px 0 0 0;
  flex: none;
  width: 80%;
  align-self: center;
`;

const ButtonText = styled.Text<{ theme: Theme }>`
  color: ${(props: { theme: Theme }) => props.theme.buttonText};
  font-size: 16px;
  font-weight: bold;
  margin-left: 5px;
`;

// --- Component ---
const ExportScreenComponent: React.FC<Props> = ({ navigation, route }) => {
  const { illustrationUri } = route.params;
  const [mediaPermissions, requestMediaPermission] = MediaLibrary.usePermissions();
  const [actionStatus, setActionStatus] = useState<ActionStatus>('idle');
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const titleFontSize = width > 600 ? 28 : 24;
  const illustrationHeight = height * 0.5;

  const isActionInProgress = actionStatus !== 'idle' && actionStatus !== 'error';

  const downloadAndGetLocalUri = useCallback(async (remoteUri: string): Promise<string | null> => {
    if (remoteUri.startsWith('file://')) return remoteUri;

    setActionStatus('downloading');
    try {
      const fileUri = FileSystem.documentDirectory + `illustraia-${Date.now()}.jpg`;
      console.log(`Downloading ${remoteUri} to ${fileUri}`);
      const { uri: localUri } = await FileSystem.downloadAsync(remoteUri, fileUri);
      console.log('Downloaded successfully:', localUri);
      setActionStatus('idle');
      return localUri;
    } catch (e) {
      console.error('Download Error:', e);
      Alert.alert('Download Failed', 'Could not download the image. Please check your connection and try again.');
      setActionStatus('error');
      return null;
    }
  }, []);

  const handleSave = useCallback(async () => {
    setActionStatus('saving');
    // Check/request permissions
    if (mediaPermissions?.status !== 'granted') {
      const permission = await requestMediaPermission();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Storage permission is needed to save the image. Please grant permission in your device settings.');
        setActionStatus('idle');
        return;
      }
    }

    const localUri = await downloadAndGetLocalUri(illustrationUri);
    if (!localUri) {
       // Error handled in download function
       setActionStatus('error'); // Ensure status reflects error
       return; 
    } 

    try {
      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('Saved!', 'Your artwork has been saved to your gallery.');
      setActionStatus('idle');
    } catch (e) {
      console.error('Save Error:', e);
      Alert.alert('Save Failed', 'An error occurred while saving the image.');
      setActionStatus('error');
    } finally {
         // Clean up downloaded file? Maybe not needed if saved successfully.
         // Optional: await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
  }, [illustrationUri, mediaPermissions, requestMediaPermission, downloadAndGetLocalUri]);

  const handleShare = useCallback(async () => {
    setActionStatus('sharing');
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing Not Available', 'Sharing is not available on this device.');
      setActionStatus('idle');
      return;
    }

    const localUri = await downloadAndGetLocalUri(illustrationUri);
    if (!localUri) {
        setActionStatus('error');
        return;
    } 

    try {
      await Sharing.shareAsync(localUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share your Illustraia creation!',
      });
      setActionStatus('idle');
    } catch (e) {
      console.error('Share Error:', e);
      Alert.alert('Share Failed', 'An error occurred while trying to share the image.');
      setActionStatus('error');
    }
  }, [illustrationUri, downloadAndGetLocalUri]);

  const handleRestart = useCallback(() => {
    navigation.popToTop();
    navigation.navigate('Welcome'); // Go back to Welcome screen
  }, [navigation]);

  // Helper to render button content
  const renderButtonContent = (text: string, statusToCheck: ActionStatus) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {actionStatus === statusToCheck ? (
        <ActivityIndicator size="small" color={theme.buttonText} />
      ) : null}
      <ButtonText theme={theme}>{text}</ButtonText>
    </View>
  );

  return (
    <ThemeProvider theme={theme}>
      <StyledSafeAreaView theme={theme}>
        <ScreenScrollView>
          <View>
            <Header>
              <Title theme={theme} fontSize={titleFontSize}>Export Your Artwork</Title>
            </Header>

            <ContentContainer>
              <FinalIllustration theme={theme} height={illustrationHeight}>
                <StyledImage
                  source={{ uri: illustrationUri }}
                  contentFit="contain"
                  transition={300}
                />
              </FinalIllustration>

              <ButtonRow>
                <ActionButton
                  theme={theme}
                  onPress={handleSave}
                  backgroundColor={theme.primary}
                  disabled={isActionInProgress}
                >{renderButtonContent('Save', 'saving')}</ActionButton>
                <ActionButton
                  theme={theme}
                  onPress={handleShare}
                  backgroundColor={theme.primary}
                  disabled={isActionInProgress}
                >{renderButtonContent('Share', 'sharing')}</ActionButton>
              </ButtonRow>
            </ContentContainer>
          </View>

          <StartOverButton
            theme={theme}
            onPress={handleRestart}
            backgroundColor={theme.secondary}
            disabled={isActionInProgress}
          ><ButtonText theme={theme}>Start Over</ButtonText></StartOverButton>
        </ScreenScrollView>
      </StyledSafeAreaView>
    </ThemeProvider>
  );
};

export const ExportScreen = React.memo(ExportScreenComponent);
