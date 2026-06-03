/* ═══════════════════════════════════════════════════════════
   YTSAVE — script.js
   Full application logic
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── 1. Apply CONFIG to DOM ─────────────────────────────── */
function applyConfig() {
  if (typeof CONFIG === 'undefined') return;

  const name = CONFIG.SITE_NAME || 'YTSAVE';
  const year = new Date().getFullYear();

  // Title & meta
  document.title = `${name} — Free YouTube Video Downloader & HD Cutter`;
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) descMeta.setAttribute('content', CONFIG.SITE_DESCRIPTION || '');

  // OG tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', `${name} — Free YouTube Video Downloader`);

  // Logo & footer name nodes
  const nodes = ['logo-text', 'footer-site-name', 'footer-name'];
  nodes.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = name;
  });

  // Footer tagline
  const taglineEl = document.getElementById('footer-tagline');
  if (taglineEl && CONFIG.SITE_DESCRIPTION) {
    taglineEl.textContent = CONFIG.SITE_DESCRIPTION;
  }

  // Footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = year;

  // Instagram button href
  const instaBtn = document.getElementById('insta-btn');
  if (instaBtn && CONFIG.INSTAGRAM_SAVER_URL) {
    instaBtn.href = CONFIG.INSTAGRAM_SAVER_URL;
  }
}

/* ── 2. Canvas Background — Particles + Bubbles ─────────── */
function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let particles = [], bubbles = [];
  let raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* Floating particle */
  class Particle {
    constructor(randomY) {
      this.reset(randomY);
    }
    reset(randomY) {
      this.x  = Math.random() * W;
      this.y  = randomY ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.2;
      this.r  = Math.random() * 1.2 + 0.3;
      this.base = Math.random() * 0.35 + 0.05;
      this.alpha = this.base;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.012 + 0.005;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.phase += this.speed;
      this.alpha = this.base + Math.sin(this.phase) * 0.12;
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(12,184,214,${this.alpha})`;
      ctx.fill();
    }
  }

  /* Rising bubble */
  class Bubble {
    constructor(init) {
      this.init = init;
      this.reset();
      if (init) this.y = Math.random() * H;
    }
    reset() {
      this.x      = Math.random() * W;
      this.y      = H + Math.random() * 40 + 10;
      this.vy     = -(Math.random() * 0.6 + 0.15);
      this.r      = Math.random() * 4 + 1;
      this.alpha  = Math.random() * 0.15 + 0.03;
      this.wobble = Math.random() * Math.PI * 2;
      this.wSpd   = Math.random() * 0.018 + 0.006;
      this.wx     = Math.random() * 0.25 + 0.05;
    }
    update() {
      this.y      += this.vy;
      this.wobble += this.wSpd;
      this.x      += Math.sin(this.wobble) * this.wx;
      if (this.y < -20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(12,184,214,${this.alpha})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Inner gleam
      const gx = this.x - this.r * 0.32;
      const gy = this.y - this.r * 0.32;
      ctx.beginPath();
      ctx.arc(gx, gy, this.r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(160,237,248,${this.alpha * 1.8})`;
      ctx.fill();
    }
  }

  function build() {
    particles = Array.from({ length: 90  }, (_, i) => new Particle(true));
    bubbles   = Array.from({ length: 35  }, (_, i) => new Bubble(true));
  }

  let tick = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Base gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#01080f');
    bg.addColorStop(0.5, '#020e1c');
    bg.addColorStop(1,   '#010810');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ambient glow — top left
    const g1 = ctx.createRadialGradient(W * 0.15, H * 0.2, 0, W * 0.15, H * 0.2, W * 0.35);
    g1.addColorStop(0, 'rgba(0,100,160,0.055)');
    g1.addColorStop(1, 'rgba(0,100,160,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    // Ambient glow — bottom right
    const g2 = ctx.createRadialGradient(W * 0.85, H * 0.75, 0, W * 0.85, H * 0.75, W * 0.28);
    g2.addColorStop(0, 'rgba(12,184,214,0.04)');
    g2.addColorStop(1, 'rgba(12,184,214,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // Slowly moving center glow
    const cx = W / 2 + Math.sin(tick * 0.0004) * W * 0.12;
    const cy = H * 0.4 + Math.cos(tick * 0.0003) * H * 0.08;
    const g3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.3);
    g3.addColorStop(0, 'rgba(6,40,80,0.06)');
    g3.addColorStop(1, 'rgba(6,40,80,0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => { p.update(); p.draw(); });
    bubbles.forEach(b => { b.update(); b.draw(); });

    tick++;
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    // rebuild on large resize
    build();
  }, { passive: true });

  resize();
  build();
  draw();
}

/* ── 3. Navbar — scroll glass + mobile toggle ───────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('nav-mobile');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 55);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (mobileNav) mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });

  // Close mobile nav on link click
  mobileNav?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle?.classList.remove('active');
      toggle?.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ── 4. URL Input & Paste ────────────────────────────────── */
function initUrlInput() {
  const input   = document.getElementById('yt-url-input');
  const fetchBtn = document.getElementById('fetch-btn');
  const pasteBtn = document.getElementById('paste-btn');

  // Paste button
  pasteBtn?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (input && text) {
        input.value = text.trim();
        input.focus();
      }
    } catch {
      input?.focus();
      input?.select();
    }
  });

  // Enter key
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchVideoInfo();
    }
  });

  // Clear validation style on input
  input?.addEventListener('input', () => {
    input.style.borderColor = '';
  });

  fetchBtn?.addEventListener('click', fetchVideoInfo);
}

/* ── 5. Fetch Video Info ─────────────────────────────────── */
async function fetchVideoInfo() {
  const input = document.getElementById('yt-url-input');
  const rawUrl = input?.value?.trim() || '';

  if (!rawUrl) {
    showError('Please paste a YouTube URL first.');
    input?.focus();
    return;
  }

  if (!isValidYouTubeUrl(rawUrl)) {
    showError('That doesn\'t look like a valid YouTube URL. Check and try again.');
    return;
  }

  // UI state
  setLoading(true);
  hideResult();
  hideError();

  const apiBase = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE) ? CONFIG.API_BASE : '/api';

  try {
    const res = await fetch(`${apiBase}/info?url=${encodeURIComponent(rawUrl)}`);
    const body = await res.json().catch(() => ({}));

    if (!res.ok || body.error) {
      throw new Error(body.error || `Server error (${res.status}).`);
    }

    // Support both {data:{...}} and flat object
    const videoData = body.data || body;

    if (!videoData || !videoData.formats || !Array.isArray(videoData.formats)) {
      throw new Error('Unexpected API response. Please try a different URL.');
    }

    renderResult(videoData);
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
}

/* ── 6. Render Result ────────────────────────────────────── */
function renderResult(video) {
  const { title = 'Unknown Title', thumbnail = '', duration = 0, formats = [] } = video;

  // Thumbnail
  const thumbEl = document.getElementById('result-thumb');
  if (thumbEl) {
    thumbEl.src = thumbnail;
    thumbEl.alt = title;
    thumbEl.onerror = () => { thumbEl.src = ''; thumbEl.style.background = 'var(--bg-surface)'; };
  }

  // Duration chip
  const durChip = document.getElementById('result-dur-chip');
  if (durChip) {
    const durStr = formatDuration(duration);
    durChip.textContent = durStr;
    durChip.setAttribute('aria-label', `Duration: ${durStr}`);
  }

  // Title
  const titleEl = document.getElementById('result-heading');
  if (titleEl) titleEl.textContent = title;

  // Info pills
  const pillsEl = document.getElementById('result-pills');
  if (pillsEl) {
    const videoFmts = formats.filter(f => !f.is_audio);
    const audioFmts = formats.filter(f => f.is_audio);
    pillsEl.innerHTML = '';

    const pills = [
      `⏱ ${formatDuration(duration)}`,
      `${videoFmts.length} video format${videoFmts.length !== 1 ? 's' : ''}`,
      audioFmts.length > 0 ? `${audioFmts.length} audio format${audioFmts.length !== 1 ? 's' : ''}` : null,
    ].filter(Boolean);

    pills.forEach(p => {
      const span = document.createElement('span');
      span.className = 'result-pill';
      span.textContent = p;
      span.setAttribute('role', 'listitem');
      pillsEl.appendChild(span);
    });
  }

  // Separate & deduplicate formats
  const videoFormats = deduplicateFormats(formats.filter(f => !f.is_audio));
  const audioFormats = formats.filter(f => f.is_audio);

  // Render video formats
  const videoGrid = document.getElementById('video-formats-grid');
  if (videoGrid) {
    videoGrid.innerHTML = '';
    videoFormats.forEach(fmt => videoGrid.appendChild(buildFormatCard(fmt, title, 'video')));
  }

  // Render audio formats
  const audioGrid = document.getElementById('audio-formats-grid');
  const audioSection = document.getElementById('audio-dl-section');
  if (audioGrid && audioSection) {
    audioGrid.innerHTML = '';
    if (audioFormats.length > 0) {
      audioFormats.forEach(fmt => audioGrid.appendChild(buildFormatCard(fmt, title, 'audio')));
      audioSection.hidden = false;
    } else {
      audioSection.hidden = true;
    }
  }

  // Show section & smooth scroll
  const resultSection = document.getElementById('result-section');
  if (resultSection) {
    resultSection.hidden = false;
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }
}

/* Deduplicate formats — keep highest-filesize per quality label */
function deduplicateFormats(formats) {
  const seen = new Map();
  formats.forEach(fmt => {
    const key = fmt.format_note || fmt.resolution || fmt.format_id;
    const cur = seen.get(key);
    const curSize = cur?.filesize || 0;
    const fmtSize = fmt.filesize || 0;
    if (!cur || fmtSize > curSize) seen.set(key, fmt);
  });

  return Array.from(seen.values()).sort((a, b) => {
    const qa = parseInt(a.format_note) || 0;
    const qb = parseInt(b.format_note) || 0;
    return qa - qb;
  });
}

/* Build a format download card */
function buildFormatCard(fmt, videoTitle, type) {
  const card = document.createElement('div');
  card.className = 'format-btn';
  card.setAttribute('role', 'listitem');

  const quality  = fmt.format_note || (fmt.resolution === 'audio only' ? 'Audio' : fmt.resolution) || '?';
  const mime     = getMimeFromUrl(fmt.url);
  const ext      = getExt(mime, type);
  const typeLabel = ext.toUpperCase();
  const sizeStr  = fmt.filesize ? formatFilesize(fmt.filesize) : '';
  const safeName = sanitizeFilename(videoTitle) + `_${quality}.${ext}`;

  card.innerHTML = `
    <div class="fmt-quality">${escapeHtml(quality)}</div>
    <div class="fmt-details">
      <span class="fmt-type">${typeLabel}</span>
      ${sizeStr ? `<span class="fmt-size">${sizeStr}</span>` : ''}
    </div>
    <button class="fmt-dl-btn" aria-label="Download ${quality} ${typeLabel}${sizeStr ? ', ' + sizeStr : ''}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      Download
    </button>
  `;

  const btn = card.querySelector('.fmt-dl-btn');
  btn.addEventListener('click', () => triggerDownload(fmt.url, safeName, btn));

  return card;
}

/* ── 7. Download Trigger ─────────────────────────────────── */
async function triggerDownload(url, filename, btn) {
  if (!url) return;
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="dl-spinner"></span> Opening…`;

  try {
    // Attempt fetch → Blob (works when CDN has permissive CORS)
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal, mode: 'cors' });
    clearTimeout(tid);

    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);

      btn.innerHTML = `✓ Done!`;
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 2500);
      return;
    }
  } catch (_) {
    // CORS blocked or network error — fall through
  }

  // Fallback: open URL in new tab (browser will handle download/stream)
  window.open(url, '_blank', 'noopener,noreferrer');
  btn.innerHTML = `↗ Opened`;
  setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 2500);
}

/* ── 8. Video Cutter ─────────────────────────────────────── */
const CutterState = {
  file: null,
  duration: 0,
  startTime: 0,
  endTime: 0,
};

function initCutter() {
  const dropZone  = document.getElementById('cutter-drop');
  const fileInput = document.getElementById('cutter-file-input');
  const editor    = document.getElementById('cutter-editor');

  // File input change
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) loadCutterFile(file);
    else if (file) showError('Please select a valid video file.');
  });

  // Drag-over
  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    dropZone.classList.add('drag-over');
  });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

  // Drop
  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('video/')) loadCutterFile(file);
    else showError('Please drop a valid video file (MP4, WebM, MOV…).');
  });

  // Time input changes
  document.getElementById('start-time-input')?.addEventListener('blur', (e) => {
    const t = parseTimeStr(e.target.value);
    if (t !== null && t >= 0 && t < CutterState.endTime) {
      CutterState.startTime = t;
      syncTimeline();
    } else {
      e.target.value = formatDuration(CutterState.startTime);
    }
  });

  document.getElementById('end-time-input')?.addEventListener('blur', (e) => {
    const t = parseTimeStr(e.target.value);
    if (t !== null && t > CutterState.startTime && t <= CutterState.duration) {
      CutterState.endTime = t;
      syncTimeline();
    } else {
      e.target.value = formatDuration(CutterState.endTime);
    }
  });

  // Buttons
  document.getElementById('preview-btn')?.addEventListener('click', previewClip);
  document.getElementById('cut-btn')?.addEventListener('click', cutAndDownload);
  document.getElementById('cutter-reset-btn')?.addEventListener('click', resetCutter);
}

function loadCutterFile(file) {
  CutterState.file = file;

  const videoEl = document.getElementById('cutter-video');
  if (!videoEl) return;

  // Revoke old object URL
  if (videoEl._blobUrl) URL.revokeObjectURL(videoEl._blobUrl);
  const blobUrl = URL.createObjectURL(file);
  videoEl._blobUrl = blobUrl;
  videoEl.src = blobUrl;

  videoEl.onloadedmetadata = () => {
    const dur = videoEl.duration || 0;
    CutterState.duration  = dur;
    CutterState.startTime = 0;
    CutterState.endTime   = dur;

    // Show editor
    document.getElementById('cutter-drop').hidden   = true;
    document.getElementById('cutter-editor').hidden = false;

    syncTimeInputs();
    initTimeline();

    // Scroll cutter section into view
    document.getElementById('cutter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  videoEl.onerror = () => showError('Could not read video file. Try a different format.');
}

/* Timeline drag system */
function initTimeline() {
  const track      = document.getElementById('timeline-track');
  const startHdle  = document.getElementById('tl-handle-start');
  const endHdle    = document.getElementById('tl-handle-end');
  const videoEl    = document.getElementById('cutter-video');

  if (!track || !startHdle || !endHdle) return;

  syncTimeline();

  function pctFromEvent(e) {
    const rect = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function makeDraggable(handle, isStart) {
    let active = false;

    const onDown = (e) => {
      e.preventDefault();
      active = true;
      document.body.style.userSelect = 'none';
    };
    const onMove = (e) => {
      if (!active) return;
      const pct = pctFromEvent(e);
      const t   = pct * CutterState.duration;
      if (isStart) {
        CutterState.startTime = Math.max(0, Math.min(t, CutterState.endTime - 0.25));
      } else {
        CutterState.endTime = Math.min(CutterState.duration, Math.max(t, CutterState.startTime + 0.25));
      }
      syncTimeline();
      syncTimeInputs();
    };
    const onUp = () => {
      active = false;
      document.body.style.userSelect = '';
    };

    handle.addEventListener('mousedown',  onDown, { passive: false });
    handle.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove',  onMove, { passive: true });
    window.addEventListener('touchmove',  onMove, { passive: true });
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('touchend',   onUp);
  }

  makeDraggable(startHdle, true);
  makeDraggable(endHdle,   false);

  // Click on track to seek
  track.addEventListener('click', (e) => {
    const pct = pctFromEvent(e);
    if (videoEl) videoEl.currentTime = pct * CutterState.duration;
  });

  // Update playhead
  videoEl?.addEventListener('timeupdate', () => {
    const pct = CutterState.duration ? videoEl.currentTime / CutterState.duration : 0;
    const ph = document.getElementById('tl-playhead');
    if (ph) ph.style.left = `${pct * 100}%`;
  });
}

/* Sync timeline visual positions */
function syncTimeline() {
  const dur  = CutterState.duration || 1;
  const sp   = (CutterState.startTime / dur) * 100;
  const ep   = (CutterState.endTime   / dur) * 100;

  const startH = document.getElementById('tl-handle-start');
  const endH   = document.getElementById('tl-handle-end');
  const sel    = document.getElementById('timeline-selection');

  if (startH) startH.style.left = `calc(${sp}% - 7px)`;
  if (endH)   endH.style.left   = `calc(${ep}% - 7px)`;
  if (sel) {
    sel.style.left  = `${sp}%`;
    sel.style.width = `${ep - sp}%`;
  }

  const tlStart = document.getElementById('tl-time-start');
  const tlEnd   = document.getElementById('tl-time-end');
  if (tlStart) tlStart.textContent = formatDuration(CutterState.startTime);
  if (tlEnd)   tlEnd.textContent   = formatDuration(CutterState.endTime);

  updateClipLength();
}

function syncTimeInputs() {
  const si = document.getElementById('start-time-input');
  const ei = document.getElementById('end-time-input');
  if (si) si.value = formatDuration(CutterState.startTime);
  if (ei) ei.value = formatDuration(CutterState.endTime);
  updateClipLength();
}

function updateClipLength() {
  const len = CutterState.endTime - CutterState.startTime;
  const el  = document.getElementById('clip-len');
  if (el) el.textContent = formatDuration(Math.max(0, len));
}

/* Preview selected clip range */
function previewClip() {
  const video = document.getElementById('cutter-video');
  if (!video) return;
  video.currentTime = CutterState.startTime;
  video.play();

  const checkEnd = () => {
    if (video.currentTime >= CutterState.endTime) {
      video.pause();
      video.removeEventListener('timeupdate', checkEnd);
    }
  };
  video.addEventListener('timeupdate', checkEnd);
}

/* Cut & download using FFmpeg.wasm */
async function cutAndDownload() {
  if (!CutterState.file) return;

  const progressWrap = document.getElementById('ffprog-wrap');
  const progressFill = document.getElementById('ffprog-fill');
  const progressLbl  = document.getElementById('ffprog-label');
  const cutBtn       = document.getElementById('cut-btn');

  const setProgress = (pct, msg) => {
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressLbl)  progressLbl.textContent  = msg;
  };

  if (progressWrap) progressWrap.hidden = false;
  if (cutBtn)       cutBtn.disabled = true;

  try {
    // Check FFmpeg availability
    if (typeof window.FFmpeg === 'undefined' || !window.FFmpeg.createFFmpeg) {
      throw new Error('FFmpeg not loaded. Please refresh the page and try again.');
    }

    setProgress(8, 'Initializing FFmpeg engine…');

    const { createFFmpeg, fetchFile } = window.FFmpeg;
    const ff = createFFmpeg({
      corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
      log: false,
      progress: ({ ratio }) => {
        const pct = 20 + Math.round(ratio * 65);
        setProgress(pct, `Processing… ${Math.round(ratio * 100)}%`);
      },
    });

    if (!ff.isLoaded()) {
      setProgress(12, 'Loading FFmpeg WASM (~6MB, first run only)…');
      await ff.load();
    }

    setProgress(20, 'Reading video file…');

    const inputName  = 'input_' + Date.now() + '.mp4';
    const outputName = 'output_' + Date.now() + '.mp4';

    ff.FS('writeFile', inputName, await fetchFile(CutterState.file));

    const ss = CutterState.startTime.toFixed(3);
    const to = CutterState.endTime.toFixed(3);

    setProgress(22, 'Cutting clip…');

    await ff.run(
      '-i', inputName,
      '-ss', ss,
      '-to', to,
      '-c', 'copy',
      '-avoid_negative_ts', 'make_zero',
      outputName,
    );

    setProgress(90, 'Preparing download…');

    const data = ff.FS('readFile', outputName);
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href     = blobUrl;
    a.download = `ytsave_clip_${formatDuration(CutterState.startTime).replace(':', 'm')}s_to_${formatDuration(CutterState.endTime).replace(':', 'm')}s.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);

    setProgress(100, '✓ Clip saved successfully!');

    // Cleanup FS
    try { ff.FS('unlink', inputName);  } catch (_) {}
    try { ff.FS('unlink', outputName); } catch (_) {}

    setTimeout(() => {
      if (progressWrap) progressWrap.hidden = true;
      setProgress(0, '');
      if (cutBtn) cutBtn.disabled = false;
    }, 3500);

  } catch (err) {
    console.error('FFmpeg error:', err);
    setProgress(0, `Error: ${err.message}`);
    setTimeout(() => {
      if (progressWrap) progressWrap.hidden = true;
      if (cutBtn)       cutBtn.disabled = false;
    }, 5000);
  }
}

/* Reset cutter to initial state */
function resetCutter() {
  const videoEl = document.getElementById('cutter-video');
  if (videoEl) {
    videoEl.pause();
    if (videoEl._blobUrl) { URL.revokeObjectURL(videoEl._blobUrl); videoEl._blobUrl = null; }
    videoEl.src = '';
  }

  CutterState.file = null;
  CutterState.duration = CutterState.startTime = CutterState.endTime = 0;

  const fileInput = document.getElementById('cutter-file-input');
  if (fileInput) fileInput.value = '';

  document.getElementById('cutter-drop').hidden   = false;
  document.getElementById('cutter-editor').hidden = true;
  document.getElementById('ffprog-wrap').hidden   = true;
}

/* ── 9. FAQ Accordion ────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item?.querySelector('.faq-a');
      const isOpen = item?.classList.contains('open');

      // Close all others
      document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        const a = el.querySelector('.faq-a');
        if (a) a.hidden = false; // keep in DOM for transition
      });

      if (!isOpen) {
        item?.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ── 10. Scroll Reveal ───────────────────────────────────── */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

/* ── UI State Helpers ────────────────────────────────────── */
function setLoading(show) {
  const loadSection = document.getElementById('loading-section');
  const btn         = document.getElementById('fetch-btn');
  const btnText     = btn?.querySelector('.go-text');

  if (loadSection) loadSection.hidden = !show;
  if (btn)         btn.disabled = show;
  if (btnText)     btnText.textContent = show ? 'Fetching…' : 'Get Links';
}

function hideResult() {
  const el = document.getElementById('result-section');
  if (el) el.hidden = true;
}

let _errorTimer = null;
function showError(msg) {
  const toast  = document.getElementById('error-toast');
  const msgEl  = document.getElementById('error-msg');
  if (!toast || !msgEl) { console.warn('YTSAVE error:', msg); return; }
  msgEl.textContent = msg;
  toast.hidden = false;
  clearTimeout(_errorTimer);
  _errorTimer = setTimeout(() => { toast.hidden = true; }, 6000);
}
function hideError() {
  const toast = document.getElementById('error-toast');
  if (toast) toast.hidden = true;
}

/* ── Utility Functions ───────────────────────────────────── */
function isValidYouTubeUrl(url) {
  return /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|playlist\?)|youtu\.be\/)/.test(url);
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const s  = Math.floor(seconds);
  const h  = Math.floor(s / 3600);
  const m  = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

function parseTimeStr(str) {
  if (!str) return null;
  const trimmed = str.trim();
  const parts   = trimmed.split(':').map(s => parseFloat(s));
  if (parts.some(isNaN)) return null;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function formatFilesize(bytes) {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMimeFromUrl(url) {
  if (!url) return 'video/mp4';
  const match = url.match(/[?&]mime=([^&]+)/);
  if (!match) return url.includes('webm') ? 'video/webm' : 'video/mp4';
  return decodeURIComponent(match[1]);
}

function getExt(mime, type) {
  const map = {
    'video/mp4':   'mp4',
    'video/webm':  'webm',
    'audio/mp4':   'm4a',
    'audio/webm':  'webm',
    'audio/mpeg':  'mp3',
    'audio/ogg':   'ogg',
  };
  if (map[mime]) return map[mime];
  return type === 'audio' ? 'm4a' : 'mp4';
}

function sanitizeFilename(str) {
  if (!str) return 'video';
  return str.replace(/[^a-zA-Z0-9\-_\u00C0-\u017E]/g, '_').replace(/_+/g, '_').substring(0, 60);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ── Boot ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initBackground();
  initNavbar();
  initUrlInput();
  initCutter();
  initFAQ();
  initScrollReveal();
});

