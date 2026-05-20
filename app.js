const MEMBERS = ['Victor', 'Leticia', 'Neto', 'Ygaro', 'Joab'];
const PASSWORD = 'cardapinho2026';
let data = {};
MEMBERS.forEach(m => (data[m] = []));
let nextId = 1;
let pendingDelete = null;

/* ── Modal ── */
function openModal() {
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
    data[member] = data[member].filter(i => i.id !== id);
    render();
    closeModal();
  } else {
    inp.classList.add('error');
    err.textContent = 'Senha incorreta. Tente novamente.';
    inp.value = '';
    setTimeout(() => inp.classList.remove('error'), 400);
  }
}

/* Fechar com Escape, confirmar com Enter */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
  const pwInput = document.getElementById('modal-pw');
  if (pwInput) {
    pwInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') confirmDelete();
    });
  }
});

/* ── CRUD ── */
function add(member) {
  const inp = document.getElementById('i-' + member);
  const val = inp.value.trim();
  if (!val) return;
  data[member].unshift({ id: nextId++, name: val });
  inp.value = '';
  render();
}

function remove(member, id) {
  pendingDelete = { member, id };
  openModal();
}

/* ── Render ── */
function render() {
  let total = 0;
  MEMBERS.forEach(m => { total += data[m].length; });
  document.getElementById('ct-total').textContent = total;

  document.getElementById('body').innerHTML = MEMBERS.map(m => {
    const items = data[m];
    const itemsHTML = items.length
      ? items.map(it => `
          <div class="citem">
            <span class="citem-name">${it.name}</span>
            <button class="citem-del" onclick="remove('${m}', ${it.id})" title="Clique para deletar (requer senha)">×</button>
          </div>`).join('')
      : '<div class="empty-msg">nenhum registro ainda</div>';

    return `
      <div class="member-row">
        <div class="member-label">
          <div class="member-name">${m.toUpperCase()}</div>
          <div class="member-count">${items.length} melhoria${items.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="member-content">
          <div class="items-list">${itemsHTML}</div>
          <div class="add-row">
            <input
              class="add-input"
              id="i-${m}"
              placeholder="Nova melhoria..."
              onkeydown="if(event.key === 'Enter') add('${m}')"
            >
            <button class="add-btn" onclick="add('${m}')">+</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

render();
