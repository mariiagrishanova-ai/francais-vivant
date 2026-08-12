const TENSE_KEYS = ['present', 'imparfait', 'futur', 'conditionnel', 'subjPresent', 'passeSimple', 'passeCompose', 'plusQueParfait', 'futurAnterieur', 'conditionnelPasse', 'subjPasse'];
const TENSE_DISPLAY = {
  present: 'Présent', imparfait: 'Imparfait', futur: 'Futur simple', conditionnel: 'Conditionnel présent',
  subjPresent: 'Subjonctif présent', passeSimple: 'Passé simple', passeCompose: 'Passé composé',
  plusQueParfait: 'Plus-que-parfait', futurAnterieur: 'Futur antérieur', conditionnelPasse: 'Conditionnel passé', subjPasse: 'Subjonctif passé',
};
const GROUP_KEYS = [
  { key: '1', label: '1-я группа (-er)' },
  { key: '2', label: '2-я группа (-ir)' },
  { key: '3', label: '3-я группа (-re)' },
  { key: 'irregular', label: 'Глаголы-исключения' },
];

const TRAINABLE = VERBS.filter(v => !v.impersonal && !v.onlyCompound);

const state = {
  groups: new Set(),
  verbs: new Set(),
  tenses: new Set(),
  count: 20,
  allGroups: true,
  allVerbs: true,
  allTenses: true,
};

function verbGroupKey(entry) {
  if (entry.group === 'irregular' || entry.family) return 'irregular';
  if ((entry.group || '').startsWith('1')) return '1';
  return entry.group;
}

// ---------- UI: конфигурация ----------
function buildChipRow(container, items, getLabel, getKey, multiSet, allFlagName) {
  container.innerHTML = '';
  const allChip = document.createElement('div');
  allChip.className = 'chip active';
  allChip.textContent = 'Все';
  allChip.addEventListener('click', () => {
    state[allFlagName] = true;
    multiSet.clear();
    [...container.children].forEach(c => c.classList.remove('active'));
    allChip.classList.add('active');
  });
  container.appendChild(allChip);
  items.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = getLabel(item);
    chip.addEventListener('click', () => {
      state[allFlagName] = false;
      allChip.classList.remove('active');
      const key = getKey(item);
      if (multiSet.has(key)) { multiSet.delete(key); chip.classList.remove('active'); }
      else { multiSet.add(key); chip.classList.add('active'); }
      if (multiSet.size === 0) { state[allFlagName] = true; allChip.classList.add('active'); }
    });
    container.appendChild(chip);
  });
}

function initConfigUI() {
  buildChipRow(document.getElementById('groupChips'), GROUP_KEYS, g => g.label, g => g.key, state.groups, 'allGroups');
  buildChipRow(document.getElementById('tenseChips'), TENSE_KEYS, t => TENSE_DISPLAY[t], t => t, state.tenses, 'allTenses');

  // count chips
  const countChips = document.getElementById('countChips');
  const counts = [10, 20, 50, 100];
  countChips.querySelectorAll('.chip').forEach((chip, i) => {
    chip.addEventListener('click', () => {
      countChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.count = counts[i];
      document.getElementById('customCount').value = '';
    });
  });
  document.getElementById('customCount').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    if (v > 0) {
      countChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      state.count = v;
    }
  });

  // автокомплит по глаголам
  const input = document.getElementById('verbSearchInput');
  const list = document.getElementById('verbAutocomplete');
  const chosenWrap = document.getElementById('chosenVerbs');

  function renderChosen() {
    chosenWrap.innerHTML = '';
    state.verbs.forEach(inf => {
      const chip = document.createElement('div');
      chip.className = 'chip active';
      chip.textContent = inf + ' ×';
      chip.addEventListener('click', () => { state.verbs.delete(inf); renderChosen(); });
      chosenWrap.appendChild(chip);
    });
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { list.classList.remove('show'); return; }
    const matches = TRAINABLE.filter(v => v.inf.toLowerCase().startsWith(q)).slice(0, 8);
    if (!matches.length) { list.classList.remove('show'); return; }
    list.innerHTML = matches.map(v => `<div data-inf="${v.inf}">${v.inf} <span style="color:var(--ink-soft);font-size:.8em;">— ${v.translation || ''}</span></div>`).join('');
    list.classList.add('show');
  });
  list.addEventListener('click', (e) => {
    const inf = e.target.closest('[data-inf]')?.dataset.inf;
    if (!inf) return;
    state.allVerbs = false;
    state.verbs.add(inf);
    renderChosen();
    input.value = '';
    list.classList.remove('show');
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.autocomplete-wrap')) list.classList.remove('show'); });

  document.getElementById('verbsAllBtn').addEventListener('click', () => {
    state.allVerbs = true; state.verbs.clear(); renderChosen();
  });

  renderStats();
}

function poolFromConfig() {
  let pool = TRAINABLE;
  if (!state.allVerbs && state.verbs.size) {
    pool = pool.filter(v => state.verbs.has(v.inf));
  } else if (!state.allGroups && state.groups.size) {
    pool = pool.filter(v => state.groups.has(verbGroupKey(v)));
  }
  return pool;
}

function tensesFromConfig() {
  if (state.allTenses || state.tenses.size === 0) return TENSE_KEYS.slice();
  return [...state.tenses];
}

// ---------- генерация заданий ----------
let session = { items: [], idx: 0, correct: 0, results: [] };

function generateSession() {
  const pool = poolFromConfig();
  const tenses = tensesFromConfig();
  const n = Math.max(1, Math.min(500, state.count || 20));
  const items = [];
  for (let i = 0; i < n; i++) {
    const entry = pool[Math.floor(Math.random() * pool.length)];
    const tense = tenses[Math.floor(Math.random() * tenses.length)];
    const pronIdx = Math.floor(Math.random() * 6);
    const paradigm = buildParadigm(entry, VERBS);
    const answer = paradigm[tense][pronIdx];
    items.push({ inf: entry.inf, translation: entry.translation, tense, pron: PRON[pronIdx], answer, pronIdx });
  }
  return items;
}

function normalize(s) {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/’/g, "'");
}

function launchSession() {
  session = { items: generateSession(), idx: 0, correct: 0, results: [] };
  document.getElementById('configView').style.display = 'none';
  document.getElementById('resultView').style.display = 'none';
  document.getElementById('exerciseView').style.display = 'block';
  showExercise();
}

function showExercise() {
  const it = session.items[session.idx];
  document.getElementById('exProgress').textContent = `Задание ${session.idx + 1} из ${session.items.length}`;
  document.getElementById('exPrompt').innerHTML = `<b>${it.inf}</b> · ${TENSE_DISPLAY[it.tense]}`;
  document.getElementById('exSub').innerHTML = `${it.translation ? it.translation + ' — ' : ''}спрягай для <b>${it.pron}</b>`;
  const inp = document.getElementById('exInput');
  inp.value = '';
  inp.className = 'exercise-input';
  inp.disabled = false;
  document.getElementById('exFeedback').textContent = '';
  document.getElementById('exFeedback').className = 'exercise-feedback';
  document.getElementById('exCheckBtn').style.display = 'inline-flex';
  document.getElementById('exNextBtn').style.display = 'none';
  inp.focus();
}

function popConfetti(target) {
  const emojis = ['🎉', '✨', '🌸', '💫', '🥳'];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    c.style.left = (40 + Math.random() * 20) + '%';
    c.style.top = '10px';
    c.style.animationDelay = (i * 0.03) + 's';
    target.appendChild(c);
    setTimeout(() => c.remove(), 800);
  }
}

function checkAnswer() {
  const it = session.items[session.idx];
  const inp = document.getElementById('exInput');
  const ok = normalize(inp.value) === normalize(it.answer);
  const fb = document.getElementById('exFeedback');
  inp.disabled = true;
  if (ok) {
    inp.className = 'exercise-input correct';
    fb.textContent = 'Верно! ✔';
    fb.className = 'exercise-feedback correct';
    session.correct++;
    popConfetti(document.querySelector('.exercise-card'));
  } else {
    inp.className = 'exercise-input wrong';
    fb.textContent = `Правильный ответ: ${it.answer}`;
    fb.className = 'exercise-feedback wrong';
  }
  session.results.push({ ...it, given: inp.value, ok });
  document.getElementById('exCheckBtn').style.display = 'none';
  document.getElementById('exNextBtn').style.display = 'inline-flex';
  document.getElementById('exNextBtn').focus();
}

function nextExercise() {
  session.idx++;
  if (session.idx >= session.items.length) {
    finishSession();
  } else {
    showExercise();
  }
}

const GRADES = [
  [100, 100, 'Ты машина 🤖', 'Tu es une machine !'],
  [95, 99, 'Нет предела совершенству', 'La perfection n\'a pas de limite'],
  [85, 94, 'Отличный результат!', 'Excellent résultat !'],
  [70, 84, 'Уверенная база, продолжай в том же духе', 'Une base solide, continue comme ça'],
  [55, 69, 'Хорошее начало, есть куда расти', 'Un bon début, il y a de la marge'],
  [40, 54, 'Половина пути пройдена — не сдавайся', 'La moitié du chemin est faite — ne lâche rien'],
  [20, 39, 'Великие дела начинаются с первого шага', 'Les grandes choses commencent par un premier pas'],
  [1, 19, 'Каждая ошибка — это шаг к знанию', 'Chaque erreur est un pas vers le savoir'],
  [0, 0, 'Ну хотя бы начало положено! Пробуем ещё раз?', 'Au moins, c\'est parti ! On réessaie ?'],
];

function gradeFor(percent) {
  return GRADES.find(([lo, hi]) => percent >= lo && percent <= hi) || GRADES[GRADES.length - 1];
}

function finishSession() {
  document.getElementById('exerciseView').style.display = 'none';
  document.getElementById('resultView').style.display = 'block';
  const total = session.items.length;
  const percent = Math.round((session.correct / total) * 100);
  const [, , ru, fr] = gradeFor(percent);
  document.getElementById('resScore').textContent = `${session.correct} / ${total}`;
  document.getElementById('resTitle').textContent = `${percent}% правильных ответов`;
  document.getElementById('resLines').innerHTML = `${ru}<span class="fr">${fr}</span>`;

  saveStats(percent, total, session.correct);
  renderStats();
}

function restartConfig() {
  document.getElementById('resultView').style.display = 'none';
  document.getElementById('exerciseView').style.display = 'none';
  document.getElementById('configView').style.display = 'block';
}

// ---------- статистика (localStorage) ----------
const STATS_KEY = 'fv_conj_stats_v1';
function saveStats(percent, total, correct) {
  let data;
  try { data = JSON.parse(localStorage.getItem(STATS_KEY)) || {}; } catch (e) { data = {}; }
  data.sessions = (data.sessions || 0) + 1;
  data.best = Math.max(data.best || 0, percent);
  data.totalAnswered = (data.totalAnswered || 0) + total;
  data.totalCorrect = (data.totalCorrect || 0) + correct;
  data.history = (data.history || []).concat([{ date: new Date().toISOString(), percent, total }]).slice(-30);
  localStorage.setItem(STATS_KEY, JSON.stringify(data));
}
function renderStats() {
  let data;
  try { data = JSON.parse(localStorage.getItem(STATS_KEY)) || {}; } catch (e) { data = {}; }
  const el = document.getElementById('statsLine');
  if (!data.sessions) { el.textContent = 'Пока нет пройденных тренировок — самое время начать!'; return; }
  el.innerHTML = `Пройдено тренировок: <b>${data.sessions}</b> · лучший результат: <b>${data.best}%</b> · всего отвечено: <b>${data.totalAnswered}</b> заданий`;
}

document.addEventListener('DOMContentLoaded', () => {
  initConfigUI();
  document.getElementById('startBtn').addEventListener('click', launchSession);
  document.getElementById('exCheckBtn').addEventListener('click', checkAnswer);
  document.getElementById('exNextBtn').addEventListener('click', nextExercise);
  document.getElementById('exInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (document.getElementById('exCheckBtn').style.display !== 'none') checkAnswer();
      else nextExercise();
    }
  });
  document.getElementById('restartBtn').addEventListener('click', restartConfig);
  document.getElementById('playAgainBtn').addEventListener('click', launchSession);
});
