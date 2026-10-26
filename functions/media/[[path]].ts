interface Env {
  MEDIA_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pathParams = context.params.path;
  const path = Array.isArray(pathParams) ? pathParams.join('/') : pathParams || '';

  if (!path) {
    return new Response('Not Found', { status: 404 });
  }

  const object = await context.env.MEDIA_BUCKET.get(path);

  if (!object) {
    return new Response('File Not Found in R2', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  // Fallback Content-Type if missing or octet-stream
  const currentCt = headers.get('content-type');
  if (!currentCt || currentCt === 'application/octet-stream') {
    const ext = path.split('.').pop()?.toLowerCase();
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
    if (ext && mimeMap[ext]) {
      headers.set('content-type', mimeMap[ext]);
    }
  }

  return new Response(object.body, {
    headers,
  });
};
