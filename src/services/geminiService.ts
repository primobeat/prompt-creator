import { GoogleGenAI, Type } from "@google/genai";

export interface VisualBalance {
  vibrancy: number;
  minimalism: number;
  complexity: number;
  softness: number;
  futurism: number;
}

export interface ToneManner {
  temperature: string;
  dynamism: string;
}

export interface TextureDensity {
  reflectivity: number;
  transparency: number;
  roughness: number;
}

export interface InsightDashboard {
  visual_balance: VisualBalance;
  tone_manner: ToneManner;
  texture_density: TextureDensity;
  designer_comment: string;
}

export interface PromptExpansion {
  midjourney: string;
  dalle: string;
  stableDiffusion: string;
  designIntent: string;
  insight: InsightDashboard;
}

export type StyleOption = 
  | 'Line Art'
  | '2D Vector'
  | '2.5D Artwork'
  | '3D Render'
  | '3D Paper'
  | 'Real Photo'
  | 'Matte'
  | 'Shiny'
  | 'Glass'
  | 'Day'
  | 'Night'
  | 'Mist';

export interface ImageAnalysis {
  camera: string;
  ratio: string;
  artStyle: StyleOption;
  texture: StyleOption;
  lighting: StyleOption;
  bgColors: string[];
  objColors: string[];
}

export async function analyzeImage(image: string): Promise<ImageAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const [mimeType, base64Data] = image.split(',');
  const mime = mimeType.match(/:(.*?);/)?.[1] || 'image/png';

  const systemInstruction = `
너는 이미지 분석 전문가야. 제공된 이미지를 분석하여 다음 카테고리에 가장 잘 어울리는 값을 추출해줘.

[Categories & Allowed Values]
1. camera: Satellite View, Isometric, High Angle, Eye Level, Profile View, Low Angle, Extreme Close-Up
2. ratio: 1:1, 4:5, 16:9, 9:16, 3:2, 2:3
3. artStyle: Line Art, 2D Vector, 2.5D Artwork, 3D Render, 3D Paper, Real Photo
4. texture: Matte, Shiny, Glass
5. lighting: Day, Night, Mist
6. bgColors: Array of Hex color codes (e.g., ["#FFFFFF", "#000000"])
7. objColors: Array of Hex color codes (e.g., ["#FF0000", "#00FF00"])

반드시 JSON 형식으로 응답할 것.
`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data || image,
            mimeType: mime
          }
        },
        { text: "이 이미지의 스타일 설정을 분석해줘." }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          camera: { type: Type.STRING },
          ratio: { type: Type.STRING },
          artStyle: { type: Type.STRING },
          texture: { type: Type.STRING },
          lighting: { type: Type.STRING },
          bgColors: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          objColors: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
        },
        required: ["camera", "ratio", "artStyle", "texture", "lighting", "bgColors", "objColors"],
      }
    }
  });

  return JSON.parse(response.text || "{}") as ImageAnalysis;
}

export async function expandPrompt(
  userIdea: string, 
  options: StyleOption[] = [], 
  bgColors: string[] = [], 
  objectColors: string[] = [], 
  camera?: string,
  ratio?: string,
  lang: 'en' | 'ko' = 'ko',
  image?: string // Base64 image data
): Promise<PromptExpansion> {
  // AI Studio 환경과 일반 Vite/Vercel 환경 모두 지원
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
너는 **'Prompt Creator'**야. 사용자의 아이디어를 분석하여 Soft & Fun 감성이 담긴 최적의 프롬프트를 생성하고 디자인 인사이트를 제공하는 것이 네 역할이야.

[Style Library]
1. Art Style: Line Art, 2D Vector, 2.5D Artwork, 3D Render, 3D Paper, Real Photo.
2. Texture: Matte, Shiny, Glass.
3. Lighting: Day, Night, Mist.
4. Color Palette & Mood: 사용자가 선택한 배경색, 오브젝트 색상, 무드를 조화롭게 사용할 것.

[Tasks]
1. Generate Prompts: Midjourney (v6.0), DALL-E 3, Stable Diffusion. (항상 영문으로 생성)
2. Design Insight: 
   - Visual Balance (0-100): Vibrancy, Minimalism, Complexity, Softness, Futurism.
   - Tone & Manner: Temperature (warm/cool), Dynamism (low/medium/high).
   - Texture Density: Reflectivity, Transparency, Roughness.
   - Design Intent & Designer Comment: 사용자가 선택한 언어(${lang === 'ko' ? '한국어' : '영어'})로 작성할 것.

[Output Format]
반드시 JSON 형식으로 응답할 것.
`;

  const contents: any = {
    parts: [
      {
        text: `사용자 아이디어: "${userIdea}"
선택된 스타일 옵션: [${options.join(', ')}]
배경색: ${bgColors.length > 0 ? bgColors.join(', ') : '지정 안됨'}
오브젝트 색상: ${objectColors.length > 0 ? objectColors.join(', ') : '지정 안됨'}
카메라 각도: ${camera || '지정 안됨'}
비율: ${ratio || '지정 안됨'}`,
      },
    ],
  };

  if (image) {
    const [mimeType, base64Data] = image.split(',');
    const mime = mimeType.match(/:(.*?);/)?.[1] || 'image/png';
    contents.parts.push({
      inlineData: {
        data: base64Data || image,
        mimeType: mime
      }
    });
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          midjourney: { type: Type.STRING },
          dalle: { type: Type.STRING },
          stableDiffusion: { type: Type.STRING },
          designIntent: { type: Type.STRING },
          insight: {
            type: Type.OBJECT,
            properties: {
              visual_balance: {
                type: Type.OBJECT,
                properties: {
                  vibrancy: { type: Type.NUMBER },
                  minimalism: { type: Type.NUMBER },
                  complexity: { type: Type.NUMBER },
                  softness: { type: Type.NUMBER },
                  futurism: { type: Type.NUMBER },
                },
                required: ["vibrancy", "minimalism", "complexity", "softness", "futurism"],
              },
              tone_manner: {
                type: Type.OBJECT,
                properties: {
                  temperature: { type: Type.STRING },
                  dynamism: { type: Type.STRING },
                },
                required: ["temperature", "dynamism"],
              },
              texture_density: {
                type: Type.OBJECT,
                properties: {
                  reflectivity: { type: Type.NUMBER },
                  transparency: { type: Type.NUMBER },
                  roughness: { type: Type.NUMBER },
                },
                required: ["reflectivity", "transparency", "roughness"],
              },
              designer_comment: { type: Type.STRING },
            },
            required: ["visual_balance", "tone_manner", "texture_density", "designer_comment"],
          },
        },
        required: ["midjourney", "dalle", "stableDiffusion", "designIntent", "insight"],
      },
    },
  });

  try {
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }
    const parsed = JSON.parse(text) as PromptExpansion;
    if (!parsed.midjourney || !parsed.dalle) {
      throw new Error("Invalid response format from Gemini");
    }
    return parsed;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("프롬프트 생성 중 오류가 발생했습니다. 상세: " + (e instanceof Error ? e.message : String(e)));
  }
}
