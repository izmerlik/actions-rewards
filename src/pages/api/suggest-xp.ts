import type { NextApiRequest, NextApiResponse } from 'next';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/distilgpt2';
const HF_TOKEN = process.env.HF_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { action } = req.body;
  if (!action) return res.status(400).json({ error: 'No action provided' });

  const prompt = `Suggest a fair XP value (1-100) for the following action: "${action}". Only return the number.`;

  try {
    console.log('API called with action:', action);
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      return res.status(500).json({ error: 'Hugging Face API error', details: errorText });
    }

    const data = await response.json();
    console.log('Hugging Face API response:', data);
    const suggestion = data[0]?.generated_text?.match(/\d+/)?.[0] || null;

    res.status(200).json({ xp: suggestion });
  } catch (err) {
    console.error('API route error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
} 