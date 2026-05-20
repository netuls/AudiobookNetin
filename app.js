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
  document.getElementById('suggestion-modal').style.display = 'flex';
  document.getElementById('suggestion-name').value = '';
  document.getElementById('suggestion-text').value = '';
  document.getElementById('char-current').textContent = '0';
  document.getElementById('suggestion-err').textContent = '';
  setTimeout(() => document.getElementById('suggestion-name').focus(), 50);
}

function closeSuggestionModal() {
  document.getElementById('suggestion-modal').style.display = 'none';
  document.getElementById('suggestion-name').value = '';
  document.getElementById('suggestion-text').value = '';
  document.getElementById('suggestion-err').textContent = '';
}

function submitSuggestion() {
  const name = document.getElementById('suggestion-name').value.trim();
  const text = document.getElementById('suggestion-text').value.trim();
  const err = document.getElementById('suggestion-err');

  if (!name || !text) {
    err.textContent = 'Por favor, preencha todos os campos.';
    return;
  }

  if (name.length < 2) {
    err.textContent = 'Nome deve ter pelo menos 2 caracteres.';
    return;
  }

  if (text.length < 10) {
    err.textContent = 'Sugestão deve ter pelo menos 10 caracteres.';
    return;
  }

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
    .catch(err => {
      console.error('Erro ao enviar sugestão:', err);
      err.textContent = 'Erro ao enviar. Tente novamente.';
    });
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

// ── Eventos globais ──
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

const pwInput = document.getElementById('modal-pw');
if (pwInput) pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') confirmDelete(); });

document.getElementById('search-input').addEventListener('input',  e => applyFilter(e.target.value));
document.getElementById('member-select').addEventListener('change', e => applyMemberFilter(e.target.value));
document.getElementById('export-btn').addEventListener('click', exportExcel);
document.getElementById('suggestion-btn').addEventListener('click', openSuggestionModal);
document.getElementById('undo-btn').addEventListener('click', doUndo);
document.getElementById('undo-close').addEventListener('click', hideUndo);

// ── Auto-resize das textareas ──
document.getElementById('body').addEventListener('input', e => {
  if (e.target.classList.contains('add-input')) {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }
});

// ── Contagem de caracteres da sugestão ──
const suggestionText = document.getElementById('suggestion-text');
if (suggestionText) {
  suggestionText.addEventListener('input', e => {
    document.getElementById('char-current').textContent = e.target.value.length;
  });
}

// ── Suporte ao botão Voltar/Avançar do navegador ──
window.addEventListener('popstate', () => {
  readFiltersFromURL();
  const searchInput  = document.getElementById('search-input');
  const memberSelect = document.getElementById('member-select');
  if (searchInput)  searchInput.value  = filterText;
  if (memberSelect) memberSelect.value = filterMember;
  render();
});
