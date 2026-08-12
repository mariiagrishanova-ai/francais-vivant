const PREPS = new Set(['à', 'de', 'sur', 'contre', 'avec', 'pour', 'en', 'dans', 'envers']);

const QN_POOL = ['Marie', 'mon frère', 'ses collègues', 'le professeur', 'nos voisins', 'ta sœur', 'les enfants', 'ton ami', 'cette femme', 'M. Dupont'];
const QCH_POOL = ['ce projet', 'son erreur', 'la vérité', 'cette décision', 'ses résultats', 'le contrat', 'cette nouvelle', 'leur choix', 'ce problème', 'la situation'];
const FAIRE_POOL = ['réussir', "l'aider", 'partir', 'changer d\'avis', 'recommencer', 'venir', 'se lever tôt', 'répondre'];
const ARTICLE_POOL = [
  { art: 'le', noun: 'directeur' }, { art: 'le', noun: 'cinéma' }, { art: 'les', noun: 'enfants' },
  { art: 'les', noun: 'voisins' }, { art: 'le', noun: 'professeur' }, { art: 'les', noun: 'étudiants' },
  { art: 'le', noun: 'projet' }, { art: 'les', noun: 'résultats' }, { art: 'le', noun: 'match' }, { art: 'les', noun: 'clients' },
];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function contract(prep, art) {
  if (prep === 'à') { if (art === 'le') return 'au'; if (art === 'les') return 'aux'; return 'à'; }
  if (prep === 'de') { if (art === 'le') return 'du'; if (art === 'les') return 'des'; return 'de'; }
  return prep;
}

// разбирает одну конструкцию, возвращает { verbPhrase, parts:[{type,value}], blanks:[answer] } или null, если нет предлога для пропуска
function parseEntry(entry, withArticles) {
  const alt = entry.v.split(' / ');
  const chosen = pick(alt);
  const tokens = chosen.replace(/[()]/g, '').split(' ');
  let vLen = 1;
  if (tokens[0] === 'être' || tokens[0] === 'il' || tokens[0] === 'se') vLen = 2;
  const verbPhrase = tokens.slice(0, vLen).join(' ');
  const rest = tokens.slice(vLen);

  const parts = [];
  const blanks = [];
  for (let i = 0; i < rest.length; i++) {
    const t = rest[i];
    if (PREPS.has(t)) {
      const next = rest[i + 1];
      if (withArticles && (t === 'à' || t === 'de') && (next === 'qn' || next === 'qch')) {
        const noun = pick(ARTICLE_POOL);
        blanks.push(contract(t, noun.art));
        parts.push({ type: 'blank' });
        parts.push({ type: 'text', value: noun.noun });
        i++; // пропускаем qn/qch — уже подставили noun
        continue;
      }
      blanks.push(t);
      parts.push({ type: 'blank' });
    } else if (t === 'qn') {
      parts.push({ type: 'text', value: pick(QN_POOL) });
    } else if (t === 'qch') {
      parts.push({ type: 'text', value: pick(QCH_POOL) });
    } else if (t === 'faire') {
      parts.push({ type: 'text', value: 'faire ' + pick(FAIRE_POOL) });
      // если следующий токен — qch, он относится к faire — пропускаем его отдельную обработку
      if (rest[i + 1] === 'qch') i++;
    } else {
      parts.push({ type: 'text', value: t });
    }
  }
  if (blanks.length === 0) return null;
  return { verbPhrase, parts, blanks, entry };
}

const TESTABLE_GOV = GOUVERNANCE; // фильтруется динамически при генерации (нужен хотя бы 1 пропуск)

const govState = { count: 20, withArticles: false };
let govSession = { items: [], idx: 0, correct: 0 };

function generateGovItem(withArticles) {
  let attempt = 0;
  while (attempt < 15) {
    const entry = pick(TESTABLE_GOV);
    const parsed = parseEntry(entry, withArticles);
    if (parsed) return parsed;
    attempt++;
  }
  return null;
}

function renderPromptHTML(parsed) {
  let blankN = 0;
  const body = parsed.parts.map(p => {
    if (p.type === 'blank') {
      blankN++;
      return `<input class="exercise-input gov-blank" data-blank="${blankN - 1}" style="display:inline-block;width:90px;padding:6px 10px;font-size:1rem;margin:0 4px;vertical-align:middle;" autocomplete="off" spellcheck="false">`;
    }
    return ` ${p.value} `;
  }).join('');
  return `Il faut ${parsed.verbPhrase} ${body}`;
}

function launchGovSession() {
  const n = Math.max(1, Math.min(500, govState.count || 20));
  const items = [];
  for (let i = 0; i < n; i++) {
    const it = generateGovItem(govState.withArticles);
    if (it) items.push(it);
  }
  govSession = { items, idx: 0, correct: 0 };
  document.getElementById('configView').style.display = 'none';
  document.getElementById('resultView').style.display = 'none';
  document.getElementById('exerciseView').style.display = 'block';
  showGovExercise();
}

function showGovExercise() {
  const it = govSession.items[govSession.idx];
  document.getElementById('exProgress').textContent = `Задание ${govSession.idx + 1} из ${govSession.items.length}`;
  document.getElementById('exSentence').innerHTML = renderPromptHTML(it);
  document.getElementById('exTranslation').textContent = it.entry.ru;
  document.getElementById('exFeedback').textContent = '';
  document.getElementById('exFeedback').className = 'exercise-feedback';
  document.getElementById('exCheckBtn').style.display = 'inline-flex';
  document.getElementById('exNextBtn').style.display = 'none';
  const firstBlank = document.querySelector('.gov-blank');
  if (firstBlank) firstBlank.focus();
}

function normalizeGov(s) { return (s || '').trim().toLowerCase().replace(/\s+/g, ' '); }

function checkGovAnswer() {
  const it = govSession.items[govSession.idx];
  const inputs = [...document.querySelectorAll('.gov-blank')];
  let allOk = true;
  inputs.forEach(inp => {
    const idx = parseInt(inp.dataset.blank, 10);
    const ok = normalizeGov(inp.value) === normalizeGov(it.blanks[idx]);
    inp.classList.remove('correct', 'wrong');
    inp.classList.add(ok ? 'correct' : 'wrong');
    inp.disabled = true;
    if (!ok) allOk = false;
  });
  const fb = document.getElementById('exFeedback');
  if (allOk) {
    fb.textContent = 'Верно! ✔';
    fb.className = 'exercise-feedback correct';
    govSession.correct++;
    popGovConfetti();
  } else {
    fb.textContent = `Правильно: ${it.blanks.join(', ')}`;
    fb.className = 'exercise-feedback wrong';
  }
  document.getElementById('exCheckBtn').style.display = 'none';
  document.getElementById('exNextBtn').style.display = 'inline-flex';
  document.getElementById('exNextBtn').focus();
}

function popGovConfetti() {
  const wrap = document.querySelector('.exercise-card');
  const emojis = ['🎉', '✨', '🌸', '💫', '🥳'];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    c.style.left = (40 + Math.random() * 20) + '%';
    c.style.top = '10px';
    c.style.animationDelay = (i * 0.03) + 's';
    wrap.appendChild(c);
    setTimeout(() => c.remove(), 800);
  }
}

function nextGovExercise() {
  govSession.idx++;
  if (govSession.idx >= govSession.items.length) finishGovSession();
  else showGovExercise();
}

const GRADES_GOV = [
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
function gradeForGov(percent) {
  return GRADES_GOV.find(([lo, hi]) => percent >= lo && percent <= hi) || GRADES_GOV[GRADES_GOV.length - 1];
}

function finishGovSession() {
  document.getElementById('exerciseView').style.display = 'none';
  document.getElementById('resultView').style.display = 'block';
  const total = govSession.items.length;
  const percent = Math.round((govSession.correct / total) * 100);
  const [, , ru, fr] = gradeForGov(percent);
  document.getElementById('resScore').textContent = `${govSession.correct} / ${total}`;
  document.getElementById('resTitle').textContent = `${percent}% правильных ответов`;
  document.getElementById('resLines').innerHTML = `${ru}<span class="fr">${fr}</span>`;
  saveGovStats(percent, total, govSession.correct);
  renderGovStats();
}

function restartGovConfig() {
  document.getElementById('resultView').style.display = 'none';
  document.getElementById('exerciseView').style.display = 'none';
  document.getElementById('configView').style.display = 'block';
}

const GOV_STATS_KEY = 'fv_gov_stats_v1';
function saveGovStats(percent, total, correct) {
  let data;
  try { data = JSON.parse(localStorage.getItem(GOV_STATS_KEY)) || {}; } catch (e) { data = {}; }
  data.sessions = (data.sessions || 0) + 1;
  data.best = Math.max(data.best || 0, percent);
  data.totalAnswered = (data.totalAnswered || 0) + total;
  localStorage.setItem(GOV_STATS_KEY, JSON.stringify(data));
}
function renderGovStats() {
  let data;
  try { data = JSON.parse(localStorage.getItem(GOV_STATS_KEY)) || {}; } catch (e) { data = {}; }
  const el = document.getElementById('statsLine');
  if (!data.sessions) { el.textContent = 'Пока нет пройденных тренировок — самое время начать!'; return; }
  el.innerHTML = `Пройдено тренировок: <b>${data.sessions}</b> · лучший результат: <b>${data.best}%</b> · всего отвечено: <b>${data.totalAnswered}</b> заданий`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderGovStats();
  const countChips = document.getElementById('countChips');
  const counts = [10, 20, 50, 70, 100];
  countChips.querySelectorAll('.chip').forEach((chip, i) => {
    chip.addEventListener('click', () => {
      countChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      govState.count = counts[i];
      document.getElementById('customCount').value = '';
    });
  });
  document.getElementById('customCount').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    if (v > 0) { countChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); govState.count = v; }
  });
  document.getElementById('articleChips').querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('articleChips').querySelectorAll('.chip').forEach(c => c.classList.remove('active', 'green'));
      chip.classList.add('active', 'green');
      govState.withArticles = chip.dataset.val === 'yes';
    });
  });

  document.getElementById('startBtn').addEventListener('click', launchGovSession);
  document.getElementById('exCheckBtn').addEventListener('click', checkGovAnswer);
  document.getElementById('exNextBtn').addEventListener('click', nextGovExercise);
  document.getElementById('exerciseView').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (document.getElementById('exCheckBtn').style.display !== 'none') checkGovAnswer();
      else nextGovExercise();
    }
  });
  document.getElementById('restartBtn').addEventListener('click', restartGovConfig);
  document.getElementById('playAgainBtn').addEventListener('click', launchGovSession);
});
