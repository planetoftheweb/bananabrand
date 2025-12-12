import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, GeneratedImage, BrandColor, VisualStyle, GraphicType } from "../types";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const NANO_BANANA_MODEL = 'gemini-2.5-flash-image';

interface GenerationContext {
  brandColors: BrandColor[];
  visualStyles: VisualStyle[];
  graphicTypes: GraphicType[];
}

/**
 * Constructs the engineered prompt based on selected presets and dynamic context
 */
const constructFullPrompt = (config: GenerationConfig, context: GenerationContext): string => {
  const colorScheme = context.brandColors.find(c => c.id === config.colorSchemeId);
  const style = context.visualStyles.find(s => s.id === config.visualStyleId);
  const type = context.graphicTypes.find(t => t.id === config.graphicTypeId);

  const colors = colorScheme ? colorScheme.colors.join(', ') : 'standard colors';
  const styleDesc = style ? style.description : 'clean style';
  const typeName = type ? type.name : 'image';

  return `
    Create a ${typeName}.
    Visual Style: ${styleDesc}.
    Color Palette: Strictly use these colors: ${colors}.
    
    Content Request: ${config.prompt}
    
    Ensure the output is high quality and adheres to the style constraints.
  `.trim();
};

export const generateGraphic = async (config: GenerationConfig, context: GenerationContext): Promise<GeneratedImage> => {
  const fullPrompt = constructFullPrompt(config, context);

  try {
    const response = await ai.models.generateContent({
      model: NANO_BANANA_MODEL,
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
        }
      },
    });

    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

export const refineGraphic = async (
  currentImage: GeneratedImage, 
  refinementPrompt: string, 
  config: GenerationConfig,
  context: GenerationContext
): Promise<GeneratedImage> => {
  const colorScheme = context.brandColors.find(c => c.id === config.colorSchemeId);
  const style = context.visualStyles.find(s => s.id === config.visualStyleId);
  
  const colors = colorScheme ? colorScheme.colors.join(', ') : '';
  const styleDesc = style ? style.description : '';

  const fullRefinementPrompt = `
    Edit this image.
    Request: ${refinementPrompt}.
    Maintain the existing style (${styleDesc}) and color palette (${colors}).
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: NANO_BANANA_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              data: currentImage.base64Data,
              mimeType: currentImage.mimeType,
            },
          },
          {
            text: fullRefinementPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
        }
      },
    });

    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Gemini Refinement Error:", error);
    throw new Error("Failed to refine image. Please try again.");
  }
};

// Helper to parse the response structure
const extractImageFromResponse = (response: any): GeneratedImage => {
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No candidates returned from API.");
  }

  const parts = response.candidates[0].content.parts;
  let imagePart = null;

  for (const part of parts) {
    if (part.inlineData) {
      imagePart = part;
      break;
    }
  }

  if (!imagePart) {
     // Sometimes errors come back as text in the part
     const textPart = parts.find((p: any) => p.text);
     if (textPart) {
         throw new Error(`Model returned text instead of image: ${textPart.text}`);
     }
    throw new Error("No image data found in response.");
  }

  const base64Data = imagePart.inlineData.data;
  const mimeType = imagePart.inlineData.mimeType || 'image/png';
  const imageUrl = `data:${mimeType};base64,${base64Data}`;

  return {
    imageUrl,
    base64Data,
    mimeType
  };
};