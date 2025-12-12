export interface BrandColor {
  name: string;
  colors: string[]; // Hex codes description
  id: string;
}

export interface VisualStyle {
  name: string;
  description: string;
  id: string;
  icon?: any;
}

export interface GraphicType {
  name: string;
  id: string;
  icon?: any;
}

export interface AspectRatioOption {
  label: string;
  value: string; // "1:1", "16:9", etc.
  icon?: any;
}

export interface GenerationConfig {
  prompt: string;
  colorSchemeId: string;
  visualStyleId: string;
  graphicTypeId: string;
  aspectRatio: string;
}

export interface GeneratedImage {
  imageUrl: string;
  base64Data: string;
  mimeType: string;
}