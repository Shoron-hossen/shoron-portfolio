interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const result = await context.env.DB
      .prepare("SELECT data FROM portfolio WHERE id = 'main' LIMIT 1")
      .first<{ data: string }>();

    if (!result || !result.data) {
      return new Response(JSON.stringify({ exists: false, data: null }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const parsed = JSON.parse(result.data);
    return new Response(JSON.stringify({ exists: true, data: parsed }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Database error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const payload = await context.request.json();
    const dataString = JSON.stringify(payload);

    await context.env.DB
      .prepare(`
        INSERT INTO portfolio (id, data, updated_at) 
        VALUES ('main', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `)
      .bind(dataString)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Failed saving to D1' }), {
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
