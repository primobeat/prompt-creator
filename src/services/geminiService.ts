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
  | 'Soft & Fluffy' 
  | 'Playful Pop' 
  | 'Jelly Iridescent' 
  | 'Glossy Glass'
  | 'Candy Chrome'
  | 'Frosted Mist'
  | 'Clean Flat'
  | 'Neo Plastic'
  | 'Paper Craft';

export async function expandPrompt(
  userIdea: string, 
  options: StyleOption[] = [], 
  bgColor?: string, 
  objectColor?: string, 
  mood?: string,
  camera?: string,
  ratio?: string
): Promise<PromptExpansion> {
  // AI Studio 환경과 일반 Vite/Vercel 환경 모두 지원
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
너는 **'Prompt Creator'**야. 사용자의 아이디어를 분석하여 Mets만의 Soft & Fun 감성이 담긴 최적의 프롬프트를 생성하고 디자인 인사이트를 제공하는 것이 네 역할이야.

[Mets Style Library]
1. Material & Texture: Soft & Fluffy, Playful Pop, Jelly Iridescent, Glossy Glass, Candy Chrome, Frosted Mist, Clean Flat, Neo Plastic, Paper Craft.
2. Color Palette & Mood: 사용자가 선택한 배경색, 오브젝트 색상, 무드를 조화롭게 사용할 것.

[Tasks]
1. Generate Prompts: Midjourney (v6.0), DALL-E 3, Stable Diffusion.
2. Design Insight: 
   - Visual Balance (0-100): Vibrancy, Minimalism, Complexity, Softness, Futurism.
   - Tone & Manner: Temperature (warm/cool), Dynamism (low/medium/high).
   - Texture Density: Reflectivity, Transparency, Roughness.
   - Designer Comment: 전문적인 디자인 코멘트 (한글).

[Output Format]
반드시 JSON 형식으로 응답할 것.
`;

  const contents: any = {
    parts: [
      {
        text: `사용자 아이디어: "${userIdea}"
선택된 스타일 옵션: [${options.join(', ')}]
무드: ${mood || '지정 안됨'}
배경색: ${bgColor || '지정 안됨'}
오브젝트 색상: ${objectColor || '지정 안됨'}
카메라 각도: ${camera || '지정 안됨'}
비율: ${ratio || '지정 안됨'}`,
      },
    ],
  };

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
