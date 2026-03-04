import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export interface VisualBalance {
  depth: number;
  modernity: number;
  aesthetic: number;
  vibrancy: number;
  minimalism: number;
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
  | 'Minimalist'
  | 'Geometric'
  | 'Detailism'
  // Step 2: Dimension
  | '2D Artwork'
  | '3D Rendering'
  | 'Real Photo'
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
  | 'Volume'
  | 'Wireframe'
  | 'Glass'
  | 'Metal'
  | 'Clay'
  // Step 3 & 4 (Photo)
  | 'Person'
  | 'Landscape'
  | 'Product'
  | 'Architecture'
  | 'Close-up'
  | 'Medium Shot'
  | 'Full Shot'
  // Step 5: Background (2D)
  | 'Solid'
  | 'Gradient'
  | 'Textured Paper'
  | 'Abstract Shapes'
  | 'Transparent Background'
  // Step 5: Environment (3D & Real)
  | 'Natural Light'
  | 'Studio'
  | 'Cinematic Neon'
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

export async function generateWallpaper(
  userIdea: string, 
  options: StyleOption[] = [], 
  bgColors: string[] = [], 
  objectColors: string[] = [], 
  camera?: string,
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9"
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  
  // 1. First, use Gemini 3 Flash to generate a high-quality image prompt based on the user's rules
  const promptModel = "gemini-3-flash-preview";
  const promptSystemInstruction = `
너는 전세계 최고의 **'AI Image Prompt Engineer'**야. 
사용자의 아이디어와 선택된 5단계 스타일 옵션을 바탕으로, 'Gemini 2.5 Flash Image (Nano Banana)' 모델이 가장 선호하는 고퀄리티 영문 프롬프트를 생성해줘.

[5단계 시스템 구성]
1. CONCEPT: Minimalist, Geometric, Detailism
2. DIMENSION: 2D Artwork, 3D Rendering, Real Photo
3. STYLE/SUBJECT: (Dimension에 따라 다름)
4. FINISH/SHOT TYPE: (Dimension에 따라 다름)
5. BACKGROUND/ENVIRONMENT: (Dimension에 따라 다름)

[프롬프트 생성 원칙]
1. 사용자의 선택에 100% 의존: 사용자가 선택한 키워드들만 사용하여 정교한 영문 프롬프트를 구성해.
2. 생략된 섹션 처리: 사용자가 선택하지 않은 섹션은 프롬프트에 포함하지 마. AI가 전체 무드에 맞춰 기본적으로 생성하도록 내버려둬.
3. 논리적 결합: 선택된 값들을 [Concept] -> [Dimension] -> [Style/Subject] -> [Finish/Shot] -> [Background/Environment] 순서로 결합해.
4. 카메라 및 샷 타입 시너지: 
   - 'Real Photo'에서 'Close-up' 계열과 'Low Angle'이 함께 선택되면 "A majestic low-angle close-up shot"과 같이 웅장한 느낌을 강조해.
   - 2D/3D에서도 선택된 'Camera Angle'이 구도와 원근감에 확실히 반영되도록 해.
5. FINISH 다중 선택: Step 4(FINISH)에서 여러 질감이 선택된 경우, 이를 자연스럽게 혼합하여 묘사해.
6. 가중치 부여: 주요 키워드는 '(Keyword:1.5)' 형식으로 표현하고, 'Detailism' 선택 시 세부 묘사 키워드를 최우선으로 배치해.

[예시]
[Detailism] + [Real Photo] + [Architecture] + [Full Shot] + [Low Angle] + [Mist] 선택 시 -> "A majestic low-angle full shot of ornate architecture shrouded in soft mist, hyper-detailed, (Detailism:1.5)"와 같이 구성.

[출력 형식]
오직 생성된 영문 프롬프트 문자열만 출력해. 다른 설명은 생략해.
`;

  const promptResponse = await ai.models.generateContent({
    model: promptModel,
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

  const refinedPrompt = promptResponse.text || userIdea;
  console.log("Refined Image Prompt:", refinedPrompt);

  // 2. Generate the image using the refined prompt with Gemini 2.5 Flash Image (Free Tier)
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: refinedPrompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }
  
  throw new Error("No image generated");
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
1. camera: High Angle, Eye Level, Low Angle, Top View
2. ratio: 1:1, 4:5, 16:9, 9:16, 3:2, 2:3
3. artStyle: 2D Artwork, 3D Rendering, Real Photo
4. texture: Matte, Glass, Metal, Clay, Halftone, Noise, Paper Texture, Flat Color
5. lighting: Natural Light, Studio, Cinematic Neon, Mist, Solid, Gradient, Textured Paper, Abstract Shapes, Transparent Background
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

[5단계 스타일 시스템]
1. CONCEPT: Minimalist, Geometric, Detailism
2. DIMENSION: 2D Artwork, 3D Rendering, Real Photo
3. STYLE/SUBJECT: Vector, Line Art, Gouache, Pixel Art, Isometric, Volume, Wireframe, Person, Landscape, Product, Architecture
4. FINISH/SHOT TYPE: Halftone, Noise, Paper Texture, Flat Color, Clay, Glass, Metal, Close-up, Medium Shot, Full Shot
5. BACKGROUND/ENVIRONMENT: Natural Light, Studio, Cinematic Neon, Mist, Solid, Gradient, Textured Paper, Abstract Shapes, Transparent Background

[Tasks]
1. Generate Prompts: Midjourney (v6.0), DALL-E 3, Stable Diffusion. (항상 영문으로 생성)
2. Design Insight: 
   - Visual Balance (0-100): Depth, Modernity, Aesthetic, Vibrancy, Minimalism.
   - Tone & Manner: Temperature (warm/cool), Dynamism (low/medium/high).
   - Texture Density: Reflectivity, Transparency, Roughness.
   - Design Intent & Designer Comment: 사용자가 선택한 언어(${lang === 'ko' ? '한국어' : '영어'})로 작성할 것.

[Insight Mapping Rules]
- 'Detailism'은 'Aesthetic'과 'Complexity' 수치를 높임.
- '3D Rendering'이나 'Real Photo'는 'Depth' 수치를 높임.
- 'Minimalist'는 'Minimalism' 수치를 높임.

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
                  depth: { type: Type.NUMBER },
                  modernity: { type: Type.NUMBER },
                  aesthetic: { type: Type.NUMBER },
                  vibrancy: { type: Type.NUMBER },
                  minimalism: { type: Type.NUMBER },
                },
                required: ["depth", "modernity", "aesthetic", "vibrancy", "minimalism"],
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
