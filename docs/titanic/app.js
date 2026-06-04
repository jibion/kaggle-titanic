/* ── Reveal on scroll ────────────────────────────────── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

/* ── Counter animation ───────────────────────────────── */
function runCounter(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  const dur = 1800;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-count]').forEach(runCounter);
      cio.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.hero-stats, .stat-grid').forEach(el => cio.observe(el));

/* ── Missing data bars ───────────────────────────────── */
const bio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.transform = `scaleX(${bar.dataset.w})`;
      });
      bio.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
const mb = document.getElementById('missing-bars');
if (mb) bio.observe(mb);


/* ── Shared dot tooltip ──────────────────────────────── */
const _tip = document.createElement('div');
_tip.style.cssText = [
  'position:fixed;z-index:9999;pointer-events:none;display:none',
  'background:rgba(8,15,30,0.92)',
  'border:1px solid rgba(201,168,76,0.35)',
  'color:#dde3ef;font-size:0.72rem;font-family:Inter,sans-serif',
  'padding:0.35rem 0.65rem;border-radius:6px;white-space:nowrap',
  'backdrop-filter:blur(8px)',
  'transition:opacity 0.1s',
].join(';');
document.body.appendChild(_tip);


// state is a plain object — the mousemove handler reads state.COLS at call time,
// so updating state.COLS on resize keeps tooltip indices accurate.
function attachDotTooltip(canvas, state) {
  canvas.style.cursor = 'crosshair';
  canvas.addEventListener('mousemove', e => {
    const { SLOT, COLS, total, survived, persons, dpr } = state;
    const r      = canvas.getBoundingClientRect();
    const scaleX = (canvas.width / dpr) / r.width;
    const scaleY = (canvas.height / dpr) / r.height;
    const mx     = (e.clientX - r.left) * scaleX;
    const my     = (e.clientY - r.top)  * scaleY;
    const col    = Math.floor(mx / SLOT);
    const row    = Math.floor(my / SLOT);
    const idx    = row * COLS + col;
    if (idx >= 0 && idx < total) {
      const p        = persons ? persons[idx] : null;
      const perished = total - survived;
      const status   = idx < perished ? 'Did not survive' : 'Survived';
      const color    = idx < perished ? '#c94c6b' : '#4ec9c4';
      let given = '—', surname = '';
      if (p) {
        const comma = p.n.indexOf(', ');
        if (comma !== -1) { surname = p.n.slice(0, comma); given = p.n.slice(comma + 2); }
        else { given = p.n; }
      }
      const fullName  = given + (surname ? ' ' + surname : '');
      const genderTxt = p ? (p.g === 'm' ? 'Male' : 'Female') : '';
      const ageTxt    = p && p.a > 0 ? '· ' + p.a + ' years old' : '· Age unknown';
      const classTxt  = p ? (p.c === 1 ? '1st Class' : p.c === 2 ? '2nd Class' : '3rd Class') : '';
      _tip.innerHTML = '<strong style="color:#dde3ef;display:block;font-size:0.8rem;">' + fullName + '</strong>'
        + '<span style="color:#8a9ab8;display:block;font-size:0.72rem;margin-top:3px;">' + genderTxt + ' ' + ageTxt + '</span>'
        + '<span style="color:#8a9ab8;display:block;font-size:0.72rem;">' + classTxt + '</span>'
        + '<span style="display:block;margin-top:6px;font-size:0.72rem;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + color + ';margin-right:4px;vertical-align:middle;"></span><span style="color:' + color + '">' + status + '</span></span>';
      _tip.style.display = 'block';
      _tip.style.left = (e.clientX + 14) + 'px';
      _tip.style.top  = (e.clientY - 14) + 'px';
    } else {
      _tip.style.display = 'none';
    }
  });
  canvas.addEventListener('mouseleave', () => { _tip.style.display = 'none'; });
}

/* ── Tab chart redraw registry ───────────────────────── */
// Each tab chart registers draw() here so the tab-click handler can call it on reveal.
const _tabRedraw = {};

/* ── Chart 1: Overall — 891 people, 99 columns ───────── */
(function () {
  const TOTAL = 891, SURVIVED = 342;
  const FIXED_COLS = 99;
  const TEAL_C = '#4ec9c4', ROSE_C = '#c94c6b';

  const canvas = document.getElementById('cOverall');
  const card   = canvas.closest('.chart-card');

  const wrap = document.createElement('div');
  card.replaceChild(wrap, canvas);
  wrap.appendChild(canvas);

  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:1.8rem;margin-top:1rem;font-size:0.78rem;color:#8a9ab8;flex-wrap:wrap;';
  legend.innerHTML = `
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ROSE_C};margin-right:6px;vertical-align:middle;"></span>Did not survive — 549 passengers (61.6%)</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${TEAL_C};margin-right:6px;vertical-align:middle;"></span>Survived — 342 passengers (38.4%)</span>`;
  wrap.appendChild(legend);

  const state = { SLOT: 0, COLS: FIXED_COLS, total: TOTAL, survived: SURVIVED, persons: _byAll, dpr: 1 };
  attachDotTooltip(canvas, state);

  function draw() {
    const dpr  = window.devicePixelRatio || 1;
    const cs   = getComputedStyle(card);
    const w    = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (w <= 0) return;
    const slot = w / FIXED_COLS;
    const h    = 9 * slot;

    state.SLOT = slot; state.dpr = dpr;

    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.cssText = `width:${w}px;height:${h}px;display:block;`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < TOTAL; i++) {
      const col = i % FIXED_COLS, row = Math.floor(i / FIXED_COLS);
      ctx.beginPath();
      ctx.arc(col * slot + slot / 2, row * slot + slot / 2, slot * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = i < (TOTAL - SURVIVED) ? ROSE_C : TEAL_C;
      ctx.globalAlpha = 0.88;
      ctx.fill();
    }
  }

  new ResizeObserver(draw).observe(card);
})();

/* ── Chart 2: Gender ─────────────────────────────────── */
(function () {
  const TEAL_C = '#4ec9c4', ROSE_C = '#c94c6b';
  const ICON_FILTER = 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(5deg) brightness(0.88)';
  const SLOT = 10;

  const groups = [
    { icon: 'assets/man.svg',   label: 'Male',   total: 577, survived: 109 },
    { icon: 'assets/woman.svg', label: 'Female', total: 314, survived: 233 },
  ];

  const origCanvas = document.getElementById('cGender');
  const panel = origCanvas.parentElement;
  const card  = panel.closest('.chart-card');
  origCanvas.remove();

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:1.2rem;';
  panel.appendChild(wrap);

  const charts = [];
  groups.forEach(g => {
    const grp = document.createElement('div');
    grp.style.cssText = 'display:flex;flex-direction:column;gap:0.4rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
    const icon = document.createElement('img');
    icon.src = g.icon; icon.style.cssText = `height:28px;width:auto;filter:${ICON_FILTER};`;
    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:0.78rem;color:#8a9ab8;letter-spacing:0.04em;';
    lbl.textContent = `${g.label} — ${g.total} passengers · ${Math.round(g.survived/g.total*100)}% survived`;
    header.appendChild(icon); header.appendChild(lbl);
    grp.appendChild(header);

    const cv = document.createElement('canvas');
    cv.style.cssText = 'display:block;max-height:none;';
    grp.appendChild(cv);
    wrap.appendChild(grp);

    const persons = _byG(g.icon === 'assets/man.svg' ? 'm' : 'f');
    const state = { SLOT, COLS: 0, total: g.total, survived: g.survived, persons, dpr: 1 };
    attachDotTooltip(cv, state);
    charts.push({ cv, g, state });
  });

  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:1.5rem;font-size:0.78rem;color:#8a9ab8;';
  legend.innerHTML = `
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${ROSE_C};margin-right:5px;vertical-align:middle;"></span>Did not survive</span>
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${TEAL_C};margin-right:5px;vertical-align:middle;"></span>Survived</span>`;
  wrap.appendChild(legend);

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const cs  = getComputedStyle(card);
    const availW = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availW <= 0) return;
    const COLS  = Math.floor(availW / SLOT);
    const DOT_R = SLOT * 0.36;
    charts.forEach(({ cv, g, state }) => {
      state.COLS = COLS; state.dpr = dpr;
      const h = Math.ceil(g.total / COLS) * SLOT;
      cv.width  = Math.round(availW * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = availW + 'px'; cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < g.total; i++) {
        const col = i % COLS, row = Math.floor(i / COLS);
        ctx.beginPath();
        ctx.arc(col * SLOT + SLOT/2, row * SLOT + SLOT/2, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = i < (g.total - g.survived) ? ROSE_C : TEAL_C;
        ctx.globalAlpha = 0.88; ctx.fill();
      }
    });
  }

  _tabRedraw['panel-gender'] = draw;
  new ResizeObserver(draw).observe(card);
})();

/* ── Chart 3: Class ──────────────────────────────────── */
(function () {
  const TEAL_C = '#4ec9c4', ROSE_C = '#c94c6b';
  const SLOT = 10;

  const classes = [
    { label: '3rd Class', total: 491, survived: 119 },
    { label: '2nd Class', total: 184, survived: 87  },
    { label: '1st Class', total: 216, survived: 136 },
  ];

  const origCanvas = document.getElementById('cClass');
  const panel = origCanvas.parentElement;
  const card  = panel.closest('.chart-card');
  origCanvas.remove();

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:0.8rem;';
  panel.appendChild(wrap);

  const charts = [];
  classes.forEach(g => {
    const grp = document.createElement('div');
    grp.style.cssText = 'display:flex;flex-direction:column;gap:0.4rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:baseline;gap:0.5rem;';
    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:0.9rem;font-weight:500;color:#dde3ef;letter-spacing:0.02em;font-family:Lora,serif;';
    lbl.textContent = g.label;
    const stat = document.createElement('span');
    stat.style.cssText = 'font-size:0.72rem;color:#8a9ab8;';
    stat.textContent = `${g.total} passengers · ${Math.round(g.survived/g.total*100)}% survived`;
    header.appendChild(lbl); header.appendChild(stat);
    grp.appendChild(header);

    const cv = document.createElement('canvas');
    cv.style.cssText = 'display:block;max-height:none;';
    grp.appendChild(cv);
    wrap.appendChild(grp);

    const pclass = g.label === '1st Class' ? 1 : g.label === '2nd Class' ? 2 : 3;
    const state = { SLOT, COLS: 0, total: g.total, survived: g.survived, persons: _byC(pclass), dpr: 1 };
    attachDotTooltip(cv, state);
    charts.push({ cv, g, state });
  });

  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:1.5rem;font-size:0.78rem;color:#8a9ab8;';
  legend.innerHTML = `
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${ROSE_C};margin-right:5px;vertical-align:middle;"></span>Did not survive</span>
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${TEAL_C};margin-right:5px;vertical-align:middle;"></span>Survived</span>`;
  wrap.appendChild(legend);

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const cs  = getComputedStyle(card);
    const availW = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availW <= 0) return;
    const COLS  = Math.floor(availW / SLOT);
    const DOT_R = SLOT * 0.36;
    charts.forEach(({ cv, g, state }) => {
      state.COLS = COLS; state.dpr = dpr;
      const h = Math.ceil(g.total / COLS) * SLOT;
      cv.width  = Math.round(availW * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = availW + 'px'; cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < g.total; i++) {
        const col = i % COLS, row = Math.floor(i / COLS);
        ctx.beginPath();
        ctx.arc(col * SLOT + SLOT/2, row * SLOT + SLOT/2, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = i < (g.total - g.survived) ? ROSE_C : TEAL_C;
        ctx.globalAlpha = 0.88; ctx.fill();
      }
    });
  }

  _tabRedraw['panel-class'] = draw;
  new ResizeObserver(draw).observe(card);
})();

/* ── Chart 4: Class × Gender × Age matrix ─────────────────── */
(function () {
  const TEAL_C = '#4ec9c4', ROSE_C = '#c94c6b';
  const ICON_FILTER = 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(5deg) brightness(0.88)';
  const SLOT = 10;

  const AGE_GROUPS = [
    { label: 'Child (0–14)', min: 0,  max: 14  },
    { label: 'Adult (15+)',  min: 15, max: 999 },
  ];
  const CLASSES = [
    { pclass: 3, label: '3rd Class' },
    { pclass: 2, label: '2nd Class' },
    { pclass: 1, label: '1st Class' },
  ];
  const GENDERS = [
    { sex: 'm', label: 'Male',   icon: 'assets/man.svg'   },
    { sex: 'f', label: 'Female', icon: 'assets/woman.svg' },
  ];

  function groupPersons(sex, pclass, ag) {
    return PASSENGERS
      .filter(p => p.g === sex && p.c === pclass && p.a >= ag.min && p.a <= ag.max)
      .sort((a, b) => a.s - b.s);
  }

  const origCanvas = document.getElementById('cMatrix');
  const panel = origCanvas.parentElement;
  const card  = panel.closest('.chart-card');
  origCanvas.remove();

  // Pre-compute all group data
  const allData = {};
  GENDERS.forEach(({ sex }) => {
    allData[sex] = {};
    CLASSES.forEach(({ pclass }) => {
      allData[sex][pclass] = {};
      AGE_GROUPS.forEach(ag => {
        const persons = groupPersons(sex, pclass, ag);
        allData[sex][pclass][ag.label] = { total: persons.length, survived: persons.filter(p=>p.s===1).length, persons };
      });
    });
  });

  // Build DOM structure once; canvases are resized in draw()
  const outerRow = document.createElement('div');
  outerRow.style.cssText = 'display:flex;gap:16px;align-items:flex-start;';
  panel.appendChild(outerRow);

  const colDivs = {};   // sex -> colDiv, for flex-basis update on resize
  const charts  = [];   // { cv, sex, pclass, agLabel, total, survived, persons, state }

  GENDERS.forEach(({ sex, label, icon }) => {
    const col = document.createElement('div');
    col.style.cssText = 'flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:0.8rem;';
    colDivs[sex] = col;

    const gHdr = document.createElement('div');
    gHdr.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
    const gIcon = document.createElement('img');
    gIcon.src = icon; gIcon.style.cssText = `height:26px;width:auto;filter:${ICON_FILTER};`;
    const gLbl = document.createElement('span');
    gLbl.style.cssText = 'font-size:0.88rem;font-weight:500;color:#dde3ef;font-family:Lora,serif;';
    gLbl.textContent = label;
    gHdr.appendChild(gIcon); gHdr.appendChild(gLbl);
    col.appendChild(gHdr);

    CLASSES.forEach(({ pclass, label: clsLabel }) => {
      const section = document.createElement('div');
      section.style.cssText = 'display:flex;flex-direction:column;gap:0.3rem;padding-left:0.55rem;border-left:2px solid rgba(201,168,76,0.2);';

      const clsHdr = document.createElement('div');
      clsHdr.style.cssText = 'font-size:0.75rem;font-weight:500;color:#dde3ef;margin-bottom:0.1rem;';
      clsHdr.textContent = clsLabel;
      section.appendChild(clsHdr);

      AGE_GROUPS.forEach(ag => {
        const { total, survived, persons } = allData[sex][pclass][ag.label];
        if (!total) return;
        const pct = Math.round(survived / total * 100);

        const grp = document.createElement('div');
        grp.style.cssText = 'display:flex;flex-direction:column;gap:0.12rem;';

        const aHdr = document.createElement('div');
        aHdr.style.cssText = 'display:flex;align-items:baseline;gap:0.35rem;';
        const aLbl = document.createElement('span');
        aLbl.style.cssText = 'font-size:0.62rem;color:#8a9ab8;min-width:76px;';
        aLbl.textContent = ag.label;
        const aStat = document.createElement('span');
        aStat.style.cssText = `font-size:0.65rem;font-weight:500;color:${pct >= 50 ? TEAL_C : ROSE_C};`;
        aStat.textContent = `${pct}% survived`;
        aHdr.appendChild(aLbl); aHdr.appendChild(aStat);
        grp.appendChild(aHdr);

        const cv = document.createElement('canvas');
        cv.style.cssText = 'display:block;max-height:none;';
        grp.appendChild(cv);
        section.appendChild(grp);

        const state = { SLOT, COLS: 0, total, survived, persons, dpr: 1 };
        attachDotTooltip(cv, state);
        charts.push({ cv, sex, pclass, agLabel: ag.label, total, survived, state });
      });

      col.appendChild(section);
    });

    outerRow.appendChild(col);
  });

  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:1.5rem;font-size:0.78rem;color:#8a9ab8;margin-top:0.6rem;';
  legend.innerHTML = `
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${ROSE_C};margin-right:5px;vertical-align:middle;"></span>Did not survive</span>
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${TEAL_C};margin-right:5px;vertical-align:middle;"></span>Survived</span>`;
  panel.appendChild(legend);

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const cs  = getComputedStyle(card);
    const availW = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availW <= 0) return;
    const colW = Math.floor((availW - 16) / 2);
    const COLS = Math.floor(colW / SLOT);
    const DOT_R = SLOT * 0.36;

    // Recalculate aligned row heights for each pclass/age group across both columns
    const maxRows = {};
    CLASSES.forEach(({ pclass }) => {
      maxRows[pclass] = {};
      AGE_GROUPS.forEach(ag => {
        maxRows[pclass][ag.label] = Math.max(
          ...GENDERS.map(({ sex }) => {
            const d = allData[sex][pclass][ag.label];
            return d.total > 0 ? Math.ceil(d.total / COLS) : 0;
          })
        );
      });
    });

    charts.forEach(({ cv, pclass, agLabel, total, survived, state }) => {
      state.COLS = COLS; state.dpr = dpr;
      const h = maxRows[pclass][agLabel] * SLOT;
      cv.width  = Math.round(colW * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = colW + 'px'; cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < total; i++) {
        const col = i % COLS, row = Math.floor(i / COLS);
        ctx.beginPath();
        ctx.arc(col * SLOT + SLOT/2, row * SLOT + SLOT/2, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = i < (total - survived) ? ROSE_C : TEAL_C;
        ctx.globalAlpha = 0.88; ctx.fill();
      }
    });
  }

  _tabRedraw['panel-matrix'] = draw;
  new ResizeObserver(draw).observe(card);
})();

/* ── Chart 5: Age groups ─────────────────────────────── */
(function () {
  const TEAL_C = '#4ec9c4', ROSE_C = '#c94c6b';
  const SLOT = 10;

  const ageBuckets = [
    { label: '0–10',        total: 64,  survived: 38, min: 0,  max: 10  },
    { label: '11–18',       total: 75,  survived: 32, min: 11, max: 18  },
    { label: '19–30',       total: 270, survived: 96, min: 19, max: 30  },
    { label: '31–45',       total: 202, survived: 86, min: 31, max: 45  },
    { label: '46–60',       total: 81,  survived: 33, min: 46, max: 60  },
    { label: '61+',              total: 22,  survived: 5,  min: 61, max: 999 },
    { label: 'Age unknown',      total: 177, survived: 52, min: -1, max: -1  },
  ];

  const origCanvas = document.getElementById('cAge');
  const panel = origCanvas.parentElement;
  const card  = panel.closest('.chart-card');
  origCanvas.remove();

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:0.55rem;';
  panel.appendChild(wrap);

  const charts = [];
  ageBuckets.forEach(g => {
    const grp = document.createElement('div');
    grp.style.cssText = 'display:flex;flex-direction:column;gap:0.2rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:baseline;gap:0.5rem;';
    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:0.78rem;font-weight:500;color:#dde3ef;font-family:Lora,serif;min-width:90px;';
    lbl.textContent = g.label;
    const stat = document.createElement('span');
    stat.style.cssText = 'font-size:0.68rem;color:#8a9ab8;';
    stat.textContent = `${g.total} · ${Math.round(g.survived/g.total*100)}% survived`;
    header.appendChild(lbl); header.appendChild(stat);
    grp.appendChild(header);

    const cv = document.createElement('canvas');
    cv.style.cssText = 'display:block;max-height:none;';
    grp.appendChild(cv);
    wrap.appendChild(grp);

    const persons = g.min === -1
      ? [...PASSENGERS].filter(p => p.a < 0).sort((a,b) => a.s - b.s)
      : [...PASSENGERS].filter(p => p.a >= g.min && p.a <= g.max).sort((a,b) => a.s - b.s);

    const state = { SLOT, COLS: 0, total: g.total, survived: g.survived, persons, dpr: 1 };
    attachDotTooltip(cv, state);
    charts.push({ cv, g, state });
  });

  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:1.5rem;font-size:0.78rem;color:#8a9ab8;';
  legend.innerHTML = `
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${ROSE_C};margin-right:5px;vertical-align:middle;"></span>Did not survive</span>
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${TEAL_C};margin-right:5px;vertical-align:middle;"></span>Survived</span>`;
  wrap.appendChild(legend);

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const cs  = getComputedStyle(card);
    const availW = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availW <= 0) return;
    const COLS  = Math.floor(availW / SLOT);
    const DOT_R = SLOT * 0.36;
    charts.forEach(({ cv, g, state }) => {
      state.COLS = COLS; state.dpr = dpr;
      const h = Math.ceil(g.total / COLS) * SLOT;
      cv.width  = Math.round(availW * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = availW + 'px'; cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < g.total; i++) {
        const col = i % COLS, row = Math.floor(i / COLS);
        ctx.beginPath();
        ctx.arc(col * SLOT + SLOT/2, row * SLOT + SLOT/2, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = i < (g.total - g.survived) ? ROSE_C : TEAL_C;
        ctx.globalAlpha = 0.88; ctx.fill();
      }
    });
  }

  _tabRedraw['panel-age'] = draw;
  new ResizeObserver(draw).observe(card);
})();

/* ── Chart 6: Embarkation port ───────────────────────── */
(function () {
  const TEAL_C = '#4ec9c4', ROSE_C = '#c94c6b';
  const SLOT = 10;

  const ports = [
    { label: 'Southampton', total: 646, survived: 217 },
    { label: 'Queenstown',  total: 77,  survived: 30  },
    { label: 'Cherbourg',   total: 168, survived: 93  },
  ];

  const origCanvas = document.getElementById('cEmbarked');
  const card = origCanvas.parentElement;
  origCanvas.remove();

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:0.8rem;';
  card.appendChild(wrap);

  const charts = [];
  ports.forEach(g => {
    const grp = document.createElement('div');
    grp.style.cssText = 'display:flex;flex-direction:column;gap:0.4rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:baseline;gap:0.5rem;';
    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:0.9rem;font-weight:500;color:#dde3ef;letter-spacing:0.02em;font-family:Lora,serif;';
    lbl.textContent = g.label;
    const stat = document.createElement('span');
    stat.style.cssText = 'font-size:0.72rem;color:#8a9ab8;';
    stat.textContent = `${g.total} passengers · ${Math.round(g.survived/g.total*100)}% survived`;
    header.appendChild(lbl); header.appendChild(stat);
    grp.appendChild(header);

    const cv = document.createElement('canvas');
    cv.style.cssText = 'display:block;max-height:none;';
    grp.appendChild(cv);
    wrap.appendChild(grp);

    const state = { SLOT, COLS: 0, total: g.total, survived: g.survived, persons: null, dpr: 1 };
    attachDotTooltip(cv, state);
    charts.push({ cv, g, state });
  });

  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:1.5rem;font-size:0.78rem;color:#8a9ab8;';
  legend.innerHTML = `
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${ROSE_C};margin-right:5px;vertical-align:middle;"></span>Did not survive</span>
    <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${TEAL_C};margin-right:5px;vertical-align:middle;"></span>Survived</span>`;
  wrap.appendChild(legend);

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const cs  = getComputedStyle(card);
    const availW = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availW <= 0) return;
    const COLS  = Math.floor(availW / SLOT);
    const DOT_R = SLOT * 0.36;
    charts.forEach(({ cv, g, state }) => {
      state.COLS = COLS; state.dpr = dpr;
      const h = Math.ceil(g.total / COLS) * SLOT;
      cv.width  = Math.round(availW * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = availW + 'px'; cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < g.total; i++) {
        const col = i % COLS, row = Math.floor(i / COLS);
        ctx.beginPath();
        ctx.arc(col * SLOT + SLOT/2, row * SLOT + SLOT/2, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = i < (g.total - g.survived) ? ROSE_C : TEAL_C;
        ctx.globalAlpha = 0.88; ctx.fill();
      }
    });
  }

  new ResizeObserver(draw).observe(card);
})();

/* ── Underwater element parallax ────────────────────────── */
(function () {
  const section  = document.getElementById('patterns');
  const floaters = section.querySelectorAll('.sea-float');

  // Reveal each floater only when its image actually loads
  floaters.forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (!img) return;
    const finalOpacity = wrapper.dataset.finalOpacity || '1';
    img.addEventListener('load', () => { wrapper.style.opacity = finalOpacity; });
    img.addEventListener('error', () => { wrapper.style.display = 'none'; });
    if (img.complete && img.naturalWidth) wrapper.style.opacity = finalOpacity;
  });

  let rafPending = false;
  function tick() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const sectionRect = section.getBoundingClientRect();
      const centreOffset = (sectionRect.top + sectionRect.height / 2) - window.innerHeight / 2;
      floaters.forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 0.1;
        el.style.transform = `translateY(${centreOffset * speed}px)`;
      });
    });
  }

  new IntersectionObserver(([e]) => {
    floaters.forEach(el => { el.style.willChange = e.isIntersecting ? 'transform' : 'auto'; });
  }, { threshold: 0 }).observe(section);

  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ── Chart tabs ─────────────────────────────────────────── */
document.querySelectorAll('.ctab').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.chart-card');
    card.querySelectorAll('.ctab').forEach(b => b.classList.remove('ctab-active'));
    card.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.remove('tab-panel-active');
      p.style.display = 'none';
    });
    btn.classList.add('ctab-active');
    const panel = card.querySelector('#panel-' + btn.dataset.panel);
    panel.style.display = 'block';
    panel.classList.add('tab-panel-active');
    if (_tabRedraw[panel.id]) _tabRedraw[panel.id]();
  });
});

/* ── Scroll cue: hide on first scroll ───────────────────── */
const scrollCue = document.getElementById('scrollCue');
if (scrollCue) {
  window.addEventListener('scroll', function hide() {
    scrollCue.classList.add('hidden');
    window.removeEventListener('scroll', hide);
  }, { passive: true });
}

/* ── Pause hero animations when off-screen ──────────────── */
const heroEl = document.getElementById('hero');
if (heroEl) {
  new IntersectionObserver(([e]) => {
    heroEl.style.setProperty('--anim-state', e.isIntersecting ? 'running' : 'paused');
  }, { threshold: 0 }).observe(heroEl);
}
