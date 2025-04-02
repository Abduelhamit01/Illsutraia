import axios from 'axios';
import { Alert } from 'react-native';
import { LEONARDO_API_KEY } from '../config'; // Import the key


const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1/generations';

// Consider defining available models if needed
const DEFAULT_MODEL_ID = 'aa77f04e-3eec-4034-9c07-d0f619684628'; // Example Stable Diffusion 2.1

// Add more descriptive style keywords
const styleDescriptions: Record<string, string> = {
  'Cozy': 'ghibli studio cozy soft comfortable illustration painted', // Added more keywords
  'Comic': 'comic style art illustration', // Added more keywords
  'Animation': 'anime style detailed animation movie still illustration', // Added more keywords
  // Add more if needed or default
};

export interface GenerationResponse {
  generations_by_pk: {
    generated_images: Array<{
      url: string;
      nsfw: boolean;
      id: string;
      likeCount: number;
      motionMP4URL?: string | null;
      generated_image_variation_generics: any[]; // Define more specific type if needed
    }> | null;
    modelId: string | null;
    motion?: string | null;
    motionModel?: string | null;
    motionStrength?: number | null;
    prompt: string | null;
    negativePrompt: string | null;
    imageHeight: number | null;
    imageWidth: number | null;
    inferenceSteps: number | null;
    seed: number | null;
    public: boolean | null;
    scheduler: string | null;
    sdVersion: string | null;
    status: string | null;
    presetStyle: string | null;
    initStrength: number | null;
    guidanceScale: number | null;
    id: string | null;
    createdAt: string | null;
    promptMagic: boolean | null;
    promptMagicVersion: string | null;
    promptMagicStrength: number | null;
    loraStrength: number | null;
    requestTimestamp: string | null;
  } | null;
}

export const generateImageFromPrompt = async (
  prompt: string,
  style: string
): Promise<string | null> => {
  // Basic validation
  if (!LEONARDO_API_KEY) {
    console.error('LEONARDO_API_KEY is not set');
    return null;
  }

  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    Alert.alert('Missing Prompt', 'Please enter a description for the image.');
    return null;
  }

  try {
    // Use descriptive style from the map, fallback to the raw style name
    const descriptiveStyle = styleDescriptions[style] || style; 

    const response = await axios.post<{ sdGenerationJob: { generationId: string }} >(
      LEONARDO_API_URL,
      {
        // Construct a more descriptive prompt
        prompt: `(${prompt}), ${descriptiveStyle} style, high quality, detailed`,
        negative_prompt: "multiple cats, multiple dogs, two cats, two dogs, text, words, signature, watermark, blurry, low quality, deformed", // Added negative prompt
        modelId: DEFAULT_MODEL_ID, 
        width: 512,
        height: 512,
        // Add other parameters as needed (negative_prompt, num_images, etc.)
        num_images: 1,
        guidance_scale: 7,
      },
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'authorization': `Bearer ${LEONARDO_API_KEY}`,
        },
      }
    );

    const generationId = response.data?.sdGenerationJob?.generationId;

    if (!generationId) {
      console.error('Failed to get generation ID from initial response.', response.data);
      return null;
    }

    console.log('Generation initiated, ID:', generationId);

    // Polling for the result
    let attempts = 0;
    const maxAttempts = 15; // Poll for ~30 seconds max (adjust as needed)
    const pollInterval = 2000; // 2 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
      console.log(`Polling attempt ${attempts} for generation ${generationId}...`);

      try {
        const resultResponse = await axios.get<
          GenerationResponse
        >(
          `${LEONARDO_API_URL}/${generationId}`,
          {
            headers: {
              'accept': 'application/json',
              'authorization': `Bearer ${LEONARDO_API_KEY}`,
            },
          }
        );

        const generationData = resultResponse.data?.generations_by_pk;
        
        if (generationData?.status === 'COMPLETE') {
           if (generationData.generated_images && generationData.generated_images.length > 0) {
               console.log('Generation complete:', generationData.generated_images[0].url);
               return generationData.generated_images[0].url;
           } else {
               console.error('Generation complete but no images found.', generationData);
               return null;
           }
        } else if (generationData?.status === 'FAILED') {
            console.error('Generation failed.', generationData);
            return null;
        } else {
            console.log(`Generation status: ${generationData?.status}`);
        }

      } catch (pollError: any) {
        console.error(`Polling error for generation ${generationId}:`, pollError.response?.data || pollError.message);
        // Continue polling unless it's a fatal error?
        if (attempts >= maxAttempts) return null; // Stop if max attempts reached
      }
    }

    console.error(`Generation ${generationId} timed out after ${maxAttempts} attempts.`);
    return null; // Timeout

  } catch (error: any) {
    console.error(
      'Error initiating image generation:',
      error.response?.data || error.message
    );
    return null;
  }
}; 