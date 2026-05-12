/* ═══════════════════════════════════════════════════════════
   HyperFruit AI: A Multi-Fruit Hyperspectral Framework
   script.js — Final Premium Edition
   ═══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────
   1. ANIMATED PARTICLE CANVAS
────────────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, pts = [];

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const mkParticle = () => ({
    x:    Math.random() * W,
    y:    Math.random() * H,
    r:    Math.random() * 1.4 + 0.3,
    vx:   (Math.random() - 0.5) * 0.14,
    vy:   (Math.random() - 0.5) * 0.14,
    a:    Math.random() * 0.45,
    hue:  Math.random() > 0.5 ? 250 : 200,
  });

  for (let i = 0; i < 130; i++) pts.push(mkParticle());

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},70%,70%,${p.a * 0.35})`;
      ctx.fill();
    });

    // Connecting lines between nearby particles
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(100,90,220,${0.1 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
})();

/* ──────────────────────────────────────────────────────
   2. STATIC DATA
────────────────────────────────────────────────────── */
const fruitMeta = {
  blueberry: { emoji: '🫐', label: 'Blueberry (Vaccinium corymbosum)' },
  kaki:      { emoji: '🍊', label: 'Kaki — Persimmon (Diospyros kaki)' },
  avocado:   { emoji: '🥑', label: 'Avocado (Persea americana)' },
};

const recommendations = {
  blueberry: {
    good: 'Suitable for premium fresh retail and export. Anthocyanin profile confirms Grade A standard. Refrigerate and dispatch within 48 hours.',
    bad:  'Not suitable for fresh retail. Fermentation and structural defect patterns detected. Route to processing or discard.',
  },
  kaki: {
    perfect:  'Ready for immediate consumption. Tannin solubility and Brix levels are optimal. Shelf life: 2–3 days at ambient temperature.',
    overripe: 'Route to processing stream — juices, jams, dried products. Avoid fresh market placement; cell degradation exceeds retail threshold.',
  },
  avocado: {
    unripe:   'Requires 2–4 days of natural ambient ripening. Avoid refrigeration at this stage to prevent chilling injury.',
    perfect:  'Optimal consumption window open now. Ideal lipid-to-water balance and creamy texture confirmed. Consume within 24–48 hours.',
    overripe: 'Use immediately for guacamole, spreads, or processing. Prolonged storage will accelerate internal oxidation.',
  },
};

const insights = {
  blueberry: {
    good: 'High anthocyanin content & optimal sugar-acid ratio detected',
    bad:  'Fermentation markers & structural defect patterns identified',
  },
  kaki: {
    perfect:  'Tannin solubility at peak — ideal Brix level confirmed',
    overripe: 'Cell wall degradation & NIR ethylene markers present',
  },
  avocado: {
    unripe:   'Chlorophyll dominance — oil content threshold not yet reached',
    perfect:  'Optimal chlorophyll degradation stage — lipid balance confirmed',
    overripe: 'Oxidation markers exceed safe threshold — process immediately',
  },
};

const confidenceText = {
  good:     'High confidence prediction based on strong spectral pattern match',
  perfect:  'High confidence prediction based on strong spectral pattern match',
  unripe:   'Moderate-high confidence — early-stage spectral signatures detected',
  overripe: 'High confidence — advanced degradation spectral signatures confirmed',
  bad:      'High confidence — defect spectral signatures clearly identified',
};

// Maps result key → color class
const colorMap = { good: 'green', perfect: 'green', unripe: 'amber', overripe: 'red', bad: 'red' };
const iconMap  = { good: '✅',    perfect: '✅',    unripe: '⏳',    overripe: '⚠️', bad: '❌' };
const badgeMap = { green: 'Quality Approved', amber: 'Needs Attention', red: 'Quality Rejected' };

/* ──────────────────────────────────────────────────────
   3. FRUIT CARD SELECTION
────────────────────────────────────────────────────── */
let selectedFruit = null;

document.querySelectorAll('.fruit-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.fruit-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedFruit = card.dataset.fruit;
  });
});

/* ──────────────────────────────────────────────────────
   4. FILE UPLOAD
────────────────────────────────────────────────────── */
const fileInput   = document.getElementById('fileInput');
const uploadZone  = document.getElementById('uploadZone');
const filePill    = document.getElementById('filePill');
const filePillName= document.getElementById('filePillName');
let   selectedFile = null;

function handleFile(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.hdr')) {
    showToast('Only .hdr hyperspectral files are accepted.');
    return;
  }
  selectedFile = file;
  filePillName.textContent = file.name;
  filePill.classList.add('show');
}

fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  handleFile(e.dataTransfer.files[0]);
});

/* ──────────────────────────────────────────────────────
   5. BUTTON RIPPLE EFFECT
────────────────────────────────────────────────────── */
function addRipple(btn, e) {
  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  const rect = btn.getBoundingClientRect();
  const sz   = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    width: ${sz}px;
    height: ${sz}px;
    left: ${e.clientX - rect.left - sz / 2}px;
    top: ${e.clientY - rect.top - sz / 2}px;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

/* ──────────────────────────────────────────────────────
   6. PREDICT — POST to /predict (DO NOT CHANGE)
────────────────────────────────────────────────────── */
const predictBtn = document.getElementById('predictBtn');

predictBtn.addEventListener('click', async function (e) {
  addRipple(this, e);

  if (!selectedFruit) { showToast('Please select a fruit species first.'); return; }
  if (!selectedFile)  { showToast('Please upload a .hdr spectral file.');  return; }

  this.classList.add('loading');
  this.disabled = true;

  const formData = new FormData();
  formData.append('fruit', selectedFruit);
  formData.append('file',  selectedFile);

  try {
    const res = await fetch('/predict', { method: 'POST', body: formData });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error (${res.status})`);
    }

    const data = await res.json();
    showModal(selectedFruit, data);

  } catch (err) {
    showToast('Error: ' + err.message);
  } finally {
    this.classList.remove('loading');
    this.disabled = false;
  }
});

/* ──────────────────────────────────────────────────────
   7. RESULT MODAL
────────────────────────────────────────────────────── */
function showModal(fruit, data) {
  const { result, info } = data;
  const key    = result.toLowerCase();
  const color  = colorMap[key]  || 'amber';
  const icon   = iconMap[key]   || '🔍';
  const meta   = fruitMeta[fruit];
  const rec    = (recommendations[fruit]   || {})[key] || 'No recommendation available.';
  const insight= (insights[fruit]          || {})[key] || 'Spectral analysis complete.';
  const conf   = confidenceText[key] || 'Prediction based on spectral feature extraction.';

  // Glow + stripe
  const glow = document.getElementById('mGlow');
  glow.className = 'modal-glow ' + color;

  document.getElementById('mStripe').className = 'modal-stripe ' + color;

  // Icon ring — re-trigger bounce animation
  const ring = document.getElementById('mIconRing');
  ring.className = 'm-icon-ring ' + color;
  ring.style.animation = 'none';
  requestAnimationFrame(() => { ring.style.animation = ''; });
  document.getElementById('mIcon').textContent = icon;

  // Badge
  const badge = document.getElementById('mBadge');
  badge.className   = 'm-badge ' + color;
  badge.textContent = badgeMap[color] || '';

  // Result text
  const rt = document.getElementById('mResult');
  rt.className   = 'm-result ' + color;
  rt.textContent = result;

  // Fruit & body
  document.getElementById('mFruit').textContent = `${meta.emoji}  ${meta.label}`;

  // Mini insight
  const insEl = document.getElementById('mInsight');
  insEl.className = 'm-insight ' + color;
  document.getElementById('mInsightText').textContent = insight;

  // Analysis + recommendation
  document.getElementById('mInfo').textContent = info || '—';
  document.getElementById('mRec').textContent  = rec;

  // Confidence (text, not %)
  document.getElementById('mConf').textContent = conf;

  // Show
  document.getElementById('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = '';
}

document.getElementById('closeBtn').addEventListener('click', closeModal);
document.getElementById('closeBtnBottom').addEventListener('click', closeModal);
document.getElementById('overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('overlay')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ──────────────────────────────────────────────────────
   8. TOAST NOTIFICATION (replaces all alert() calls)
────────────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3300);
}