// api/generate.js
// Vercel Serverless Function — GPT API (OpenAI SDK v4+)

import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model = 'gpt-4o', max_tokens = 4000 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages 필드가 필요합니다' });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model,
      max_tokens,
      messages,
    });

    const text = completion.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });
  } catch (e) {
    const msg = e?.error?.message || e?.message || 'OpenAI API 오류';
    return res.status(500).json({ error: msg });
  }
}
