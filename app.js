const MEMBERS = ['Victor', 'Leticia', 'Neto', 'Ygaro', 'Joab'];

let data = {};
MEMBERS.forEach(m => (data[m] = []));
let nextId = 1;

function add(member) {
  const inp = document.getElementById('i-' + member);
  const val = inp.value.trim();
  if (!val) return;
  data[member].unshift({ id: nextId++, name: val, done: false });
  inp.value = '';
  render();
}

function toggle(member, id) {
  const item = data[member].find(i => i.id === id);
  if (item) {
    item.done = !item.done;
    render();
  }
}

function remove(member, id) {
  data[member] = data[member].filter(i => i.id !== id);
  render();
}

function render() {
  let total = 0, open = 0, done = 0;

  MEMBERS.forEach(m => {
    total += data[m].length;
    open  += data[m].filter(i => !i.done).length;
    done  += data[m].filter(i => i.done).length;
  });

  document.getElementById('ct-total').textContent = total;
  document.getElementById('ct-open').textContent  = open;
  document.getElementById('ct-done').textContent  = done;

  document.getElementById('body').innerHTML = MEMBERS.map(m => {
    const items = data[m];
    const pending = items.filter(i => !i.done).length;

    const itemsHTML = items.length
      ? items.map(it => `
          <div class="citem${it.done ? ' done' : ''}">
            <input
              type="checkbox"
              class="citem-check"
              ${it.done ? 'checked' : ''}
              onchange="toggle('${m}', ${it.id})"
            >
            <span class="citem-name">${it.name}</span>
            <button class="citem-del" onclick="remove('${m}', ${it.id})">×</button>
          </div>`).join('')
      : '<div class="empty-msg">nenhum registro ainda</div>';

    return `
      <div class="member-row">
        <div class="member-label">
          <div class="member-name">${m.toUpperCase()}</div>
          <div class="member-count">${pending} pendente${pending !== 1 ? 's' : ''}</div>
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
