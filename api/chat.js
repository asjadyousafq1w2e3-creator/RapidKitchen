// Simple chat endpoint — returns a basic assistant reply.
// If OPENAI_API_KEY is present, use it to generate a response (non-streaming).
import fetch from 'node-fetch';
import connectToDatabase from './_utils/mongodb.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages } = req.body || {};
    const last = messages && messages.length ? messages[messages.length - 1].content : '';

    // If OpenAI key provided, call it.
    const key = process.env.OPENAI_API_KEY;
    if (key) {
      const prompt = `You are a friendly store assistant. Respond concisely to the user message:\n\n${last}`;
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: 'You are a helpful store assistant.' }, { role: 'user', content: last }], max_tokens: 300 })
      });
      const json = await resp.json();
      const reply = json?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
      return res.json({ reply });
    }

    // Fallback: simple canned response
    const reply = `Thanks for reaching out — regarding: "${String(last).slice(0, 120)}". Our team will get back to you shortly or check product pages for details.`;
    return res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
