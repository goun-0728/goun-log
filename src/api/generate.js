// src/api/generate.js
// 클라이언트에서 Vercel API Route를 통해 GPT 호출

export async function generateContent({ systemPrompt, userPrompt, images = [], model = 'gpt-4o', maxTokens = 4000 }) {
  // 메시지 구성
  const userContent = [];

  // 이미지가 있으면 추가 (base64 dataURL 형식)
  for (const imgDataUrl of images) {
    if (!imgDataUrl) continue;
    userContent.push({
      type: 'image_url',
      image_url: { url: imgDataUrl, detail: 'high' },
    });
  }

  // 텍스트 프롬프트
  userContent.push({ type: 'text', text: userPrompt });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.text;
}
