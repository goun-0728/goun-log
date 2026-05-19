// api/dalle.js
// Vercel Serverless Function — gpt-image-1 이미지 생성/편집 (openai SDK v4)

import OpenAI, { toFile } from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, imageBase64 } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt 필드가 필요합니다' });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    let response;

    if (imageBase64) {
      // 제품 사진이 있으면 images.edit() — 제품 외형 참조
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const imageFile = await toFile(buffer, 'product.png', { type: 'image/png' });

      response = await openai.images.edit({
        model: 'gpt-image-1',
        image: imageFile,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
      });
    } else {
      response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
      });
    }

    const item = response.data[0];

    // gpt-image-1은 base64로 반환 — data URL로 변환해서 전달
    if (item.b64_json) {
      return res.status(200).json({ url: `data:image/png;base64,${item.b64_json}` });
    }

    // URL로 반환되는 경우 그대로 전달
    if (item.url) {
      return res.status(200).json({ url: item.url });
    }

    return res.status(500).json({ error: '이미지 데이터를 받지 못했습니다' });
  } catch (e) {
    const status = e?.status || 500;
    const msg = e?.error?.message || e?.message || 'Image API 오류';
    const code = e?.error?.code || e?.code || null;
    return res.status(status).json({ error: msg, code });
  }
}
