/* NEXUS AI · 核心：状态 / 等级 / 经验值 */

const STORAGE_KEY = 'nexus_ai_state_v2';

/* ---------- 基础工具 ---------- */
function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function dateStr(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function todayStr() { return dateStr(new Date()); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return dateStr(d); }
function uid() { return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function relDate(ts) {
  const d = new Date(ts);
  const t = todayStr(), y = daysAgo(1);
  const ds = dateStr(d);
  if (ds === t) return '今天 ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  if (ds === y) return '昨天 ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}
function weekLabel(offset) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  const names = ['日', '一', '二', '三', '四', '五', '六'];
  return offset === 0 ? '今天' : '周' + names[d.getDay()];
}
function fmtCN(d) {
  const names = ['日', '一', '二', '三', '四', '五', '六'];
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · 周' + names[d.getDay()];
}

/* ---------- 图标：内联 SVG，避免依赖系统 emoji 字体 ---------- */
const ICON_PATHS = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2.1-1-3.1-1.1-2.1-.2-4 2-5.9.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/>',
  beaker: '<path d="M9 3h6"/><path d="M10 3v6.5L4.6 18A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-3L14 9.5V3"/><path d="M6.6 14h10.8"/>',
  bookmark: '<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"/>',
  note: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 5H3v2a4 4 0 0 0 4 4"/><path d="M17 5h4v2a4 4 0 0 1-4 4"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  spark: '<path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m5.6 5.6 2.8 2.8"/><path d="m15.6 15.6 2.8 2.8"/><path d="m18.4 5.6-2.8 2.8"/><path d="m8.4 15.6-2.8 2.8"/>'
};
function svgIcon(name, size) {
  const p = ICON_PATHS[name];
  if (!p) return '';
  const s = size || 16;
  return '<svg class="ui-ico" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
}

/* ---------- 等级体系：Lv0–Lv100，锚点之间线性增长 ---------- */
const MAX_LEVEL = 100;

function xpForLevel(level) {
  const lv = clamp(Math.round(level), 0, MAX_LEVEL);
  for (let i = 0; i < LEVEL_ANCHORS.length - 1; i++) {
    const a = LEVEL_ANCHORS[i], b = LEVEL_ANCHORS[i + 1];
    if (lv >= a.level && lv <= b.level) {
      return Math.round(a.xp + (b.xp - a.xp) * (lv - a.level) / (b.level - a.level));
    }
  }
  return LEVEL_ANCHORS[LEVEL_ANCHORS.length - 1].xp;
}
function levelFromXp(xp) {
  const v = Math.max(0, Number(xp) || 0);
  let lv = 0;
  for (let i = 1; i <= MAX_LEVEL; i++) {
    if (v >= xpForLevel(i)) lv = i; else break;
  }
  return lv;
}
function levelTitle(level) {
  const lv = clamp(Math.round(level), 0, MAX_LEVEL);
  let title = LEVEL_ANCHORS[0].title;
  LEVEL_ANCHORS.forEach(a => { if (lv >= a.level) title = a.title; });
  return title;
}
function xpText(n) { return Number(n || 0).toLocaleString('en-US'); }
function levelInfo(xp) {
  const value = Math.max(0, Number(xp) || 0);
  const level = levelFromXp(value);
  const cur = xpForLevel(level);
  const maxed = level >= MAX_LEVEL;
  const next = maxed ? cur : xpForLevel(level + 1);
  const pct = maxed ? 100 : clamp((value - cur) / Math.max(next - cur, 1) * 100, 0, 100);
  return {
    level,
    title: levelTitle(level),
    nextTitle: maxed ? levelTitle(level) : levelTitle(level + 1),
    cur, next, pct, maxed,
    toNext: maxed ? 0 : Math.max(next - value, 0)
  };
}

/* ---------- 课程集合（内置 + 自定义 + 删除隐藏） ---------- */
function allCourses() {
  return COURSES.concat((state && state.customCourses) || []);
}
function hiddenCourseIds() {
  return (state && state.hiddenCourses) || [];
}
function visibleCourses() {
  const hidden = hiddenCourseIds();
  return allCourses().filter(c => hidden.indexOf(c.id) < 0);
}
function isCustomCourse(c) { return !!(c && c.custom); }

/* ---------- 论文集合（内置 + 自定义 + 删除隐藏） ---------- */
function allPapers() {
  const hidden = (state && state.hiddenPapers) || [];
  return PAPERS.concat((state && state.customPapers) || []).filter(p => hidden.indexOf(p.id) < 0);
}
function findPaper(id) {
  return allPapers().find(p => p.id === id) || null;
}
function customCourseById(id) {
  return ((state && state.customCourses) || []).find(c => c.id === id) || null;
}
function newCustomCourse() {
  const cid = 'uc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return {
    id: cid,
    custom: true,
    title: '',
    subtitle: '',
    desc: '',
    domain: '自定义',
    level: '自定义',
    icon: '✎',
    color: '#7c5cff',
    tags: [],
    chapters: [{ id: 'ch_' + cid.slice(3), title: '第一章', blocks: [] }],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
function chaptersOf(course) {
  if (!course) return [];
  return isCustomCourse(course) ? (course.chapters || []) : (course.lessons || []);
}
function chapterBlocks(chapter) {
  return (chapter && chapter.blocks) || [];
}

/* ---------- 统计 ---------- */
function calcStreak(dates) {
  const set = new Set(dates || []);
  let streak = 0;
  let d = new Date();
  if (!set.has(dateStr(d))) d.setDate(d.getDate() - 1);
  while (set.has(dateStr(d))) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function totalLessons() {
  return visibleCourses().reduce((n, c) => n + chaptersOf(c).length, 0);
}
function todayXp() {
  const t = todayStr();
  return state.activity.filter(a => a.date === t).reduce((s, a) => s + a.xp, 0);
}
function findCourse(id) { return visibleCourses().find(c => c.id === id); }
function dayMinutes(ds) {
  return (state.dailyMinutes && state.dailyMinutes[ds]) || 0;
}
function totalStudyMinutes() {
  return Object.keys(state.dailyMinutes || {}).reduce((sum, d) => sum + (state.dailyMinutes[d] || 0), 0);
}
function continueTarget() {
  const pool = visibleCourses().filter(c => chaptersOf(c).length);
  const target = pool[0] || null;
  if (!target) return { course: null, lesson: null };
  return { course: target, lesson: chaptersOf(target)[0] };
}

/* ---------- 状态初始化 ---------- */
function seedState() {
  return {
    version: 2,
    user: { name: '探索者', avatar: '探' },
    xp: 0,
    notes: [],
    bookmarks: [],
    dailyMinutes: {},
    activity: [],
    checkInDates: [],
    customCourses: [],
    hiddenCourses: [],
    customPapers: [],
    hiddenPapers: [],
    onlineSeconds: 0,
    assistant: {
      apiKey: '',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-flash',
      conversations: [],
      activeId: null
    },
    createdAt: Date.now()
  };
}

function normalizeState(s) {
  if (!s || typeof s !== 'object') return seedState();
  s.version = 2;
  if (!s.user || typeof s.user !== 'object') s.user = { name: '探索者', avatar: '探' };
  if (!s.user.name) s.user.name = '探索者';
  if (!s.user.avatar) s.user.avatar = '探';
  if (typeof s.xp !== 'number') s.xp = 0;
  if (!s.dailyMinutes || typeof s.dailyMinutes !== 'object') s.dailyMinutes = {};
  if (!Array.isArray(s.notes)) s.notes = [];
  if (!Array.isArray(s.bookmarks)) s.bookmarks = [];
  if (!Array.isArray(s.activity)) s.activity = [];
  if (!Array.isArray(s.checkInDates)) s.checkInDates = [];
  if (!Array.isArray(s.customCourses)) s.customCourses = [];
  if (!Array.isArray(s.hiddenCourses)) s.hiddenCourses = [];
  if (!Array.isArray(s.customPapers)) s.customPapers = [];
  if (!Array.isArray(s.hiddenPapers)) s.hiddenPapers = [];
  s.customPapers.forEach(function (p) { if (!Array.isArray(p.tags)) p.tags = []; });
  if (typeof s.onlineSeconds !== 'number') s.onlineSeconds = 0;
  if (!s.assistant || typeof s.assistant !== 'object') s.assistant = {};
  if (typeof s.assistant.apiKey !== 'string') s.assistant.apiKey = '';
  if (!s.assistant.baseUrl) s.assistant.baseUrl = 'https://api.deepseek.com';
  if (!s.assistant.model) s.assistant.model = 'deepseek-flash';
  if (!Array.isArray(s.assistant.conversations)) s.assistant.conversations = [];
  if (!s.assistant.activeId) s.assistant.activeId = s.assistant.conversations[0] ? s.assistant.conversations[0].id : null;
  s.customCourses.forEach(function (c) {
    if (!Array.isArray(c.chapters)) {
      c.chapters = [{ id: 'ch_' + c.id, title: '课程内容', blocks: c.blocks || [] }];
      delete c.blocks;
    }
  });
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.version === 2) return normalizeState(s);
    }
  } catch (e) { /* ignore */ }
  return seedState();
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

let state = loadState();

/* ---------- 经验值引擎：网站在线时长 ---------- */
function grantXp(amount, type, text, merge) {
  if (!amount) return;
  const before = levelFromXp(state.xp);
  state.xp += amount;
  const today = todayStr();
  const head = state.activity[0];
  if (merge && head && head.date === today && head.type === type && head.text === text) {
    head.xp += amount;
    head.ts = Date.now();
  } else {
    state.activity.unshift({ date: today, ts: Date.now(), xp: amount, type: type || 'xp', text: text || '获得经验值' });
  }
  if (state.activity.length > 200) state.activity.length = 200;
  const after = levelFromXp(state.xp);
  saveState();
  updateHud();
  if (after > before) setTimeout(() => showLevelUp(after), 160);
}

let onlineTrackerStarted = false;
function startOnlineTracker() {
  if (onlineTrackerStarted) return;
  onlineTrackerStarted = true;
  if (typeof state.onlineSeconds !== 'number') state.onlineSeconds = 0;
  let sessionSeconds = 0;
  setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    state.onlineSeconds += 1;
    sessionSeconds += 1;
    if (sessionSeconds % 7200 === 0) {
      grantXp(10, 'online-bonus', '连续在线 2 小时激励');
      showTopNotice('连续在线 2 小时 · 额外 +10 XP', '已为你发放连续在线激励，记得适当休息');
    }
    if (state.onlineSeconds % 60 === 0) {
      const d = todayStr();
      if (!state.dailyMinutes) state.dailyMinutes = {};
      state.dailyMinutes[d] = (state.dailyMinutes[d] || 0) + 1;
      grantXp(1, 'online', '网站在线学习', true);
    } else if (state.onlineSeconds % 10 === 0) {
      saveState();
    }
  }, 1000);
  window.addEventListener('pagehide', saveState);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') saveState();
  });
}

/* ---------- Toast ---------- */
function showToast(title, desc, opts) {
  opts = opts || {};
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML =
    '<div class="toast-icon">' + (opts.icon || '✦') + '</div>' +
    '<div><div class="toast-title">' + esc(title) + '</div>' +
    (desc ? '<div class="toast-desc">' + esc(desc) + '</div>' : '') + '</div>' +
    (opts.xp ? '<div class="toast-xp">' + esc(opts.xp) + '</div>' : '');
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, opts.duration || 4200);
}

/* 顶部提示：自动淡出消失 */
function showTopNotice(title, desc) {
  const el = document.createElement('div');
  el.className = 'top-notice';
  el.innerHTML =
    '<div class="tn-icon">✦</div>' +
    '<div><div class="tn-title">' + esc(title) + '</div>' +
    (desc ? '<div class="tn-desc">' + esc(desc) + '</div>' : '') + '</div>';
  document.body.appendChild(el);
  setTimeout(function () { el.classList.add('out'); }, 3800);
  setTimeout(function () { el.remove(); }, 4300);
}

/* ---------- 弹窗 ---------- */
function openModal(html, opts) {
  opts = opts || {};
  const root = document.getElementById('modal-root');
  root.innerHTML = '<div class="modal-backdrop">' +
    '<div class="modal' + (opts.wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' +
    html + '</div></div>';
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
  document.body.style.overflow = '';
}
function showLevelUp(level) {
  const info = levelInfo(state.xp);
  const colors = ['#fbbf24', '#22d3ee', '#a78bfa', '#f472b6', '#34d399'];
  let confetti = '';
  for (let i = 0; i < 18; i++) {
    confetti += '<span class="confetti" style="left:' + (4 + Math.random() * 92) + '%;background:' + colors[i % colors.length] +
      ';animation-delay:' + (Math.random() * 1.6).toFixed(2) + 's;animation-duration:' + (2 + Math.random() * 1.4).toFixed(2) + 's"></span>';
  }
  openModal(
    '<div class="levelup">' + confetti +
    '<div class="lu-badge">' + svgIcon('trophy', 34) + '</div>' +
    '<h3>等级提升！</h3>' +
    '<div class="lu-title">Lv.' + level + ' · ' + esc(info.title) + '</div>' +
    '<p>你的知识密度又上了一个台阶。新的课程与研究方向已经为你敞开。</p>' +
    '<div class="lu-xp">' + svgIcon('spark', 13) + ' 当前总经验 ' + xpText(state.xp) + ' XP</div>' +
    '</div>' +
    '<div class="modal-foot" style="justify-content:center"><button class="btn btn-primary" data-action="close-modal">继续探索</button></div>'
  );
}

/* ---------- 顶部 HUD ---------- */
const PAGE_TITLES = {
  dashboard: '学习总览', courses: '课程中心', papers: '论文库', notes: '笔记库',
  resources: '学习资源', focus: '专注计时', profile: '个人中心', assistant: '智能助手',
  course: '课程详情', lesson: '课程学习', editor: '课程编辑'
};
function updateHud() {
  const info = levelInfo(state.xp);
  const streak = calcStreak(state.checkInDates);
  const t = document.getElementById('topbar-title');
  if (t) t.textContent = PAGE_TITLES[currentPage] || '学习总览';

  const sp = document.getElementById('streak-pill');
  if (sp) sp.innerHTML = svgIcon('fire', 13) + ' <b>' + streak + '</b> 天';
  const xp = document.getElementById('xp-pill');
  if (xp) xp.innerHTML = '<span class="xp-dot"></span><b>' + xpText(state.xp) + '</b> XP';
  const av = document.getElementById('top-avatar');
  if (av) av.textContent = state.user.avatar;

  const goal = document.getElementById('daily-goal');
  if (goal) {
    const tx = todayXp();
    const goalTarget = 120;
    const pct = clamp(tx / goalTarget * 100, 0, 100);
    goal.innerHTML =
      '<div class="daily-goal-top"><span>今日经验</span><b>' + (tx >= goalTarget ? '已达标 · ' + tx : tx + ' / ' + goalTarget) + '</b></div>' +
      '<div class="progress"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  }
  const um = document.getElementById('user-mini');
  if (um) {
    um.innerHTML =
      '<div class="avatar avatar-sm">' + esc(state.user.avatar) + '</div>' +
      '<div><div class="u-name">' + esc(state.user.name) + '</div><div class="u-lv">Lv.' + info.level + ' · ' + info.title + '</div></div>' +
      '<div class="u-xp">' + xpText(state.xp) + '</div>';
  }
}
