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

    // 1. Save to Cloudflare D1 so messages are never lost
    if (context.env?.DB) {
      try {
        await context.env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `).run();

        await context.env.DB.prepare(`
          INSERT INTO contact_messages (name, email, subject, message)
          VALUES (?, ?, ?, ?)
        `).bind(name, email, subject || `Portfolio Inquiry from ${name}`, message).run();
      } catch (dbErr) {
        console.warn('D1 contact message save warning:', dbErr);
      }
    }

    // 2. Dispatch to FormSubmit in background using reliable URL-encoded form data
    const formParams = new URLSearchParams();
    formParams.append('name', name);
    formParams.append('email', email);
    formParams.append('_subject', subject || `Portfolio Inquiry from ${name}`);
    formParams.append('message', message);
    formParams.append('_replyto', email);
    formParams.append('_template', 'table');
    formParams.append('_captcha', 'false');

    const sendEmail = async (target: string) => {
      try {
        await fetch(`https://formsubmit.co/${encodeURIComponent(target)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'https://shoron-portfolio.pages.dev',
          },
          body: formParams.toString(),
          signal: AbortSignal.timeout(6000),
        });
      } catch (e) {
        console.error('Mail forward error for', target, e);
      }
    };

    context.waitUntil(
      Promise.allSettled([
        sendEmail('shoronhossen886@gmail.com'),
        sendEmail('meshoron53@gmail.com'),
      ])
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
