// ═══════════════════════════════════════════════════════════
//  /api/info.js — Vercel Serverless Function
//  Proxies video info requests to the upstream YT API.
//
//  Required Vercel Environment Variables:
//    YT_API_URL  — Full URL of your upstream API endpoint
//    YT_API_KEY  — (Optional) Bearer token for the upstream API
//
//  Frontend calls: GET /api/info?url=<encoded-youtube-url>
// ═══════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // ── CORS headers ──────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.query;

  // ── Input validation ──────────────────────────────────
  if (!url) {
    return res.status(400).json({ error: "YouTube URL is required." });
  }

  const decoded = decodeURIComponent(url);
  const YT_PATTERN =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|playlist\?(?:.*&)?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  if (!YT_PATTERN.test(decoded)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid YouTube URL." });
  }

  // ── Environment ───────────────────────────────────────
  const YT_API_URL = 'https://clipytpro.vercel.app/api/info'; // ← your API URL
const YT_API_KEY = '';                                    // ← your key or leave empty

  if (!YT_API_URL) {
    console.error("YT_API_URL environment variable is not set.");
    return res
      .status(503)
      .json({ error: "Service temporarily unavailable. Please try again later." });
  }

  // ── Upstream fetch ────────────────────────────────────
  try {
    const headers = { "Content-Type": "application/json" };
    if (YT_API_KEY) headers["Authorization"] = `Bearer ${YT_API_KEY}`;

    const upstream = await fetch(`${YT_API_URL}?url=${encodeURIComponent(decoded)}`, {
      headers,
      signal: AbortSignal.timeout(25_000),
    });

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => "");
      console.error(`Upstream API error ${upstream.status}:`, body);
      return res.status(upstream.status).json({
        error: `Could not retrieve video info (upstream ${upstream.status}).`,
      });
    }

    const data = await upstream.json();

    // Cache the response for 60 seconds at Vercel edge
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json(data);
  } catch (err) {
    console.error("API handler error:", err);

    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return res
        .status(504)
        .json({ error: "Request timed out. Please try again." });
    }

    return res
      .status(500)
      .json({ error: err.message || "Internal server error." });
  }
}
