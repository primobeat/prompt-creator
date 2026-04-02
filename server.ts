import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

async function startServer() {
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { refinedPrompt, aspectRatio, model } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured on server" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: refinedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "16:9",
            imageSize: model === 'gemini-2.5-flash-image' ? undefined : "1K"
          },
        },
      });

      // Explicitly include text and candidates for the frontend
      res.json({
        text: response.text,
        candidates: response.candidates,
        usageMetadata: response.usageMetadata
      });
    } catch (error: any) {
      console.error("Server Gemini Generate Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/analyze", async (req, res) => {
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

      res.json({
        text: response.text,
        candidates: response.candidates,
        usageMetadata: response.usageMetadata
      });
    } catch (error: any) {
      console.error("Server Gemini Analyze Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/expand", async (req, res) => {
    try {
      const { contents, systemInstruction, responseSchema } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "API Key not configured on server" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema
        }
      });

      res.json({
        text: response.text,
        candidates: response.candidates,
        usageMetadata: response.usageMetadata
      });
    } catch (error: any) {
      console.error("Server Gemini Expand Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();

export default app;
