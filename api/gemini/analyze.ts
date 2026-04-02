import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, systemInstruction, responseSchema } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "API Key not configured on server" });
    }

    const [mimeType, base64Data] = image.split(',');
    const mime = mimeType.match(/:(.*?);/)?.[1] || 'image/png';

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
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

    return res.status(200).json({
      text: response.text,
      candidates: response.candidates,
      usageMetadata: response.usageMetadata
    });
  } catch (error: any) {
    console.error("Vercel Gemini Analyze Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
