import { GoogleGenAI, Type } from "@google/genai";

// AI Studio 환경에서는 process.env.GEMINI_API_KEY가 자동으로 주입됩니다.
// Vercel 배포 시에는 Vercel 대시보드에서 GEMINI_API_KEY를 설정해야 합니다.
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. Vercel 설정에서 GEMINI_API_KEY를 추가해주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeImage = async (base64Image: string) => {
  const ai = getAI();
  const [mimeType, data] = base64Image.split(',');
  const mime = mimeType.match(/:(.*?);/)?.[1] || 'image/png';

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: data || base64Image, mimeType: mime } },
        { text: "이 이미지의 스타일 설정을 최대한 상세하게 분석해서 JSON으로 출력해줘." }
      ]
    },
    config: {
      systemInstruction: "You are an expert image prompt engineer. Analyze the image and extract style, lighting, composition, and subject details.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          style: { type: Type.STRING },
          lighting: { type: Type.STRING },
          composition: { type: Type.STRING },
          colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          atmosphere: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const expandPrompt = async (prompt: string, styleContext?: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: `Prompt: ${prompt}\nContext: ${JSON.stringify(styleContext)}` }] }],
    config: {
      systemInstruction: "You are a professional Midjourney prompt engineer. Expand the user's simple prompt into a highly detailed, artistic English prompt. Focus on aesthetics, technical camera settings, and artistic styles.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refinedPrompt: { type: Type.STRING },
          explanation: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateImage = async (refinedPrompt: string, aspectRatio: string, model: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: model || 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [{ text: refinedPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any || "16:9",
        imageSize: model === 'gemini-2.5-flash-image' ? undefined : "1K" as any
      },
    },
  });

  // 이미지 파트 찾기
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("이미지 생성에 실패했습니다. 결과에 이미지 데이터가 없습니다.");
};
