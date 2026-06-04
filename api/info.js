// ═══════════════════════════════════════════════════════════
//  /api/info.js — Vercel Serverless Function
//  Frontend calls: GET /api/info?url=<encoded-youtube-url>
// ═══════════════════════════════════════════════════════════

// ── YOUR API ────────────────────────────────────────────────
const YT_API_BASE = 'https://clipytpro.vercel.app/api/info';
// ────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'YouTube URL is required.' });
  }

  const decoded = decodeURIComponent(url);
  const YT_PATTERN = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|playlist\?(?:.*&)?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  if (!YT_PATTERN.test(decoded)) {
    return res.status(400).json({ error: 'Please enter a valid YouTube URL.' });
  }

  try {
    // Calls: https://clipytpro.vercel.app/api/info?yt=YOUTUBE_LINK
    const upstream = await fetch(`${YT_API_BASE}?yt=${encodeURIComponent(decoded)}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25_000),
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => '');
      console.error(`Upstream API error ${upstream.status}:`, body);
      return res.status(upstream.status).json({
        error: `Could not retrieve video info (${upstream.status}).`,
      });
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);

  } catch (err) {
    console.error('API handler error:', err);
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out. Please try again.' });
    }
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}
