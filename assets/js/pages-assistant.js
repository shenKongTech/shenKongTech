/* NEXUS AI · 页面：智能助手（DeepSeek 流式对话 / Agent 建课） */

let assistantAbort = null;
let assistantBusy = false;
let assistantDrawerOpen = false;
let assistantEditing = null;
let assistantMenu = null;

function assistantCfg() {
  return state.assistant;
}

function activeConversation() {
  const a = assistantCfg();
  return a.conversations.find(c => c.id === a.activeId) || null;
}

function newAssistantConversation(mode) {
  const a = assistantCfg();
  const conv = {
    id: uid(),
    title: '新对话',
    mode: mode || 'chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  a.conversations.unshift(conv);
  a.activeId = conv.id;
  saveState();
  return conv;
}

function ensureConversation() {
  return activeConversation() || newAssistantConversation('chat');
}

function assistantMsgHtml(m, i) {
  const mine = m.role === 'user';
  const tools = (!mine || assistantBusy) ? '' :
    '<div class="msg-menu-wrap">' +
      '<button class="msg-more" data-action="assistant-menu" data-i="' + i + '" aria-label="消息操作" title="更多操作">⋯</button>' +
      (assistantMenu === i
        ? '<div class="msg-menu">' +
            '<button data-action="assistant-edit" data-i="' + i + '">编辑</button>' +
            '<button data-action="assistant-delmsg" data-i="' + i + '">删除</button>' +
          '</div>'
        : '') +
    '</div>';
  return '<div class="msg' + (mine ? ' user' : '') + (assistantEditing === i ? ' editing' : '') + '" data-i="' + i + '">' +
    '<div class="msg-avatar">' + (mine ? esc(state.user.avatar || '探') : 'AI') + '</div>' +
    '<div class="msg-col">' +
      '<div class="msg-bubble">' + assistantMarkup(m.content) +
        (m.courseId ? '<div class="as-course-link"><a class="btn btn-tiny btn-soft" href="#/course/' + esc(m.courseId) + '">打开课程 →</a></div>' : '') +
      '</div>' +
      tools +
    '</div>' +
  '</div>';
}

function assistantMarkup(text) {
  const src = String(text || '');
  let out = '';
  src.split('```').forEach(function (part, i) {
    if (i % 2 === 1) {
      const nl = part.indexOf('\n');
      const lang = nl >= 0 ? part.slice(0, nl).trim() : '';
      const code = nl >= 0 ? part.slice(nl + 1) : part;
      out += '<pre class="as-code"><span class="as-code-lang">' + esc(lang || 'code') + '</span><code>' + esc(code.replace(/\n$/, '')) + '</code></pre>';
    } else {
      out += richTextHtml(part)
        .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }
  });
  return out || '<span class="muted">（空）</span>';
}

function conversationListHtml() {
  const a = assistantCfg();
  if (!a.conversations.length) return '<div class="small muted" style="padding:10px 2px">还没有对话，点击上方「新建对话」开始。</div>';
  return a.conversations.map(function (c) {
    return '<div class="as-conv' + (c.id === a.activeId ? ' active' : '') + '" data-action="assistant-open" data-id="' + c.id + '">' +
      '<div class="as-conv-body"><div class="as-conv-title">' + esc(c.title) + '</div>' +
      '<div class="as-conv-meta">' + (c.mode === 'agent' ? 'Agent' : '对话') + ' · ' + relDate(c.updatedAt) + '</div></div>' +
      '<button class="as-conv-del" data-action="assistant-del" data-id="' + c.id + '" title="删除对话" aria-label="删除对话">✕</button>' +
    '</div>';
  }).join('');
}

function renderAssistant() {
  const app = document.getElementById('app');
  const a = assistantCfg();
  const conv = activeConversation();
  const mode = conv ? conv.mode : 'chat';
  const hasKey = !!(a.apiKey || '').trim();

  const messages = conv ? conv.messages : [];
  const empty = '<div class="as-empty"><div class="as-empty-icon">✦</div><h3>开始你的 AI 学习对话</h3>' +
    '<p>配置 DeepSeek API Key 后即可使用流式对话；切换到「Agent 建课」，填写主题即可自动生成完整课程并保存到课程中心。</p></div>';

  app.innerHTML =
    '<div class="page-head">' +
      '<div><div class="eyebrow">AI Assistant</div><h1>智能助手</h1>' +
      '<div class="sub">接入 DeepSeek 开放平台（OpenAI 兼容格式），支持流式对话、历史记录与 Agent 自动建课。</div></div>' +
      '<div class="actions">' +
        '<span class="badge ' + (hasKey ? 'green' : '') + '">' + (hasKey ? '已配置 API Key' : '未配置 API Key') + '</span>' +
        '<button class="btn btn-ghost btn-sm" data-action="assistant-settings">API 配置</button>' +
        '<span class="badge">' + a.model + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="assistant-layout">' +
      '<section class="card as-main">' +
        '<div class="as-drawer-mask' + (assistantDrawerOpen ? ' show' : '') + '" data-action="assistant-drawer"></div>' +
        '<aside class="as-drawer' + (assistantDrawerOpen ? ' open' : '') + '">' +
          '<div class="as-drawer-head"><b>历史对话</b><button class="icon-btn" data-action="assistant-drawer" title="收起" aria-label="收起历史对话">✕</button></div>' +
          '<button class="btn btn-primary btn-block" data-action="assistant-new">＋ 新建对话</button>' +
          '<div class="as-conv-list">' + conversationListHtml() + '</div>' +
        '</aside>' +
        '<div class="as-head">' +
          '<div class="as-head-left">' +
            '<button class="as-menu" data-action="assistant-drawer" title="历史对话" aria-label="打开历史对话">☰</button>' +
            '<div><div class="as-title">' + esc(conv ? conv.title : '新对话') + '</div>' +
            '<div class="small muted">' + (conv ? messages.length : 0) + ' 条消息 · ' + (mode === 'agent' ? 'Agent 建课模式' : '流式对话模式') + '</div></div>' +
          '</div>' +
          '<div class="as-tabs">' +
            '<button class="chip' + (mode === 'chat' ? ' active' : '') + '" data-action="assistant-mode" data-mode="chat">流式对话</button>' +
            '<button class="chip' + (mode === 'agent' ? ' active' : '') + '" data-action="assistant-mode" data-mode="agent">Agent 建课</button>' +
          '</div>' +
        '</div>' +
        '<div class="as-msgs" id="as-msgs">' +
          (messages.length ? messages.map(assistantMsgHtml).join('') : empty) +
        '</div>' +
        '<div class="as-composer">' +
          (assistantEditing != null && messages[assistantEditing]
            ? '<div class="as-edit-banner"><span>正在编辑第 ' + (assistantEditing + 1) + ' 条消息，发送后将替换并重新生成回复</span>' +
              '<button class="btn btn-tiny btn-ghost" data-action="assistant-cancel-edit">取消编辑</button></div>'
            : '') +
          '<textarea class="textarea" id="as-input" rows="2" placeholder="' + (mode === 'agent' ? '也可以直接向 AI 提问，例如：帮我设计一门 3 章的 Transformer 入门课' : '向 AI 提问，Enter 发送，Shift + Enter 换行…') + '"></textarea>' +
          '<div class="as-actions">' +
            '<span class="small muted">' + (hasKey ? 'DeepSeek · ' + esc(a.model) : '请先点击「API 配置」填写 Key') + '</span>' +
            '<span class="as-btns"><button class="btn btn-ghost btn-sm" id="as-stop" style="display:none" data-action="assistant-stop">停止</button>' +
            '<button class="btn btn-primary btn-sm" id="as-send" data-action="assistant-send">发送</button></span>' +
          '</div>' +
        '</div>' +
        '<button class="as-top-btn" data-action="assistant-top" title="回到聊天顶部" aria-label="回到聊天顶部">↑</button>' +
      '</section>' +
    '</div>';

  const msgs = document.getElementById('as-msgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
  const input = document.getElementById('as-input');
  if (input) {
    if (assistantEditing != null && messages[assistantEditing]) {
      input.value = messages[assistantEditing].content;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAssistantMessage();
      }
    });
    input.focus();
  }
}

function agentFormHtml() {
  const domains = ['数学基础', '机器学习', '深度学习', '自然语言处理', '计算机视觉', '强化学习', '大模型', 'AI 应用'];
  return '<div class="agent-grid">' +
      '<div class="field"><label>课程主题 *</label><input class="input" id="ag-topic" placeholder="例如：Transformer 架构精讲"></div>' +
      '<div class="field"><label>知识领域</label><select class="select" id="ag-domain">' + domains.map(d => '<option value="' + esc(d) + '">' + esc(d) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>目标水平</label><select class="select" id="ag-level"><option>入门</option><option>进阶</option><option>高级</option></select></div>' +
      '<div class="field"><label>章节数量</label><input class="input" id="ag-chapters" type="number" min="1" max="8" value="4"></div>' +
    '</div>' +
    '<div class="field"><label>补充要求（可选）</label><textarea class="textarea" id="ag-extra" rows="2" placeholder="例如：多举工程实践例子，包含 Python 代码片段"></textarea></div>' +
    '<div class="small muted" style="margin:-4px 0 10px">生成流程：先规划大纲，再逐章撰写（每章 8-12 个内容块），章节越多耗时越长。</div>';
}

function openAgentCourseModal() {
  openModal(
    '<div class="modal-head"><div><h3>Agent 建课</h3><p>填写必要的提示词，AI 将生成课程章节与内容并保存到课程中心</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body">' + agentFormHtml() + '</div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="assistant-agent-run">生成课程</button></div>'
  );
  const t = document.getElementById('ag-topic');
  if (t) t.focus();
}

function assistantToggleDrawer() {
  assistantDrawerOpen = !assistantDrawerOpen;
  renderAssistant();
}

function openAssistantSettings() {
  const a = assistantCfg();
  openModal(
    '<div class="modal-head"><div><h3>API 配置</h3><p>接入 DeepSeek 开放平台（OpenAI 兼容格式）</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body">' +
      '<div class="field"><label>API Key</label><input class="input" id="as-key" type="password" placeholder="sk-..." autocomplete="off" value="' + esc(a.apiKey) + '"></div>' +
      '<div class="field"><label>Base URL（OpenAI 兼容）</label><input class="input" id="as-base" placeholder="https://api.deepseek.com" value="' + esc(a.baseUrl) + '"></div>' +
      '<div class="field"><label>模型</label><input class="input" id="as-model" placeholder="deepseek-flash" value="' + esc(a.model) + '"></div>' +
      '<div class="as-note">Key 仅保存在本机浏览器，不会上传到任何第三方服务。可在 platform.deepseek.com 获取。</div>' +
    '</div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="assistant-save-settings">保存配置</button></div>'
  );
}

function assistantScrollTop() {
  const msgs = document.getElementById('as-msgs');
  if (msgs) msgs.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveAssistantSettings() {
  const a = assistantCfg();
  const keyEl = document.getElementById('as-key');
  const baseEl = document.getElementById('as-base');
  const modelEl = document.getElementById('as-model');
  a.apiKey = ((keyEl && keyEl.value) || '').trim();
  a.baseUrl = (((baseEl && baseEl.value) || '').trim() || 'https://api.deepseek.com').replace(/\/+$/, '');
  a.model = (((modelEl && modelEl.value) || '').trim()) || 'deepseek-flash';
  saveState();
  closeModal();
  renderAssistant();
  showToast('配置已保存', a.apiKey ? '现在可以开始对话了' : '请填写 API Key 后使用', { icon: '✓' });
}

function assistantSetMode(mode) {
  assistantEditing = null;
  assistantMenu = null;
  if (mode === 'agent') {
    openAgentCourseModal();
    return;
  }
  const conv = ensureConversation();
  conv.mode = 'chat';
  conv.updatedAt = Date.now();
  saveState();
  renderAssistant();
}

function assistantOpen(id) {
  const a = assistantCfg();
  if (!a.conversations.some(c => c.id === id)) return;
  a.activeId = id;
  assistantDrawerOpen = false;
  assistantEditing = null;
  assistantMenu = null;
  saveState();
  renderAssistant();
}

function assistantDelete(id) {
  const a = assistantCfg();
  a.conversations = a.conversations.filter(c => c.id !== id);
  if (a.activeId === id) {
    a.activeId = a.conversations[0] ? a.conversations[0].id : null;
    assistantEditing = null;
    assistantMenu = null;
  }
  saveState();
  renderAssistant();
  showToast('对话已删除', '历史记录已更新', { icon: '✕' });
}

function assistantSystemPrompt(mode) {
  if (mode === 'agent') {
    return '你是 NEXUS AI 的课程设计助手，擅长把 AI 知识拆解为结构化课程。回答要准确、循序渐进、使用简体中文。';
  }
  return '你是 NEXUS AI 学习助手，帮助用户理解人工智能知识、制定学习计划与解释论文概念。回答简洁、结构清晰，可使用 Markdown、代码块与列表。';
}

function assistantPayload(mode, messages) {
  return {
    model: assistantCfg().model,
    messages: [{ role: 'system', content: assistantSystemPrompt(mode) }].concat(messages),
    stream: true,
    temperature: mode === 'agent' ? 0.5 : 0.7
  };
}

function assistantRequest(messages, mode) {
  const a = assistantCfg();
  return fetch(a.baseUrl.replace(/\/+$/, '') + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + a.apiKey
    },
    body: JSON.stringify(assistantPayload(mode, messages)),
    signal: assistantAbort ? assistantAbort.signal : undefined
  });
}

function assistantApiError(res) {
  return res.text().then(function (t) {
    let msg = t;
    try {
      const j = JSON.parse(t);
      msg = (j.error && (j.error.message || j.error.code)) || j.message || t;
    } catch (e) { /* ignore */ }
    throw new Error('HTTP ' + res.status + ' · ' + String(msg).slice(0, 200));
  });
}

function assistantBusyUi(on) {
  assistantBusy = on;
  const send = document.getElementById('as-send');
  const stop = document.getElementById('as-stop');
  const input = document.getElementById('as-input');
  if (send) send.style.display = on ? 'none' : '';
  if (stop) stop.style.display = on ? '' : 'none';
  if (input) input.disabled = on;
}

function assistantLiveUpdate(content) {
  const el = document.getElementById('as-live');
  if (el) {
    const bubble = el.querySelector('.msg-bubble');
    if (bubble) bubble.innerHTML = assistantMarkup(content);
    const msgs = document.getElementById('as-msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
}

function assistantAddLiveBubble() {
  const msgs = document.getElementById('as-msgs');
  if (!msgs) return;
  const empty = msgs.querySelector('.as-empty');
  if (empty) empty.remove();
  const div = document.createElement('div');
  div.className = 'msg';
  div.id = 'as-live';
  div.innerHTML = '<div class="msg-avatar">AI</div><div class="msg-bubble"><span class="as-typing">正在思考…</span></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function assistantNote(title, desc) {
  showToast(title, desc, { icon: '!' });
}

function assistantEditMessage(i) {
  const conv = activeConversation();
  if (!conv || !conv.messages[i] || conv.messages[i].role !== 'user') return;
  assistantEditing = i;
  assistantMenu = null;
  renderAssistant();
}

function assistantToggleMenu(i) {
  assistantMenu = assistantMenu === i ? null : i;
  renderAssistant();
}

function assistantCancelEdit() {
  assistantEditing = null;
  renderAssistant();
}

function assistantDeleteMessage(i) {
  const conv = activeConversation();
  if (!conv || !conv.messages[i]) return;
  assistantMenu = null;
  openModal(
    '<div class="modal-head"><div><h3>删除这条消息？</h3><p>对应的 AI 回复也会一并删除</p></div>' +
      '<button class="modal-close" data-action="close-modal">✕</button></div>' +
    '<div class="modal-body"><p class="modal-note">仅影响本机保存的对话记录，不影响课程与学习数据。</p></div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-soft" data-action="assistant-delmsg-ok" data-i="' + i + '">确认删除</button></div>'
  );
}

function assistantDeleteMessageDo(i) {
  const conv = activeConversation();
  if (!conv || !conv.messages[i]) { closeModal(); return; }
  const isUser = conv.messages[i].role === 'user';
  const next = conv.messages[i + 1];
  const count = (isUser && next && next.role === 'assistant') ? 2 : 1;
  conv.messages.splice(i, count);
  if (assistantEditing != null) {
    assistantEditing = assistantEditing >= i + count ? assistantEditing - count : (assistantEditing >= i ? null : assistantEditing);
  }
  conv.updatedAt = Date.now();
  saveState();
  closeModal();
  renderAssistant();
  showToast('消息已删除', count > 1 ? '对应的 AI 回复已一并删除' : '对话记录已更新', { icon: '✕' });
}

function sendAssistantMessage() {
  if (assistantBusy) return;
  const a = assistantCfg();
  if (!(a.apiKey || '').trim()) {
    assistantNote('请先配置 API Key', '在左侧填写 DeepSeek API Key 并保存');
    const el = document.getElementById('as-key');
    if (el) el.focus();
    return;
  }
  const input = document.getElementById('as-input');
  const text = ((input && input.value) || '').trim();
  if (!text) { assistantNote('请输入内容', '问题不能为空'); return; }

  const conv = ensureConversation();
  assistantMenu = null;
  if (assistantEditing != null && conv.messages[assistantEditing] && conv.messages[assistantEditing].role === 'user') {
    conv.messages[assistantEditing].content = text;
    conv.messages.length = assistantEditing + 1;
    assistantEditing = null;
  } else {
    assistantEditing = null;
    conv.messages.push({ role: 'user', content: text });
  }
  conv.updatedAt = Date.now();
  if (conv.title === '新对话') conv.title = text.slice(0, 20);
  saveState();
  renderAssistant();
  assistantAddLiveBubble();
  assistantBusyUi(true);

  assistantAbort = new AbortController();
  const reply = { role: 'assistant', content: '' };
  assistantRequest(conv.messages.slice(), conv.mode).then(function (res) {
    if (!res.ok) return assistantApiError(res);
    if (!res.body) return res.json().then(function (j) {
      reply.content = ((j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '').trim();
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    function pump() {
      return reader.read().then(function (r) {
        if (r.done) return;
        buf += decoder.decode(r.value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        lines.forEach(function (line) {
          const s = line.trim();
          if (!s || s.indexOf('data:') !== 0) return;
          const data = s.slice(5).trim();
          if (!data || data === '[DONE]') return;
          try {
            const j = JSON.parse(data);
            const delta = j.choices && j.choices[0] && j.choices[0].delta;
            if (delta && delta.content) {
              reply.content += delta.content;
              assistantLiveUpdate(reply.content);
            }
          } catch (e) { /* 忽略不完整分片 */ }
        });
        return pump();
      });
    }
    return pump();
  }).then(function () {
    if (!reply.content) reply.content = '（未收到回复，请稍后重试）';
    conv.messages.push(reply);
    conv.updatedAt = Date.now();
    saveState();
    assistantBusyUi(false);
    renderAssistant();
  }).catch(function (err) {
    const aborted = err && err.name === 'AbortError';
    reply.content = (reply.content || '') + (aborted ? '\n\n（已停止生成）' : '\n\n请求失败：' + (err && err.message ? err.message : '网络错误'));
    conv.messages.push(reply);
    conv.updatedAt = Date.now();
    saveState();
    assistantBusyUi(false);
    assistantAbort = null;
    renderAssistant();
    if (!aborted) assistantNote('请求失败', '请检查 API Key、Base URL 与网络连接');
  });
}

function stopAssistant() {
  if (assistantAbort) assistantAbort.abort();
}

/* ---------- Agent 建课 ---------- */
function assistantJsonCandidates(raw) {
  const text = String(raw || '').trim();
  const fence = text.match(/```(?:json)?([\s\S]*?)```/i);
  const body = fence ? fence[1].trim() : text;
  const start = body.indexOf('{');
  if (start < 0) return [];
  const end = body.lastIndexOf('}');
  const bases = [body];
  if (end > start) {
    const cut = body.slice(start, end + 1);
    if (bases.indexOf(cut) < 0) bases.push(cut);
  }
  const rest = body.slice(start);
  if (bases.indexOf(rest) < 0) bases.push(rest);
  const out = [];
  bases.forEach(function (base) {
    out.push(base);
    const repaired = repairJsonText(base);
    if (repaired !== base) out.push(repaired);
  });
  return out;
}

// 容错修复：转义字符串内的裸换行与未转义引号、去掉尾逗号、补全被截断的括号
function repairJsonText(src) {
  let out = '';
  const stack = [];
  let inStr = false;
  let esc = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (esc) { out += ch; esc = false; continue; }
      if (ch === '\\') { out += ch; esc = true; continue; }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') { out += '\\r'; continue; }
      if (ch === '\t') { out += '\\t'; continue; }
      if (ch === '"') {
        let j = i + 1;
        while (j < src.length && /\s/.test(src[j])) j++;
        const next = src[j];
        if (next === undefined || next === ':' || next === ',' || next === '}' || next === ']') {
          inStr = false;
          out += ch;
        } else {
          out += '\\"';
        }
        continue;
      }
      out += ch;
      continue;
    }
    if (ch === '"') { inStr = true; out += ch; continue; }
    if (ch === '{' || ch === '[') { stack.push(ch); out += ch; continue; }
    if (ch === '}' || ch === ']') {
      if (stack.length) stack.pop();
      out += ch;
      continue;
    }
    out += ch;
  }
  if (inStr) {
    out = out.replace(/\\u[0-9a-fA-F]{0,3}$/, '');
    if (/\\$/.test(out)) out += '\\';
    out += '"';
  }
  out = out.replace(/,\s*([}\]])/g, '$1');
  while (stack.length) out += stack.pop() === '{' ? '}' : ']';
  return out;
}

function agentParseObject(raw) {
  const candidates = assistantJsonCandidates(raw);
  for (let i = 0; i < candidates.length; i++) {
    try { return JSON.parse(candidates[i]); } catch (e) { /* 尝试下一个候选 */ }
  }
  throw new Error('课程 JSON 解析失败，请重试');
}

function agentBlocks(input) {
  return (Array.isArray(input) ? input : []).map(function (b) {
    if (!b || typeof b !== 'object') return null;
    if (b.type === 'heading') {
      const t = String(b.text || '').trim();
      return t ? { type: 'heading', level: clamp(parseInt(b.level, 10) || 2, 1, 3), text: t } : null;
    }
    if (b.type === 'code') {
      return b.code ? { type: 'code', lang: String(b.lang || 'code'), code: String(b.code) } : null;
    }
    const t = String(b.text || '').trim();
    return t ? { type: 'text', text: t } : null;
  }).filter(Boolean);
}

function agentJsonRules() {
  return '只输出一个 JSON 对象，不要输出解释或 Markdown 围栏。JSON 合法性：字符串内禁止出现英文双引号（需要引用时用「」）；禁止出现真实换行（分段用 \\n 转义）；禁止尾随逗号。';
}

function agentApiJson(a, messages, signal, maxTokens, jsonMode) {
  const payload = {
    model: a.model,
    messages: messages,
    stream: false,
    temperature: 0.6,
    max_tokens: maxTokens
  };
  if (jsonMode) payload.response_format = { type: 'json_object' };
  return fetch(a.baseUrl.replace(/\/+$/, '') + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + a.apiKey },
    body: JSON.stringify(payload),
    signal: signal
  }).then(function (res) {
    if (!res.ok) return assistantApiError(res);
    return res.json();
  }).then(function (j) {
    return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
  });
}

// 将 Markdown 片段解析为内容块：标题 / 代码围栏 / 正文段落
function agentInlineText(s) {
  return String(s || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').replace(/`([^`]+)`/g, '$1').trim();
}

function agentMarkdownToBlocks(md) {
  const lines = String(md || '').replace(/\r/g, '').split('\n');
  const blocks = [];
  let para = [];
  let inCode = false;
  let codeLang = 'code';
  let codeLines = [];

  function flushPara() {
    if (!para.length) return;
    const t = agentInlineText(para.join('\n'));
    para = [];
    if (t) blocks.push({ type: 'text', text: t });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^\s*```([\w+#.-]*)\s*$/);
    if (inCode) {
      if (fence) {
        const code = codeLines.join('\n').replace(/^\n+|\n+$/g, '');
        if (code.trim()) blocks.push({ type: 'code', lang: codeLang || 'code', code: code });
        inCode = false;
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }
    if (fence) {
      flushPara();
      inCode = true;
      codeLang = fence[1] || 'code';
      continue;
    }
    const h = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (h) {
      flushPara();
      blocks.push({ type: 'heading', level: clamp(h[1].length, 1, 3), text: agentInlineText(h[2]) });
      continue;
    }
    if (!line.trim()) { flushPara(); continue; }
    para.push(line.trim());
  }
  if (inCode && codeLines.length) {
    const code = codeLines.join('\n').trim();
    if (code) blocks.push({ type: 'code', lang: codeLang || 'code', code: code });
  }
  flushPara();
  return blocks;
}

function agentChapterTitle(t) {
  return String(t || '').replace(/^第\s*[0-9一二三四五六七八九十]+\s*章[\s：:·.、-]*/, '').trim();
}

function agentBuildCourse(outline, contents, fallbackDomain, fallbackLevel) {
  const chapters = contents.map(function (item, i) {
    const d = item.data || {};
    let blocks = agentBlocks(d.blocks);
    if (!blocks.length) blocks = [{ type: 'text', text: '本章内容生成失败，可在课程编辑中补充。' }];
    return {
      id: uid(),
      title: agentChapterTitle(d.title || item.def.title) || ('第' + (i + 1) + '章'),
      blocks: blocks
    };
  });
  const tags = Array.isArray(outline.tags) ? outline.tags.map(t => String(t)).filter(Boolean).slice(0, 6) : [];
  return {
    id: 'uc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    custom: true,
    title: String(outline.title || '未命名课程').trim(),
    subtitle: String(outline.subtitle || '').trim(),
    desc: String(outline.desc || '').trim(),
    domain: String(outline.domain || fallbackDomain || 'AI 应用').trim(),
    level: String(outline.level || fallbackLevel || '入门').trim(),
    icon: '✧',
    color: '#7c5cff',
    tags: tags,
    chapters: chapters,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function agentChapterContent(text) {
  const s = String(text || '').trim();
  if (s.charAt(0) === '{' || /```json/i.test(s)) {
    try {
      const obj = agentParseObject(s);
      const fromJson = agentBlocks(obj.blocks);
      if (fromJson.length) return fromJson;
    } catch (e) { /* 退回 Markdown 解析 */ }
  }
  return agentMarkdownToBlocks(text);
}

function agentFillChapters(a, outline, defs, count, signal) {
  if (defs.length >= count) return Promise.resolve(defs);
  const missing = count - defs.length;
  const exist = defs.map(function (d) { return d.title; }).filter(Boolean).join('、');
  const messages = [
    { role: 'system', content: '你是资深的 AI 课程架构师。' + agentJsonRules() },
    { role: 'user', content: '课程《' + (outline.title || '') + '》（领域：' + (outline.domain || '') + '，水平：' + (outline.level || '') + '）已有章节：' + exist +
      '。请补充 ' + missing + ' 个后续章节，与已有章节循序渐进且不重复。只输出结构：{"chapters":[{"title":"章节标题","summary":"60-100 字","keyPoints":["关键点 1","关键点 2","关键点 3"]}]}' }
  ];
  return agentApiJson(a, messages, signal, 1500, true).then(function (text) {
    const extra = agentParseObject(text).chapters;
    return defs.concat(Array.isArray(extra) ? extra : []).slice(0, count);
  }).catch(function () { return defs; });
}

function runAgentCourse() {
  if (assistantBusy) return;
  const a = assistantCfg();
  if (!(a.apiKey || '').trim()) {
    assistantNote('请先配置 API Key', 'Agent 建课需要调用 DeepSeek API');
    return;
  }
  const topicEl = document.getElementById('ag-topic');
  const topic = ((topicEl && topicEl.value) || '').trim();
  if (!topic) { assistantNote('请填写课程主题', '主题是生成课程的必需信息'); if (topicEl) topicEl.focus(); return; }
  const domain = (document.getElementById('ag-domain') || {}).value || '大模型';
  const level = (document.getElementById('ag-level') || {}).value || '入门';
  const count = clamp(parseInt((document.getElementById('ag-chapters') || {}).value, 10) || 4, 1, 8);
  const extra = ((document.getElementById('ag-extra') || {}).value || '').trim();
  closeModal();

  const conv = ensureConversation();
  conv.mode = 'agent';
  conv.title = '建课 · ' + topic.slice(0, 14);
  const userText = '请生成课程：' + topic + '（' + domain + ' · ' + level + ' · ' + count + ' 章）' + (extra ? '\n补充要求：' + extra : '');
  conv.messages.push({ role: 'user', content: userText });
  conv.updatedAt = Date.now();
  saveState();
  renderAssistant();
  assistantAddLiveBubble();
  assistantBusyUi(true);
  assistantLiveUpdate('正在规划课程大纲…');

  assistantAbort = new AbortController();
  const signal = assistantAbort.signal;
  const outlineMessages = [
    { role: 'system', content: '你是资深的 AI 课程架构师与教学设计师，擅长把主题拆解成循序渐进、知识点密集的课程大纲。' + agentJsonRules() },
    { role: 'user', content: '请为以下课程设计大纲：\n主题：' + topic + '\n知识领域：' + domain + '\n目标水平：' + level + '\n章节数量：' + count + (extra ? '\n补充要求：' + extra : '') +
      '\n\n输出结构：{"title":"课程名","subtitle":"一句话副标题","desc":"课程简介 120-200 字","domain":"知识领域","level":"入门|进阶|高级","tags":["3-5 个标签"],' +
      '"chapters":[{"title":"章节标题","summary":"本章讲什么，60-100 字","keyPoints":["关键点 1","关键点 2","关键点 3"]}]}' +
      '\n要求：共 ' + count + ' 章；章节之间循序渐进、无重复，覆盖该主题的核心知识体系；每章 3-5 个 keyPoints，确保知识点具体而非泛泛而谈。' }
  ];

  agentApiJson(a, outlineMessages, signal, 2500, true).then(function (text) {
    const outline = agentParseObject(text);
    let defs = (Array.isArray(outline.chapters) ? outline.chapters : []).slice(0, count);
    if (!defs.length) throw new Error('大纲中没有章节');
    const contents = [];
    const failMessages = [];

    function partMessages(def, i, part, keys, doneHeadings, hint) {
      const kps = keys.map(k => '- ' + k).join('\n');
      const head = '课程：《' + (outline.title || topic) + '》' + (outline.subtitle ? '——' + outline.subtitle : '') +
        '\n本章：第 ' + (i + 1) + ' / ' + defs.length + ' 章《' + (def.title || '') + '》' +
        '\n章节定位：' + (def.summary || '') +
        (kps ? '\n本部分要讲的知识点：\n' + kps : '') +
        (part === 2 && doneHeadings ? '\n前文已写小节：' + doneHeadings + '（不要重复）' : '') +
        '\n目标读者：' + (outline.level || level);
      const rules = part === 1
        ? '\n\n输出要求：\n1. 用 Markdown 只输出本章前半部分，直接从「## 小节标题」开始，不要任何开场说明；\n' +
          '2. 写 2-3 个小节，每小节 2-3 个自然段，每段 180-300 字，讲清定义、原理与具体例子；\n' +
          '3. 需要展示代码时必须使用 ```语言 围栏代码块，禁止把代码写进正文段落；\n' +
          '4. 公式必须用 $...$ 或 $$...$$ 包裹的 LaTeX 表示，例如 $\\mathrm{softmax}(QK^T/\\sqrt{d_k})V$；\n' +
          '5. 不要写本章小结。'
        : '\n\n输出要求：\n1. 用 Markdown 只输出本章后半部分，直接从「## 小节标题」开始，不要开场说明；\n' +
          '2. 写 2-3 个小节，每小节 2-3 个自然段，每段 180-300 字；\n' +
          '3. 需要展示代码时必须使用 ```语言 围栏代码块；\n' +
          '4. 公式必须用 $...$ 或 $$...$$ 包裹的 LaTeX 表示；\n' +
          '5. 最后用「## 本章小结」写一段 120-200 字总结。';
      const hintText = hint === 'expand' ? '\n6. 上一次输出内容过少，本次请写满 3 个小节，正文不少于 5 段。' : '';
      return [
        { role: 'system', content: '你是严谨的 AI 课程内容作者。用 Markdown 输出可直接学习的章节正文，讲解深入、例子具体。禁止输出 JSON，禁止输出解释性开场白。' },
        { role: 'user', content: head + rules + hintText }
      ];
    }

    function genChapter(i) {
      if (i >= defs.length) return Promise.resolve();
      const def = defs[i];
      const allPoints = (Array.isArray(def.keyPoints) ? def.keyPoints : []).filter(Boolean).slice(0, 6);
      const mid = allPoints.length > 1 ? Math.ceil(allPoints.length / 2) : allPoints.length;
      const parts = [allPoints.slice(0, mid), allPoints.slice(mid)];
      let merged = [];
      let fallbackTried = false;

      function finalize() {
        if (!merged.length) {
          failMessages.push('「' + (def.title || ('第' + (i + 1) + '章')) + '」内容为空');
          contents.push({ def: def, data: null });
        } else {
          contents.push({ def: def, data: { blocks: merged.slice() } });
        }
        return genChapter(i + 1);
      }

      function completeChapter() {
        assistantLiveUpdate('正在补全第 ' + (i + 1) + ' / ' + defs.length + ' 章 · ' + (def.title || '') + '…');
        const points = allPoints.map(k => '- ' + k).join('\n');
        const messages = [
          { role: 'system', content: '你是严谨的 AI 课程内容作者。用 Markdown 输出完整章节正文，禁止输出 JSON 与解释性开场白。' },
          { role: 'user', content: '课程：《' + (outline.title || topic) + '》\n本章：第 ' + (i + 1) + ' / ' + defs.length + ' 章《' + (def.title || '') + '》\n章节定位：' + (def.summary || '') +
            (points ? '\n必须覆盖的知识点：\n' + points : '') +
            '\n目标读者：' + (outline.level || level) +
            '\n\n输出要求：\n1. 用 Markdown 输出本章完整内容，从「## 小节标题」开始；\n2. 写 3-4 个小节，每小节 2 个自然段，每段 180-300 字，讲清定义、原理与例子；\n3. 公式使用 $...$ 形式的 LaTeX；\n4. 需要展示代码时使用 ```语言 围栏代码块；\n5. 最后用「## 本章小结」写一段 120-200 字总结。' }
        ];
        return agentApiJson(a, messages, signal, 3500, false).then(function (t) {
          const blocks = agentChapterContent(t);
          if (blocks.length > merged.length) merged = blocks;
          return finalize();
        }, function (err) {
          if (err && err.name === 'AbortError') throw err;
          return finalize();
        });
      }

      function genPart(pi) {
        if (pi >= 2) {
          if (merged.length < 6 && !fallbackTried) {
            fallbackTried = true;
            return completeChapter();
          }
          return finalize();
        }
        assistantLiveUpdate('正在撰写第 ' + (i + 1) + ' / ' + defs.length + ' 章 · ' + (def.title || '') + '（' + (pi + 1) + '/2）…');
        const headings = merged.filter(b => b.type === 'heading').map(b => b.text).slice(-4).join('、');

        function attempt(n, hint) {
          const nodes = partMessages(def, i, pi + 1, parts[pi], headings, hint);
          return agentApiJson(a, nodes, signal, 3500, false).then(function (t) {
            const blocks = agentChapterContent(t);
            if (blocks.length < 2 && n < 2) return attempt(n + 1, 'expand');
            const seen = {};
            merged.forEach(function (b) { if (b.type === 'heading') seen[b.text] = 1; });
            blocks.forEach(function (b) {
              if (b.type === 'heading') {
                if (seen[b.text]) return;
                seen[b.text] = 1;
              }
              merged.push(b);
            });
            return genPart(pi + 1);
          }, function (err) {
            if (err && err.name === 'AbortError') throw err;
            if (n < 2) return new Promise(function (r) { setTimeout(r, 1200); }).then(function () { return attempt(n + 1, 'expand'); });
            return genPart(pi + 1);
          });
        }
        return attempt(0, '');
      }
      return genPart(0);
    }

    function hasSummary(blocks) {
      return blocks.some(b => b.type === 'heading' && /小结|总结/.test(b.text || ''));
    }

    // 章节完整性检查：块数、小结、结尾是否中断
    function chapterIncomplete(entry) {
      const blocks = (entry.data && entry.data.blocks) || [];
      if (blocks.length < 8) return true;
      if (!hasSummary(blocks)) return true;
      const tail = blocks[blocks.length - 1];
      if (!tail || tail.type !== 'text') return true;
      const t = String(tail.text || '').trim();
      return !t || !/[。！？；：…」”’\)]$/.test(t);
    }

    // 对任意一章补全缺失内容，保证小结收尾
    function completeChapter(entry, idx) {
      const blocks = (entry.data && entry.data.blocks) || [];
      const isLast = idx === contents.length - 1;
      function summaryFallback() {
        if (!entry.data) entry.data = { blocks: [] };
        const list = entry.data.blocks || (entry.data.blocks = []);
        if (!list.length) {
          list.push({ type: 'heading', level: 2, text: entry.def.title || '本章内容' });
          list.push({ type: 'text', text: entry.def.summary || '本章内容暂缺，可删除课程后重新生成。' });
        }
        if (!hasSummary(list)) {
          const points = (Array.isArray(entry.def.keyPoints) ? entry.def.keyPoints : []).slice(0, 4);
          list.push({ type: 'heading', level: 2, text: '本章小结' });
          list.push({
            type: 'text',
            text: '本章围绕「' + (entry.def.title || '') + '」展开' + (entry.def.summary ? '：' + entry.def.summary : '') + '。' +
              (points.length ? '关键要点包括：' + points.join('；') + '。' : '') +
              '建议结合本章的示例与代码动手复现，把概念转化为可操作的实践。'
          });
        }
      }
      if (!chapterIncomplete(entry)) return Promise.resolve();
      assistantLiveUpdate('正在补全第 ' + (idx + 1) + '/' + contents.length + ' 章 · ' + (entry.def.title || '') + '…');
      const done = blocks.filter(b => b.type === 'heading').map(b => b.text).join('、');
      const tail = blocks[blocks.length - 1];
      const tailText = tail && tail.type === 'text' ? String(tail.text || '').trim() : '';
      function run() {
        const messages = [
          { role: 'system', content: '你是严谨的 AI 课程内容作者。用 Markdown 输出章节内容，禁止输出 JSON 与解释性开场白。' },
          { role: 'user', content: '课程：《' + (outline.title || topic) + '》\n这是课程的第 ' + (idx + 1) + ' / ' + contents.length + ' 章《' + (entry.def.title || '') + '》' + (isLast ? '（最后一章）' : '') + '\n章节定位：' + (entry.def.summary || '') +
            (done ? '\n已完成的小节：' + done + '（不要重复这些标题）' : '\n本章尚未产出有效内容。') +
            (tailText ? '\n当前结尾片段：' + tailText.slice(-160) : '') +
            '\n\n输出要求：\n1. 直接以「## 小节标题」开始，输出本章缺失的部分；\n2. 若结尾片段在句中截断，先自然补全该句（不要重复片段已有的文字），再另起小节；\n3. 内容不足时补充 1-2 个小节，每节 2 段、每段 180-300 字；\n4. 必须包含「## 本章小结」，写一段 120-200 字的总结，回顾本章脉络并给出实践建议；\n5. 公式用 $...$，代码用 ```语言 围栏；\n6. 不要重复已有小节，不要输出任何解释。' }
        ];
        return agentApiJson(a, messages, signal, 2600, false).then(function (t) {
          const extra = agentChapterContent(t);
          if (!entry.data) entry.data = { blocks: [] };
          if (!entry.data.blocks) entry.data.blocks = [];
          const list = entry.data.blocks;
          const existSummary = hasSummary(list);
          let extras = extra;
          if (existSummary) {
            const cut = extras.findIndex(b => b.type === 'heading' && /小结|总结/.test(b.text || ''));
            if (cut >= 0) extras = extras.slice(0, cut);
          }
          const titles = {};
          list.forEach(function (b) { if (b.type === 'heading') titles[b.text] = 1; });
          const add = [];
          extras.forEach(function (b) {
            if (b.type === 'heading') {
              if (titles[b.text]) return;
              titles[b.text] = 1;
            }
            add.push(b);
          });
          if (add.length) {
            const si = existSummary ? list.findIndex(b => b.type === 'heading' && /小结|总结/.test(b.text || '')) : -1;
            if (si >= 0) list.splice.apply(list, [si, 0].concat(add));
            else list.push.apply(list, add);
          }
          summaryFallback();
        }, function (err) {
          if (err && err.name === 'AbortError') throw err;
          if (!entry.data) return summaryFallback();
          summaryFallback();
        });
      }
      return run();
    }

    function completeChapters() {
      let p = Promise.resolve();
      contents.forEach(function (entry, idx) {
        p = p.then(function () { return completeChapter(entry, idx); });
      });
      return p;
    }

    return agentFillChapters(a, outline, defs, count, signal).then(function (list) {
      defs = list;
      return genChapter(0);
    }).then(completeChapters).then(function () {
      contents.forEach(function (e) {
        if (!e.data || !(e.data.blocks || []).length) return;
        for (let k = failMessages.length - 1; k >= 0; k--) {
          if (e.def.title && failMessages[k].indexOf(e.def.title) >= 0) failMessages.splice(k, 1);
        }
      });
      const course = agentBuildCourse(outline, contents, domain, level);
      const blockTotal = course.chapters.reduce((s, ch) => s + ch.blocks.length, 0);
      state.customCourses.unshift(course);
      saveState();
      conv.messages.push({
        role: 'assistant',
        content: '已为你创建课程《' + course.title + '》，包含 ' + course.chapters.length + ' 个章节、' + blockTotal + ' 个内容块，已保存到课程中心。' +
          (failMessages.length ? '\n\n其中 ' + failMessages.length + ' 章生成失败，已保留占位内容，可在课程编辑中补充或重新生成。\n首个错误：' + failMessages[0] : ''),
        courseId: course.id
      });
      conv.updatedAt = Date.now();
      saveState();
      assistantBusyUi(false);
      assistantAbort = null;
      renderAssistant();
      showToast('课程创建成功', '《' + course.title + '》共 ' + blockTotal + ' 个内容块', { icon: '✓' });
    });
  }).catch(function (err) {
    const aborted = err && err.name === 'AbortError';
    conv.messages.push({
      role: 'assistant',
      content: aborted ? '已停止生成课程。' : '课程生成失败：' + (err && err.message ? err.message : '网络错误') + '\n\n可以调整主题后重试。'
    });
    conv.updatedAt = Date.now();
    saveState();
    assistantBusyUi(false);
    assistantAbort = null;
    renderAssistant();
    if (!aborted) assistantNote('生成失败', '请检查网络或稍后重试');
  });
}
