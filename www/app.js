'use strict';

/* ---------- Storage ---------- */
const KEY = 'det-prep-v1';
const DEFAULT_STATE = () => ({
  v: 1,
  startDate: '2026-10-03',
  examDate: '2026-10-31',
  target: 115,
  theme: 'auto',
  done: {},
  notes: {},
  custom: [],
  scores: [],
  errors: [],
  words: [],
  correction: '',
  onlineChecks: {},
  examChecks: {},
  sessions: {},
  timer: { block: 0, remaining: TIMER_BLOCKS[0].min * 60, running: false, endAt: null }
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE();
    return Object.assign(DEFAULT_STATE(), JSON.parse(raw));
  } catch (e) { return DEFAULT_STATE(); }
}
let S = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('تعذّر الحفظ على الجهاز — صدّر نسخة احتياطية من الإعدادات'); }
}

/* ---------- UI state (not saved) ---------- */
const UI = { tab: 'today', week: null, filter: 'all', open: {}, nb: 'scores', errFilter: 'all', quiz: null, drill: null, addOpen: false };

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
function ymd(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseYmd(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function dayDiff(a, b) { return Math.round((parseYmd(b) - parseYmd(a)) / 86400000); }
const DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
function fmtDate(s) { const d = parseYmd(s); return `${d.getDate()}/${d.getMonth() + 1}`; }
function mmss(sec) { sec = Math.max(0, Math.ceil(sec)); return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function words(t) { return (t.trim().match(/[A-Za-z؀-ۿ'’-]+/g) || []).length; }

const ICON = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>'
};

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

let audioCtx;
function beep(times = 2) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
      const t0 = audioCtx.currentTime + i * 0.35;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
      o.start(t0); o.stop(t0 + 0.27);
    }
  } catch (e) { /* no audio */ }
  if (times > 0 && navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

/* ---------- Plan logic ---------- */
function weekTasks(w) {
  const base = w.tasks.map(t => Object.assign({}, t, { week: w.id }));
  const extra = S.custom.filter(c => c.week === w.id);
  return base.concat(extra);
}
function allTasks() { return PLAN.flatMap(weekTasks); }
function currentWeekId() {
  const d = dayDiff(S.startDate, ymd());
  if (d < 0) return 'w1';
  const w = PLAN.slice(1).find(w => d >= w.startDay && d <= w.endDay);
  return w ? w.id : 'w4';
}
function weekById(id) { return PLAN.find(w => w.id === id); }
function weekProgress(w) { const t = weekTasks(w); const d = t.filter(x => S.done[x.id]).length; return { d, n: t.length }; }
function bestScore() {
  const official = S.scores.filter(s => s.kind === 'official');
  const pool = official.length ? official : S.scores;
  return pool.length ? Math.max(...pool.map(s => s.score)) : null;
}
function lastScore() {
  if (!S.scores.length) return null;
  return [...S.scores].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
}

/* ---------- Views ---------- */
const TITLES = { today: 'اليوم', plan: 'الخطة', timer: 'المؤقّت', notebook: 'دفتري', library: 'المكتبة' };

function taskItem(t, opts = {}) {
  const done = !!S.done[t.id];
  const open = !!UI.open[t.id];
  const m = MODES[t.mode];
  const wk = opts.showWeek ? `<span class="muted small">${esc(weekById(t.week).name)}</span>` : '';
  const steps = (t.steps && t.steps.length) ? `<ol>${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : '';
  return `<li class="task${done ? ' is-done' : ''}">
    <div class="task-row">
      <button class="check" role="checkbox" aria-checked="${done}" aria-label="${done ? 'إلغاء الإنجاز' : 'تم'}" data-act="toggle" data-id="${t.id}">${ICON.check}</button>
      <button class="task-main" data-act="expand" data-id="${t.id}" aria-expanded="${open}">
        <span class="task-title">${esc(t.title)}</span>
        <span class="task-meta"><span class="badge ${t.mode}" title="${esc(m.hint)}">${m.label}</span>${wk}${S.notes[t.id] ? '<span class="muted small">فيها ملاحظة</span>' : ''}</span>
      </button>
    </div>
    ${open ? `<div class="task-detail">${steps}
      <label class="field"><span>ملاحظاتي</span><textarea data-note="${t.id}" rows="3" placeholder="صعوبات، روابط، أسئلة...">${esc(S.notes[t.id] || '')}</textarea></label>
      ${t.id.startsWith('c') ? `<button class="btn ghost danger" data-act="delTask" data-id="${t.id}">احذف المهمة</button>` : ''}
    </div>` : ''}
  </li>`;
}

function scoreTrack() {
  const best = bestScore();
  const x = v => 8 + (Math.min(160, Math.max(10, v)) - 10) / 150 * 304;
  const ticks = [10, 60, 160];
  const zoneA = x(110), zoneB = x(120);
  const marker = best != null ? `
      <line class="fill" x1="${x(10)}" y1="40" x2="${x(best)}" y2="40"/>
      <path class="marker" d="M${x(best)} 31 l-6 -9 h12 z"/>
      <text x="${x(best)}" y="16" text-anchor="middle" style="fill:var(--ink);font-weight:700;font-size:12px">${best}</text>` : '';
  return `<div class="track" aria-hidden="true"><svg viewBox="0 0 320 64">
      <rect class="zone" x="${zoneA}" y="28" width="${zoneB - zoneA}" height="24" rx="3"/>
      <line class="axis" x1="${x(10)}" y1="40" x2="${x(160)}" y2="40"/>
      <line class="zone-edge" x1="${zoneA}" y1="26" x2="${zoneA}" y2="54"/>
      <line class="zone-edge" x1="${zoneB}" y1="26" x2="${zoneB}" y2="54"/>
      ${marker}
      ${ticks.map(v => `<text x="${x(v)}" y="62" text-anchor="middle">${v}</text>`).join('')}
      <text class="zone-label" x="${(zoneA + zoneB) / 2}" y="62" text-anchor="middle">110–120</text>
    </svg></div>`;
}

function viewToday() {
  const best = bestScore();
  const days = dayDiff(ymd(), S.examDate);
  const gap = best != null ? Math.max(0, 110 - best) : null;
  let line;
  if (best == null) line = 'اعمل الاختبار التجريبي الرسمي أول ما يتوفر نت، وسجّل علامتك من «دفتري».';
  else if (best >= 120) line = 'تخطّيت الهدف. ثبّت المستوى بمحاكاة كاملة وجهّز مكان الامتحان.';
  else if (best >= 110) line = 'أنت داخل منطقة الهدف. ارفعها لـ 115+ مرتين متتاليتين قبل الحجز.';
  else line = `باقيلك ${gap} نقطة لأول منطقة الهدف.`;

  const daysHtml = days > 0 ? `<b class="num">${days}</b><span class="muted small">يوم للامتحان</span>`
    : days === 0 ? `<b>اليوم</b><span class="muted small">يوم الامتحان</span>` : `<span class="muted small">عدّل موعد الامتحان من الإعدادات</span>`;

  // last 7 days
  const strip = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); const k = ymd(d);
    strip.push(`<div class="day${S.sessions[k] ? ' done' : ''}${i === 0 ? ' today' : ''}">${DAYS[d.getDay()]}<i></i></div>`);
  }
  const streakDays = Object.keys(S.sessions).filter(k => S.sessions[k]).length;
  const todayDone = !!S.sessions[ymd()];

  const wk = weekById(currentWeekId());
  const setup = weekTasks(PLAN[0]).filter(t => !S.done[t.id]);
  const now = setup.concat(weekTasks(wk).filter(t => !S.done[t.id]));
  const wp = weekProgress(wk);

  const onlineDone = ONLINE_WINDOW.filter((_, i) => S.onlineChecks[i]).length;

  return `
  <section class="hero" aria-label="علامتك والهدف">
    <div class="hero-top">
      <div>${best != null ? `<div class="hero-score">${best}</div><div class="muted small">أفضل علامة مسجّلة من 160</div>` : '<div class="hero-score empty">لسا ما سجّلت علامة</div>'}</div>
      <div class="hero-days">${daysHtml}</div>
    </div>
    ${scoreTrack()}
    <p class="hero-line">${esc(line)}</p>
  </section>

  <h2>جلسات آخر 7 أيام</h2>
  <div class="strip">${strip.join('')}</div>
  <div class="row spread" style="margin-top:12px">
    <span class="muted small">مجموع الجلسات: <span class="num">${streakDays}</span></span>
    <div class="row">
      <button class="btn ghost" data-act="toggleSession">${todayDone ? 'ألغِ جلسة اليوم' : 'سجّل جلسة اليوم'}</button>
      <button class="btn primary" data-go="timer">ابدأ الساعة</button>
    </div>
  </div>

  <h2>مهام ${esc(wk.name)}</h2>
  <p class="muted small" style="margin-top:-6px">${esc(wk.focus)} — أنجزت <span class="num" dir="ltr">${wp.d}/${wp.n}</span></p>
  ${now.length ? `<ul class="tasks">${now.slice(0, 5).map(t => taskItem(t, { showWeek: t.week !== wk.id })).join('')}</ul>` :
    `<div class="empty-state">خلّصت مهام هذا الأسبوع. افتح «الخطة» وابدأ بالأسبوع الجاي أو أضف مهمة.</div>`}
  ${now.length > 5 ? `<button class="btn ghost" data-go="plan">كل المهام (${now.length})</button>` : ''}

  <h2>جاني نت</h2>
  <div class="panel">
    <p class="small muted">نفّذ بالترتيب لما يتوفر إنترنت، حتى لو 20 دقيقة.</p>
    <ul class="tasks" style="border-top:0">
      ${ONLINE_WINDOW.map((x, i) => `<li class="task${S.onlineChecks[i] ? ' is-done' : ''}"><div class="task-row">
        <button class="check" role="checkbox" aria-checked="${!!S.onlineChecks[i]}" data-act="online" data-i="${i}" aria-label="${esc(x)}">${ICON.check}</button>
        <span class="task-title" style="flex:1">${esc(x)}</span></div></li>`).join('')}
    </ul>
    ${onlineDone ? `<button class="btn ghost" data-act="resetOnline">ابدأ نافذة جديدة</button>` : ''}
  </div>`;
}

function viewPlan() {
  const wid = UI.week || currentWeekId();
  const w = weekById(wid);
  const total = allTasks(); const totalDone = total.filter(t => S.done[t.id]).length;
  let tasks = weekTasks(w);
  if (UI.filter !== 'all') tasks = tasks.filter(t => (UI.filter === 'on' ? t.mode !== 'off' : t.mode === 'off'));
  const p = weekProgress(w);
  return `
  <div class="row spread small muted" style="margin:4px 0 6px"><span>التقدّم الكلي</span><span class="num">${totalDone}/${total.length}</span></div>
  <div class="progress" aria-hidden="true"><span style="width:${total.length ? totalDone / total.length * 100 : 0}%"></span></div>

  <div class="chips" role="group" aria-label="الأسابيع" style="margin-top:16px">
    ${PLAN.map(x => { const q = weekProgress(x); return `<button class="chip" aria-pressed="${x.id === wid}" data-act="week" data-id="${x.id}"><bdi>${esc(x.name)}</bdi><span class="cnt" dir="ltr">${q.d}/${q.n}</span></button>`; }).join('')}
  </div>

  <h2 style="margin-top:12px">${esc(w.name)} <span class="muted small" style="font-weight:400">${esc(w.range)}</span></h2>
  <p class="muted" style="margin-top:-4px">${esc(w.focus)}</p>

  <div class="seg" role="group" aria-label="تصفية">
    <button aria-pressed="${UI.filter === 'all'}" data-act="filter" data-v="all">الكل</button>
    <button aria-pressed="${UI.filter === 'off'}" data-act="filter" data-v="off">بدون نت</button>
    <button aria-pressed="${UI.filter === 'on'}" data-act="filter" data-v="on">بدها نت</button>
  </div>

  ${tasks.length ? `<ul class="tasks">${tasks.map(t => taskItem(t)).join('')}</ul>` : `<div class="empty-state">ما في مهام بهالتصفية.</div>`}
  ${p.n && p.d === p.n ? `<p class="small" style="color:var(--good);margin-top:10px">خلّصت ${esc(w.name)} كامل.</p>` : ''}

  ${UI.addOpen ? `
  <form class="panel" id="addTask" style="margin-top:16px">
    <label class="field"><span>المهمة</span><input type="text" name="title" required placeholder="مثلاً: 3 تسجيلات إضافية للمحادثة"></label>
    <label class="field"><span>النوع</span><select name="mode"><option value="off">أوفلاين</option><option value="on">أونلاين</option><option value="dl">تحميل</option></select></label>
    <label class="field"><span>خطوات (سطر لكل خطوة، اختياري)</span><textarea name="steps" rows="3"></textarea></label>
    <div class="row"><button class="btn primary" type="submit">أضف لـ ${esc(w.name)}</button><button class="btn ghost" type="button" data-act="addToggle">إلغاء</button></div>
  </form>` : `<button class="btn block" style="margin-top:16px" data-act="addToggle">أضف مهمة لـ ${esc(w.name)}</button>`}`;
}

function viewTimer() {
  const T = S.timer;
  const b = TIMER_BLOCKS[T.block];
  const rem = T.running ? (T.endAt - Date.now()) / 1000 : T.remaining;
  const frac = 1 - Math.max(0, rem) / (b.min * 60);
  const C = 2 * Math.PI * 54;
  const todayDone = !!S.sessions[ymd()];
  return `
  <div class="timer">
    <div class="ring">
      <svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="54" fill="none" stroke-width="8"/>
      <circle class="fg" id="ring-fg" cx="60" cy="60" r="54" fill="none" stroke-width="8" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - frac)}"/></svg>
      <div class="ring-label"><b id="t-rem">${mmss(rem)}</b><span>${esc(b.name)}</span></div>
    </div>
    <p class="muted">${esc(b.note)}</p>
    <div class="row" style="justify-content:center">
      <button class="btn primary" data-act="tStart" style="min-width:120px">${T.running ? 'إيقاف مؤقت' : (T.remaining < b.min * 60 ? 'كمّل' : 'ابدأ')}</button>
      <button class="btn" data-act="tNext">الجزء التالي</button>
      <button class="btn ghost" data-act="tReset">من الأول</button>
    </div>
  </div>
  <ul class="blocks">
    ${TIMER_BLOCKS.map((x, i) => `<li class="${i === T.block ? 'active' : i < T.block ? 'past' : ''}"><span class="bar"></span><span><b>${esc(x.name)}</b><br><span class="small muted">${esc(x.note)}</span></span><span class="mins">${x.min} د</span></li>`).join('')}
  </ul>
  <p class="small muted" style="margin-top:14px">${todayDone ? 'جلسة اليوم مسجّلة.' : 'لما تخلص الأجزاء الأربعة بتنسجّل جلسة اليوم تلقائياً. المؤقّت بيشتغل بدون نت، وبيصفّر بصوت بنهاية كل جزء.'}</p>`;
}

function scoreChart() {
  const pts = [...S.scores].sort((a, b) => a.date.localeCompare(b.date));
  if (!pts.length) return '';
  const W = 320, H = 170, L = 30, R = 22, Tp = 10, B = 24;
  const lo = Math.max(10, Math.min(80, Math.min(...pts.map(p => p.score)) - 10)), hi = 160;
  const y = v => Tp + (hi - v) / (hi - lo) * (H - Tp - B);
  const x = i => pts.length === 1 ? (L + W - R) / 2 : L + i / (pts.length - 1) * (W - L - R);
  const grid = [lo, 110, 120, 160].filter((v, i, a) => a.indexOf(v) === i);
  return `<div class="chart" role="img" aria-label="تطور العلامات"><svg viewBox="0 0 ${W} ${H}">
    <rect class="zone" x="${L}" y="${y(120)}" width="${W - L - R}" height="${y(110) - y(120)}"/>
    ${grid.map(v => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 4}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
    ${pts.length > 1 ? `<polyline class="line" points="${pts.map((p, i) => `${x(i)},${y(p.score)}`).join(' ')}"/>` : ''}
    ${pts.map((p, i) => `<circle class="dot${p.kind === 'mock' ? ' mock' : ''}" cx="${x(i)}" cy="${y(p.score)}" r="4.5"/><text x="${x(i)}" y="${H - 6}" text-anchor="${pts.length > 1 && i === pts.length - 1 ? 'end' : pts.length > 1 && i === 0 ? 'start' : 'middle'}">${fmtDate(p.date)}</text>`).join('')}
  </svg></div>`;
}

function viewNotebook() {
  const tabs = [['scores', 'العلامات'], ['errors', 'الأخطاء'], ['words', 'كلماتي'], ['correct', 'للتصحيح']];
  let body = '';
  if (UI.nb === 'scores') {
    const list = [...S.scores].sort((a, b) => b.date.localeCompare(a.date));
    body = `
    ${scoreChart()}
    <form class="panel" id="addScore" style="margin-top:12px">
      <div class="grid2">
        <label class="field"><span>العلامة</span><input type="number" name="score" min="10" max="160" required inputmode="numeric"></label>
        <label class="field"><span>التاريخ</span><input type="date" name="date" value="${ymd()}" required></label>
      </div>
      <label class="field"><span>النوع</span><select name="kind"><option value="official">اختبار تجريبي رسمي</option><option value="mock">محاكاة أوفلاين (تقديرية)</option></select></label>
      <button class="btn primary block" type="submit">سجّل العلامة</button>
    </form>
    ${list.length ? `<ul class="items" style="margin-top:8px">${list.map(s => `<li class="row spread"><span><b class="num">${s.score}</b> <span class="muted small">${s.kind === 'official' ? 'رسمي' : 'محاكاة'} · ${fmtDate(s.date)}</span></span><button class="btn ghost danger" data-act="delScore" data-id="${s.id}" aria-label="احذف">احذف</button></li>`).join('')}</ul>` : '<div class="empty-state">لما تسجّل علامات بيطلع هون منحنى تطورك مع منطقة الهدف 110–120.</div>'}`;
  } else if (UI.nb === 'errors') {
    let list = [...S.errors].reverse();
    if (UI.errFilter !== 'all') list = list.filter(e => e.kind === UI.errFilter);
    const open = list.filter(e => !e.ok).length;
    body = `
    <form class="panel" id="addErr">
      <label class="field"><span>الخطأ</span><input type="text" class="en" name="wrong" required placeholder="informations"></label>
      <label class="field"><span>الصح</span><input type="text" class="en" name="right" required placeholder="information"></label>
      <div class="grid2">
        <label class="field"><span>السبب (اختياري)</span><input type="text" name="why" placeholder="غير معدودة"></label>
        <label class="field"><span>النوع</span><select name="kind">${ERROR_KINDS.map(k => `<option>${k}</option>`).join('')}</select></label>
      </div>
      <button class="btn primary block" type="submit">أضف للدفتر</button>
    </form>
    <div class="chips" style="margin-top:14px">${['all', ...ERROR_KINDS].map(k => `<button class="chip" aria-pressed="${UI.errFilter === k}" data-act="errFilter" data-v="${k}">${k === 'all' ? 'الكل' : k}</button>`).join('')}</div>
    <p class="small muted">${open} خطأ لسا بدهم مراجعة. راجعهم كل يوم قبل ما تبدأ.</p>
    ${list.length ? `<ul class="items">${list.map(e => `<li>
      <div class="row spread" style="align-items:flex-start">
        <div class="err-pair en"><span class="wrong">${esc(e.wrong)}</span><span class="right">${esc(e.right)}</span></div>
        <span class="badge off">${esc(e.kind)}</span>
      </div>
      ${e.why ? `<p class="small muted" style="margin:4px 0 0">${esc(e.why)}</p>` : ''}
      <div class="row"><button class="btn ghost" data-act="errOk" data-id="${e.id}">${e.ok ? 'رجّعه للمراجعة' : 'صرت أعرفه'}</button><button class="btn ghost danger" data-act="delErr" data-id="${e.id}">احذف</button></div>
    </li>`).join('')}</ul>` : '<div class="empty-state">سجّل كل غلطة تلاقيها بالتصحيح أو المحاكاة. الدفتر هو أسرع طريق لرفع العلامة.</div>'}`;
  } else if (UI.nb === 'words') {
    const due = S.words.filter(w => !w.known);
    const q = UI.quiz;
    body = `
    ${q ? (() => {
      const w = S.words.find(x => x.id === q.id);
      if (!w) { UI.quiz = null; return ''; }
      return `<div class="panel">
        <button class="card-flip" data-act="flip">${q.show ? `<div class="w en">${esc(w.w)}</div><div style="margin-top:8px">${esc(w.m)}</div>${w.ex ? `<div class="en small muted" style="margin-top:6px">${esc(w.ex)}</div>` : ''}` : `<div class="w en">${esc(w.w)}</div><div class="small muted" style="margin-top:8px">اضغط لتشوف المعنى</div>`}</button>
        <div class="grid2"><button class="btn" data-act="qNo">لسا</button><button class="btn primary" data-act="qYes">عرفتها</button></div>
        <button class="btn ghost block" data-act="qEnd" style="margin-top:6px">أنهِ المراجعة</button>
      </div>`;
    })() : (due.length ? `<button class="btn primary block" data-act="qStart">راجع ${due.length} كلمة</button>` : '')}
    <form class="panel" id="addWord" style="margin-top:12px">
      <div class="grid2">
        <label class="field"><span>الكلمة</span><input type="text" class="en" name="w" required></label>
        <label class="field"><span>المعنى</span><input type="text" name="m" required></label>
      </div>
      <label class="field"><span>جملة من تأليفك</span><input type="text" class="en" name="ex"></label>
      <button class="btn block" type="submit">أضف الكلمة</button>
    </form>
    ${S.words.length ? `<ul class="items" style="margin-top:8px">${[...S.words].reverse().map(w => `<li class="row spread"><span><b class="en">${esc(w.w)}</b> <span class="muted">— ${esc(w.m)}</span>${w.known ? ' <span class="badge off">محفوظة</span>' : ''}</span><button class="btn ghost danger" data-act="delWord" data-id="${w.id}">احذف</button></li>`).join('')}</ul>`
      : '<div class="empty-state">أضف الكلمات الجديدة اللي بتمرّ عليك، وراجعها هون كبطاقات.</div>'}`;
  } else {
    const wc = words(S.correction);
    body = `
    <p class="muted">اكتب أو الصق ردودك الأوفلاين هون. لما يجي النت، انسخ الكل واطلب من Claude يصحّحها حسب معايير الدولينجو.</p>
    <textarea id="correction" class="en" style="min-height:260px" placeholder="Topic: ...&#10;&#10;In my opinion, ...">${esc(S.correction)}</textarea>
    <div class="row spread" style="margin-top:8px">
      <span class="small muted"><span class="num" id="wc">${wc}</span> كلمة</span>
      <div class="row"><button class="btn" data-act="copyCorr">انسخ مع طلب التصحيح</button><button class="btn ghost danger" data-act="clearCorr">امسح</button></div>
    </div>`;
  }
  return `<div class="seg" role="group" aria-label="أقسام الدفتر">${tabs.map(([k, l]) => `<button aria-pressed="${UI.nb === k}" data-act="nb" data-v="${k}">${l}</button>`).join('')}</div>${body}`;
}

function renderBlocks(blocks) {
  return blocks.map(b => {
    if (b.type === 'p') return `<p>${esc(b.text)}</p>`;
    if (b.type === 'h') return `<h3>${esc(b.text)}</h3>`;
    if (b.type === 'note') return `<p class="note">${esc(b.text)}</p>`;
    if (b.type === 'en') return `<pre class="en-block">${esc(b.text)}</pre>`;
    if (b.type === 'list') return `<ul>${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (b.type === 'table') return `<table class="kv${b.ltr ? ' ltr' : ''}">${b.rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>`;
    return '';
  }).join('');
}

function viewLibrary() {
  const d = UI.drill;
  let drill = '';
  if (d) {
    const rem = d.running ? (d.endAt - Date.now()) / 1000 : d.remaining;
    drill = `<div class="panel" style="margin-top:12px">
      <p class="small muted" style="margin:0">${d.kind === 'write' ? 'اكتب 120–150 كلمة' : 'جاوب فوراً بطريقة ARE'}</p>
      <p class="drill-q en">${esc(d.q)}</p>
      <div class="row spread"><span class="drill-time" id="d-rem">${mmss(rem)}</span>
        <div class="row"><button class="btn primary" data-act="dStart">${d.running ? 'إيقاف' : 'ابدأ'}</button><button class="btn" data-act="${d.kind === 'write' ? 'drillW' : 'drillS'}">غيره</button><button class="btn ghost" data-act="dClose">إغلاق</button></div></div>
    </div>`;
  }
  const examDone = EXAM_DAY.filter((_, i) => S.examChecks[i]).length;
  return `
  <h2 style="margin-top:8px">تدريب سريع</h2>
  <div class="grid2">
    <button class="btn" data-act="drillW">موضوع كتابة · 5 د</button>
    <button class="btn" data-act="drillS">سؤال محادثة · 35 ث</button>
  </div>
  ${drill}

  <h2>المراجع</h2>
  <div style="border-top:1px solid var(--line)">
    ${LIBRARY.map(s => `<details class="lib"><summary>${esc(s.title)}${ICON.chev}</summary><div class="body">${renderBlocks(s.blocks)}</div></details>`).join('')}
    <details class="lib"><summary>بنك مواضيع الكتابة (${TOPICS.length})${ICON.chev}</summary><div class="body"><ol class="en" style="padding-left:22px">${TOPICS.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div></details>
    <details class="lib"><summary>أسئلة المحادثة (${SPEAK_QS.length})${ICON.chev}</summary><div class="body"><ol class="en" style="padding-left:22px">${SPEAK_QS.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div></details>
  </div>

  <h2>جاهزية يوم الامتحان <span class="muted small num" style="font-weight:400">${examDone}/${EXAM_DAY.length}</span></h2>
  <p class="small muted" style="margin-top:-4px">الامتحان بيحتاج إنترنت ثابت طول الساعة. لا تحجز قبل ما تخلص هالقائمة.</p>
  <ul class="tasks">
    ${EXAM_DAY.map((x, i) => `<li class="task${S.examChecks[i] ? ' is-done' : ''}"><div class="task-row">
      <button class="check" role="checkbox" aria-checked="${!!S.examChecks[i]}" data-act="exam" data-i="${i}" aria-label="${esc(x)}">${ICON.check}</button>
      <span class="task-title" style="flex:1">${esc(x)}</span></div></li>`).join('')}
  </ul>`;
}

function viewSettings() {
  return `
  <h2 id="sheet-title" style="margin-top:4px">الإعدادات</h2>
  <div class="grid2">
    <label class="field"><span>بداية الخطة</span><input type="date" id="set-start" value="${S.startDate}"></label>
    <label class="field"><span>موعد الامتحان</span><input type="date" id="set-exam" value="${S.examDate}"></label>
  </div>
  <label class="field"><span>المظهر</span>
    <select id="set-theme"><option value="auto"${S.theme === 'auto' ? ' selected' : ''}>حسب الجهاز</option><option value="light"${S.theme === 'light' ? ' selected' : ''}>فاتح</option><option value="dark"${S.theme === 'dark' ? ' selected' : ''}>داكن</option></select>
  </label>

  <h3>نسخة احتياطية</h3>
  <p class="small muted">تقدّمك محفوظ على هذا الجوال فقط. انسخ النسخة الاحتياطية واحفظها بملاحظة أو ابعتها لنفسك، وبتقدر ترجّعها لو غيّرت الجوال أو مسحت التطبيق.</p>
  <div class="row"><button class="btn" data-act="export">انسخ النسخة الاحتياطية</button></div>
  <label class="field" style="margin-top:12px"><span>استرجاع: الصق النسخة هون</span><textarea id="import-text" class="en" rows="4"></textarea></label>
  <div class="row spread">
    <button class="btn" data-act="import">استرجع</button>
    <button class="btn ghost danger" data-act="resetAll">امسح كل التقدّم</button>
  </div>
  <button class="btn primary block" data-act="closeSheet" style="margin-top:16px">تم</button>`;
}

/* ---------- Render ---------- */
const VIEWS = { today: viewToday, plan: viewPlan, timer: viewTimer, notebook: viewNotebook, library: viewLibrary };

function applyTheme() {
  const r = document.documentElement;
  if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme);
  const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name=theme-color]').setAttribute('content', dark ? '#0E181C' : '#E7ECEA');
}

function render(keepScroll) {
  const y = window.scrollY;
  $('#view').innerHTML = VIEWS[UI.tab]();
  $('#screen-title').textContent = TITLES[UI.tab];
  document.querySelectorAll('.nav button').forEach(b => b.setAttribute('aria-current', b.dataset.tab === UI.tab ? 'page' : 'false'));
  if (keepScroll) window.scrollTo(0, y);
}

function go(tab) {
  if (!VIEWS[tab]) tab = 'today';
  if (location.hash.slice(1) !== tab) location.hash = tab;
  else { UI.tab = tab; render(); }
}
window.addEventListener('hashchange', () => {
  const t = location.hash.slice(1);
  if (VIEWS[t]) { UI.tab = t; render(); window.scrollTo(0, 0); }
});

/* ---------- Sheet ---------- */
let sheetOpen = false;
function openSheet() {
  $('#sheet-body').innerHTML = viewSettings();
  $('#sheet').classList.add('open'); $('#sheet-back').classList.add('open');
  sheetOpen = true; history.pushState({ sheet: 1 }, '');
}
function closeSheet(fromPop) {
  if (!sheetOpen) return;
  $('#sheet').classList.remove('open'); $('#sheet-back').classList.remove('open');
  sheetOpen = false; if (!fromPop) history.back();
  render(true);
}
window.addEventListener('popstate', () => { if (sheetOpen) closeSheet(true); });
$('#open-settings').addEventListener('click', openSheet);
$('#sheet-back').addEventListener('click', () => closeSheet());

/* ---------- Timer engine ---------- */
function timerTick() {
  const T = S.timer;
  if (T.running) {
    const rem = (T.endAt - Date.now()) / 1000;
    if (rem <= 0) {
      beep(3);
      if (T.block < TIMER_BLOCKS.length - 1) {
        T.block++; T.remaining = TIMER_BLOCKS[T.block].min * 60; T.running = false; T.endAt = null;
        toast(`خلص الجزء. التالي: ${TIMER_BLOCKS[T.block].name}`);
      } else {
        T.block = 0; T.remaining = TIMER_BLOCKS[0].min * 60; T.running = false; T.endAt = null;
        S.sessions[ymd()] = true; toast('خلّصت ساعة اليوم. انسجّلت الجلسة.');
      }
      save(); if (UI.tab === 'timer' || UI.tab === 'today') render(true);
    } else if (UI.tab === 'timer') {
      const el = $('#t-rem'); if (el) el.textContent = mmss(rem);
      const fg = $('#ring-fg'); if (fg) { const C = 2 * Math.PI * 54; fg.setAttribute('stroke-dashoffset', C * (rem / (TIMER_BLOCKS[T.block].min * 60))); }
    }
  }
  const d = UI.drill;
  if (d && d.running) {
    const rem = (d.endAt - Date.now()) / 1000;
    if (rem <= 0) { d.running = false; d.remaining = 0; beep(2); toast('خلص الوقت'); if (UI.tab === 'library') render(true); }
    else { const el = $('#d-rem'); if (el) el.textContent = mmss(rem); }
  }
}
setInterval(timerTick, 500);
document.addEventListener('visibilitychange', () => { if (!document.hidden) timerTick(); });

function newDrill(kind) {
  const pool = kind === 'write' ? TOPICS : SPEAK_QS;
  let q; do { q = pool[Math.floor(Math.random() * pool.length)]; } while (UI.drill && pool.length > 1 && q === UI.drill.q);
  UI.drill = { kind, q, remaining: kind === 'write' ? 300 : 35, running: false, endAt: null };
}

/* ---------- Actions ---------- */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
    ta.remove(); return ok;
  }
}

const ACTIONS = {
  toggle: el => { const id = el.dataset.id; S.done[id] = !S.done[id]; if (!S.done[id]) delete S.done[id]; save(); render(true); },
  expand: el => { const id = el.dataset.id; UI.open[id] = !UI.open[id]; render(true); },
  delTask: el => { if (!confirm('تحذف هالمهمة؟')) return; const id = el.dataset.id; S.custom = S.custom.filter(c => c.id !== id); delete S.done[id]; delete S.notes[id]; save(); render(true); toast('انحذفت المهمة'); },
  week: el => { UI.week = el.dataset.id; UI.addOpen = false; render(true); },
  filter: el => { UI.filter = el.dataset.v; render(true); },
  addToggle: () => { UI.addOpen = !UI.addOpen; render(true); if (UI.addOpen) setTimeout(() => $('#addTask input')?.focus(), 50); },
  toggleSession: () => { const k = ymd(); if (S.sessions[k]) delete S.sessions[k]; else S.sessions[k] = true; save(); render(true); },
  online: el => { const i = el.dataset.i; S.onlineChecks[i] = !S.onlineChecks[i]; save(); render(true); },
  resetOnline: () => { S.onlineChecks = {}; save(); render(true); },
  exam: el => { const i = el.dataset.i; S.examChecks[i] = !S.examChecks[i]; save(); render(true); },
  tStart: () => {
    const T = S.timer; beep(0);
    if (T.running) { T.remaining = (T.endAt - Date.now()) / 1000; T.running = false; T.endAt = null; }
    else { T.endAt = Date.now() + T.remaining * 1000; T.running = true; }
    save(); render(true);
  },
  tNext: () => { const T = S.timer; T.block = (T.block + 1) % TIMER_BLOCKS.length; T.remaining = TIMER_BLOCKS[T.block].min * 60; T.running = false; T.endAt = null; save(); render(true); },
  tReset: () => { S.timer = DEFAULT_STATE().timer; save(); render(true); },
  nb: el => { UI.nb = el.dataset.v; UI.quiz = null; render(true); },
  delScore: el => { S.scores = S.scores.filter(s => s.id !== el.dataset.id); save(); render(true); },
  errFilter: el => { UI.errFilter = el.dataset.v; render(true); },
  errOk: el => { const e = S.errors.find(x => x.id === el.dataset.id); if (e) e.ok = !e.ok; save(); render(true); },
  delErr: el => { S.errors = S.errors.filter(x => x.id !== el.dataset.id); save(); render(true); },
  delWord: el => { S.words = S.words.filter(x => x.id !== el.dataset.id); save(); render(true); },
  qStart: () => { const due = S.words.filter(w => !w.known); if (!due.length) return; UI.quiz = { ids: due.map(w => w.id).sort(() => Math.random() - .5), pos: 0, show: false }; UI.quiz.id = UI.quiz.ids[0]; render(true); },
  flip: () => { UI.quiz.show = !UI.quiz.show; render(true); },
  qYes: () => { const w = S.words.find(x => x.id === UI.quiz.id); if (w) w.known = true; save(); nextQ(); },
  qNo: () => nextQ(),
  qEnd: () => { UI.quiz = null; render(true); },
  copyCorr: async () => {
    const text = 'صحّح هالكتابات حسب معايير Duolingo English Test، وأعطيني علامة تقريبية لكل رد وأهم 3 أخطاء بتتكرر:\n\n' + S.correction;
    toast(await copyText(text) ? 'انسخ. الصقه على Claude لما يجي النت.' : 'ما زبط النسخ — حدّد النص وانسخه يدوياً');
  },
  clearCorr: () => { if (!S.correction || confirm('تمسح كل النص؟ تأكد إنك صحّحته أولاً.')) { S.correction = ''; save(); render(true); } },
  drillW: () => { newDrill('write'); render(true); },
  drillS: () => { newDrill('speak'); render(true); },
  dStart: () => {
    const d = UI.drill; beep(0);
    if (d.running) { d.remaining = (d.endAt - Date.now()) / 1000; d.running = false; }
    else { if (d.remaining <= 0) d.remaining = d.kind === 'write' ? 300 : 35; d.endAt = Date.now() + d.remaining * 1000; d.running = true; }
    render(true);
  },
  dClose: () => { UI.drill = null; render(true); },
  closeSheet: () => closeSheet(),
  export: async () => { toast(await copyText(JSON.stringify(S)) ? 'انسخت النسخة الاحتياطية. احفظها بمكان آمن.' : 'ما زبط النسخ'); },
  import: () => {
    const raw = $('#import-text').value.trim();
    try {
      const data = JSON.parse(raw);
      if (!data || data.v !== 1 || typeof data.done !== 'object') throw new Error();
      S = Object.assign(DEFAULT_STATE(), data); save(); applyTheme();
      $('#sheet-body').innerHTML = viewSettings(); toast('رجعت النسخة الاحتياطية');
    } catch (e) { toast('النص مش نسخة احتياطية صالحة. انسخه كامل من «انسخ النسخة الاحتياطية».'); }
  },
  resetAll: () => {
    if (!confirm('بتنمسح كل المهام المنجزة والعلامات والأخطاء والكلمات. متأكد؟')) return;
    S = DEFAULT_STATE(); save(); applyTheme(); $('#sheet-body').innerHTML = viewSettings(); toast('انمسح التقدّم');
  }
};
function nextQ() {
  const q = UI.quiz; q.pos++; q.show = false;
  if (q.pos >= q.ids.length) { UI.quiz = null; toast('خلصت المراجعة'); } else q.id = q.ids[q.pos];
  render(true);
}

document.addEventListener('click', e => {
  const nav = e.target.closest('.nav button'); if (nav) { go(nav.dataset.tab); return; }
  const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
  const a = e.target.closest('[data-act]'); if (a && ACTIONS[a.dataset.act]) { e.preventDefault(); ACTIONS[a.dataset.act](a); }
});

document.addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, fd = new FormData(f);
  if (f.id === 'addTask') {
    const title = fd.get('title').trim(); if (!title) return;
    const steps = fd.get('steps').split('\n').map(s => s.trim()).filter(Boolean);
    S.custom.push({ id: 'c' + uid(), week: UI.week || currentWeekId(), title, mode: fd.get('mode'), steps });
    UI.addOpen = false; toast('انضافت المهمة');
  } else if (f.id === 'addScore') {
    const score = Number(fd.get('score')); if (!(score >= 10 && score <= 160)) { toast('العلامة لازم تكون بين 10 و 160'); return; }
    S.scores.push({ id: uid(), score, date: fd.get('date') || ymd(), kind: fd.get('kind') }); toast('انسجّلت العلامة');
  } else if (f.id === 'addErr') {
    S.errors.push({ id: uid(), wrong: fd.get('wrong').trim(), right: fd.get('right').trim(), why: fd.get('why').trim(), kind: fd.get('kind'), ok: false, date: ymd() });
  } else if (f.id === 'addWord') {
    S.words.push({ id: uid(), w: fd.get('w').trim(), m: fd.get('m').trim(), ex: fd.get('ex').trim(), known: false });
  }
  save(); render(true);
});

let noteT;
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.note) { S.notes[t.dataset.note] = t.value; if (!t.value) delete S.notes[t.dataset.note]; clearTimeout(noteT); noteT = setTimeout(save, 300); }
  else if (t.id === 'correction') { S.correction = t.value; const wc = $('#wc'); if (wc) wc.textContent = words(t.value); clearTimeout(noteT); noteT = setTimeout(save, 300); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'set-start' && t.value) { S.startDate = t.value; save(); }
  else if (t.id === 'set-exam' && t.value) { S.examDate = t.value; save(); }
  else if (t.id === 'set-theme') { S.theme = t.value; save(); applyTheme(); }
});
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ---------- Boot ---------- */
applyTheme();
UI.tab = VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : 'today';
render();
