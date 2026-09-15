import DOMPurify from 'dompurify';
import { useEffect, useMemo, useRef, useState } from 'react';

interface HtmlMessageBodyProps {
  html: string;
  title: string;
}

interface PreparedEmail {
  document: string;
  hasRemoteImages: boolean;
}

const forbiddenTags = [
  'script', 'noscript', 'link', 'meta', 'base', 'form', 'input', 'button',
  'textarea', 'select', 'option', 'iframe', 'frame', 'frameset', 'object', 'embed',
  'video', 'audio', 'canvas', 'svg', 'math',
];

function isRemoteSource(value: string): boolean {
  return /^(?:https?:)?\/\//i.test(value.trim());
}

function cleanEmailCss(value: string): string {
  return value
    .replace(/@import[\s\S]*?;/gi, '')
    .replace(/expression\s*\(/gi, 'blocked(')
    .replace(/(?:behavior|-moz-binding)\s*:[^;}]+[;}]/gi, '')
    .replace(/<\/style/gi, '<\\/style');
}

function prepareEmail(html: string, allowRemoteImages: boolean, dark: boolean): PreparedEmail {
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    WHOLE_DOCUMENT: true,
    FORBID_TAGS: forbiddenTags,
    FORBID_ATTR: ['srcdoc', 'formaction'],
  });
  const parsed = new DOMParser().parseFromString(sanitized, 'text/html');
  let hasRemoteImages = false;

  const emailStyles = Array.from(parsed.querySelectorAll('style'))
    .map((style) => cleanEmailCss(style.textContent || ''))
    .join('\n');
  parsed.querySelectorAll('style').forEach((style) => style.remove());
  if (/url\(\s*['"]?(?:https?:)?\/\//i.test(emailStyles)) hasRemoteImages = true;

  parsed.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    const href = link.getAttribute('href')?.trim() || '';
    if (!/^(https?:|mailto:)/i.test(href)) {
      link.removeAttribute('href');
      return;
    }
    link.target = '_blank';
    link.rel = 'noopener noreferrer nofollow';
  });

  parsed.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    const src = image.getAttribute('src') || '';
    const srcset = image.getAttribute('srcset') || '';
    const remote = isRemoteSource(src) || isRemoteSource(srcset);
    if (remote) hasRemoteImages = true;
    if (remote && !allowRemoteImages) {
      image.removeAttribute('src');
      image.removeAttribute('srcset');
      image.setAttribute('data-remote-image-blocked', 'true');
    } else {
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
    }
  });

  parsed.querySelectorAll<HTMLSourceElement>('source').forEach((source) => {
    const srcset = source.getAttribute('srcset') || '';
    if (isRemoteSource(srcset)) {
      hasRemoteImages = true;
      if (!allowRemoteImages) source.removeAttribute('srcset');
    }
  });

  parsed.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const style = element.getAttribute('style') || '';
    if (/url\(\s*['"]?(?:https?:)?\/\//i.test(style)) hasRemoteImages = true;
  });

  const foreground = dark ? '#f5f5f7' : '#172033';
  const muted = dark ? '#a2a2aa' : '#657189';
  const link = dark ? '#91bbff' : '#1769e0';
  const border = dark ? 'rgba(255,255,255,.14)' : 'rgba(20,45,80,.16)';
  const imageSources = allowRemoteImages ? 'data: blob: https:' : 'data: blob:';
  const contentSecurityPolicy = [
    "default-src 'none'",
    `img-src ${imageSources}`,
    "style-src 'unsafe-inline'",
    "font-src data:",
    "connect-src 'none'",
    "media-src 'none'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');

  const body = parsed.body.innerHTML;
  const document = `<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
${emailStyles ? `<style>${emailStyles}</style>` : ''}
<style>
  :root { color-scheme: ${dark ? 'dark' : 'light'}; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { width: 100% !important; max-width: 100% !important; min-width: 0 !important; margin: 0; padding: 0; color: ${foreground}; background: transparent; font: 15px/1.72 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow-x: hidden; overflow-wrap: anywhere; word-break: break-word; }
  body { padding: 22px 1px 6px; }
  body > table, body > div, body > center, div, center { max-width: 100% !important; }
  a { color: ${link}; text-decoration-thickness: 1px; text-underline-offset: 2px; }
  img { max-width: 100% !important; height: auto !important; border-radius: 6px; }
  img[data-remote-image-blocked] { display: none !important; }
  table { max-width: 100% !important; border-collapse: collapse; }
  td, th { max-width: 100% !important; overflow-wrap: anywhere; word-break: break-word; }
  blockquote { margin-inline: 0; padding-inline-start: 14px; color: ${muted}; border-inline-start: 3px solid ${border}; }
  pre { max-width: 100%; white-space: pre-wrap; }
  hr { border: 0; border-top: 1px solid ${border}; }
  @media (max-width: 520px) {
    table, tbody, tr, td, th { max-width: 100% !important; }
    img[width], table[width] { max-width: 100% !important; }
  }
</style></head><body>${body}</body></html>`;

  return { document, hasRemoteImages };
}

export function HtmlMessageBody({ html, title }: HtmlMessageBodyProps) {
  const [showRemoteImages, setShowRemoteImages] = useState(false);
  const [height, setHeight] = useState(220);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const dark = document.documentElement.dataset.theme === 'dark';
  const prepared = useMemo(
    () => prepareEmail(html, showRemoteImages, dark),
    [html, showRemoteImages, dark],
  );

  useEffect(() => () => resizeObserverRef.current?.disconnect(), []);

  function resizeFrame() {
    const frameDocument = frameRef.current?.contentDocument;
    const body = frameDocument?.body;
    if (!body || !frameDocument) return;
    const update = () => {
      const contentHeight = Math.max(body.scrollHeight, frameDocument.documentElement.scrollHeight);
      setHeight(Math.min(16000, Math.max(220, contentHeight + 8)));
    };
    update();
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(update);
    resizeObserverRef.current.observe(body);
  }

  return (
    <section className="html-message-body">
      {prepared.hasRemoteImages && !showRemoteImages && (
        <div className="remote-images-notice" role="status">
          <span>プライバシー保護のため外部画像を非表示にしています</span>
          <button onClick={() => setShowRemoteImages(true)}>画像を表示</button>
        </div>
      )}
      <iframe
        ref={frameRef}
        className="message-html-frame"
        title={title}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        srcDoc={prepared.document}
        style={{ height }}
        onLoad={resizeFrame}
      />
    </section>
  );
}
