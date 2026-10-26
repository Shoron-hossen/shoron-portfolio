import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Link2,
  Check,
  Copy,
  ExternalLink,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { CloudflareR2 } from '../cloudflareR2';

export interface MediaUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  accept?: string;
  helperText?: string;
  previewAspect?: 'square' | 'video' | 'portrait' | 'auto';
  isDocument?: boolean;
  className?: string;
}

export default function MediaUploadField({
  label,
  value = '',
  onChange,
  folder = 'portfolio',
  placeholder = 'https://...',
  accept = 'image/*',
  helperText,
  previewAspect = 'video',
  isDocument = false,
  className = '',
}: MediaUploadFieldProps) {
  // Default to 'upload' if empty, otherwise detect mode
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value with local state
  useEffect(() => {
    setUrlInput(value || '');
    setImageError(false);
  }, [value]);

  // Check if current URL is hosted on Cloudflare R2
  const isR2Url = Boolean(
    value &&
    (value.startsWith('/media/') ||
      value.includes('.r2.dev') ||
      value.includes('r2.cloudflarestorage.com') ||
      value.includes('shoron-portfolio'))
  );

  // Check if current URL is a known temporary expiring CDN (Discord, FB, tokenized URLs)
  const isTempCdnUrl = Boolean(
    value &&
    !isR2Url &&
    (value.includes('discordapp.com') ||
      value.includes('discordapp.net') ||
      value.includes('fbcdn.net') ||
      value.includes('scontent.') ||
      value.includes('blob:') ||
      /[?&](ex|is|hm|token|expires)=/i.test(value))
  );

  // Handle direct file upload to Cloudflare R2
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check size (25MB limit for images, 50MB for docs)
    const maxBytes = isDocument ? 50 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is ${isDocument ? '50MB' : '25MB'}.`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const publicUrl = await CloudflareR2.uploadFile(file, folder);
      onChange(publicUrl);
      setUrlInput(publicUrl);
      setImageError(false);
    } catch (err: any) {
      console.error('R2 Upload failed:', err);
      setUploadError(err?.message || 'Failed to upload to Cloudflare R2. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  const handleUrlSubmit = () => {
    let trimmed = urlInput.trim();
    if (!trimmed) {
      onChange('');
      return;
    }
    // Auto-fix URL schema if missing
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
      trimmed = `https://${trimmed}`;
      setUrlInput(trimmed);
    }
    onChange(trimmed);
    setImageError(false);
  };

  const handleCopyUrl = async () => {
    if (!value) return;
    try {
      const fullUrl = value.startsWith('/')
        ? `${window.location.origin}${value}`
        : value;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const aspectClass = {
    square: 'aspect-square max-w-[200px]',
    video: 'aspect-video w-full max-w-md',
    portrait: 'aspect-[3/4] max-w-[220px]',
    auto: 'max-h-52 w-auto',
  }[previewAspect];

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label and Mode Switcher Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="block text-xs font-medium text-slate-300">
          {label}
        </label>

        {/* Dual Mode Pills */}
        <div className="inline-flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              mode === 'upload'
                ? 'bg-forest-bright text-black font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Direct R2 Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
              mode === 'url'
                ? 'bg-forest-bright text-black font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* ── Mode 1: Cloudflare R2 Upload Zone ── */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative group border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-forest-bright bg-forest-bright/10 scale-[1.01]'
                : 'border-white/15 bg-black/40 hover:border-forest-bright/60 hover:bg-forest-bright/[0.03]'
            } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-3">
                <Loader2 className="w-8 h-8 text-forest-bright animate-spin mb-2.5" />
                <span className="text-xs font-semibold text-white">Uploading to Cloudflare R2...</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Saving to your permanent cloud storage</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-1">
                <div className="w-10 h-10 rounded-xl bg-forest-bright/10 border border-forest-bright/30 text-forest-bright flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>Click to browse</span>
                  <span className="text-slate-400 font-normal">or drag & drop</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                  Uploaded directly to Cloudflare R2 · Permanent link that never dies
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300">
                  <Sparkles className="w-2.5 h-2.5 text-forest-bright" />
                  <span>Permanent CDN · Zero expiry</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mode 2: Direct URL Input Zone ── */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                <Link2 className="w-3.5 h-3.5" />
              </div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onBlur={handleUrlSubmit}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                placeholder={placeholder}
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-forest-bright/60 focus:ring-1 focus:ring-forest-bright/30 transition-all font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Apply
            </button>
          </div>

          {/* Expiration warning for Discord/Facebook/tokenized URLs */}
          {isTempCdnUrl && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-200">
                  Temporary CDN URL detected (Discord / Social Token)
                </p>
                <p className="text-amber-300/80">
                  This URL has an expiration signature (<code className="bg-black/30 px-1 py-0.5 rounded font-mono text-[10px]">ex=... / token=...</code>) and will become dead/broken in a few days.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('upload')}
                  className="inline-flex items-center gap-1 font-semibold text-forest-bright hover:underline text-[11px] mt-0.5 cursor-pointer"
                >
                  <UploadCloud className="w-3 h-3" /> Switch to Direct R2 Upload for lifetime hosting
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-xs text-rose-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Active Media Card & Preview ── */}
      {value && (
        <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3 space-y-2.5">
          <div className="flex items-start gap-3">
            {/* Visual Thumbnail */}
            {!isDocument ? (
              <div
                className={`relative rounded-lg overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 flex items-center justify-center ${aspectClass}`}
              >
                {!imageError ? (
                  <img
                    src={value}
                    alt={label}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[80px] min-w-[80px] p-2 flex flex-col items-center justify-center text-center text-rose-400">
                    <AlertTriangle className="w-5 h-5 mb-1" />
                    <span className="text-[10px] leading-tight font-medium">Link Broken / Expired</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            )}

            {/* Info and Badges */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {isR2Url ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-bright/10 border border-forest-bright/30 text-forest-bright text-[10px] font-semibold">
                    <Sparkles className="w-3 h-3" /> Cloudflare R2 (Permanent)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-300 text-[10px] font-medium">
                    <Link2 className="w-3 h-3" /> External Link
                  </span>
                )}
                {isTempCdnUrl && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                    <AlertTriangle className="w-3 h-3" /> Expiring URL
                  </span>
                )}
              </div>

              {/* URL Display */}
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-full" title={value}>
                {value}
              </p>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-forest-bright" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied URL!' : 'Copy URL'}</span>
                </button>

                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open</span>
                </a>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace via R2</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setUrlInput('');
                    setImageError(false);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] transition-colors cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  );
}
