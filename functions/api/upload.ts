interface Env {
  MEDIA_BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Filename',
    'Content-Type': 'application/json',
  };

  try {
    const contentType = context.request.headers.get('content-type') || '';
    let fileBody: ReadableStream | ArrayBuffer;
    let fileName = '';
    let mimeType = 'application/octet-stream';

    let folder = 'portfolio';
    if (contentType.includes('multipart/form-data')) {
      const formData = await context.request.formData();
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: 'No file found in form data' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const formFolder = formData.get('folder');
      if (typeof formFolder === 'string' && formFolder.trim()) {
        folder = formFolder.trim().replace(/[^a-zA-Z0-9_\-/]/g, '').replace(/^\/+|\/+$/g, '') || 'portfolio';
      }

      fileName = file.name;
      mimeType = file.type || 'application/octet-stream';
      fileBody = await file.arrayBuffer();
    } else {
      // Direct binary stream
      const customName = context.request.headers.get('x-filename') || 'upload.jpg';
      const headerFolder = context.request.headers.get('x-folder');
      if (headerFolder) {
        folder = headerFolder.trim().replace(/[^a-zA-Z0-9_\-/]/g, '').replace(/^\/+|\/+$/g, '') || 'portfolio';
      }
      fileName = customName;
      mimeType = contentType;
      fileBody = context.request.body as ReadableStream;
    }

    // Clean and generate unique key
    const rawExt = fileName.split('.').pop() || 'jpg';
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';

    // Auto-fix mimeType if generic
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      avif: 'image/avif',
      pdf: 'application/pdf',
    };
    if ((!mimeType || mimeType === 'application/octet-stream') && mimeMap[ext]) {
      mimeType = mimeMap[ext];
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const key = `${folder}/${timestamp}-${randomSuffix}.${ext}`;

    await context.env.MEDIA_BUCKET.put(key, fileBody, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    const publicUrl = `/media/${key}`;

    return new Response(JSON.stringify({
      success: true,
      key,
      url: publicUrl,
      fileName,
      mimeType,
      size: (fileBody as ArrayBuffer)?.byteLength || undefined,
    }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'R2 upload failed' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

export const onRequestPut = onRequestPost;

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Filename',
    },
  });
};
