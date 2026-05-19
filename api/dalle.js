// api/dalle.js
// Vercel Serverless Function — DALL-E 3 이미지 생성 (openai SDK v4)

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt 필드가 필요합니다' });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = response.data[0].url;
    return res.status(200).json({ url: imageUrl });
  } catch (e) {
    // 상세 에러 정보 반환 (디버깅용)
    const status = e?.status || 500;
    const msg = e?.error?.message || e?.message || 'DALL-E API 오류';
    const code = e?.error?.code || e?.code || null;
    return res.status(status).json({ error: msg, code });
  }
}
