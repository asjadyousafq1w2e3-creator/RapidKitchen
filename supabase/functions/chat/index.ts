import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase env vars not configured");

    // Fetch products from DB to give AI real store context
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: products } = await supabase
      .from("products")
      .select("name, slug, price, original_price, short_description, category, badge, in_stock, rating, review_count, images")
      .eq("in_stock", true)
      .order("rating", { ascending: false })
      .limit(50);

    const productCatalog = (products || [])
      .map((p: any) => {
        const discount = p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0;
        return `- **${p.name}** | PKR ${p.price.toLocaleString()}${discount > 0 ? ` (${discount}% OFF, was PKR ${p.original_price.toLocaleString()})` : ""} | ${p.category} | ⭐ ${p.rating}/5 (${p.review_count} reviews)${p.badge ? ` | 🏷️ ${p.badge}` : ""} | ${p.short_description} | [Shop Now](/product/${p.slug})`;
      })
      .join("\n");

    const systemPrompt = `You are RapidKitch's friendly AI shopping assistant. You help customers find the perfect kitchen products.

## YOUR PRODUCT CATALOG (REAL STORE DATA):
${productCatalog}

## RESPONSE RULES:
1. When a user asks about a product, ALWAYS show matching products from the catalog above with:
   - Product name, price, discount if any
   - A brief description
   - A markdown link: [🛒 Shop Now](/product/SLUG) — use the exact slug from the catalog
2. If multiple products match, show up to 3-4 best matches
3. Format product recommendations nicely with bold names, prices, and the shop link
4. If no products match, suggest browsing our full collection: [Browse All Products](/shop)
5. Be concise, helpful, and use emojis sparingly
6. Use PKR for all prices

## STORE POLICIES:
- Store: RapidKitchen — Premium Kitchen Gadgets Pakistan
- Website: rapidkitch.com
- Free shipping above PKR 3,000
- Standard delivery: 3-5 business days
- Express delivery: PKR 300 for 1-2 days
- 30-day hassle-free returns
- 1-year manufacturer warranty
- Payment: COD, Credit/Debit Card, Bank Transfer, JazzCash/EasyPaisa
- Contact: hello@rapidkitch.com`;

    // Build Gemini conversation format
    // System prompt goes as first user turn in Gemini
    const geminiContents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood! I'm ready to help RapidKitch customers find the perfect kitchen products." }] },
      ...messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: geminiContents }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gemini SSE format differs from OpenAI — transform it to OpenAI-compatible SSE
    // so the frontend ChatWidget works without changes
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    (async () => {
      try {
        const reader = response.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                // Emit OpenAI-compatible SSE chunk
                const openaiChunk = {
                  choices: [{ delta: { content: text }, finish_reason: null }],
                };
                await writer.write(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
