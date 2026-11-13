/* NEXUS AI · 路由 / 交互 */

function parseHash() {
  const raw = (location.hash || '#/dashboard').replace(/^#\/?/, '');
  return raw.split('/').filter(Boolean);
}

function updateNav() {
  document.querySelectorAll('.nav-item').forEach(function (a) {
    const key = a.getAttribute('data-nav');
    const active = key === currentPage || (key === 'courses' && (currentPage === 'course' || currentPage === 'lesson' || currentPage === 'editor'));
    a.classList.toggle('active', active);
  });
}

function render() {
  const parts = parseHash();
  const base = parts[0] || 'dashboard';
  currentPage = base;

  if (base === 'dashboard') renderDashboard();
  else if (base === 'courses') renderCourses();
  else if (base === 'course') renderCourse(parts[1]);
  else if (base === 'lesson') renderLesson(parts[1], parts[2]);
  else if (base === 'editor') renderCourseEditor(parts[1]);
  else if (base === 'papers') renderPapers();
  else if (base === 'notes') renderNotes();
  else if (base === 'resources') renderResources();
  else if (base === 'focus') renderFocus();
  else if (base === 'assistant') renderAssistant();
  else if (base === 'profile') renderProfile();
  else renderNotFound();

  document.title = (PAGE_TITLES[base] || '未找到页面') + ' · NEXUS AI';
  updateNav();
  updateHud();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ---------- 动作 ---------- */
function toggleSidebar(force) {
  const sb = document.getElementById('sidebar');
  const bd = document.querySelector('.sidebar-backdrop');
  if (!sb) return;
  const open = typeof force === 'boolean' ? force : !sb.classList.contains('open');
  sb.classList.toggle('open', open);
  if (bd) bd.classList.toggle('show', open);
}

function doCheckIn() {
  const t = todayStr();
  if (state.checkInDates.includes(t)) {
    showToast('今天已经打卡过了', '明天再来延续你的连续记录', { icon: '✓' });
    return;
  }
  state.checkInDates.push(t);
  const streak = calcStreak(state.checkInDates);
  const bonus = Math.min(streak, 30);
  saveState();
  grantXp(10 + bonus, 'checkin', '每日打卡 · 连签 ' + streak + ' 天（基础 10 + 激励 ' + bonus + '）');
  render();
  showToast('打卡成功 · +' + (10 + bonus) + ' XP',
    bonus > 1 ? '连续签到第 ' + streak + ' 天，连签激励 +' + bonus + ' XP' : '连续签到从今天开始，明天可达 +12 XP',
    { icon: '火' });
}

function toggleBookmark(id) {
  const p = findPaper(id);
  if (!p) return;
  const has = state.bookmarks.includes(id);
  if (has) {
    state.bookmarks = state.bookmarks.filter(x => x !== id);
    saveState();
    closeModal();
    render();
    showToast('已取消收藏', '《' + p.title + '》已从收藏中移除', { icon: '★' });
  } else {
    state.bookmarks.push(id);
    saveState();
    closeModal();
    render();
    showToast('已收藏', '《' + p.title + '》已加入你的论文库收藏', { icon: '★' });
  }
}

function saveName() {
  const input = document.getElementById('name-input');
  const v = ((input && input.value) || '').trim();
  if (!v) {
    showToast('名称不能为空', '请输入 1-16 个字符的展示名称', { icon: '!' });
    return;
  }
  state.user.name = v.slice(0, 16);
  state.user.avatar = state.user.name.slice(0, 1);
  saveState();
  updateHud();
  render();
  showToast('资料已更新', '新的学习者身份已生效', { icon: '✓' });
}

function exportData() {
  try {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nexus-ai-learning-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast('已导出学习数据', 'JSON 文件已开始下载', { icon: '↓' });
  } catch (e) {
    showToast('导出失败', '当前环境不支持文件下载', { icon: '!' });
  }
}

let pendingImport = null;

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    let data = null;
    try { data = JSON.parse(String(reader.result)); } catch (e) { /* ignore */ }
    if (!data || typeof data !== 'object' || typeof data.xp !== 'number' || !data.user) {
      showToast('加载失败', '该文件不是有效的学习数据 JSON', { icon: '!' });
      return;
    }
    const next = normalizeState(data);
    pendingImport = next;
    const info = levelInfo(next.xp);
    openModal(
      '<div class="modal-head"><div><h3>加载学习数据？</h3><p>来自 ' + esc(next.user.name || '探索者') + ' 的学习档案</p></div>' +
        '<button class="modal-close" data-action="close-modal">✕</button></div>' +
      '<div class="modal-body"><div class="info-list">' +
        '<div class="info-row"><span>等级</span><b>Lv.' + info.level + ' · ' + esc(info.title) + '</b></div>' +
        '<div class="info-row"><span>总经验值</span><b>' + xpText(next.xp) + ' XP</b></div>' +
        '<div class="info-row"><span>课程 / 笔记</span><b>' + next.customCourses.length + ' 门自定义 / ' + next.notes.length + ' 篇</b></div>' +
        '<div class="info-row"><span>累计在线</span><b>' + (next.onlineSeconds / 60).toFixed(0) + ' 分钟</b></div>' +
      '</div><p class="modal-note">加载后将覆盖当前浏览器中的学习数据，且无法撤销。如需保留当前数据，请先导出。</p></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
        '<button class="btn btn-primary" data-action="confirm-import">确认加载</button></div>'
    );
  };
  reader.onerror = function () {
    showToast('加载失败', '无法读取该文件', { icon: '!' });
  };
  reader.readAsText(file);
}

function applyImport() {
  if (!pendingImport) return;
  state = pendingImport;
  pendingImport = null;
  saveState();
  closeModal();
  render();
  showToast('已加载学习数据', '学习档案已恢复', { icon: '✓' });
}

function confirmReset() {
  openModal(
    '<div class="modal-head"><div><h3>清空学习数据？</h3><p>等级、经验值、课程与笔记都将归零</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body"><p class="modal-note">此操作会清除当前浏览器中保存的全部学习进度，且无法撤销。如需保留，请先导出数据。</p></div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-soft" data-action="confirm-reset">确认清空</button></div>'
  );
}

function resetData() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  state = seedState();
  saveState();
  closeModal();
  render();
  showToast('已清空学习数据', '学习档案已恢复初始状态', { icon: '↻' });
}

function handleAction(action, el) {
  switch (action) {
    case 'toggle-sidebar': toggleSidebar(); break;
    case 'close-modal': closeModal(); break;
    case 'checkin': doCheckIn(); break;
    case 'path-filter':
      ui.pathFilter = el.getAttribute('data-filter');
      render();
      break;
    case 'toggle-bookmark': toggleBookmark(el.getAttribute('data-id')); break;
    case 'open-paper': openPaperModal(el.getAttribute('data-id')); break;
    case 'new-paper': openPaperForm(); break;
    case 'save-paper': savePaper(); break;
    case 'delete-paper': confirmDeletePaper(el.getAttribute('data-id')); break;
    case 'confirm-delete-paper': deletePaper(el.getAttribute('data-id')); break;
    case 'new-note': openNoteModal(); break;
    case 'edit-note': openNoteModal(el.getAttribute('data-id')); break;
    case 'save-note': saveNote(); break;
    case 'delete-note': deleteNote(el.getAttribute('data-id')); break;
    case 'confirm-delete-note': {
      const id = el.getAttribute('data-id');
      state.notes = state.notes.filter(n => n.id !== id);
      saveState();
      closeModal();
      render();
      showToast('笔记已删除', '笔记库已更新', { icon: '✕' });
      break;
    }
    case 'save-name': saveName(); break;
    case 'assistant-new': {
      const cur = activeConversation();
      newAssistantConversation(cur ? cur.mode : 'chat');
      assistantDrawerOpen = false;
      assistantEditing = null;
      assistantMenu = null;
      renderAssistant();
      break;
    }
    case 'assistant-open': assistantOpen(el.getAttribute('data-id')); break;
    case 'assistant-del': assistantDelete(el.getAttribute('data-id')); break;
    case 'assistant-drawer': assistantToggleDrawer(); break;
    case 'assistant-mode': assistantSetMode(el.getAttribute('data-mode')); break;
    case 'assistant-menu': assistantToggleMenu(parseInt(el.getAttribute('data-i'), 10)); break;
    case 'assistant-edit': assistantEditMessage(parseInt(el.getAttribute('data-i'), 10)); break;
    case 'assistant-cancel-edit': assistantCancelEdit(); break;
    case 'assistant-delmsg': assistantDeleteMessage(parseInt(el.getAttribute('data-i'), 10)); break;
    case 'assistant-delmsg-ok': assistantDeleteMessageDo(parseInt(el.getAttribute('data-i'), 10)); break;
    case 'assistant-save-settings': saveAssistantSettings(); break;
    case 'assistant-settings': openAssistantSettings(); break;
    case 'assistant-top': assistantScrollTop(); break;
    case 'assistant-send': sendAssistantMessage(); break;
    case 'assistant-stop': stopAssistant(); break;
    case 'assistant-agent-run': runAgentCourse(); break;
    case 'export-data': exportData(); break;
    case 'import-data': {
      const input = document.getElementById('import-file');
      if (input) input.click();
      break;
    }
    case 'confirm-import': applyImport(); break;
    case 'reset-data': confirmReset(); break;
    case 'confirm-reset': resetData(); break;
    case 'new-course': startNewCourse(); break;
    case 'open-course': location.hash = '#/course/' + el.getAttribute('data-id'); break;
    case 'pick-icon':
      if (courseDraft) {
        collectDraft();
        courseDraft.icon = el.getAttribute('data-icon') || '✎';
        rerenderEditor();
      }
      break;
    case 'add-chapter': editorAddChapter(); break;
    case 'remove-chapter': editorRemoveChapter(el.getAttribute('data-id')); break;
    case 'move-chapter': editorMoveChapter(el.getAttribute('data-id'), parseInt(el.getAttribute('data-dir'), 10)); break;
    case 'add-block': editorAddBlock(el.getAttribute('data-type'), el.getAttribute('data-chapter')); break;
    case 'remove-block': editorRemoveBlock(el.getAttribute('data-id')); break;
    case 'move-block': editorMoveBlock(el.getAttribute('data-id'), parseInt(el.getAttribute('data-dir'), 10)); break;
    case 'save-course': saveCourseDraft(); break;
    case 'editor-cancel': cancelCourseEditor(); break;
    case 'delete-course': confirmDeleteCourse(el.getAttribute('data-id')); break;
    case 'confirm-delete-course': deleteCourse(el.getAttribute('data-id')); break;
    case 'focus-preset':
      setFocusMinutes(parseInt(el.getAttribute('data-min'), 10) || 25);
      break;
    case 'focus-toggle': toggleFocus(); break;
    case 'focus-reset': resetFocus(); break;
    case 'focus-finish': finishFocus(); break;
    case 'paper-domain':
      ui.paperDomain = el.getAttribute('data-domain');
      render();
      break;
    case 'paper-saved':
      ui.paperSaved = !ui.paperSaved;
      render();
      break;
    case 'paper-sort':
      ui.paperSort = el.getAttribute('data-sort') || 'cite';
      render();
      break;
    case 'scroll-to': {
      const target = document.getElementById(el.getAttribute('data-target'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
    default: break;
  }
}

document.addEventListener('click', function (e) {
  const actionEl = e.target.closest('[data-action]');
  if (actionEl) {
    handleAction(actionEl.getAttribute('data-action'), actionEl, e);
    return;
  }
  const backdrop = e.target.closest('.modal-backdrop');
  if (backdrop && e.target === backdrop) closeModal();
  const navLink = e.target.closest('#sidebar a');
  if (navLink) toggleSidebar(false);
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter') {
    const card = e.target.closest && e.target.closest('[data-action="open-course"]');
    if (card) location.hash = '#/course/' + card.getAttribute('data-id');
  }
});

window.addEventListener('hashchange', render);

document.addEventListener('DOMContentLoaded', function () {
  if (!location.hash) {
    try { history.replaceState(null, '', '#/dashboard'); } catch (err) { location.hash = '#/dashboard'; }
  }
  render();
  startOnlineTracker();
});
