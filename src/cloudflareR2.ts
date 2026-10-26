/**
 * Cloudflare R2 Image Upload Utility
 * 
 * Works seamlessly with Cloudflare Pages Functions (/api/upload -> R2)
 * and also supports custom external Cloudflare Worker proxies.
 */

export interface R2Config {
  workerUrl: string;       // Custom Cloudflare Worker URL (optional, defaults to /api/upload)
  bucketName: string;      // R2 bucket name
  publicUrl: string;       // Public URL prefix for accessing uploaded files
  authToken: string;       // Bearer token (optional)
}

const R2_CONFIG_KEY = 'shoron_r2_config';

export class CloudflareR2 {
  static getConfig(): R2Config {
    const saved = localStorage.getItem(R2_CONFIG_KEY);
    if (!saved) {
      return {
        workerUrl: '',
        bucketName: 'shoron-portfolio-media',
        publicUrl: '',
        authToken: ''
      };
    }
    try {
      return { bucketName: 'shoron-portfolio-media', ...JSON.parse(saved) };
    } catch {
      return { workerUrl: '', bucketName: 'shoron-portfolio-media', publicUrl: '', authToken: '' };
    }
  }

  static saveConfig(config: R2Config): void {
    localStorage.setItem(R2_CONFIG_KEY, JSON.stringify(config));
  }

  static isConfigured(): boolean {
    // When running on Cloudflare Pages, /api/upload is built-in and always available
    return true;
  }

  /**
   * Upload a file to Cloudflare R2.
   * If an external workerUrl is specified, it uses that;
   * otherwise, it uses the native /api/upload Cloudflare Pages Function.
   */
  static async uploadFile(file: File, folder: string = 'portfolio'): Promise<string> {
    const config = this.getConfig();

    // Use external worker if explicitly configured
    if (config.workerUrl) {
      const ext = file.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const filename = `${folder}/${timestamp}-${randomSuffix}.${ext}`;
      const uploadUrl = `${config.workerUrl.replace(/\/$/, '')}/upload/${filename}`;

      const headers: Record<string, string> = {
        'Content-Type': file.type || 'application/octet-stream',
      };

      if (config.authToken) {
        headers['Authorization'] = `Bearer ${config.authToken}`;
      }

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Upload failed (${response.status}): ${errorText}`);
      }

      const publicBase = config.publicUrl.replace(/\/$/, '');
      return publicBase ? `${publicBase}/${filename}` : `/media/${filename}`;
    }

    // Default: Built-in Cloudflare Pages Function /api/upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    let res: Response | null = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    }).catch(() => null);

    if (!res || !res.ok) {
      // Live fallback for localhost dev
      res = await fetch('https://shoron-portfolio.pages.dev/api/upload', {
        method: 'POST',
        body: formData,
      });
    }

    if (!res || !res.ok) {
      const errorText = await res?.text().catch(() => 'Upload failed');
      throw new Error(`R2 upload failed (${res?.status || 500}): ${errorText}`);
    }

    const data = await res.json();
    if (!data.url) {
      throw new Error(data.error || 'Failed to retrieve uploaded image URL');
    }

    // If custom publicUrl is configured in Settings, use it
    if (config.publicUrl && data.key) {
      const publicBase = config.publicUrl.replace(/\/$/, '');
      return `${publicBase}/${data.key}`;
    }

    return data.url;
  }

  /**
   * Upload from a File input element.
   * Returns the public URL or null if cancelled/failed.
   */
  static async uploadFromInput(inputElement: HTMLInputElement, folder?: string): Promise<string | null> {
    const file = inputElement.files?.[0];
    if (!file) return null;

    try {
      return await this.uploadFile(file, folder);
    } catch (error) {
      console.error('R2 Upload error:', error);
      throw error;
    }
  }
}
