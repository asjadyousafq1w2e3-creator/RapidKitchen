// Dynamic Chatbot API powered by Google Gemini 1.5 Flash & MongoDB
import connectToDatabase from './_utils/mongodb.js';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { messages } = req.body || {};
    const lastMessage = messages && messages.length ? messages[messages.length - 1].content : '';

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    // 1. Fetch live products from MongoDB Atlas to feed as real-time context to the AI
    let productContext = '';
    try {
      const { db } = await connectToDatabase();
      const products = await db.collection('products').find({}).toArray();
      productContext = products.map(p => 
        `- ${p.name}: PKR ${p.price.toLocaleString()} (${p.category}) - Link: /product/${p.slug || p._id.toString()}`
      ).join('\n');
    } catch (dbErr) {
      console.error('Failed to query products catalog for chat context:', dbErr);
    }

    // Build the system prompt with product contexts and markdown instruction
    const systemPrompt = `You are the friendly, helpful AI Store Assistant of Kitchub Store.
We offer premium kitchen products, insulated tumblers, cooking oil sprayers, and elegant home decoration pieces.

Below is our LIVE product catalog in real-time:
${productContext}

Instruction Guidelines:
- Help customers with queries about products, shipping, orders, or home decor advice.
- When referring to a product, always mention its price and include its relative link (e.g. [Buy here](/product/thermal-smart-mug) or [Smart Chopper Pro](/product/smart-chopper-pro)) so the customer can click it and navigate immediately!
- Refer ONLY to the live catalog products. If a customer asks for something we don't have, politely state we don't stock it yet but update our catalog regularly.
- Keep your responses brief, professional, warm, and highly engaging.
- Use markdown (bold, bullet points) to format replies beautifully.`;

    // 2. Call Google Gemini API if key is present
    if (geminiKey) {
      // Map message history to Gemini API format (roles alternate between 'user' and 'model')
      const geminiMessages = (messages || []).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7
          }
        })
      });

      if (response.ok) {
        const json = await response.json();
        const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text || 'I\'m sorry, I couldn\'t process that right now.';
        return res.json({ reply });
      } else {
        const errText = await response.text();
        console.error('Gemini API call failed:', errText);
      }
    }

    // 3. Fallback to OpenAI if Gemini is not set but OpenAI is
    const openAIKey = process.env.OPENAI_API_KEY;
    if (openAIKey && !openAIKey.startsWith('sk-...')) {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openAIKey}` },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...(messages || []).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
          ],
          max_tokens: 300
        })
      });
      
      if (resp.ok) {
        const json = await resp.json();
        const reply = json?.choices?.[0]?.message?.content || 'I\'m sorry, I couldn\'t generate a reply.';
        return res.json({ reply });
      }
    }

    // 4. Ultimate Canned Helper Reply (if no API keys are active or calls fail)
    const reply = `Welcome to Kitchub Store! 👋 I'm here to help you discover our premium kitchen gadgets, smart scale, insulated tumblers, oil sprayers, and home decoration pieces. To speak with a live assistant, please configure your GEMINI_API_KEY environment variable.`;
    return res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
