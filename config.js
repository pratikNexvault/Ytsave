// ═══════════════════════════════════════════════════════════
//  YTSAVE — Site Configuration
//  Changing SITE_NAME here automatically propagates to:
//    • Logo (nav + footer)
//    • Page <title> and meta description
//    • Open Graph & Twitter Card tags
//    • Footer copyright
//    • All SEO-relevant text nodes
// ═══════════════════════════════════════════════════════════

const CONFIG = Object.freeze({
  // ─── Branding ─────────────────────────────────────────
  SITE_NAME: "YTSAVE",
  SITE_TAGLINE: "Download Any YouTube Video. Free. Instant.",
  SITE_DESCRIPTION:
    "Free YouTube video downloader. Download HD MP4 videos, WebM, and MP3 audio. Trim YouTube clips in your browser with our built-in Video Cutter. No registration needed.",
  SITE_KEYWORDS:
    "youtube downloader, youtube video downloader, hd video downloader, youtube cutter, youtube clip downloader, mp4 downloader, mp3 downloader",

  // ─── URLs ─────────────────────────────────────────────
  SITE_URL: "https://ytsave.vercel.app",
  INSTAGRAM_SAVER_URL: "https://instasaves.vercel.app",

  // ─── API ──────────────────────────────────────────────
  // Frontend ONLY calls internal /api routes. Never expose upstream API here.
  API_BASE: "/api",

  // ─── Theme ────────────────────────────────────────────
  BRAND_COLOR: "#0cb8d6",
  BRAND_COLOR_DARK: "#030e1c",
});

