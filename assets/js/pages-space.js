/* NEXUS AI · 页面：论文库 / 笔记库 / 学习资源 / 专注计时 / 个人中心 */

/* ---------- 论文库 ---------- */
function renderPapers() {
  const app = document.getElementById('app');
  const domains = paperDomains();
  if (ui.paperDomain !== 'all' && domains.indexOf(ui.paperDomain) < 0) ui.paperDomain = 'all';
  const count = filteredPapers(ui.paperQuery, ui.paperSaved).length;

  app.innerHTML =
    '<div class="page-head">' +
      '<div><div class="eyebrow">Paper Library</div><h1>论文库</h1>' +
      '<div class="sub">共 ' + allPapers().length + ' 篇文献，支持自行添加与管理，按研究领域筛选、按影响力排序。</div></div>' +
      '<div class="actions"><span class="badge">已收藏 ' + state.bookmarks.length + ' 篇</span>' +
        '<button class="btn btn-primary btn-sm" data-action="new-paper">＋ 添加论文</button></div>' +
    '</div>' +
    '<section class="card panel" style="padding:22px">' +
      '<div class="search-row" style="margin-bottom:14px">' +
        '<div class="search-input">' +
          '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
          '<input id="paper-search" type="text" placeholder="搜索论文标题、作者、方向或关键词…" autocomplete="off">' +
        '</div>' +
        '<span class="badge" style="align-self:center" id="paper-count">' + count + ' 篇文献</span>' +
      '</div>' +
      '<div class="filter-bar">' +
        '<div class="chip-row">' +
          '<button class="chip' + (ui.paperDomain === 'all' ? ' active' : '') + '" data-action="paper-domain" data-domain="all">全部领域</button>' +
          domains.map(d => '<button class="chip' + (ui.paperDomain === d ? ' active' : '') + '" data-action="paper-domain" data-domain="' + esc(d) + '">' + esc(d) + '</button>').join('') +
        '</div>' +
        '<div class="chip-row">' +
          '<button class="chip' + (ui.paperSort === 'cite' ? ' active' : '') + '" data-action="paper-sort" data-sort="cite">引用最多</button>' +
          '<button class="chip' + (ui.paperSort === 'year' ? ' active' : '') + '" data-action="paper-sort" data-sort="year">最新发表</button>' +
          '<button class="chip' + (ui.paperSaved ? ' active' : '') + '" data-action="paper-saved">只看收藏</button>' +
        '</div>' +
      '</div>' +
      '<div id="paper-list">' + paperCardsHtml(ui.paperQuery, ui.paperSaved) + '</div>' +
    '</section>';

  const input = document.getElementById('paper-search');
  if (input) {
    input.value = ui.paperQuery;
    input.addEventListener('input', function (e) {
      ui.paperQuery = e.target.value;
      const list = document.getElementById('paper-list');
      const cnt = document.getElementById('paper-count');
      if (list) list.innerHTML = paperCardsHtml(ui.paperQuery, ui.paperSaved);
      if (cnt) cnt.textContent = filteredPapers(ui.paperQuery, ui.paperSaved).length + ' 篇文献';
    });
  }
}

function paperDomains() {
  return allPapers().map(p => p.domain).filter((d, i, arr) => d && arr.indexOf(d) === i);
}

function filteredPapers(query, onlySaved) {
  const q = (query || '').trim().toLowerCase();
  let list = allPapers();
  if (onlySaved) list = list.filter(p => state.bookmarks.includes(p.id));
  if (ui.paperDomain !== 'all') list = list.filter(p => p.domain === ui.paperDomain);
  if (q) {
    list = list.filter(p =>
      [p.title, p.authors, p.domain, (p.tags || []).join(' '), p.summary, p.venue].join(' ').toLowerCase().indexOf(q) >= 0
    );
  }
  if (ui.paperSort === 'year') list.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
  else list.sort((a, b) => (parseInt(b.citations, 10) || 0) - (parseInt(a.citations, 10) || 0));
  return list;
}

function paperCardsHtml(query, onlySaved) {
  const list = filteredPapers(query, onlySaved);
  if (!list.length) {
    if (!allPapers().length) {
      return '<div class="empty-state card"><div class="es-icon">' + svgIcon('search', 30) + '</div><h3>论文库还没有论文</h3><p>添加你正在阅读的文献，建立属于自己的论文清单。</p>' +
        '<button class="btn btn-primary" data-action="new-paper">＋ 添加论文</button></div>';
    }
    return '<div class="empty-state card"><div class="es-icon">' + svgIcon('search', 30) + '</div><h3>没有找到相关论文</h3><p>' +
      (onlySaved ? '你还没有收藏论文，点击卡片右上角的书签即可加入收藏。' : '试试切换研究领域，或搜索 Transformer、扩散模型、对齐等关键词。') + '</p></div>';
  }
  return '<div class="paper-grid">' + list.map(p => {
    const bm = state.bookmarks.includes(p.id);
    return '<article class="card paper-card">' +
      '<div class="paper-top">' +
        '<div class="paper-title">' + esc(p.title) + '</div>' +
        '<div class="paper-acts">' +
          '<button class="del-btn" data-action="delete-paper" data-id="' + p.id + '" title="删除论文" aria-label="删除论文">✕</button>' +
          '<button class="bm-btn' + (bm ? ' active' : '') + '" data-action="toggle-bookmark" data-id="' + p.id + '" title="' + (bm ? '取消收藏' : '收藏论文') + '">' +
            '<svg viewBox="0 0 24 24"><path d="M6 4h12v17l-6-4-6 4V4Z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="paper-authors">' + esc(p.authors) + ' · ' + esc(p.year) + ' · ' + esc(p.venue) + '</div>' +
      '<div class="paper-abs">' + esc(p.summary) + '</div>' +
      '<div class="paper-tags"><span class="tag">' + esc(p.domain) + '</span>' + (p.tags || []).map(t => '<span class="tag">' + esc(t) + '</span>').join('') +
        (p.difficulty ? '<span class="tag">' + esc(p.difficulty) + '</span>' : '') + '</div>' +
      '<div class="paper-foot">' +
        '<span class="paper-venue">' + (p.citations ? '引用 ' + esc(p.citations) : '未收录引用数据') + '</span>' +
        '<button class="btn btn-tiny btn-soft" data-action="open-paper" data-id="' + p.id + '">阅读 →</button>' +
      '</div>' +
    '</article>';
  }).join('') + '</div>';
}

/* ---------- 笔记库 ---------- */
function renderNotes() {
  const app = document.getElementById('app');
  const body = !state.notes.length
    ? '<div class="card empty-state"><div class="es-icon">' + svgIcon('note', 30) + '</div><h3>还没有笔记</h3>' +
      '<p>把阅读中的疑问、灵感与推导记录下来，沉淀为你的知识资产。</p>' +
      '<button class="btn btn-primary" data-action="new-note">写下第一篇笔记</button></div>'
    : '<div class="card panel" style="padding:22px">' +
        '<div class="search-row" style="margin-bottom:16px">' +
          '<div class="search-input">' +
            '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
            '<input id="note-search" type="text" placeholder="搜索笔记标题、正文或标签…" autocomplete="off">' +
          '</div>' +
          '<span class="badge" style="align-self:center" id="note-count-badge">' + noteListCount() + ' 篇笔记</span>' +
        '</div>' +
        '<div id="note-list">' + noteListHtml() + '</div>' +
      '</div>';

  app.innerHTML =
    '<div class="page-head">' +
      '<div><div class="eyebrow">Notes</div><h1>笔记库</h1>' +
      '<div class="sub">记录问题、推导与灵感，让零散的思考沉淀为可复用的知识。</div></div>' +
      '<div class="actions"><span class="badge">' + state.notes.length + ' 篇笔记</span>' +
      '<button class="btn btn-primary" data-action="new-note">＋ 新建笔记</button></div>' +
    '</div>' + body;

  const input = document.getElementById('note-search');
  if (input) {
    input.value = ui.noteQuery;
    input.addEventListener('input', function (e) {
      ui.noteQuery = e.target.value;
      const list = document.getElementById('note-list');
      const cnt = document.getElementById('note-count-badge');
      if (list) list.innerHTML = noteListHtml();
      if (cnt) cnt.textContent = noteListCount() + ' 篇笔记';
    });
  }
}

function noteListCount() {
  const q = (ui.noteQuery || '').trim().toLowerCase();
  if (!q) return state.notes.length;
  return state.notes.filter(n =>
    [n.title, n.body, n.tag].join(' ').toLowerCase().indexOf(q) >= 0
  ).length;
}

function noteListHtml() {
  const q = (ui.noteQuery || '').trim().toLowerCase();
  const list = q
    ? state.notes.filter(n => [n.title, n.body, n.tag].join(' ').toLowerCase().indexOf(q) >= 0)
    : state.notes.slice();
  if (!list.length) {
    return '<div class="empty-state" style="padding:26px 0"><div class="es-icon">' + svgIcon('search', 30) + '</div>' +
      '<h3>没有找到相关笔记</h3><p>换个关键词试试，或检查笔记标签。</p></div>';
  }
  const order = [];
  const groups = {};
  list.forEach(n => {
    const tag = n.tag || '未分类';
    if (!groups[tag]) { groups[tag] = []; order.push(tag); }
    groups[tag].push(n);
  });
  return order.map(tag =>
    '<section class="note-group">' +
      '<div class="note-group-head"><h3>' + esc(tag) + '</h3><span class="badge">' + groups[tag].length + ' 篇</span></div>' +
      '<div class="note-grid">' + groups[tag].map(n =>
        '<article class="card note-card" data-action="edit-note" data-id="' + n.id + '" tabindex="0" role="button" aria-label="编辑笔记 ' + esc(n.title) + '">' +
          '<div class="note-head"><div class="note-title">' + esc(n.title) + '</div>' +
            '<button class="del-btn" data-action="delete-note" data-id="' + n.id + '" title="删除笔记">✕</button></div>' +
          '<div class="note-body">' + esc(n.body) + '</div>' +
          '<div class="note-foot"><span class="tag">' + esc(n.tag) + '</span>' +
            '<span class="note-time">' + relDate(n.createdAt) + '</span></div>' +
        '</article>'
      ).join('') + '</div>' +
    '</section>'
  ).join('');
}

/* ---------- 学习资源 ---------- */
function renderResources() {
  const app = document.getElementById('app');
  let total = 0;
  LEARNING_RESOURCES.forEach(g => { total += g.items.length; });

  app.innerHTML =
    '<div class="page-head">' +
      '<div><div class="eyebrow">Resources</div><h1>学习资源</h1>' +
      '<div class="sub">精选框架、数据集、课程与学术会议，帮助你把知识转化为可复现的实践能力。</div></div>' +
      '<div class="actions"><span class="badge">' + total + ' 个精选资源</span></div>' +
    '</div>' +
    '<div class="resource-grid">' + LEARNING_RESOURCES.map(group =>
      '<section class="card panel resource-card">' +
        '<div class="panel-head"><h3>' + esc(group.group) + '</h3>' +
          '<span class="badge">' + group.items.length + ' 项</span></div>' +
        '<div class="res-list">' + group.items.map(r =>
          '<a class="res-row" href="' + esc(r.link) + '" target="_blank" rel="noopener">' +
            '<span class="entry-dot" style="background:' + group.color + '"></span>' +
            '<div><b>' + esc(r.name) + '</b><small>' + esc(r.desc) + '</small></div><span>↗</span></a>'
        ).join('') + '</div>' +
      '</section>'
    ).join('') + '</div>';
}

/* ---------- 专注计时 ---------- */
function renderFocus() {
  const app = document.getElementById('app');
  let weekMin = 0;
  for (let i = 0; i < 7; i++) weekMin += dayMinutes(daysAgo(i));
  const totalH = (totalStudyMinutes() / 60).toFixed(1);

  app.innerHTML =
    '<div class="page-head">' +
      '<div><div class="eyebrow">Focus Timer</div><h1>专注计时</h1>' +
      '<div class="sub">用一段不被打断的时间深入一个问题。专注时长会累计到你的学习节奏中。</div></div>' +
      '<div class="actions"><span class="badge green">本周专注 ' + weekMin + ' 分钟</span></div>' +
    '</div>' +
    '<div class="focus-layout">' +
      '<section class="card panel focus-page-card">' +
        '<div class="panel-head"><h3>番茄专注</h3><span class="link">今日 <b id="focus-today">' + dayMinutes(todayStr()) + '</b> 分钟</span></div>' +
        '<div class="focus-time" id="focus-time">' + formatClock(focusState.left) + '</div>' +
        '<div class="focus-presets">' +
          [15, 25, 45].map(m => '<button class="chip' + (focusState.total === m * 60 ? ' active' : '') + '" data-action="focus-preset" data-min="' + m + '">' + m + ' 分钟</button>').join('') +
        '</div>' +
        '<div class="progress" style="margin:20px 0 18px"><div class="progress-fill" id="focus-bar" style="width:0%"></div></div>' +
        '<div class="focus-actions">' +
          '<button class="btn btn-primary" data-action="focus-toggle" id="focus-toggle">开始专注</button>' +
          '<button class="btn btn-ghost" data-action="focus-reset">重置</button>' +
          '<button class="btn btn-soft" data-action="focus-finish">结束并记录</button>' +
        '</div>' +
        '<div class="small muted" style="margin-top:14px;text-align:center">专注期间的网站在线时长会自动计入经验值，每满 1 分钟 = 1 XP。</div>' +
      '</section>' +
      '<div class="stack">' +
        '<section class="card panel"><div class="panel-head"><h3>学习记录</h3></div>' +
          '<div class="info-list">' +
            '<div class="info-row"><span>今日专注</span><b>' + dayMinutes(todayStr()) + ' 分钟</b></div>' +
            '<div class="info-row"><span>本周累计</span><b>' + weekMin + ' 分钟</b></div>' +
            '<div class="info-row"><span>累计学习</span><b>' + totalH + ' 小时</b></div>' +
            '<div class="info-row"><span>连续学习</span><b>' + calcStreak(state.checkInDates) + ' 天</b></div>' +
          '</div>' +
        '</section>' +
      '</div>' +
    '</div>';

  updateFocusUI();
}

function openPaperModal(id) {
  const p = findPaper(id);
  if (!p) return;
  const bm = state.bookmarks.includes(p.id);
  openModal(
    '<div class="modal-head"><div><h3>' + esc(p.title) + '</h3>' +
      '<p>' + esc(p.authors) + ' · ' + esc(p.year) + ' · ' + esc(p.venue) + (p.citations ? ' · 引用 ' + esc(p.citations) : '') + '</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body">' +
      '<div class="paper-tags" style="margin-bottom:12px">' + (p.tags || []).map(t => '<span class="tag">' + esc(t) + '</span>').join('') +
        '<span class="tag">' + esc(p.domain) + '</span>' + (p.difficulty ? '<span class="tag">' + esc(p.difficulty) + '</span>' : '') + '</div>' +
      '<p class="modal-note" style="margin-bottom:14px">' + esc(p.summary) + '</p>' +
      (p.link ? '<div class="callout"><span style="color:#b3a6ff">' + svgIcon('link', 18) + '</span><div>原文链接：<b>' + esc(p.link) + '</b></div></div>' : '') +
    '</div>' +
    '<div class="modal-foot" style="justify-content:space-between">' +
      (p.link ? '<a class="btn btn-ghost" href="' + esc(p.link) + '" target="_blank" rel="noopener">打开原文 ↗</a>' : '<span></span>') +
      '<button class="btn ' + (bm ? 'btn-ghost' : 'btn-primary') + '" data-action="toggle-bookmark" data-id="' + p.id + '">' +
        (bm ? '取消收藏' : '收藏论文') + '</button>' +
    '</div>'
  );
}

function openPaperForm() {
  openModal(
    '<div class="modal-head"><div><h3>添加论文</h3><p>补充文献信息，建立自己的论文清单</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body">' +
      '<div class="field"><label>论文标题</label><input class="input" id="paper-title" placeholder="例如：Attention Is All You Need" maxlength="140"></div>' +
      '<div class="field-row">' +
        '<div class="field"><label>论文作者</label><input class="input" id="paper-authors" placeholder="例如：Vaswani 等" maxlength="80"></div>' +
        '<div class="field"><label>发表年份</label><input class="input" id="paper-year" type="number" min="1900" max="2100" placeholder="2024"></div>' +
      '</div>' +
      '<div class="field"><label>刊登处</label><input class="input" id="paper-venue" placeholder="例如：NeurIPS / arXiv / Nature" maxlength="60"></div>' +
      '<div class="field"><label>引用数据</label><input class="input" id="paper-citations" placeholder="例如：12k+ 或 1200" maxlength="20"></div>' +
      '<div class="field"><label>论文标签</label><input class="input" id="paper-tags" placeholder="用逗号分隔，例如：Transformer, 自注意力" maxlength="120"></div>' +
      '<div class="field"><label>论文简介</label><textarea class="textarea" id="paper-summary" placeholder="用一两句话概括论文解决的问题与核心方法…"></textarea></div>' +
      '<div class="field"><label>原文链接</label><input class="input" id="paper-link" placeholder="https://arxiv.org/abs/…" maxlength="300"></div>' +
    '</div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-paper">保存论文</button></div>',
    { wide: true }
  );
}

function savePaper() {
  const val = function (id) {
    const el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  };
  const title = val('paper-title');
  if (!title) {
    showToast('请填写论文标题', '标题是论文的唯一标识', { icon: '!' });
    return;
  }
  const tags = val('paper-tags').split(/[,，、]/).map(t => t.trim()).filter(Boolean);
  const builtinDomains = PAPERS.map(p => p.domain);
  let link = val('paper-link');
  if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
  const year = parseInt(val('paper-year'), 10);
  const paper = {
    id: 'up_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    custom: true,
    title: title,
    authors: val('paper-authors') || '未知作者',
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    venue: val('paper-venue') || '未注明',
    domain: tags[0] && builtinDomains.indexOf(tags[0]) >= 0 ? tags[0] : '其他',
    citations: val('paper-citations'),
    difficulty: '',
    tags: tags,
    summary: val('paper-summary'),
    link: link
  };
  if (!Array.isArray(state.customPapers)) state.customPapers = [];
  state.customPapers.unshift(paper);
  saveState();
  closeModal();
  render();
  showToast('论文已添加', '《' + title + '》已加入论文库', { icon: '✓' });
}

function confirmDeletePaper(id) {
  const p = findPaper(id);
  if (!p) return;
  openModal(
    '<div class="modal-head"><div><h3>删除论文</h3><p>该操作不可撤销</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body"><p class="modal-note">确定要删除《' + esc(p.title) + '》吗？</p></div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-soft" data-action="confirm-delete-paper" data-id="' + p.id + '">确认删除</button></div>'
  );
}

function deletePaper(id) {
  if (!findPaper(id)) return;
  if (!Array.isArray(state.customPapers)) state.customPapers = [];
  if (!Array.isArray(state.hiddenPapers)) state.hiddenPapers = [];
  if (state.customPapers.some(p => p.id === id)) {
    state.customPapers = state.customPapers.filter(p => p.id !== id);
  } else if (state.hiddenPapers.indexOf(id) < 0) {
    state.hiddenPapers.push(id);
  }
  state.bookmarks = state.bookmarks.filter(x => x !== id);
  saveState();
  closeModal();
  render();
  showToast('论文已删除', '论文库已更新', { icon: '✕' });
}

let editingNoteId = '';

function openNoteModal(id) {
  const editing = id ? state.notes.find(n => n.id === id) : null;
  editingNoteId = editing ? editing.id : '';
  const tags = ['深度学习', '大语言模型', '计算机视觉', '强化学习', '多模态', '数学基础', '其他'];
  if (editing && tags.indexOf(editing.tag) < 0 && editing.tag) tags.push(editing.tag);
  openModal(
    '<div class="modal-head"><div><h3>' + (editing ? '编辑笔记' : '新建笔记') + '</h3><p>' + (editing ? '修改后点击保存即可更新' : '记录你的问题、推导与灵感') + '</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body">' +
      '<div class="field"><label>标题</label><input class="input" id="note-title" placeholder="例如：为什么注意力需要缩放？" maxlength="60" value="' + (editing ? esc(editing.title) : '') + '"></div>' +
      '<div class="field"><label>笔记标签</label><select class="select" id="note-tag">' +
        tags.map(t => '<option' + (editing && editing.tag === t ? ' selected' : '') + '>' + esc(t) + '</option>').join('') +
      '</select></div>' +
      '<div class="field"><label>正文</label><textarea class="textarea" id="note-body" placeholder="写下你的思考过程…">' + (editing ? esc(editing.body) : '') + '</textarea></div>' +
    '</div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-note"' + (editing ? ' data-id="' + editing.id + '"' : '') + '>' + (editing ? '保存修改' : '保存笔记') + '</button></div>',
    { wide: true }
  );
}

function saveNote() {
  const title = (document.getElementById('note-title').value || '').trim();
  const tag = document.getElementById('note-tag').value;
  const body = (document.getElementById('note-body').value || '').trim();
  if (!title || !body) {
    showToast('内容不完整', '请填写笔记标题与正文', { icon: '笔' });
    return;
  }
  const existing = editingNoteId ? state.notes.find(n => n.id === editingNoteId) : null;
  if (existing) {
    existing.title = title;
    existing.tag = tag;
    existing.body = body;
    existing.updatedAt = Date.now();
  } else {
    state.notes.unshift({ id: uid(), title: title, tag: tag, body: body, createdAt: Date.now() });
  }
  editingNoteId = '';
  saveState();
  closeModal();
  render();
  showToast(existing ? '笔记已更新' : '笔记已保存', existing ? '修改内容已保存' : '持续记录会让知识真正内化', { icon: '✓' });
}

function deleteNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  openModal(
    '<div class="modal-head"><div><h3>删除这篇笔记？</h3><p>此操作不可撤销</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body"><p class="modal-note">《' + esc(note.title) + '》将被永久删除，已获得的经验值不会扣回。</p></div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-soft" data-action="confirm-delete-note" data-id="' + id + '">确认删除</button></div>'
  );
}

/* ---------- 个人中心 ---------- */
function heatmapHtml() {
  let cells = '';
  for (let i = 83; i >= 0; i--) {
    const ds = daysAgo(i);
    const min = dayMinutes(ds);
    const lv = min === 0 ? 0 : min < 15 ? 1 : min < 30 ? 2 : min < 60 ? 3 : 4;
    cells += '<span class="hm-cell' + (lv ? ' l' + lv : '') + '" title="' + ds + ' · ' + min + ' 分钟"></span>';
  }
  return '<div class="heatmap">' + cells + '</div>' +
    '<div class="heat-legend"><span>少</span><span class="hm-cell"></span><span class="hm-cell l1"></span><span class="hm-cell l2"></span><span class="hm-cell l3"></span><span class="hm-cell l4"></span><span>多</span></div>';
}

function renderProfile() {
  const app = document.getElementById('app');
  const info = levelInfo(state.xp);
  const streak = calcStreak(state.checkInDates);
  const days = Math.max(1, Math.ceil((Date.now() - (state.createdAt || Date.now())) / 86400000));
  let weekMin = 0;
  for (let i = 0; i < 7; i++) weekMin += dayMinutes(daysAgo(i));

  app.innerHTML =
    '<div class="page-head">' +
      '<div><div class="eyebrow">Profile</div><h1>个人中心</h1>' +
      '<div class="sub">管理你的学习身份与学习档案。所有数据保存在本地浏览器中，可随时导出。</div></div>' +
    '</div>' +
    '<section class="card profile-hero">' +
      '<div class="avatar avatar-lg">' + esc(state.user.avatar) + '</div>' +
      '<div class="profile-main">' +
        '<div class="profile-name-row"><h1>' + esc(state.user.name) + '</h1><span class="badge">Lv.' + info.level + '</span>' +
          '<span class="badge amber">' + svgIcon('fire', 12) + ' ' + streak + ' 天连续</span></div>' +
        '<div class="profile-level"><span>' + esc(info.title) + '</span><span>·</span><span>加入 ' + days + ' 天</span><span>·</span><span>累计 ' + xpText(state.xp) + ' XP</span></div>' +
        '<div class="progress" style="margin-top:12px;max-width:420px"><div class="progress-fill" style="width:' + info.pct.toFixed(1) + '%"></div></div>' +
        '<div class="small muted" style="margin-top:6px">' + (info.maxed ? '已抵达最高等级 · ' + esc(info.title) : '距离 Lv.' + (info.level + 1) + ' 还需 ' + xpText(info.toNext) + ' XP') + '</div>' +
      '</div>' +
      '<div style="text-align:right"><div class="small muted">课程 / 章节</div>' +
        '<div style="font-size:22px;font-weight:750">' + visibleCourses().length + ' / ' + totalLessons() + '</div></div>' +
    '</section>' +
    '<div class="profile-grid">' +
      '<div class="stack">' +
        '<section class="card panel"><div class="panel-head"><h3>学习档案</h3></div>' +
          '<div class="info-list">' +
            '<div class="info-row"><span>当前等级</span><b>Lv.' + info.level + ' · ' + esc(info.title) + '</b></div>' +
            '<div class="info-row"><span>总经验值</span><b>' + xpText(state.xp) + ' XP</b></div>' +
            '<div class="info-row"><span>经验值规则</span><b>签到 +10（连签每日 +1，最高 30）· 在线 1 分钟 = 1 XP · 连续在线 2 小时 +10</b></div>' +
            '<div class="info-row"><span>累计在线时长</span><b>' + (totalStudyMinutes() / 60).toFixed(1) + ' 小时</b></div>' +
            '<div class="info-row"><span>本周学习时长</span><b>' + weekMin + ' 分钟</b></div>' +
            '<div class="info-row"><span>课程 / 章节</span><b>' + visibleCourses().length + ' 门 / ' + totalLessons() + ' 章</b></div>' +
            '<div class="info-row"><span>研究笔记 / 收藏论文</span><b>' + state.notes.length + ' 篇 / ' + state.bookmarks.length + ' 篇</b></div>' +
          '</div>' +
        '</section>' +
        '<section class="card panel"><div class="panel-head"><h3>学习热力图</h3><span class="link">最近 12 周</span></div>' +
          heatmapHtml() +
        '</section>' +
      '</div>' +
      '<div class="stack">' +
        '<section class="card panel"><div class="panel-head"><h3>账号设置</h3></div>' +
          '<div class="field"><label>展示名称</label><input class="input" id="name-input" maxlength="16" value="' + esc(state.user.name) + '"></div>' +
          '<button class="btn btn-primary btn-block" data-action="save-name">保存资料</button>' +
          '<div class="divider"></div>' +
          '<button class="btn btn-ghost btn-block" style="margin-bottom:8px" data-action="export-data">导出学习数据（JSON）</button>' +
          '<button class="btn btn-ghost btn-block" style="margin-bottom:8px" data-action="import-data">加载学习数据（JSON）</button>' +
          '<input type="file" id="import-file" accept=".json,application/json" hidden>' +
          '<button class="btn btn-ghost btn-block" data-action="reset-data">清空学习数据</button>' +
        '</section>' +
        '<section class="card panel"><div class="panel-head"><h3>等级对照</h3><span class="link">Lv.0 – Lv.100</span></div>' +
          '<div class="info-list">' +
            LEVEL_ANCHORS.map(a => {
              const current = Math.min(100, Math.floor(info.level / 10) * 10) === a.level;
              return '<div class="info-row" style="padding-bottom:8px"><span>Lv.' + a.level + '</span><b' + (current ? ' style="color:var(--cyan)"' : '') + '>' + esc(a.title) + ' · ' + xpText(a.xp) + ' XP</b></div>';
            }).join('') +
            '<div class="small muted" style="padding-top:6px">中间等级所需经验值在相邻锚点之间线性增长。</div>' +
          '</div>' +
        '</section>' +
      '</div>' +
    '</div>';

  const importInput = document.getElementById('import-file');
  if (importInput) {
    importInput.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (file) importData(file);
    });
  }
}
