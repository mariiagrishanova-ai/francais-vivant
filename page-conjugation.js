function renderTenseGrid(p) {
  const rows = (label, arr) => `
    <div class="tense-box">
      <h4>${label}</h4>
      ${PRON.map((pr, i) => `<div class="row"><b>${pr}</b><span>${arr[i]}</span></div>`).join('')}
    </div>`;
  return `<div class="tense-grid">
    ${rows('Présent', p.present)}
    ${rows('Imparfait', p.imparfait)}
    ${rows('Futur simple', p.futur)}
    ${rows('Passé simple', p.passeSimple)}
    ${rows('Conditionnel présent', p.conditionnel)}
    ${rows('Subjonctif présent', p.subjPresent)}
    ${rows('Passé composé', p.passeCompose)}
    ${rows('Plus-que-parfait', p.plusQueParfait)}
    ${rows('Futur antérieur', p.futurAnterieur)}
    ${rows('Conditionnel passé', p.conditionnelPasse)}
    ${rows('Subjonctif passé', p.subjPasse)}
    <div class="tense-box">
      <h4>Impératif</h4>
      <div class="row"><b>tu</b><span>${p.imperatif[0]}</span></div>
      <div class="row"><b>nous</b><span>${p.imperatif[1]}</span></div>
      <div class="row"><b>vous</b><span>${p.imperatif[2]}</span></div>
      <div class="row"><b>infinitif</b><span>${p.inf}</span></div>
      <div class="row"><b>participe passé</b><span>${p.pp}</span></div>
    </div>
  </div>`;
}

function renderImpersonal(e) {
  const f = e.formsIl;
  const rows = [
    ['Présent', f.present], ['Imparfait', f.imparfait], ['Futur simple', f.futur],
    ['Conditionnel présent', f.conditionnel], ['Subjonctif présent (que)', f.subjPresent],
    ['Passé simple', f.passeSimple], ['Passé composé', f.passeCompose],
    ['Plus-que-parfait', f.plusQueParfait], ['Futur antérieur', f.futurAnterieur],
    ['Conditionnel passé', f.conditionnelPasse], ['Subjonctif passé', f.subjPasse],
  ];
  return `<div class="tense-grid">${rows.map(([l, v]) => `
    <div class="tense-box"><h4>${l}</h4><div class="row"><b>il</b><span>${v}</span></div></div>`).join('')}
  </div>`;
}

function cardHTML(entry, idx) {
  const isImpersonal = !!entry.impersonal;
  const p = isImpersonal ? null : buildParadigm(entry, VERBS);
  const groupLabel = { '1': '1-я группа', '2': '2-я группа', '3': '3-я группа (регулярный -re)' }[entry.group] || (entry.group || '').startsWith('1') ? 'группа 1 (особый случай)' : 'глагол-исключение';
  const label = entry.modelLabel ? entry.modelLabel : (entry.group === '2' ? '2-я группа' : entry.group === '3' ? '3-я группа, регулярный тип' : (entry.group && entry.group.startsWith('1')) ? '1-я группа' : (entry.family ? 'родственный глагол' : 'глагол-исключение'));
  const bodyId = `body-${idx}`;
  return `
  <div class="conj-card" data-search="${(entry.inf + ' ' + (entry.translation || '')).toLowerCase()}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
      <div>
        <span class="tag">${label}</span>${entry.aux ? `<span class="tag">${entry.aux === 'être' ? 'auxiliaire être' : 'auxiliaire avoir'}</span>` : ''}
        <h3>${entry.inf}</h3>
        <div class="tr">${entry.translation || ''}</div>
      </div>
      <button class="btn btn-ghost btn-sm toggle-btn" data-target="${bodyId}">Показать спряжение</button>
    </div>
    ${entry.note ? `<div class="note">💡 ${entry.note}</div>` : ''}
    <div id="${bodyId}" style="display:none; margin-top:6px;">
      ${isImpersonal ? renderImpersonal(entry) : renderTenseGrid(p)}
    </div>
  </div>`;
}

function initTogglers(root) {
  root.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.dataset.target);
      const open = el.style.display !== 'none';
      el.style.display = open ? 'none' : 'block';
      btn.textContent = open ? 'Показать спряжение' : 'Скрыть';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const modelZone = document.getElementById('modelZone');
  const group2Zone = document.getElementById('group2Zone');
  const group3Zone = document.getElementById('group3Zone');
  const irregZone = document.getElementById('irregZone');

  const modelsG1 = VERBS.filter(v => v.model && (v.group || '').startsWith('1'));
  const modelG2 = VERBS.filter(v => v.model && v.group === '2');
  const modelG3 = VERBS.filter(v => v.model && v.group === '3');
  const irregular = VERBS.filter(v => (v.group === 'irregular' || v.impersonal || v.family));

  modelZone.innerHTML = modelsG1.map((v, i) => cardHTML(v, 'm' + i)).join('');
  group2Zone.innerHTML = modelG2.map((v, i) => cardHTML(v, 'g2-' + i)).join('');
  group3Zone.innerHTML = modelG3.map((v, i) => cardHTML(v, 'g3-' + i)).join('');
  irregZone.innerHTML = irregular
    .sort((a, b) => a.inf.localeCompare(b.inf, 'fr'))
    .map((v, i) => cardHTML(v, 'ir-' + i)).join('');

  initTogglers(document);

  const search = document.getElementById('conjSearch');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('.conj-card').forEach(card => {
      card.style.display = card.dataset.search.includes(q) ? '' : 'none';
    });
  });
});
