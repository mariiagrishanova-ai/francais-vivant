const GHOST_WORDS = ['demander', 'interdire', 'посвящать', 'aider', 'улучшать', 'interrompre', 'renoncer à', 'мечтать о'];

function startGhostTyper(el) {
  let wordIdx = 0;
  function typeLoop() {
    const word = GHOST_WORDS[wordIdx % GHOST_WORDS.length];
    let i = 0;
    const typeInterval = setInterval(() => {
      i++;
      el.textContent = word.slice(0, i);
      if (i >= word.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          let j = word.length;
          const delInterval = setInterval(() => {
            j--;
            el.textContent = word.slice(0, j);
            if (j <= 0) {
              clearInterval(delInterval);
              wordIdx++;
              setTimeout(typeLoop, 350);
            }
          }, 45);
        }, 1100);
      }
    }, 85);
  }
  typeLoop();
}

function renderGouvernance() {
  const zone = document.getElementById('govZone');
  let html = '';
  GOUVERNANCE_LETTERS.forEach(letter => {
    const items = GOUVERNANCE.filter(g => g.l === letter);
    html += `<div class="letter-block" data-letter="${letter}">
      <div class="letter-head"><div class="letter-orn">${letter}</div><h3 style="margin:0;">${letter}</h3></div>
      <div class="gov-list">
        ${items.map(g => `<div class="gov-item" data-search="${(g.v + ' ' + g.ru).toLowerCase()}">
          <div class="fr">${g.v}</div><div class="ru">${g.ru}</div>
        </div>`).join('')}
      </div>
    </div>`;
  });
  zone.innerHTML = html;
}

function initGovSearch() {
  const input = document.getElementById('govSearch');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.gov-item').forEach(item => {
      item.style.display = item.dataset.search.includes(q) ? '' : 'none';
    });
    document.querySelectorAll('.letter-block').forEach(block => {
      const anyVisible = [...block.querySelectorAll('.gov-item')].some(i => i.style.display !== 'none');
      block.style.display = anyVisible ? '' : 'none';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderGouvernance();
  initGovSearch();
  startGhostTyper(document.getElementById('ghostTyper'));
});
