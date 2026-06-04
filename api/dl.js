// ═══════════════════════════════════════════════════════════
//  /api/dl.js — Download Proxy
//  Fetches the video/audio from YouTube CDN and streams it
//  back with Content-Disposition: attachment so the browser
//  downloads the file instead of playing it in a new tab.
//
//  Called by frontend as: GET /api/dl?url=<encoded>&fn=<filename>
// ═══════════════════════════════════════════════════════════

export const config = { maxDuration: 60 }; // 60s (Vercel Pro) — 10s on Hobby plan

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, fn } = req.query;

  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  const decoded = decodeURIComponent(url);
  const filename = fn ? decodeURIComponent(fn) : 'video.mp4';

  // Only allow YouTube CDN URLs for security
  const allowed = /googlevideo\.com|youtube\.com|ytimg\.com/;
  if (!allowed.test(decoded)) {
    return res.status(403).json({ error: 'Only YouTube CDN URLs are allowed.' });
  }

  try {
    const upstream = await fetch(decoded, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Range': req.headers['range'] || '',
      },
      // Forward range header for partial content / resumable downloads
    });

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}. URL may have expired — please refresh the page and try again.`,
      });
    }

    // Copy upstream headers
    const ct = upstream.headers.get('content-type') || 'application/octet-stream';
    const cl = upstream.headers.get('content-length');
    const cr = upstream.headers.get('content-range');

    res.setHeader('Content-Type', ct);
    // Force download in browser
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader('Cache-Control', 'no-store');
    if (cl) res.setHeader('Content-Length', cl);
    if (cr) res.setHeader('Content-Range', cr);

    res.status(upstream.status);

    // Stream the body chunk by chunk
    const reader = upstream.body.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) { res.end(); return; }
      const ok = res.write(Buffer.from(value));
      // Respect backpressure
      if (!ok) {
        await new Promise(r => res.once('drain', r));
      }
      return pump();
    };

    await pump();

  } catch (err) {
    console.error('Download proxy error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Download failed.' });
    }
  }
}

