interface Env {
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
}

// SHA-256 hash of the default admin password (plaintext password is never stored in source code)
const DEFAULT_ADMIN_HASH = 'f4df9a2a8dabc30e27273f7f06f22aa19fe398884306d0b20435a8a2a83c793b';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const payload = (await context.request.json().catch(() => ({}))) as { password?: string };
    const { password } = payload || {};

    if (!password) {
      return new Response(JSON.stringify({ success: false, error: 'Password is required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 1. Verify against Cloudflare environment secret if configured
    if (context.env?.ADMIN_PASSWORD && password === context.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // 2. Verify via cryptographic SHA-256 hash
    const enc = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc);
    const hex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const targetHash = context.env?.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH;
    if (hex === targetHash) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Incorrect password' }), {
      status: 401,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Server error' }), {
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
