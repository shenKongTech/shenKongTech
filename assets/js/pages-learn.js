/* NEXUS AI · 页面：总览 / 课程中心 / 课程与课时 / 专注计时 */

function ringMarkup(info) {
  const C = 2 * Math.PI * 54;
  const offset = C * (1 - info.pct / 100);
  return '' +
    '<div class="ring-wrap">' +
      '<svg viewBox="0 0 128 128">' +
        '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop stop-color="#7c5cff"/><stop offset="1" stop-color="#22d3ee"/>' +
        '</linearGradient></defs>' +
        '<circle class="ring-bg" cx="64" cy="64" r="54"/>' +
        '<circle class="ring-fg" cx="64" cy="64" r="54" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '"/>' +
      '</svg>' +
      '<div class="ring-center">' +
        '<div class="lv-label">LEVEL</div>' +
        '<div class="lv-num">' + info.level + '</div>' +
        '<div class="lv-title">' + esc(info.title) + '</div>' +
      '</div>' +
    '</div>';
}

function courseIconStyle(c) {
  return 'background:linear-gradient(140deg,' + c.color + '33,rgba(148,163,184,0.08));color:' + c.color + ';border-color:' + c.color + '55';
}

function isImageIcon(v) {
  return /^(data:image\/|https?:\/\/)/.test(v || '');
}

function courseIconHtml(c) {
  const icon = c.icon || '✎';
  if (isImageIcon(icon)) {
    return '<div class="course-icon icon-img" style="' + courseIconStyle(c) + '"><img src="' + esc(icon) + '" alt=""></div>';
  }
  return '<div class="course-icon" style="' + courseIconStyle(c) + '">' + esc(icon) + '</div>';
}

let ui = {
  pathFilter: 'all',
  pathQuery: '',
  paperQuery: '',
  paperDomain: 'all',
  paperSort: 'cite',
  paperSaved: false,
  noteQuery: ''
};
let currentPage = 'dashboard';

/* ---------- 总览 ---------- */
function renderDashboard() {
  const app = document.getElementById('app');
  const info = levelInfo(state.xp);
  const target = continueTarget();
  const c = target.course;
  const hasCourse = !!(c && target.lesson);
  const streak = calcStreak(state.checkInDates);
  const checkedIn = state.checkInDates.includes(todayStr());
  const totalMin = totalStudyMinutes();
  const hours = (totalMin / 60).toFixed(1);
  const courseCount = visibleCourses().length;
  const chapterTotal = totalLessons();
  const hour = new Date().getHours();
  const greet = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const ds = daysAgo(i);
    days.push({ label: weekLabel(-i), min: dayMinutes(ds), today: i === 0 });
  }
  const maxMin = Math.max(30, Math.max.apply(null, days.map(d => d.min)));
  const weekTotal = days.reduce((s, d) => s + d.min, 0);
  const avgMin = Math.round(weekTotal / 7);
  const domains = domainStats();

  const continueCard = hasCourse
    ? '<section class="card continue-card">' +
        '<div class="continue-top">' +
          courseIconHtml(c) +
          '<div style="flex:1"><div class="course-title">开始学习 · ' + esc(c.title) + '</div>' +
          '<div class="course-sub">第一章：' + esc(target.lesson.title) + '</div></div>' +
          '<span class="badge">' + esc(c.level) + '</span>' +
        '</div>' +
        '<div class="continue-meta"><span>共 ' + chaptersOf(c).length + ' 个章节</span><span>' + esc(c.domain) + '</span></div>' +
        '<div class="continue-actions">' +
          '<a class="btn btn-primary" href="#/lesson/' + c.id + '/' + target.lesson.id + '">进入第一章</a>' +
          '<a class="btn btn-ghost" href="#/course/' + c.id + '">查看章节</a>' +
        '</div>' +
      '</section>'
    : '<section class="card continue-card">' +
        '<div class="continue-top">' +
          '<div class="course-icon" style="background:linear-gradient(140deg,#7c5cff33,rgba(148,163,184,0.08));color:#7c5cff;border-color:#7c5cff55">✎</div>' +
          '<div style="flex:1"><div class="course-title">还没有可学习的课程</div>' +
          '<div class="course-sub">去课程中心创建一门属于你的课程</div></div>' +
        '</div>' +
        '<div class="continue-actions"><a class="btn btn-primary" href="#/courses">前往课程中心</a></div>' +
      '</section>';

  app.innerHTML =
    '<section class="hero">' +
      '<div class="hero-copy">' +
        '<div class="eyebrow">' + fmtCN(new Date()) + '</div>' +
        '<h1>' + greet + '，<span class="hi">' + esc(state.user.name) + '</span></h1>' +
        '<p class="lead">你已抵达 <b>Lv.' + info.level + ' · ' + esc(info.title) + '</b>，累计 ' + xpText(state.xp) + ' XP。' +
          (info.maxed ? '你已抵达最高等级，继续以学习时长沉淀经验。' : '再获得 <b>' + xpText(info.toNext) + ' XP</b> 即可晋升下一等级，继续拓展你的智能版图。') + '</p>' +
        '<div class="hero-actions">' +
          (hasCourse
            ? '<a class="btn btn-primary" href="#/lesson/' + c.id + '/' + target.lesson.id + '">' +
                '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg>继续学习 · ' + esc(c.title) +
              '</a>'
            : '<a class="btn btn-primary" href="#/courses"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7-11-7Z"/></svg>创建你的第一门课程</a>') +
          '<button class="btn ' + (checkedIn ? 'btn-ghost' : 'btn-soft') + '" data-action="checkin"' + (checkedIn ? ' disabled' : '') + '>' +
            (checkedIn ? '今日已打卡' : '每日打卡 · 连签加成') +
          '</button>' +
        '</div>' +
        '<div class="hero-meta">' +
          '<div class="hm"><b>' + xpText(state.xp) + '</b><span>总经验值</span></div>' +
          '<div class="hm"><b>' + courseCount + ' 门</b><span>课程总数</span></div>' +
          '<div class="hm"><b>' + streak + ' 天</b><span>连续学习</span></div>' +
          '<div class="hm"><b>' + totalMin + ' 分钟</b><span>累计在线</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="level-panel">' +
        ringMarkup(info) +
        '<div class="level-xp">' +
          '<div class="row"><span>' + (info.maxed ? 'Lv.100 · MAX' : 'Lv.' + info.level + ' → Lv.' + (info.level + 1)) + '</span><b>' + xpText(state.xp) + ' / ' + xpText(info.maxed ? state.xp : info.next) + '</b></div>' +
          '<div class="progress"><div class="progress-fill" style="width:' + info.pct.toFixed(1) + '%"></div></div>' +
          '<div class="hint">' + (info.maxed ? '已抵达最高等级 · ' + esc(info.title) : '距离 ' + (info.nextTitle !== info.title ? 'Lv.' + (info.level + 1) + ' · ' + esc(info.nextTitle) : 'Lv.' + (info.level + 1)) + ' 还需 ' + xpText(info.toNext) + ' XP') + '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<div class="stat-grid">' +
      statCard('clock', '累计在线时长', hours, '小时', '今日已在线 ' + dayMinutes(todayStr()) + ' 分钟') +
      statCard('book', '课程总数', courseCount, '门', '共 ' + chapterTotal + ' 个章节') +
      statCard('fire', '连续学习', streak, '天', checkedIn ? '今日已打卡，状态良好' : '今日尚未打卡') +
      statCard('chart', '本周学习', weekTotal, '分钟', '日均 ' + avgMin + ' 分钟') +
    '</div>' +

    '<div class="layout">' +
      '<div class="stack">' +
        '<section class="card panel">' +
          '<div class="panel-head"><h3>每周学习节奏</h3><span class="link">每日学习时长</span></div>' +
          '<div class="chart-summary"><b>' + weekTotal + '</b><span>分钟 · 日均 ' + avgMin + ' 分钟</span></div>' +
          '<div class="chart">' +
            days.map(d =>
              '<div class="chart-col">' +
                '<div class="chart-val">' + (d.min || '') + '</div>' +
                '<div class="chart-bar-wrap"><div class="chart-bar' + (d.min ? '' : ' zero') + (d.today ? ' today' : '') + '" style="height:' + Math.max(5, Math.round(d.min / maxMin * 100)) + '%"></div></div>' +
                '<div class="chart-label' + (d.today ? ' today' : '') + '">' + d.label + '</div>' +
              '</div>'
            ).join('') +
          '</div>' +
          (weekTotal === 0 ? '<div class="chart-note">在网站上学习时，系统会自动记录在线时长，每满 1 分钟计入经验值。</div>' : '') +
        '</section>' +

        continueCard +
      '</div>' +

      '<div class="stack">' +
        '<section class="card panel">' +
          '<div class="panel-head"><h3>知识领域</h3><span class="link">' + courseCount + ' 门课程 · ' + chapterTotal + ' 章</span></div>' +
          '<div class="domain-list">' +
            (domains.length ? domains.map(d =>
              '<div class="domain-row">' +
                '<div class="domain-top"><span>' + esc(d.name) + '</span><span>' + d.total + ' 章</span></div>' +
                '<div class="progress"><div class="progress-fill" style="width:' + d.pct + '%;background:' + d.color + '"></div></div>' +
              '</div>'
            ).join('') : '<div class="small muted">还没有课程，去课程中心创建一门吧。</div>') +
          '</div>' +
        '</section>' +
      '</div>' +
    '</div>';
}

function statCard(icon, label, value, unit, foot) {
  return '<div class="card stat-card">' +
    '<div class="stat-top"><span class="stat-label">' + label + '</span><span class="stat-icon">' + svgIcon(icon) + '</span></div>' +
    '<div class="stat-value">' + value + '<small>' + unit + '</small></div>' +
    '<div class="stat-foot">' + foot + '</div>' +
  '</div>';
}

/* ---------- 知识领域统计 ---------- */
function domainStats() {
  const map = {};
  visibleCourses().forEach(c => {
    const n = chaptersOf(c).length;
    if (!n) return;
    if (!map[c.domain]) map[c.domain] = { name: c.domain, total: 0, color: c.color };
    map[c.domain].total += n;
  });
  const max = Math.max(1, Object.keys(map).map(k => map[k].total).reduce((m, v) => Math.max(m, v), 1));
  return Object.keys(map).map(k => {
    const d = map[k];
    d.pct = Math.round(d.total / max * 100);
    return d;
  });
}

/* ---------- 课程中心 ---------- */
function renderCourses() {
  const app = document.getElementById('app');
  const domains = courseDomains();
  if (ui.pathFilter !== 'all' && domains.indexOf(ui.pathFilter) < 0) ui.pathFilter = 'all';
  const filter = ui.pathFilter;
  const chips = [{ id: 'all', name: '全部领域' }].concat(domains.map(d => ({ id: d, name: d })));
  const info = levelInfo(state.xp);

  app.innerHTML =
    '<div class="page-head">' +
      '<div><div class="eyebrow">Course Center</div><h1>课程中心</h1>' +
      '<div class="sub">' + visibleCourses().length + ' 门课程 · ' + totalLessons() + ' 个章节。你可以创建自己的课程，自由组织章节与内容。</div></div>' +
      '<div class="actions"><span class="badge">Lv.' + info.level + ' · ' + esc(info.title) + '</span>' +
      '<span class="badge green">' + totalLessons() + ' 个章节</span>' +
      '<button class="btn btn-primary btn-sm" data-action="new-course">＋ 创建课程</button></div>' +
    '</div>' +
    '<section class="card panel" style="padding:22px">' +
      '<div class="panel-head"><h3>课程库</h3><span class="badge" id="course-count">' + filteredCourses().length + ' 门课程</span></div>' +
      '<div class="search-row" style="margin-bottom:14px">' +
        '<div class="search-input">' +
          '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<input id="course-search" type="text" placeholder="搜索课程名称、方向或关键词…" autocomplete="off">' +
        '</div>' +
      '</div>' +
      '<div class="chip-row" style="margin-bottom:22px">' +
        chips.map(ch => '<button class="chip' + (filter === ch.id ? ' active' : '') + '" data-action="path-filter" data-filter="' + ch.id + '">' + ch.name + '</button>').join('') +
      '</div>' +
      '<div id="course-results">' + courseSectionsHtml() + '</div>' +
    '</section>';

  const input = document.getElementById('course-search');
  if (input) {
    input.value = ui.pathQuery;
    input.addEventListener('input', function (e) {
      ui.pathQuery = e.target.value;
      const box = document.getElementById('course-results');
      const cnt = document.getElementById('course-count');
      if (box) box.innerHTML = courseSectionsHtml();
      if (cnt) cnt.textContent = filteredCourses().length + ' 门课程';
    });
  }
}

function courseDomains() {
  const out = [];
  visibleCourses().forEach(c => {
    const d = (c.domain || '自定义').trim() || '自定义';
    if (out.indexOf(d) < 0) out.push(d);
  });
  return out;
}

function filteredCourses() {
  const q = (ui.pathQuery || '').trim().toLowerCase();
  return visibleCourses().filter(c => {
    const domain = (c.domain || '自定义').trim() || '自定义';
    if (ui.pathFilter !== 'all' && domain !== ui.pathFilter) return false;
    if (!q) return true;
    const hay = [c.title || '', c.subtitle || '', c.desc || '', c.domain || '', c.level || '', (c.tags || []).join(' ')].join(' ');
    return hay.toLowerCase().indexOf(q) >= 0;
  });
}

function courseSectionsHtml() {
  const list = filteredCourses();
  if (!list.length) {
    return '<div class="card empty-state"><h3>没有匹配的课程</h3><p>试试切换知识领域、换个关键词，或者创建一门属于自己的课程。</p>' +
      '<button class="btn btn-primary" data-action="new-course">＋ 创建课程</button></div>';
  }
  return courseDomains().map(domain => {
    const group = list.filter(c => (((c.domain || '自定义').trim()) || '自定义') === domain);
    if (!group.length) return '';
    const color = group[0].color || '#7c5cff';
    const chapterCount = group.reduce((n, c) => n + chaptersOf(c).length, 0);
    return '<section class="stage-block">' +
      '<div class="stage-head">' +
        '<span class="stage-dot" style="color:' + color + '"></span>' +
        '<div><h2>' + esc(domain) + '</h2><div class="stage-desc">' + group.length + ' 门课程 · ' + chapterCount + ' 个章节</div></div>' +
        '<span class="stage-count">' + group.length + ' 门课程</span>' +
      '</div>' +
      '<div class="course-grid">' + group.map(courseCard).join('') + '</div>' +
    '</section>';
  }).join('');
}

/* ---------- 专注计时 ---------- */
let focusState = { total: 25 * 60, left: 25 * 60, running: false, timer: null };

function formatClock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return pad2(m) + ':' + pad2(s);
}
function updateFocusUI() {
  const el = document.getElementById('focus-time');
  if (!el) return false;
  el.textContent = formatClock(focusState.left);
  const bar = document.getElementById('focus-bar');
  if (bar) bar.style.width = (((focusState.total - focusState.left) / focusState.total) * 100).toFixed(1) + '%';
  const btn = document.getElementById('focus-toggle');
  if (btn) btn.textContent = focusState.running ? '暂停' : (focusState.left < focusState.total ? '继续专注' : '开始专注');
  const today = document.getElementById('focus-today');
  if (today) today.textContent = dayMinutes(todayStr());
  document.querySelectorAll('[data-action="focus-preset"]').forEach(b => {
    b.classList.toggle('active', (parseInt(b.getAttribute('data-min'), 10) * 60) === focusState.total);
  });
  return true;
}
function stopFocusTimer() {
  if (focusState.timer) clearInterval(focusState.timer);
  focusState.timer = null;
  focusState.running = false;
}
function setFocusMinutes(min) {
  stopFocusTimer();
  focusState.total = clamp(min, 1, 180) * 60;
  focusState.left = focusState.total;
  updateFocusUI();
}
function toggleFocus() {
  if (focusState.running) {
    stopFocusTimer();
    updateFocusUI();
    return;
  }
  if (focusState.left <= 0) focusState.left = focusState.total;
  focusState.running = true;
  focusState.timer = setInterval(function () {
    if (!document.getElementById('focus-time')) { stopFocusTimer(); return; }
    focusState.left -= 1;
    if (focusState.left <= 0) {
      focusState.left = 0;
      stopFocusTimer();
      recordFocus(Math.round(focusState.total / 60), true);
      return;
    }
    updateFocusUI();
  }, 1000);
  updateFocusUI();
}
function resetFocus() {
  stopFocusTimer();
  focusState.left = focusState.total;
  updateFocusUI();
}
function finishFocus() {
  const elapsed = focusState.total - focusState.left;
  if (elapsed < 60) {
    showToast('专注时长不足', '至少专注 1 分钟后才能记录', { icon: '!' });
    return;
  }
  const mins = Math.max(1, Math.round(elapsed / 60));
  stopFocusTimer();
  recordFocus(mins, false);
}
function recordFocus(minutes, completed) {
  stopFocusTimer();
  focusState.left = focusState.total;
  focusState.running = false;
  render();
  showToast(completed ? '专注完成' : '已结束本次专注', '专注期间的在线时长已自动计入经验值', { icon: '◷' });
}

function courseCard(c) {
  const chapters = chaptersOf(c);
  const delBtn = '<button class="course-del" data-action="delete-course" data-id="' + c.id + '" title="删除课程" aria-label="删除课程">✕</button>';
  return '<article class="card course-card" data-action="open-course" data-id="' + c.id + '" tabindex="0" role="link" aria-label="进入课程 ' + esc(c.title) + '">' +
    '<div class="course-card-top">' +
      courseIconHtml(c) +
      '<div class="course-card-headings"><div class="course-title">' + esc(c.title) + '</div>' +
        '<div class="course-sub">' + esc(c.subtitle || '') + '</div></div>' +
      delBtn +
    '</div>' +
    '<p class="course-desc">' + esc(c.desc || '还没有填写课程简介。') + '</p>' +
    '<div class="course-meta">' +
      '<span>' + chapters.length + ' 个章节</span><span>' + esc(c.domain || '自定义') + '</span><span>' + esc(c.level || '自定义') + '</span>' +
    '</div>' +
    '<div class="course-tags">' + (c.tags || []).map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' +
    '<div class="course-card-foot">' +
      '<a class="btn btn-sm btn-block btn-soft" href="#/course/' + c.id + '">查看课程</a>' +
    '</div>' +
  '</article>';
}

/* ---------- 课程详情 ---------- */
function renderCourse(cid) {
  const app = document.getElementById('app');
  const c = findCourse(cid);
  if (!c) { renderNotFound(); return; }
  const custom = isCustomCourse(c);
  const chapters = chaptersOf(c);
  const first = chapters[0] || null;
  const tags = c.tags || [];
  const outcomes = (c.outcomes && c.outcomes.length)
    ? c.outcomes
    : chapters.slice(0, 4).map(ch => '掌握「' + ch.title + '」的核心内容');
  const totalBlocks = chapters.reduce((n, ch) => n + chapterBlocks(ch).length, 0);

  const chapterRows = chapters.length
    ? chapters.map((ch, i) =>
        '<a class="lesson-item" href="#/lesson/' + c.id + '/' + ch.id + '">' +
          '<div class="lesson-idx">' + pad2(i + 1) + '</div>' +
          '<div class="lesson-info"><div class="lesson-title">' + esc(ch.title) + '</div>' +
          '<div class="lesson-sub">' + (custom ? chapterBlocks(ch).length + ' 个内容块' : ((ch.keyPoints || []).length) + ' 个核心要点') + '</div></div>' +
          '<div class="lesson-state">开始 →</div>' +
        '</a>').join('')
    : '<div class="empty-state" style="padding:34px 12px"><h3>还没有章节</h3><p>' +
      (custom ? '去编辑器为这门课程添加第一章。' : '') + '</p>' +
      (custom ? '<a class="btn btn-primary" href="#/editor/' + c.id + '">添加章节</a>' : '') + '</div>';

  app.innerHTML =
    '<a class="back-link" href="#/courses">← 返回课程中心</a>' +
    '<section class="course-hero card" style="--accent:' + (c.color || '#7c5cff') + '">' +
      '<div class="course-hero-main">' +
        courseIconHtml(c) +
        '<div style="flex:1;min-width:240px">' +
          '<div class="chip-row" style="margin-bottom:9px"><span class="badge">' + esc(c.domain || '自定义') + '</span><span class="tag">' + esc(c.level || '自定义') + '</span></div>' +
          '<h1>' + esc(c.title) + '</h1>' +
          '<div class="sub">' + esc(c.subtitle || '') + '</div>' +
          '<p class="desc">' + esc(c.desc || '还没有填写课程简介。') + '</p>' +
          '<div class="course-hero-meta">' +
            tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') +
            '<span class="small muted">· ' + chapters.length + ' 个章节 · ' + esc(c.domain || '自定义') + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:9px;margin-top:18px;flex-wrap:wrap">' +
            (first ? '<a class="btn btn-primary" href="#/lesson/' + c.id + '/' + first.id + '">开始学习</a>' : '') +
            (custom ? '<a class="btn btn-soft" href="#/editor/' + c.id + '">编辑课程</a>' : '') +
            '<button class="btn btn-ghost" data-action="delete-course" data-id="' + c.id + '">删除课程</button>' +
          '</div>' +
        '</div>' +
        '<div class="course-hero-side">' +
          '<div class="pct-label">课程章节</div>' +
          '<div class="pct">' + chapters.length + '</div>' +
          '<div class="small muted">' + esc(c.domain || '自定义') + '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<div class="detail-layout">' +
      '<section class="card panel">' +
        '<div class="panel-head"><h3>课程章节</h3><span class="link">' + chapters.length + ' 章</span></div>' +
        '<div class="lesson-list">' + chapterRows + '</div>' +
      '</section>' +
      '<div class="stack">' +
        '<section class="card panel"><div class="panel-head"><h3>你将掌握</h3></div>' +
          '<div class="outcomes">' + outcomes.map(o => '<div class="outcome">' + esc(o) + '</div>').join('') + '</div>' +
        '</section>' +
        (custom ? '<section class="card panel"><div class="panel-head"><h3>课程信息</h3></div>' +
          '<div class="info-list">' +
            '<div class="info-row"><span>内容块</span><b>' + totalBlocks + ' 个</b></div>' +
            '<div class="info-row"><span>知识领域</span><b>' + esc(c.domain || '自定义') + '</b></div>' +
            '<div class="info-row"><span>更新时间</span><b>' + relDate(c.updatedAt || c.createdAt || Date.now()) + '</b></div>' +
          '</div>' +
        '</section>' : '') +
      '</div>' +
    '</div>';
}

/* ---------- 自定义内容块 ---------- */
const MATH_SYMBOLS = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
  theta: 'θ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ',
  phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ',
  Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  sum: 'Σ', prod: '∏', int: '∫', infty: '∞', times: '×', div: '÷', cdot: '·', pm: '±',
  leq: '≤', geq: '≥', neq: '≠', approx: '≈', equiv: '≡', to: '→', rightarrow: '→',
  leftarrow: '←', in: '∈', notin: '∉', forall: '∀', exists: '∃', partial: '∂', nabla: '∇',
  subset: '⊂', cup: '∪', cap: '∩', ldots: '…', cdots: '…', dots: '…', top: 'ᵀ',
  propto: '∝', sim: '∼', cong: '≅', ll: '≪', gg: '≫', odot: '⊙', otimes: '⊗',
  oplus: '⊕', circ: '∘', emptyset: '∅', langle: '⟨', rangle: '⟩', Vert: '‖', mid: '|',
  sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh', log: 'log', ln: 'ln', lg: 'lg',
  exp: 'exp', max: 'max', min: 'min', sup: 'sup', inf: 'inf', lim: 'lim',
  det: 'det', dim: 'dim', arg: 'arg', softmax: 'softmax'
};

// 读取从 start（必须是 {）开始的一对平衡花括号
function mathReadGroup(s, start) {
  let depth = 0;
  for (let k = start; k < s.length; k++) {
    if (s[k] === '{') depth++;
    else if (s[k] === '}') {
      depth--;
      if (depth === 0) return { body: s.slice(start + 1, k), end: k + 1 };
    }
  }
  return null;
}

// 支持嵌套花括号的 \frac 替换
function mathFrac(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const idx = s.indexOf('\\frac', i);
    if (idx < 0) { out += s.slice(i); break; }
    out += s.slice(i, idx);
    let j = idx + 5;
    while (s[j] === ' ') j++;
    const g1 = s[j] === '{' ? mathReadGroup(s, j) : null;
    if (!g1) { out += '\\frac'; i = idx + 5; continue; }
    j = g1.end;
    while (s[j] === ' ') j++;
    const g2 = s[j] === '{' ? mathReadGroup(s, j) : null;
    if (!g2) { out += '\\frac' + '{' + g1.body + '}'; i = g1.end; continue; }
    out += '(' + g1.body + ')/(' + g2.body + ')';
    i = g2.end;
  }
  return out;
}

// 支持嵌套花括号的 \sqrt 替换
function mathSqrt(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const idx = s.indexOf('\\sqrt', i);
    if (idx < 0) { out += s.slice(i); break; }
    out += s.slice(i, idx);
    let j = idx + 5;
    while (s[j] === ' ') j++;
    if (s[j] === '{') {
      const g = mathReadGroup(s, j);
      if (!g) { out += '\\sqrt'; i = idx + 5; continue; }
      out += '√(' + g.body + ')';
      i = g.end;
    } else {
      const m = s.slice(j).match(/^[A-Za-z0-9]/);
      out += m ? '√' + m[0] : '√';
      i = j + (m ? 1 : 0);
    }
  }
  return out;
}

// 上标 / 下标：支持嵌套花括号
function mathScript(s, marker, tag) {
  let out = '';
  let i = 0;
  const token = marker + '{';
  while (i < s.length) {
    const idx = s.indexOf(token, i);
    if (idx < 0) { out += s.slice(i); break; }
    out += s.slice(i, idx);
    const g = mathReadGroup(s, idx + 1);
    if (!g) { out += s.slice(idx); break; }
    out += '<' + tag + '>' + g.body + '</' + tag + '>';
    i = g.end;
  }
  return out;
}

function mathToHtml(tex) {
  let s = esc(tex).trim();
  s = s.replace(/\\begin\{[a-z*]+\}|\\end\{[a-z*]+\}/g, '').replace(/\\\\/g, '<br>');
  s = s.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
  for (let i = 0; i < 3; i++) s = mathFrac(s);
  for (let i = 0; i < 3; i++) s = mathSqrt(s);
  s = s.replace(/\\(?:text|mathrm|operatorname\*?|mathit)\s*\{([^{}]*)\}/g, '$1');
  s = s.replace(/\\mathbf\s*\{([^{}]*)\}/g, '<b>$1</b>');
  s = s.replace(/\\(?:left|right|big|Big|bigg|Bigg)[\s.]?/g, '');
  s = s.replace(/\\(?:quad|qquad|,|;|:|!)/g, ' ');
  s = s.replace(/\^\s*\\top\b/g, 'ᵀ').replace(/\^\s*\\mathrm\s*\{\s*T\s*\}/g, 'ᵀ');
  for (let i = 0; i < 3; i++) s = mathScript(s, '^', 'sup');
  for (let i = 0; i < 3; i++) s = mathScript(s, '_', 'sub');
  s = s.replace(/\^([A-Za-z0-9+\-])/g, '<sup>$1</sup>').replace(/_([A-Za-z0-9])/g, '<sub>$1</sub>');
  const names = Object.keys(MATH_SYMBOLS).sort((a, b) => b.length - a.length);
  s = s.replace(new RegExp('\\\\(' + names.join('|') + ')(?![A-Za-z])', 'g'), m => MATH_SYMBOLS[m.slice(1)]);
  s = s.replace(/\\[A-Za-z]+/g, '');
  return s.replace(/[ \t]+/g, ' ').trim();
}

function richTextHtml(text) {
  const src = String(text == null ? '' : text);
  const re = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;
  function plain(s) { return esc(s).replace(/\n/g, '<br>'); }
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    out += plain(src.slice(last, m.index));
    const raw = m[0];
    const isBlock = raw.indexOf('$$') === 0 || raw.indexOf('\\[') === 0;
    const inner = isBlock ? raw.slice(2, raw.length - 2) : raw.slice(1, raw.length - 1);
    out += '<span class="math-' + (isBlock ? 'block' : 'inline') + '">' + mathToHtml(inner) + '</span>';
    last = m.index + raw.length;
  }
  return out + plain(src.slice(last));
}

function customBlockHtml(b, i) {
  const id = 'cblk-' + i;
  if (b.type === 'heading') {
    const lv = clamp(parseInt(b.level, 10) || 2, 1, 3);
    const tag = 'h' + (lv + 1);
    return '<' + tag + ' class="cf-heading cf-h' + lv + '" id="' + id + '">' + richTextHtml(b.text || '未命名标题') + '</' + tag + '>';
  }
  if (b.type === 'text') {
    return '<p class="cf-text">' + richTextHtml(b.text || '') + '</p>';
  }
  if (b.type === 'image') {
    if (!b.src) return '<div class="cf-img-empty">图片地址为空，请编辑课程补充</div>';
    return '<figure class="cf-figure"' + (b.caption ? '' : ' style="margin-bottom:22px"') + '>' +
      '<img src="' + esc(b.src) + '" alt="' + esc(b.caption || '课程图片') + '" loading="lazy" referrerpolicy="no-referrer">' +
      (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') +
    '</figure>';
  }
  if (b.type === 'code') {
    return '<div class="cf-code"><div class="cf-code-bar"><span>' + esc(b.lang || 'code') + '</span></div>' +
      '<pre><code>' + esc(b.code || '') + '</code></pre></div>';
  }
  return '';
}

/* ---------- 自定义课程编辑器 ---------- */
let courseDraft = null;
const BLOCK_LABELS = { heading: '标题', text: '正文', image: '图片', code: '代码框' };
const BUILTIN_ICONS = ['✎', '🧠', '🤖', '📘', '⚙', '🔬', '💡', '🚀', '📊', '🧩', '🌐', '🎯'];

function startNewCourse() {
  courseDraft = null;
  if (location.hash === '#/editor') render();
  else location.hash = '#/editor';
}

function collectDraft() {
  if (!courseDraft) return;
  const g = function (id) { const el = document.getElementById(id); return el ? el.value : ''; };
  if (document.getElementById('ce-title')) {
    courseDraft.title = g('ce-title');
    courseDraft.subtitle = g('ce-subtitle');
    courseDraft.desc = g('ce-desc');
    courseDraft.domain = g('ce-domain');
    courseDraft.level = g('ce-level');
    courseDraft.tags = g('ce-tags').split(/[,，、]/).map(s => s.trim()).filter(Boolean).slice(0, 8);
    courseDraft.color = g('ce-color') || '#7c5cff';
    const iconEl = document.getElementById('ce-icon');
    if (iconEl) courseDraft.icon = iconEl.value || '✎';
  }
  (courseDraft.chapters || []).forEach(function (ch) {
    const t = document.querySelector('[data-chapter-title="' + ch.id + '"]');
    if (t) ch.title = t.value;
    (ch.blocks || []).forEach(function (b) {
      const root = document.querySelector('[data-block-id="' + b.id + '"]');
      if (!root) return;
      root.querySelectorAll('[data-field]').forEach(function (f) {
        const key = f.getAttribute('data-field');
        if (key === 'level') b.level = parseInt(f.value, 10) || 2;
        else b[key] = f.value;
      });
    });
  });
}

function findDraftBlock(id) {
  const chapters = (courseDraft && courseDraft.chapters) || [];
  for (let i = 0; i < chapters.length; i++) {
    const b = (chapters[i].blocks || []).find(x => x.id === id);
    if (b) return { chapter: chapters[i], block: b };
  }
  return null;
}

function cnChapterNum(n) {
  const names = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  return names[n] || String(n);
}

function rerenderEditor() {
  renderCourseEditor(courseDraft && !courseDraft.__new ? courseDraft.id : null);
}

function editorBlockHtml(b, i, total, chapterId) {
  const tools = '<div class="eb-tools">' +
    '<button class="eb-btn" data-action="move-block" data-id="' + b.id + '" data-dir="-1" title="上移"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
    '<button class="eb-btn" data-action="move-block" data-id="' + b.id + '" data-dir="1" title="下移"' + (i === total - 1 ? ' disabled' : '') + '>↓</button>' +
    '<button class="eb-btn danger" data-action="remove-block" data-id="' + b.id + '" title="删除此块">✕</button>' +
  '</div>';
  let fields = '';
  if (b.type === 'heading') {
    fields = '<div class="eb-row">' +
      '<select class="select eb-select" data-field="level">' +
        [1, 2, 3].map(lv => '<option value="' + lv + '"' + ((parseInt(b.level, 10) || 2) === lv ? ' selected' : '') + '>' + lv + ' 级标题</option>').join('') +
      '</select>' +
      '<input class="input" data-field="text" maxlength="80" value="' + esc(b.text || '') + '" placeholder="输入标题文字">' +
    '</div>';
  } else if (b.type === 'text') {
    fields = '<textarea class="textarea eb-textarea" data-field="text" placeholder="输入正文内容，支持换行">' + esc(b.text || '') + '</textarea>';
  } else if (b.type === 'image') {
    fields = '<input class="input" data-field="src" value="' + esc(b.src || '') + '" placeholder="图片链接 https://...">' +
      '<div class="eb-file"><label class="btn btn-sm btn-ghost">选择本地图片<input type="file" accept="image/*" data-image-file="' + b.id + '" hidden></label>' +
      '<span class="small muted">或上传本地图片（≤600KB）</span></div>' +
      '<input class="input" data-field="caption" maxlength="80" value="' + esc(b.caption || '') + '" placeholder="图片说明（可选）">' +
      (b.src ? '<img class="eb-preview" src="' + esc(b.src) + '" alt="图片预览">' : '');
  } else if (b.type === 'code') {
    fields = '<input class="input" data-field="lang" maxlength="20" value="' + esc(b.lang || '') + '" placeholder="语言，例如 python / javascript">' +
      '<textarea class="textarea eb-textarea code-input" data-field="code" spellcheck="false" placeholder="在此粘贴代码">' + esc(b.code || '') + '</textarea>';
  }
  return '<div class="eb" data-block-id="' + b.id + '">' +
    '<div class="eb-head"><span class="eb-type">' + (BLOCK_LABELS[b.type] || '内容') + ' ' + (i + 1) + '</span>' + tools + '</div>' +
    '<div class="eb-fields">' + fields + '</div>' +
  '</div>';
}

function chapterEditorHtml(ch, ci, total) {
  const blocks = ch.blocks || [];
  return '<div class="ec" data-chapter-id="' + ch.id + '">' +
    '<div class="ec-head">' +
      '<span class="ec-idx">' + pad2(ci + 1) + '</span>' +
      '<input class="input ec-title" data-chapter-title="' + ch.id + '" maxlength="60" value="' + esc(ch.title || '') + '" placeholder="章节标题">' +
      '<div class="eb-tools">' +
        '<button class="eb-btn" data-action="move-chapter" data-id="' + ch.id + '" data-dir="-1" title="上移章节"' + (ci === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button class="eb-btn" data-action="move-chapter" data-id="' + ch.id + '" data-dir="1" title="下移章节"' + (ci === total - 1 ? ' disabled' : '') + '>↓</button>' +
        '<button class="eb-btn danger" data-action="remove-chapter" data-id="' + ch.id + '" title="删除此章节">✕</button>' +
      '</div>' +
    '</div>' +
    '<div class="editor-toolbar">' +
      ['heading', 'text', 'image', 'code'].map(t =>
        '<button class="btn btn-sm btn-soft" data-action="add-block" data-type="' + t + '" data-chapter="' + ch.id + '">＋ ' + BLOCK_LABELS[t] + '</button>'
      ).join('') +
    '</div>' +
    '<div class="editor-blocks">' +
      (blocks.length
        ? blocks.map((b, i) => editorBlockHtml(b, i, blocks.length, ch.id)).join('')
        : '<div class="editor-empty">这一章还没有内容块。从上方添加标题、正文、图片或代码框。</div>') +
    '</div>' +
  '</div>';
}

function renderCourseEditor(id) {
  const app = document.getElementById('app');
  const existing = id ? customCourseById(id) : null;
  if (id && !existing) { renderNotFound(); return; }
  if (!courseDraft || (id && courseDraft.id !== id) || (!id && !courseDraft.__new)) {
    courseDraft = existing ? JSON.parse(JSON.stringify(existing)) : newCustomCourse();
    courseDraft.__new = !existing;
  }
  const d = courseDraft;
  const isNew = !!d.__new;
  if (!Array.isArray(d.chapters) || !d.chapters.length) {
    d.chapters = [{ id: uid(), title: '第一章', blocks: [] }];
  }
  const totalBlocks = d.chapters.reduce((n, ch) => n + (ch.blocks || []).length, 0);

  app.innerHTML =
    '<a class="back-link" href="' + (isNew ? '#/courses' : '#/course/' + d.id) + '">← 返回</a>' +
    '<div class="page-head">' +
      '<div><div class="eyebrow">Course Editor</div><h1>' + (isNew ? '创建课程' : '编辑课程') + '</h1>' +
      '<div class="sub">填写课程信息，并分章节用标题、正文、图片与代码框组织课程内容。</div></div>' +
      '<div class="actions"><button class="btn btn-ghost" data-action="editor-cancel">取消</button>' +
      '<button class="btn btn-primary" data-action="save-course">保存课程</button></div>' +
    '</div>' +
    '<div class="editor-layout">' +
      '<section class="card panel">' +
        '<div class="panel-head"><h3>课程信息</h3></div>' +
        '<div class="field"><label>课程名称 *</label><input class="input" id="ce-title" maxlength="60" value="' + esc(d.title) + '" placeholder="例如：我的 Transformer 学习笔记"></div>' +
        '<div class="field"><label>副标题</label><input class="input" id="ce-subtitle" maxlength="80" value="' + esc(d.subtitle) + '" placeholder="用一句话概括这门课程"></div>' +
        '<div class="field"><label>课程简介</label><textarea class="textarea" id="ce-desc" style="min-height:88px" maxlength="300" placeholder="这门课程会讲什么？">' + esc(d.desc) + '</textarea></div>' +
        '<div class="field"><label>知识领域</label><input class="input" id="ce-domain" maxlength="20" value="' + esc(d.domain) + '" placeholder="例如：大模型、计算机视觉"></div>' +
        '<div class="editor-grid2">' +
          '<div class="field"><label>难度</label><select class="select" id="ce-level">' +
            ['入门', '进阶', '高级', '自定义'].map(lv => '<option' + (d.level === lv ? ' selected' : '') + '>' + lv + '</option>').join('') +
          '</select></div>' +
          '<div class="field"><label>主题色</label><input class="input" id="ce-color" type="color" value="' + esc(/^#[0-9a-fA-F]{6}$/.test(d.color || '') ? d.color : '#7c5cff') + '"></div>' +
        '</div>' +
        '<div class="field"><label>标签（用逗号分隔）</label><input class="input" id="ce-tags" maxlength="80" value="' + esc((d.tags || []).join('，')) + '" placeholder="例如：注意力，笔记"></div>' +
        '<div class="field"><label>课程图标</label>' +
          '<div class="icon-picker">' +
            BUILTIN_ICONS.map(ic => '<button type="button" class="icon-opt' + (!isImageIcon(d.icon) && (d.icon || '✎') === ic ? ' active' : '') + '" data-action="pick-icon" data-icon="' + esc(ic) + '">' + ic + '</button>').join('') +
          '</div>' +
          '<div class="icon-upload">' +
            '<div class="icon-current">' + (isImageIcon(d.icon) ? '<img src="' + esc(d.icon) + '" alt="课程图标预览">' : '<span>' + esc(d.icon || '✎') + '</span>') + '</div>' +
            '<div class="icon-upload-info">' +
              '<label class="btn btn-sm btn-ghost">上传本地图片<input type="file" accept="image/*" data-course-icon hidden></label>' +
              '<div class="small muted" style="margin-top:6px">支持 PNG / JPG，大小不超过 600KB</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="card panel">' +
        '<div class="panel-head"><h3>课程章节</h3><span class="badge">' + d.chapters.length + ' 章 · ' + totalBlocks + ' 个内容块</span></div>' +
        '<div class="editor-chapters">' +
          d.chapters.map((ch, i) => chapterEditorHtml(ch, i, d.chapters.length)).join('') +
        '</div>' +
        '<div class="editor-foot">' +
          '<button class="btn btn-sm btn-soft" data-action="add-chapter">＋ 新增章节</button>' +
          '<button class="btn btn-primary" data-action="save-course">保存课程</button>' +
          '<span class="small muted">课程保存在本地浏览器中</span>' +
        '</div>' +
      '</section>' +
    '</div>';

  bindEditorImageInputs();
}

function bindEditorImageInputs() {
  document.querySelectorAll('[data-image-file]').forEach(function (input) {
    input.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        showToast('文件类型不支持', '请选择图片文件', { icon: '!' });
        return;
      }
      if (file.size > 600 * 1024) {
        showToast('图片过大', '请选择小于 600KB 的图片，或改用图片链接', { icon: '!' });
        return;
      }
      const bid = input.getAttribute('data-image-file');
      const reader = new FileReader();
      reader.onload = function () {
        collectDraft();
        const found = findDraftBlock(bid);
        if (found) found.block.src = reader.result;
        rerenderEditor();
        showToast('图片已插入', '保存课程后即可在详情页查看', { icon: '✓' });
      };
      reader.readAsDataURL(file);
    });
  });
  document.querySelectorAll('[data-course-icon]').forEach(function (input) {
    input.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        showToast('文件类型不支持', '请选择图片文件', { icon: '!' });
        return;
      }
      if (file.size > 600 * 1024) {
        showToast('图标过大', '请选择小于 600KB 的图片', { icon: '!' });
        return;
      }
      const reader = new FileReader();
      reader.onload = function () {
        collectDraft();
        courseDraft.icon = reader.result;
        rerenderEditor();
        showToast('图标已更新', '保存课程后生效', { icon: '✓' });
      };
      reader.readAsDataURL(file);
    });
  });
}

function editorAddChapter() {
  if (!courseDraft) return;
  collectDraft();
  if (!Array.isArray(courseDraft.chapters)) courseDraft.chapters = [];
  const n = courseDraft.chapters.length + 1;
  courseDraft.chapters.push({ id: uid(), title: '第' + cnChapterNum(n) + '章', blocks: [] });
  rerenderEditor();
}

function editorRemoveChapter(id) {
  if (!courseDraft) return;
  collectDraft();
  courseDraft.chapters = (courseDraft.chapters || []).filter(ch => ch.id !== id);
  if (!courseDraft.chapters.length) {
    courseDraft.chapters.push({ id: uid(), title: '第一章', blocks: [] });
  }
  rerenderEditor();
}

function editorMoveChapter(id, dir) {
  if (!courseDraft) return;
  collectDraft();
  const list = courseDraft.chapters || [];
  const idx = list.findIndex(ch => ch.id === id);
  const to = idx + (dir || 0);
  if (idx < 0 || to < 0 || to >= list.length) return;
  const tmp = list[idx];
  list[idx] = list[to];
  list[to] = tmp;
  rerenderEditor();
}

function editorAddBlock(type, chapterId) {
  if (!courseDraft) return;
  collectDraft();
  const chapters = courseDraft.chapters || [];
  const ch = chapters.find(c => c.id === chapterId) || chapters[0];
  if (!ch) return;
  const b = { id: uid(), type: type };
  if (type === 'heading') { b.level = 2; b.text = ''; }
  else if (type === 'text') { b.text = ''; }
  else if (type === 'image') { b.src = ''; b.caption = ''; }
  else if (type === 'code') { b.lang = 'python'; b.code = ''; }
  else return;
  if (!Array.isArray(ch.blocks)) ch.blocks = [];
  ch.blocks.push(b);
  rerenderEditor();
}

function editorRemoveBlock(id) {
  if (!courseDraft) return;
  collectDraft();
  (courseDraft.chapters || []).forEach(function (ch) {
    ch.blocks = (ch.blocks || []).filter(b => b.id !== id);
  });
  rerenderEditor();
}

function editorMoveBlock(id, dir) {
  if (!courseDraft) return;
  collectDraft();
  const found = findDraftBlock(id);
  if (!found) return;
  const list = found.chapter.blocks;
  const idx = list.findIndex(b => b.id === id);
  const to = idx + (dir || 0);
  if (idx < 0 || to < 0 || to >= list.length) return;
  const tmp = list[idx];
  list[idx] = list[to];
  list[to] = tmp;
  rerenderEditor();
}

function saveCourseDraft() {
  if (!courseDraft) return;
  collectDraft();
  const title = (courseDraft.title || '').trim();
  if (!title) {
    showToast('请填写课程名称', '课程名称不能为空', { icon: '!' });
    const el = document.getElementById('ce-title');
    if (el) el.focus();
    return;
  }
  const isNew = !customCourseById(courseDraft.id);
  const now = Date.now();
  const chapters = (courseDraft.chapters || []).map(function (ch, i) {
    return {
      id: ch.id || uid(),
      title: (ch.title || '').trim() || ('第' + cnChapterNum(i + 1) + '章'),
      blocks: ch.blocks || []
    };
  });
  const iconVal = (courseDraft.icon || '').trim();
  const data = {
    id: courseDraft.id,
    custom: true,
    title: title,
    subtitle: (courseDraft.subtitle || '').trim(),
    desc: (courseDraft.desc || '').trim(),
    domain: (courseDraft.domain || '').trim() || '自定义',
    level: courseDraft.level || '自定义',
    icon: isImageIcon(iconVal) ? iconVal : (iconVal.slice(0, 2) || '✎'),
    color: courseDraft.color || '#7c5cff',
    tags: courseDraft.tags || [],
    chapters: chapters,
    createdAt: courseDraft.createdAt || now,
    updatedAt: now
  };
  if (isNew) {
    if (!state.customCourses) state.customCourses = [];
    state.customCourses.unshift(data);
  } else {
    state.customCourses = (state.customCourses || []).map(c => c.id === data.id ? data : c);
  }
  saveState();
  courseDraft = null;
  const target = '#/course/' + data.id;
  if (location.hash === target) render();
  else location.hash = target;
  showToast(isNew ? '课程已创建' : '课程已保存', '《' + title + '》已保存到你的课程中心', { icon: '✓' });
}

function cancelCourseEditor() {
  const target = courseDraft && !courseDraft.__new ? '#/course/' + courseDraft.id : '#/courses';
  courseDraft = null;
  if (location.hash === target) render();
  else location.hash = target;
}

function confirmDeleteCourse(id) {
  const c = findCourse(id);
  if (!c) return;
  const custom = isCustomCourse(c);
  openModal(
    '<div class="modal-head"><div><h3>删除课程《' + esc(c.title) + '》？</h3><p>删除后将从课程中心移除</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body"><p class="modal-note">' + (custom
      ? '课程信息与全部章节、内容块将被永久删除，且无法恢复。已获得的经验值不会扣回。'
      : '这门内置课程将从课程中心隐藏，可通过「个人中心 → 清空学习数据」恢复。') + '</p></div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-soft" data-action="confirm-delete-course" data-id="' + id + '">确认删除</button></div>'
  );
}

function deleteCourse(id) {
  const c = findCourse(id);
  if (!c) { closeModal(); render(); return; }
  if (isCustomCourse(c)) {
    state.customCourses = (state.customCourses || []).filter(x => x.id !== id);
    if (courseDraft && courseDraft.id === id) courseDraft = null;
  } else {
    if (!state.hiddenCourses) state.hiddenCourses = [];
    if (state.hiddenCourses.indexOf(id) < 0) state.hiddenCourses.push(id);
  }
  saveState();
  closeModal();
  if (location.hash === '#/course/' + id) location.hash = '#/courses';
  else render();
  showToast('课程已删除', '《' + c.title + '》已从课程中心移除', { icon: '✕' });
}

/* ---------- 学习页 ---------- */
function renderLesson(cid, lid) {
  const app = document.getElementById('app');
  const c = findCourse(cid);
  if (!c) { renderNotFound(); return; }
  const custom = isCustomCourse(c);
  const chapters = chaptersOf(c);
  const idx = chapters.findIndex(l => l.id === lid);
  if (idx < 0) { renderNotFound(); return; }
  const ch = chapters[idx];
  const next = chapters[idx + 1];
  const prev = chapters[idx - 1];
  const blocks = custom ? chapterBlocks(ch) : [];
  const sections = custom ? [] : (ch.sections || []);

  const body = custom
    ? (blocks.length
        ? blocks.map((b, i) => customBlockHtml(b, i)).join('')
        : '<div class="editor-empty">这一章还没有内容。点击下方「编辑课程」补充章节内容。</div>')
    : sections.map((s, i) =>
        '<section class="article-section" id="sec-' + i + '">' +
          '<h2><span class="hnum">' + pad2(i + 1) + '</span>' + esc(s.h) + '</h2>' +
          '<p>' + esc(s.p) + '</p>' +
          (s.list && s.list.length ? '<ul>' + s.list.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
        '</section>'
      ).join('') +
      ((ch.keyPoints || []).length
        ? '<div class="keypoints"><h3>Key Takeaways</h3>' +
            ch.keyPoints.map(k => '<div class="kp-item">' + esc(k) + '</div>').join('') +
          '</div>'
        : '');

  const outline = custom
    ? blocks.map((b, i) => b.type === 'heading'
        ? '<div class="outline-link" data-action="scroll-to" data-target="cblk-' + i + '"><span>' + pad2(i + 1) + '</span>' + esc(b.text || '未命名标题') + '</div>'
        : '').join('')
    : sections.map((s, i) =>
        '<div class="outline-link" data-action="scroll-to" data-target="sec-' + i + '"><span>' + pad2(i + 1) + '</span>' + esc(s.h) + '</div>'
      ).join('');

  app.innerHTML =
    '<a class="back-link" href="#/course/' + c.id + '">← ' + esc(c.title) + '</a>' +
    '<div class="lesson-layout">' +
      '<article class="card article">' +
        '<div class="lesson-kicker"><span>' + esc(c.title) + '</span><span>·</span><span>第 ' + (idx + 1) + ' / ' + chapters.length + ' 章</span></div>' +
        '<h1>' + esc(ch.title) + '</h1>' +
        '<div class="article-meta"><span>' + esc(c.level || '自定义') + '</span><span>' + esc(c.domain || '') + '</span></div>' +
        body +
        '<div class="lesson-nav">' +
          (prev ? '<a class="btn btn-ghost btn-sm" href="#/lesson/' + c.id + '/' + prev.id + '">← 上一章</a>' : '<a class="btn btn-ghost btn-sm" href="#/course/' + c.id + '">← 返回课程</a>') +
          (next ? '<a class="btn btn-primary btn-sm" href="#/lesson/' + c.id + '/' + next.id + '">下一章 →</a>' : '') +
        '</div>' +
      '</article>' +
      '<aside class="aside-sticky">' +
        '<div class="card aside-card"><h4>本章目录</h4>' +
          (outline || '<div class="small muted">本章暂无小节目录</div>') +
        '</div>' +
        '<div class="card aside-card">' +
          '<h4>章节导航</h4>' +
          '<div class="lesson-progress-num"><b>' + (idx + 1) + '</b><span>/ ' + chapters.length + ' 章</span></div>' +
          '<div class="progress"><div class="progress-fill" style="width:' + Math.round((idx + 1) / chapters.length * 100) + '%"></div></div>' +
          (next ? '<div class="next-lesson"><div class="nl-label">NEXT CHAPTER</div><a class="nl-title" href="#/lesson/' + c.id + '/' + next.id + '">' + esc(next.title) + ' →</a></div>' : '') +
          (prev ? '<div class="next-lesson"><div class="nl-label">PREVIOUS</div><a class="nl-title" href="#/lesson/' + c.id + '/' + prev.id + '">' + esc(prev.title) + '</a></div>' : '') +
        '</div>' +
      '</aside>' +
    '</div>';
}

function renderNotFound() {
  document.getElementById('app').innerHTML =
    '<div class="card panel empty-state" style="margin-top:40px">' +
      '<div class="es-icon">' + svgIcon('search', 30) + '</div><h3>未找到该内容</h3>' +
      '<p>链接可能已失效，或课程仍在构建中。</p>' +
      '<a class="btn btn-primary" href="#/courses">返回课程中心</a>' +
    '</div>';
}
