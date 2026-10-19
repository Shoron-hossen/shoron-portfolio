interface Env {
  AI?: any;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body = (await context.request.json().catch(() => ({}))) as {
      messages?: Array<{ role: 'user' | 'assistant' | 'model'; content: string }>;
      systemPrompt?: string;
      geminiApiKey?: string;
    };

    const { messages = [], systemPrompt = '', geminiApiKey } = body;

    // 1. If Gemini API Key provided, attempt direct Gemini API first
    if (geminiApiKey) {
      const candidateModels = [
        'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      ];

      const fullContents = [
        {
          role: 'user',
          parts: [{ text: `[System Instructions]: ${systemPrompt}\n\nAcknowledge.` }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I will answer as Shoron Hossen.' }],
        },
        ...messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      ];

      const payload = {
        contents: fullContents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
      };

      try {
        const winnerText = await Promise.any(
          candidateModels.map(async (url) => {
            const res = await fetch(`${url}?key=${encodeURIComponent(geminiApiKey)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = (await res.json()) as any;
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Empty');
            return text;
          })
        );

        return new Response(JSON.stringify({ success: true, reply: winnerText, source: 'gemini' }), {
          status: 200,
          headers: corsHeaders,
        });
      } catch {
        // Fallback to Workers AI below
      }
    }

    // 2. Cloudflare Edge Workers AI (Zero API key needed, runs at the edge in ~300ms)
    if (context.env?.AI) {
      try {
        const aiMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-4).map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ];

        const response: any = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: aiMessages,
          max_tokens: 220,
          temperature: 0.7,
        });

        const reply = response?.response || response?.text;
        if (reply) {
          return new Response(JSON.stringify({ success: true, reply, source: 'workers-ai' }), {
            status: 200,
            headers: corsHeaders,
          });
        }
      } catch (aiErr) {
        console.warn('Workers AI error:', aiErr);
      }
    }

    return new Response(JSON.stringify({ success: false, fallback: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Chat error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
