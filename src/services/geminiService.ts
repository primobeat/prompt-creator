import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. Vercel 설정에서 GEMINI_API_KEY를 추가해주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.message?.includes('429') || 
                        error.message?.includes('RESOURCE_EXHAUSTED') ||
                        error.message?.includes('quota');
    
    if (isRateLimit && retries > 0) {
      console.warn(`Gemini API rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await sleep(delay);
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export interface VisualBalance {
  depth: number;
  modernity: number;
  aesthetic: number;
  vibrancy: number;
  minimalism: number;
  geometry: number;
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
  // Step 1: Concept
  | 'Minimalism'
  | 'Artistic'
  | 'Geometry'
  | 'Abstract'
  | 'Futuristic'
  | 'Experimental'
  // Step 2: Visual Style
  | '2D Artwork'
  | '3D Rendering'
  | 'Real Photo'
  | 'Icon'
  // Step 3 & 4 (2D)
  | 'Vector'
  | 'Line Art'
  | 'Gouache'
  | 'Pixel Art'
  | 'Halftone'
  | 'Noise'
  | 'Paper Texture'
  | 'Flat Color'
  // Step 3 & 4 (3D)
  | 'Isometric'
  | 'Soft Volume'
  | 'Inflatable'
  | 'Geometric Abstract'
  | 'Wireframe'
  | 'Transparent Glass'
  | 'Reflective Metal'
  | 'Matte Clay'
  | 'Paper'
  | 'Emissive'
  // Step 3 & 4 (Photo)
  | 'Person'
  | 'Landscape'
  | 'Product'
  | 'Architecture'
  | 'Close-up'
  | 'Medium Shot'
  | 'Full Shot'
  | 'Panorama'
  | 'Long Exposure'
  | 'Out of Focus (f/1.8)'
  | 'Pan Focus (f/11)'
  | 'Fisheye Lens'
  | 'Macro'
  | 'Film Grain'
  // Step 3, 4 & 5 (Icon)
  | 'Line'
  | 'Fill'
  | 'Duotone'
  | '3D Clay'
  | 'Glassmorphism'
  | 'Solid'
  | 'Realism'
  | 'Glass'
  | 'Hand-drawn'
  | 'Soft Shadow'
  | 'None'
  | 'Circle'
  | 'Square'
  | 'Organic Curve'
  // Step 5: Background (2D)
  | 'Solid'
  | 'Gradient'
  | 'Textured Paper'
  | 'Abstract Shapes'
  | 'Transparent Background'
  // Step 5: Environment (3D & Real)
  | 'Natural Light'
  | 'Golden Hour'
  | 'Blue Hour'
  | 'Studio'
  | 'Cinematic Neon'
  | 'Mist'
  | 'Infinity Wall'
  | 'Levitation'
  | 'Minimal Room'
  | 'Soft White'
  | 'Dark Mood';

export interface ImageAnalysis {
  camera: string;
  ratio: string;
  selectedOptions: StyleOption[];
  bgColors: string[];
  objColors: string[];
}

export async function generateWallpaper(
  userIdea: string, 
  options: StyleOption[] = [], 
  bgColors: string[] = [], 
  objectColors: string[] = [], 
  camera?: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9",
  preRefinedPrompt?: string
): Promise<string> {
  let refinedPrompt = preRefinedPrompt;

  if (!refinedPrompt) {
    // 1. First, use Gemini 3 Flash to generate a high-quality image prompt based on the user's rules
    const promptSystemInstruction = `
너는 전세계 최고의 **'AI Image Prompt Engineer'**야. 
사용자의 아이디어와 선택된 5단계 스타일 옵션을 바탕으로, 'Gemini 2.5 Flash Image (Nano Banana)' 모델이 가장 선호하는 고퀄리티 영문 프롬프트를 생성해줘.

[5단계 시스템 구성]
1. CONCEPT: Minimalism, Artistic, Geometry, Abstract, Futuristic, Experimental
2. VISUAL STYLE: 2D Artwork, 3D Rendering, Real Photo, Icon
3. STYLE/SUBJECT/STRUCTURE/ICON STYLE: Vector, Line Art, Gouache, Pixel Art, Isometric, Soft Volume, Inflatable, Geometric Abstract, Wireframe, Person, Landscape, Product, Architecture, Out of Focus (f/1.8), Pan Focus (f/11), Fisheye Lens, Macro, Film Grain, Line, Solid, Realism, 3D Clay, Glass, Isometric, Hand-drawn
4. FINISH/SHOT TYPE/MATERIAL/ICON FINISH: Halftone, Noise, Paper Texture, Flat Color, Matte Clay, Transparent Glass, Reflective Metal, Paper, Emissive, Close-up, Medium Shot, Full Shot, Panorama, Long Exposure, Gradient, Soft Shadow
5. BACKGROUND/ENVIRONMENT/SCENE/LIGHTING/CONTAINER: Natural Light, Studio, Cinematic Neon, Mist, Solid, Gradient, Textured Paper, Abstract Shapes, Transparent Background, Infinity Wall, Levitation, Minimal Room, Soft White, Dark Mood, Golden Hour, Blue Hour, None, Circle, Square, Organic Curve

[프롬프트 생성 원칙]
1. 사용자의 선택에 100% 의존: 사용자가 선택한 키워드들만 사용하여 정교한 영문 프롬프트를 구성해.
2. 생략된 섹션 처리: 사용자가 선택하지 않은 섹션은 프롬프트에 포함하지 마. AI가 전체 무드에 맞춰 기본적으로 생성하도록 내버려둬.
3. 논리적 결합: 선택된 값들을 [Concept] -> [Dimension] -> [Style/Subject] -> [Finish/Shot] -> [Background/Environment] 순서로 결합해.
4. 카메라 및 샷 타입 시너지: 
   - 'Real Photo'에서 'Close-up' 계열과 'Low Angle'이 함께 선택되면 "A majestic low-angle close-up shot"과 같이 웅장한 느낌을 강조해.
   - 2D/3D에서도 선택된 'Camera Angle'이 구도와 원근감에 확실히 반영되도록 해.
5. FINISH 다중 선택: Step 4(FINISH)에서 여러 질감이 선택된 경우, 이를 자연스럽게 혼합하여 묘사해.
6. 가중치 부여: 주요 키워드는 '(Keyword:1.5)' 형식으로 표현하고, 'Experimental'이나 'Artistic' 선택 시 세부 묘사 키워드를 최우선으로 배치해.

[예시]
[Futuristic] + [Real Photo] + [Architecture] + [Full Shot] + [Low Angle] + [Mist] 선택 시 -> "A majestic low-angle full shot of futuristic architecture shrouded in soft mist, hyper-detailed, (Futuristic:1.5)"와 같이 구성.

[출력 형식]
오직 생성된 영문 프롬프트 문자열만 출력해. 다른 설명은 생략해.
`;

    const promptResponse = await withRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              text: `사용자 아이디어: "${userIdea}"
스타일 옵션: [${options.join(', ')}]
배경색: ${bgColors.join(', ')}
오브젝트 색상: ${objectColors.join(', ')}
카메라 각도: ${camera || 'Eye Level'}
비율: ${aspectRatio}`,
            },
          ],
        },
        config: {
          systemInstruction: promptSystemInstruction,
        },
      });
      return response;
    });

    if (!promptResponse) {
      console.warn("Gemini Prompt Generation: No response returned");
      refinedPrompt = userIdea;
    } else {
      refinedPrompt = promptResponse.text || userIdea;
    }
  }
  
  console.log("Image Prompt to use:", refinedPrompt);

  // 2. Generate the image using the refined prompt via SDK directly
  try {
    const response = await withRetry(async () => {
      const ai = getAI();
      // Use gemini-2.5-flash-image as primary for better free-tier availability
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: refinedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any || "16:9",
          },
        },
      });
      return res;
    });
    return extractImageFromResponse(response);
  } catch (err: any) {
    console.warn("Primary image model (2.5) failed, attempting fallback to gemini-3.1-flash-image-preview:", err);
    
    try {
      const fallbackResponse = await withRetry(async () => {
        const ai = getAI();
        const res = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: {
            parts: [{ text: refinedPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any || "16:9",
              imageSize: "1K" as any
            },
          },
        });
        return res;
      }, 1, 1000); // Fewer retries for fallback to avoid long waits
      return extractImageFromResponse(fallbackResponse);
    } catch (fallbackErr: any) {
      console.error("All image generation models failed:", fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Helper to extract base64 image data from Gemini response
 */
function extractImageFromResponse(response: any): string {
  if (!response || !response.candidates || response.candidates.length === 0) {
    console.error("Gemini Image Generation: No response or candidates returned", response);
    throw new Error("이미지 생성에 실패했습니다. (No response)");
  }

  const candidate = response.candidates[0];
  
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    console.warn("Gemini Image Generation: Finish reason is not STOP", candidate.finishReason);
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("안전 정책에 의해 이미지가 생성되지 않았습니다. 다른 키워드로 시도해주세요.");
    }
  }

  for (const part of candidate.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }
  
  console.error("Gemini Image Generation: No inlineData found in parts", candidate.content?.parts);
  throw new Error("이미지 데이터를 찾을 수 없습니다.");
}

export async function analyzeImage(image: string): Promise<ImageAnalysis> {
  const systemInstruction = `
너는 이미지 분석 전문가야. 제공된 이미지를 분석하여 다음 카테고리별로 가장 잘 어울리는 값을 추출해줘.
이미지의 느낌을 최대한 재현할 수 있도록 모든 카테고리에서 적절한 값을 선택해야 해.

[Categories & Allowed Values]
1. camera: High Angle, Eye Level, Low Angle, Top View, Isometric
2. ratio: 1:1, 4:5, 16:9, 9:16, 3:2, 2:3
3. concept: Minimalism, Artistic, Geometry, Abstract, Futuristic, Experimental (이미지의 전반적인 분위기에 따라 선택)
4. dimension: 2D Artwork, 3D Rendering, Real Photo, Icon (이미지의 형식을 선택)
5. subStyle: 
   - 2D일 때: Vector, Line Art, Gouache, Pixel Art
   - 3D일 때: Soft Volume, Inflatable, Geometric Abstract, Wireframe
   - Photo일 때: Out of Focus (f/1.8), Pan Focus (f/11), Fisheye Lens, Macro, Film Grain
   - Icon일 때: Line, Solid, Realism, 3D Clay, Glass, Hand-drawn
6. finish:
   - 2D일 때: Halftone, Noise, Paper Texture, Flat Color
   - 3D일 때: Matte Clay, Transparent Glass, Reflective Metal, Paper, Emissive
   - Photo일 때: Close-up, Medium Shot, Full Shot, Panorama, Long Exposure
   - Icon일 때: Gradient, Halftone, Noise, Soft Shadow
7. environment:
   - 2D일 때: Solid, Gradient, Textured Paper, Abstract Shapes, Transparent Background
   - 3D일 때: Studio, Infinity Wall, Levitation, Minimal Room, Natural Light, Cinematic Neon, Soft White, Dark Mood
   - Photo일 때: Golden Hour, Blue Hour, Cinematic Neon, Natural Light, Dark Mood
   - Icon일 때: None, Circle, Square, Organic Curve

8. bgColors: Array of Hex color codes (e.g., ["#FFFFFF", "#000000"])
9. objColors: Array of Hex color codes (e.g., ["#FF0000", "#00FF00"])

[Output Rules]
- selectedOptions 배열에는 concept, dimension, subStyle, finish, environment에서 선택한 모든 StyleOption 값들을 담아줘.
- 반드시 JSON 형식으로 응답할 것.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      camera: { type: Type.STRING },
      ratio: { type: Type.STRING },
      selectedOptions: { 
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      bgColors: { 
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      objColors: { 
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
    },
    required: ["camera", "ratio", "selectedOptions", "bgColors", "objColors"],
  };

  const response = await withRetry(async () => {
    const ai = getAI();
    const [mimeType, base64Data] = image.split(',');
    const mime = mimeType.match(/:(.*?);/)?.[1] || 'image/png';

    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data || image,
              mimeType: mime
            }
          },
          { text: "이 이미지의 스타일 설정을 최대한 상세하게 분석해서 JSON으로 출력해줘." }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });
    return res;
  });

  try {
    const text = response.text;
    if (!text) return { camera: 'Eye Level', ratio: '1:1', selectedOptions: [], bgColors: [], objColors: [] };
    return JSON.parse(text) as ImageAnalysis;
  } catch (e) {
    console.error("Failed to parse analysis JSON", e);
    return { camera: 'Eye Level', ratio: '1:1', selectedOptions: [], bgColors: [], objColors: [] };
  }
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
  const systemInstruction = `
너는 **'Prompt Creator'**야. 사용자의 아이디어를 분석하여 Soft & Fun 감성이 담긴 최적의 프롬프트를 생성하고 디자인 인사이트를 제공해.

[Tasks]
1. Generate Prompts: Midjourney (v6.0), DALL-E 3, Stable Diffusion. (항상 영문으로 생성)
2. Design Insight: 
   - Visual Balance (0-100): Depth, Modernity, Aesthetic, Vibrancy, Minimalism, Geometry.
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

  const responseSchema = {
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
              depth: { type: Type.NUMBER },
              modernity: { type: Type.NUMBER },
              aesthetic: { type: Type.NUMBER },
              vibrancy: { type: Type.NUMBER },
              minimalism: { type: Type.NUMBER },
              geometry: { type: Type.NUMBER },
            },
            required: ["depth", "modernity", "aesthetic", "vibrancy", "minimalism", "geometry"],
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
  };

  const response = await withRetry(async () => {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });
    return res;
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
