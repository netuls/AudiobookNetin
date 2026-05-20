// ── Libs externas ──
// SheetJS carregado via <script> no HTML (xlsx.full.min.js)

const MEMBERS = ['Victor', 'Leticia', 'Neto', 'Ygaro', 'Joab'];
const PASSWORD = 'cardapinho2026';
let data = {};
MEMBERS.forEach(m => (data[m] = []));
let nextId = 1;
let pendingDelete = null;
let undoTimeout = null;
let undoItem = null;
let filterText = '';
let sortMode = 'newest'; // 'newest' | 'oldest' | 'alpha'

const MAX_ITEMS = 10;

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

function add(member) {
  const inp = document.getElementById('i-' + member);
  const val = inp.value.trim();
  if (!val) return;
  const item = { id: nextId++, name: val, ts: Date.now() };
  data[member].unshift(item);
  inp.value = '';
  render();
  flashSuccess(member);
  animateNewItem(item.id);
}

function flashSuccess(member) {
  const row = document.querySelector(`[data-member="${member}"]`);
  if (!row) return;
  row.classList.add('flash-success');
  setTimeout(() => row.classList.remove('flash-success'), 800);
}

function animateNewItem(id) {
  setTimeout(() => {
    const el = document.getElementById('item-' + id);
    if (el) el.classList.add('item-enter');
  }, 10);
}

function startEdit(member, id) {
  const item = data[member].find(i => i.id === id);
  if (!item) return;
  const el = document.getElementById('item-' + id);
  if (!el) return;
  el.innerHTML = `
    <input class="edit-input" id="edit-${id}" value="${item.name.replace(/"/g, '&quot;')}" />
    <button class="edit-save-btn" onclick="saveEdit('${member}', ${id})">✓</button>
    <button class="edit-cancel-btn" onclick="render()">✕</button>
  `;
  const inp = document.getElementById('edit-' + id);
  inp.focus();
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveEdit(member, id);
    if (e.key === 'Escape') render();
  });
}

function saveEdit(member, id) {
  const inp = document.getElementById('edit-' + id);
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;
  const item = data[member].find(i => i.id === id);
  if (item) item.name = val;
  render();
}

function remove(member, id) {
  pendingDelete = { member, id };
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
  if (pw === PASSWORD) {
    const { member, id } = pendingDelete;
    const item = data[member].find(i => i.id === id);
    data[member] = data[member].filter(i => i.id !== id);
    render();
    closeModal();
    showUndo(member, item);
  } else {
    inp.classList.add('error');
    err.textContent = 'Senha incorreta. Tente novamente.';
    inp.value = '';
    setTimeout(() => inp.classList.remove('error'), 400);
  }
}

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
  data[member].push(item);
  hideUndo();
  render();
}

function applyFilter(val) {
  filterText = val;
  render();
}

function applySort(val) {
  sortMode = val;
  render();
}

function exportExcel() {
  const wb = XLSX.utils.book_new();
  const rows = [['Membro', 'Melhoria', 'Data/Hora']];
  MEMBERS.forEach(m => {
    sortItems(data[m]).forEach(it => {
      rows.push([m, it.name, formatDate(it.ts)]);
    });
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 15 }, { wch: 50 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Melhorias');
  XLSX.writeFile(wb, 'stark-csat.xlsx');
}

function render() {
  let total = 0;
  MEMBERS.forEach(m => { total += data[m].length; });
  document.getElementById('ct-total').textContent = total;

  document.getElementById('body').innerHTML = MEMBERS.map(m => {
    const allItems = data[m];
    const items = filterItems(sortItems(allItems));
    const pct = Math.min(100, Math.round((allItems.length / MAX_ITEMS) * 100));

    // Esconde membro se filtro ativo e sem resultados
    if (filterText.trim() !== '' && items.length === 0) return '';

    const itemsHTML = items.length
      ? items.map(it => `
          <div class="citem" id="item-${it.id}">
            <div class="citem-body">
              <span class="citem-name">${it.name}</span>
              <span class="citem-date">${formatDate(it.ts)}</span>
            </div>
            <button class="citem-edit" onclick="startEdit('${m}', ${it.id})" title="Editar">✎</button>
            <button class="citem-del"  onclick="remove('${m}', ${it.id})" title="Deletar">×</button>
          </div>`).join('')
      : `<div class="empty-msg">nenhum registro ainda</div>`;

    return `
      <div class="member-row" data-member="${m}">
        <div class="member-label">
          <div class="member-name">${m.toUpperCase()}</div>
          <div class="member-count">${allItems.length} melhoria${allItems.length !== 1 ? 's' : ''}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="member-content">
          <div class="items-list">${itemsHTML}</div>
          <div class="add-row">
            <input
              class="add-input"
              id="i-${m}"
              placeholder="Nova melhoria..."
              onkeydown="if(event.key==='Enter') add('${m}')"
            >
            <button class="add-btn" onclick="add('${m}')">+</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
  const pwInput = document.getElementById('modal-pw');
  if (pwInput) pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') confirmDelete(); });

  document.getElementById('search-input').addEventListener('input', e => applyFilter(e.target.value));
  document.getElementById('sort-select').addEventListener('change', e => applySort(e.target.value));
  document.getElementById('export-btn').addEventListener('click', exportExcel);
  document.getElementById('undo-btn').addEventListener('click', doUndo);
  document.getElementById('undo-close').addEventListener('click', hideUndo);

  render();
});
