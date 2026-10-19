interface Env {
  DB?: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const payload = (await context.request.json().catch(() => ({}))) as Record<string, string>;
    const { name, email, subject, message } = payload || {};

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const recipient = 'shoronhossen886@gmail.com';

    // Dispatch to FormSubmit in background edge worker with zero CORS delay
    context.waitUntil(
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://shoron-portfolio.pages.dev',
        },
        body: JSON.stringify({
          name,
          email,
          _subject: subject || `Portfolio Inquiry from ${name}`,
          message,
          _replyto: email,
          _template: 'table',
          _captcha: 'false',
        }),
      }).catch((e) => console.error('Cloudflare Edge mail forward error:', e))
    );

    // Instant sub-50ms 200 response to client
    return new Response(
      JSON.stringify({ success: true, message: 'Message received and dispatched instantly' }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Failed processing contact request' }), {
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
