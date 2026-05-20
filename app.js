// ── Firebase ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-pWCZqu_wqghj65pix_kOIh_BkuNaOOM",
  authDomain: "banco-cw.firebaseapp.com",
  databaseURL: "https://banco-cw-default-rtdb.firebaseio.com",
  projectId: "banco-cw",
  storageBucket: "banco-cw.firebasestorage.app",
  messagingSenderId: "1005772037818",
  appId: "1:1005772037818:web:d11d5f6bfb55ada945ac83",
  measurementId: "G-SQQKV7WDX6"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── Config ──
const MEMBERS  = ['Victor', 'Leticia', 'Neto', 'Ygaro', 'Joab'];
const PASSWORD = 'cardapinho2026';

let localData    = {};
MEMBERS.forEach(m => (localData[m] = {}));

let pendingDelete  = null;
let undoTimeout    = null;
let undoItem       = null;
let filterText     = '';
let filterMember   = '';
let sortMode       = 'newest';

// ── [NOVO] Sincronizar filtros com a URL ──
function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  filterText   = params.get('q')      || '';
  filterMember = params.get('member') || '';
  sortMode     = params.get('sort')   || 'newest';
}

function pushFiltersToURL() {
  const params = new URLSearchParams();
  if (filterText)             params.set('q',      filterText);
  if (filterMember)           params.set('member', filterMember);
  if (sortMode !== 'newest')  params.set('sort',   sortMode);
  const newURL = params.toString()
    ? `${location.pathname}?${params.toString()}`
    : location.pathname;
  history.replaceState(null, '', newURL);
}

// Lê os filtros da URL antes do primeiro render
readFiltersFromURL();

// ── Renderiza imediatamente ──
render();

// Sincroniza os controles visuais com os filtros da URL
(function syncControls() {
  const searchInput   = document.getElementById('search-input');
  const memberSelect  = document.getElementById('member-select');
  if (searchInput)  searchInput.value  = filterText;
  if (memberSelect) memberSelect.value = filterMember;
})();

// ── Escutar Firebase em tempo real ──
MEMBERS.forEach(member => {
  const memberRef = ref(db, 'melhorias/' + member);
  onValue(memberRef, snapshot => {
    localData[member] = snapshot.val() || {};
    render();
  });
});

// ── Utilitários ──
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function sortItems(items) {
  const arr = [...items];
  if (sortMode === 'newest') return arr.sort((a, b) => b.ts - a.ts);
  if (sortMode === 'oldest') return arr.sort((a, b) => a.ts - b.ts);
  if (sortMode === 'alpha')  return arr.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return arr;
}

function filterItems(items) {
  if (!filterText) return items;
  return items.filter(i => i.name.toLowerCase().includes(filterText.toLowerCase()));
}

// ── [NOVO] Notificação de erro inline ──
function showError(message) {
  const existing = document.getElementById('error-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'error-toast';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span>⚠️ ${message}</span>
    <button onclick="this.parentElement.remove()" aria-label="Fechar">×</button>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast && toast.remove(), 6000);
}

// ── [NOVO] Notificação de sucesso ──
function showSuccess(message) {
  const existing = document.getElementById('success-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'success-toast';
  toast.className = 'success-toast';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span>✅ ${message}</span>
    <button onclick="this.parentElement.remove()" aria-label="Fechar">×</button>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast && toast.remove(), 5000);
}

// ── Adicionar ──
function add(member) {
  const inp = document.getElementById('i-' + member);
  const val = inp.value.trim();
  if (!val) return;

  const btn = inp.nextElementSibling;
  inp.disabled = true;
  if (btn) btn.disabled = true;

  const memberRef = ref(db, 'melhorias/' + member);
  push(memberRef, { name: val, ts: Date.now() })
    .then(() => {
      inp.value = '';
      flashSuccess(member);
    })
    .catch(err => {
      console.error('Erro ao adicionar:', err);
      showError('Não foi possível adicionar. Verifique sua conexão.');
    })
    .finally(() => {
      inp.disabled = false;
      if (btn) btn.disabled = false;
      inp.focus();
    });
}

function flashSuccess(member) {
  setTimeout(() => {
    const row = document.querySelector(`[data-member="${member}"]`);
    if (!row) return;
    row.classList.add('flash-success');
    setTimeout(() => row.classList.remove('flash-success'), 800);
  }, 100);
}

// ── Editar ──
function startEdit(member, firebaseKey) {
  const item = localData[member][firebaseKey];
  if (!item) return;
  const el = document.getElementById('item-' + firebaseKey);
  if (!el) return;
  el.innerHTML = `
    <input class="edit-input" id="edit-${firebaseKey}" value="${item.name.replace(/"/g, '&quot;')}" />
    <button class="edit-save-btn" onclick="saveEdit('${member}', '${firebaseKey}')">✓</button>
    <button class="edit-cancel-btn" onclick="render()">✕</button>
  `;
  const inp = document.getElementById('edit-' + firebaseKey);
  inp.focus();
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter')  saveEdit(member, firebaseKey);
    if (e.key === 'Escape') render();
  });
}

function saveEdit(member, firebaseKey) {
  const inp = document.getElementById('edit-' + firebaseKey);
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;

  inp.disabled = true;
  const saveBtn   = inp.nextElementSibling;
  const cancelBtn = saveBtn ? saveBtn.nextElementSibling : null;
  if (saveBtn)   saveBtn.disabled   = true;
  if (cancelBtn) cancelBtn.disabled = true;

  const itemRef = ref(db, `melhorias/${member}/${firebaseKey}`);
  update(itemRef, { name: val })
    .catch(err => {
      console.error('Erro ao editar:', err);
      showError('Não foi possível salvar a edição. Verifique sua conexão.');
      if (inp)       inp.disabled       = false;
      if (saveBtn)   saveBtn.disabled   = false;
      if (cancelBtn) cancelBtn.disabled = false;
    });
}

// ── Deletar ──
function removeItem(member, firebaseKey) {
  pendingDelete = { member, firebaseKey };
  document.getElementById('pw-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('modal-pw').focus(), 50);
}

function closeModal() {
  document.getElementById('pw-modal').style.display = 'none';
  document.getElementById('modal-pw').value = '';
  document.getElementById('modal-err').textContent = '';
  document.getElementById('modal-pw').classList.remove('error');
  pendingDelete = null;
}

function confirmDelete() {
  const pw  = document.getElementById('modal-pw').value;
  const inp = document.getElementById('modal-pw');
  const err = document.getElementById('modal-err');

  if (pw !== PASSWORD) {
    inp.classList.add('error');
    err.textContent = 'Senha incorreta. Tente novamente.';
    inp.value = '';
    setTimeout(() => inp.classList.remove('error'), 400);
    return;
  }

  const { member, firebaseKey } = pendingDelete;
  const item    = localData[member][firebaseKey];
  const itemRef = ref(db, `melhorias/${member}/${firebaseKey}`);

  closeModal();

  remove(itemRef)
    .then(() => {
      showUndo(member, item);
    })
    .catch(err => {
      console.error('Erro ao deletar:', err);
      showError('Não foi possível deletar. Verifique sua conexão.');
    });
}

// ── Desfazer exclusão ──
function showUndo(member, item) {
  if (undoTimeout) clearTimeout(undoTimeout);
  undoItem = { member, item };
  const toast = document.getElementById('undo-toast');
  document.getElementById('undo-label').textContent = `"${item.name.length > 30 ? item.name.slice(0,30)+'…' : item.name}" removido`;
  toast.classList.add('show');
  undoTimeout = setTimeout(hideUndo, 5000);
}

function hideUndo() {
  document.getElementById('undo-toast').classList.remove('show');
  undoItem = null;
}

function doUndo() {
  if (!undoItem) return;
  const { member, item } = undoItem;
  const memberRef = ref(db, 'melhorias/' + member);
  push(memberRef, item)
    .catch(err => {
      console.error('Erro ao desfazer:', err);
      showError('Não foi possível desfazer. Verifique sua conexão.');
    });
  hideUndo();
}

// ── [NOVO] Sugestões ──
function openSuggestionModal() {
  console.log('✅ Abrindo modal de sugestão...');
  const modal = document.getElementById('suggestion-modal');
  if (modal) {
    modal.style.display = 'flex';
    console.log('✅ Modal aberto com sucesso!');
    document.getElementById('suggestion-name').value = '';
    document.getElementById('suggestion-text').value = '';
    document.getElementById('char-current').textContent = '0';
    document.getElementById('suggestion-err').textContent = '';
    setTimeout(() => document.getElementById('suggestion-name').focus(), 50);
  } else {
    console.error('❌ Modal de sugestão não encontrado no DOM');
  }
}

function closeSuggestionModal() {
  document.getElementById('suggestion-modal').style.display = 'none';
  document.getElementById('suggestion-name').value = '';
  document.getElementById('suggestion-text').value = '';
  document.getElementById('suggestion-err').textContent = '';
}

function submitSuggestion() {
  const name  = document.getElementById('suggestion-name').value.trim();
  const text  = document.getElementById('suggestion-text').value.trim();
  const errEl = document.getElementById('suggestion-err');

  if (!name || !text) {
    errEl.textContent = 'Por favor, preencha todos os campos.';
    return;
  }

  if (name.length < 2) {
    errEl.textContent = 'Nome deve ter pelo menos 2 caracteres.';
    return;
  }

  if (text.length < 10) {
    errEl.textContent = 'Sugestão deve ter pelo menos 10 caracteres.';
    return;
  }

  const sendBtn = document.querySelector('#suggestion-modal .modal-btn-confirm');
  if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Enviando...'; }

  const suggestionsRef = ref(db, 'sugestoes');
  push(suggestionsRef, {
    name: name,
    texto: text,
    ts: Date.now()
  })
    .then(() => {
      showSuccess('Sugestão enviada com sucesso! 🎉');
      closeSuggestionModal();
    })
    .catch(firebaseErr => {
      console.error('Erro ao enviar sugestão:', firebaseErr);
      errEl.textContent = 'Erro ao enviar. Verifique sua conexão e tente novamente.';
    })
    .finally(() => {
      if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Enviar Sugestão'; }
    });
}

// ── Painel de Sugestões ──
let localSuggestions = {};

const suggestoesRef = ref(db, 'sugestoes');
onValue(suggestoesRef, snapshot => {
  localSuggestions = snapshot.val() || {};
  const panel = document.getElementById('suggestions-panel');
  if (panel && panel.style.display !== 'none') {
    renderSuggestionsPanel();
  }
});

const SUGGESTIONS_PASSWORD = 'gta123gta';

function openSuggestionsPanel() {
  // Abre modal de senha antes de exibir o painel
  const pwModal = document.getElementById('suggestions-pw-modal');
  if (pwModal) {
    pwModal.style.display = 'flex';
    setTimeout(() => {
      const inp = document.getElementById('suggestions-pw-input');
      if (inp) inp.focus();
    }, 50);
  }
}

function closeSuggestionsPwModal() {
  const pwModal = document.getElementById('suggestions-pw-modal');
  if (pwModal) pwModal.style.display = 'none';
  const inp = document.getElementById('suggestions-pw-input');
  if (inp) inp.value = '';
  const err = document.getElementById('suggestions-pw-err');
  if (err) err.textContent = '';
}

function confirmSuggestionsPassword() {
  const inp = document.getElementById('suggestions-pw-input');
  const err = document.getElementById('suggestions-pw-err');
  if (inp.value !== SUGGESTIONS_PASSWORD) {
    inp.classList.add('error');
    err.textContent = 'Senha incorreta. Tente novamente.';
    inp.value = '';
    setTimeout(() => inp.classList.remove('error'), 400);
    return;
  }
  closeSuggestionsPwModal();
  const panel = document.getElementById('suggestions-panel');
  if (!panel) return;
  panel.style.display = 'flex';
  renderSuggestionsPanel();
}

function closeSuggestionsPanel() {
  const panel = document.getElementById('suggestions-panel');
  if (panel) panel.style.display = 'none';
}

function deleteSuggestion(key) {
  const itemRef = ref(db, 'sugestoes/' + key);
  remove(itemRef).catch(e => {
    console.error('Erro ao deletar sugestão:', e);
    showError('Não foi possível deletar a sugestão.');
  });
}

function renderSuggestionsPanel() {
  const list = document.getElementById('suggestions-list');
  if (!list) return;

  const items = Object.entries(localSuggestions)
    .map(([key, val]) => ({ ...val, key }))
    .sort((a, b) => b.ts - a.ts);

  document.getElementById('suggestions-count').textContent = items.length;

  if (items.length === 0) {
    list.innerHTML = '<div class="suggestions-empty">Nenhuma sugestão recebida ainda.</div>';
    return;
  }

  list.innerHTML = items.map(it => `
    <div class="suggestion-item">
      <div class="suggestion-item-header">
        <span class="suggestion-item-name">👤 ${it.name}</span>
        <span class="suggestion-item-date">${formatDate(it.ts)}</span>
        <button class="suggestion-item-del" onclick="deleteSuggestion('${it.key}')" title="Deletar">×</button>
      </div>
      <div class="suggestion-item-text">${it.texto}</div>
    </div>
  `).join('');
}

// ── Filtros ──
function applyFilter(val) {
  filterText = val;
  pushFiltersToURL();
  render();
}

function applySort(val) {
  sortMode = val;
  pushFiltersToURL();
  render();
}

function applyMemberFilter(val) {
  filterMember = val;
  pushFiltersToURL();
  render();
}

// ── Exportar Excel ──
function exportExcel() {
  const wb   = XLSX.utils.book_new();
  const rows = [['Membro', 'Melhoria', 'Data/Hora']];
  MEMBERS.forEach(m => {
    const items = Object.values(localData[m] || {});
    sortItems(items).forEach(it => rows.push([m, it.name, formatDate(it.ts)]));
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 15 }, { wch: 50 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Melhorias');
  XLSX.writeFile(wb, 'stark-csat.xlsx');
}

// ── Render ──
function render() {
  let total = 0;
  MEMBERS.forEach(m => { total += Object.keys(localData[m] || {}).length; });

  const ctTotal = document.getElementById('ct-total');
  if (ctTotal) ctTotal.textContent = total;

  const body = document.getElementById('body');
  if (!body) return;

  const visibleMembers = filterMember
    ? MEMBERS.filter(m => m.toLowerCase() === filterMember.toLowerCase())
    : MEMBERS;

  body.innerHTML = visibleMembers.map(m => {
    const allItems = Object.entries(localData[m] || {}).map(([key, val]) => ({ ...val, key }));
    const items    = filterItems(sortItems(allItems));

    if (filterText.trim() !== '' && items.length === 0) return '';

    const itemsHTML = items.length
      ? items.map(it => `
          <div class="citem" id="item-${it.key}">
            <div class="citem-body">
              <span class="citem-name">${it.name}</span>
              <span class="citem-date">${formatDate(it.ts)}</span>
            </div>
            <button class="citem-edit icon-btn" onclick="startEdit('${m}', '${it.key}')" title="Editar" aria-label="Editar melhoria">✎</button>
            <button class="citem-del icon-btn"  onclick="removeItem('${m}', '${it.key}')" title="Deletar" aria-label="Deletar melhoria">×</button>
          </div>`).join('')
      : `<div class="empty-msg">nenhum registro ainda</div>`;

    return `
      <div class="member-row" data-member="${m}">
        <div class="member-label">
          <div class="member-name">${m.toUpperCase()}</div>
          <div class="member-count">${allItems.length} melhoria${allItems.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="member-content">
          <div class="items-list">${itemsHTML}</div>
          <div class="add-row">
            <textarea
              class="add-input"
              id="i-${m}"
              placeholder="Nova melhoria..."
              rows="2"
              onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); add('${m}'); }"
            ></textarea>
            <button class="add-btn" onclick="add('${m}')">+</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Expor funções globais ──
// IMPORTANTE: deve ficar ANTES do setupEventListeners e dos onclick inline do HTML
// porque type="module" isola o escopo e os atributos onclick precisam de window.*
window.add                    = add;
window.startEdit              = startEdit;
window.saveEdit               = saveEdit;
window.removeItem             = removeItem;
window.closeModal             = closeModal;
window.confirmDelete          = confirmDelete;
window.render                 = render;
window.openSuggestionModal    = openSuggestionModal;
window.closeSuggestionModal   = closeSuggestionModal;
window.submitSuggestion       = submitSuggestion;
window.openSuggestionsPanel      = openSuggestionsPanel;
window.closeSuggestionsPwModal   = closeSuggestionsPwModal;
window.confirmSuggestionsPassword = confirmSuggestionsPassword;
window.closeSuggestionsPanel  = closeSuggestionsPanel;
window.deleteSuggestion       = deleteSuggestion;

// ── Esperar DOM estar pronto ──
function setupEventListeners() {
  console.log('Configurando event listeners...');

  // Escape para fechar modais
  document.addEventListener('keydown', e => { 
    if (e.key === 'Escape') {
      closeModal();
      closeSuggestionModal();
      closeSuggestionsPanel();
      closeSuggestionsPwModal();
    }
  });

  // Modal de senha
  const pwInput = document.getElementById('modal-pw');
  if (pwInput) {
    pwInput.addEventListener('keydown', e => { 
      if (e.key === 'Enter') confirmDelete(); 
    });
  }

  // Busca
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => applyFilter(e.target.value));
  }

  // Filtro de membro
  const memberSelect = document.getElementById('member-select');
  if (memberSelect) {
    memberSelect.addEventListener('change', e => applyMemberFilter(e.target.value));
  }

  // Exportar
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportExcel);
  }

  // Botão ver sugestões
  const viewSuggestionsBtn = document.getElementById('view-suggestions-btn');
  if (viewSuggestionsBtn) {
    viewSuggestionsBtn.addEventListener('click', openSuggestionsPanel);
  }

  // SUGESTÃO - LISTENER PRINCIPAL
  const suggestionBtn = document.getElementById('suggestion-btn');
  if (suggestionBtn) {
    suggestionBtn.addEventListener('click', openSuggestionModal);
    console.log('✅ Listener de sugestão adicionado com sucesso!');
  } else {
    console.warn('❌ Botão de sugestão não encontrado');
  }

  // Contador de caracteres
  const suggestionText = document.getElementById('suggestion-text');
  if (suggestionText) {
    suggestionText.addEventListener('input', e => {
      document.getElementById('char-current').textContent = e.target.value.length;
    });
  }

  // Desfazer
  const undoBtn = document.getElementById('undo-btn');
  const undoClose = document.getElementById('undo-close');
  if (undoBtn) undoBtn.addEventListener('click', doUndo);
  if (undoClose) undoClose.addEventListener('click', hideUndo);

  // Auto-resize
  const body = document.getElementById('body');
  if (body) {
    body.addEventListener('input', e => {
      if (e.target.classList.contains('add-input')) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
      }
    });
  }

  console.log('✅ Todos os listeners configurados!');
}

// Chamar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  setupEventListeners();
}

// Suporte ao botão Voltar/Avançar
window.addEventListener('popstate', () => {
  readFiltersFromURL();
  const searchInput  = document.getElementById('search-input');
  const memberSelect = document.getElementById('member-select');
  if (searchInput)  searchInput.value  = filterText;
  if (memberSelect) memberSelect.value = filterMember;
  render();
});

console.log('✅ App.js carregado completamente!');
