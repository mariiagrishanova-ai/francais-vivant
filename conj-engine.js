/* ============================================================
   CONJ-ENGINE — движок построения полной парадигмы спряжения
   ============================================================
   Каждый глагол в базе описан КОМПАКТНО: инфинитив, тип (шаблон
   1-й группы / 2-я группа / индивидуальный), формы наст. времени
   (если неправильные), причастие прошедшего времени, вспом. глагол
   и точечные "отступления" (subj, futureStem, passeSimple и т.д.).
   Все производные времена (Passé composé, Plus-que-parfait, Futur
   antérieur, Conditionnel passé, Subjonctif passé, Impératif)
   ВЫЧИСЛЯЮТСЯ по формулам французской грамматики — это позволяет
   держать базу компактной, но при этом абсолютно полной.
   ============================================================ */

const PRON = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
const PRON_ELIDED = ["j'", 'tu', 'il', 'nous', 'vous', 'ils']; // для глаголов на гласную

function elide(pronoun, formStartsWithVowel) {
  if (pronoun === 'je' && formStartsWithVowel) return "j'";
  return pronoun;
}

function startsWithVowelSound(s) {
  return /^[aeiouhàâéèêëîïôùûü]/i.test(s);
}

// ---------- Базовые окончания ----------
const END = {
  presentER:   ['e', 'es', 'e', 'ons', 'ez', 'ent'],
  presentIR2:  ['is', 'is', 'it', 'issons', 'issez', 'issent'], // choisir type
  presentRE3:  ['s', 's', '', 'ons', 'ez', 'ent'],               // attendre type
  imparfait:   ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
  futur:       ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
  conditionnel:['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
  subjPresent: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
  passeSimpleA:['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'],
  passeSimpleI:['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
  passeSimpleU:['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'],
  passeSimpleIN:['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'],
};

// глаголы, у которых 2-е л. ед.ч. императива теряет "s"
const NO_S_IMPERATIVE_ENDINGS = ['er']; // 1-я группа
const NO_S_IMPERATIVE_VERBS = new Set(['ouvrir', 'offrir', 'souffrir', 'couvrir', 'découvrir', 'recouvrir', 'cueillir', 'accueillir', 'recueillir', 'aller']);

function applyEndings(stem, endings, glueRule) {
  return PRON.map((p, i) => (glueRule ? glueRule(stem, endings[i], i) : stem + endings[i]));
}

// -er 1-я группа: орфографические варианты по формам (je,tu,il,nous,vous,ils)
function buildPresentER(base, pattern) {
  // base — инфинитив без "er", напр. "parl" для parler
  const strong = base; // je/tu/il/ils
  let weak = base;      // nous/vous
  const forms = [];
  for (let i = 0; i < 6; i++) {
    let stem = (i === 3 || i === 4) ? weak : strong;
    let ending = END.presentER[i];
    if (pattern === 'doubling' && (i === 0 || i === 1 || i === 2 || i === 5)) {
      // appeler/jeter: удвоение согласной перед немым "e" (appelle, jette)
      stem = stem + stem.slice(-1); // удвоить последнюю букву
    }
    if (pattern === 'e-open' && (i === 0 || i === 1 || i === 2 || i === 5)) {
      // lever/peser/acheter: e → è перед немым окончанием (меняем ПОСЛЕДНЕЕ "e" основы)
      stem = stem.replace(/e(?=[^e]*$)/, 'è');
    }
    if (pattern === 'e-acute' && (i === 0 || i === 1 || i === 2 || i === 5)) {
      // préférer/espérer: é → è только в наст./сослаг. (не в futur/cond!), меняем ПОСЛЕДНЕЕ "é"
      stem = stem.replace(/é(?=[^é]*$)/, 'è');
    }
    if (pattern === 'yer' && (i === 0 || i === 1 || i === 2 || i === 5)) {
      // payer/essayer/nettoyer/envoyer: y → i перед немым "e"
      stem = stem.replace(/y$/, 'i');
    }
    if (pattern === 'ger' && (i === 3)) {
      // manger: добавляем "e" перед nous (mangeons)
      stem = stem + 'e';
    }
    if (pattern === 'cer' && (i === 3)) {
      // commencer: c → ç перед nous (commençons)
      stem = stem.replace(/c$/, 'ç');
    }
    forms.push(stem + ending);
  }
  return forms;
}

// применяет ger/cer орфографическую поправку к любой форме,
// где окончание начинается на "a" или "o" (imparfait il/ils/je/tu, passé simple...)
function gerCerFix(stem, ending, pattern) {
  const startsAO = /^[ao]/.test(ending);
  if (!startsAO) return stem + ending;
  if (pattern === 'ger') return stem + 'e' + ending;
  if (pattern === 'cer') return stem.replace(/c$/, 'ç') + ending;
  return stem + ending;
}

/**
 * entry — компактное описание глагола:
 * {
 *   inf, group: '1'|'1-doubling'|'1-e-open'|'1-e-acute'|'1-yer'|'1-ger'|'1-cer'|'2'|'irregular',
 *   aux: 'avoir'|'être',
 *   pp: причастие прошедшего времени, напр. 'pris'
 *   pres: [je,tu,il,nous,vous,ils] — ТОЛЬКО для group:'irregular'
 *   futureStem, subj (override [6] или {strong,weak}), impOverride[3],
 *   ps: {type:'a'|'i'|'u'|'in', stem} — passé simple override
 *   family: 'infinitif-глагола-donneur+префикс' — для образования от другого глагола (см. buildFamily)
 * }
 */
const REFLEXIVE_PRONOUNS = ['me', 'te', 'se', 'nous', 'vous', 'se'];
function attachReflexive(form, i) {
  const base = REFLEXIVE_PRONOUNS[i];
  if ((base === 'me' || base === 'te' || base === 'se') && startsWithVowelSound(form)) {
    return base[0] + "'" + form;
  }
  return base + ' ' + form;
}

function buildParadigm(entry, allVerbs) {
  let e = entry;
  if (e.family) {
    e = expandFamily(e, allVerbs);
  }

  // глаголы, употребляемые только в сложных временах (faillir)
  if (e.onlyCompound) {
    const aux = e.aux || 'avoir';
    const auxP = aux === 'être' ? EMPTY_AUX_ETRE : EMPTY_AUX_AVOIR;
    const agree = aux === 'être' ? ['(e)', '(e)', '(e)', '(e)s', '(e)(s)', '(e)s'] : ['', '', '', '', '', ''];
    const compound = (forms) => PRON.map((p, i) => `${forms[i]} ${e.pp}${agree[i]}`);
    const dash = () => ['—', '—', '—', '—', '—', '—'];
    return {
      inf: e.inf, group: e.group, aux, pp: e.pp, translation: e.translation || '',
      present: dash(), imparfait: dash(), futur: dash(), conditionnel: dash(), subjPresent: dash(),
      imperatif: ['—', '—', '—'], passeSimple: dash(),
      passeCompose: compound(auxP.present), plusQueParfait: compound(auxP.imparfait),
      futurAnterieur: compound(auxP.futur), conditionnelPasse: compound(auxP.conditionnel), subjPasse: compound(auxP.subjPresent),
      note: e.note || null,
    };
  }

  const group = e.group;
  let present;

  if (group === '2') {
    const base = e.inf.slice(0, -2); // choisir -> chois
    present = applyEndings(base, END.presentIR2);
  } else if (group === 'irregular' || e.pres) {
    present = e.pres;
  } else if (group === '3') {
    const base = e.inf.slice(0, -2); // attendre -> attend
    present = applyEndings(base, END.presentRE3);
  } else if (group && group.startsWith('1')) {
    const pattern = group === '1' ? 'regular' : group.replace('1-', '');
    const base = e.inf.slice(0, -2); // parler -> parl
    present = buildPresentER(base, pattern);
  } else {
    present = e.pres;
  }

  // --- imparfait: стем = nous (present[3]) без "-ons"; для 1-й группы берём
  // ЧИСТУЮ основу инфинитива (важно для ger/cer — иначе "e"/"ç" задваиваются) ---
  const pattern1 = (group || '').startsWith('1') ? group.replace('1-', '') : null;
  let impStem = e.impStem || (pattern1 ? e.inf.slice(0, -2) : present[3].replace(/ons$/, ''));
  const imparfait = PRON.map((p, i) => {
    if (pattern1 === 'ger' || pattern1 === 'cer') {
      return gerCerFix(impStem, END.imparfait[i], pattern1);
    }
    return impStem + END.imparfait[i];
  });

  // --- futur simple / conditionnel ---
  let futStem = e.futureStem;
  if (!futStem) {
    if (group === '3') futStem = e.inf.slice(0, -1); // attendre -> attendr
    else if (group && group.startsWith('1')) futStem = e.inf; // parler -> parler(ai)
    else if (group === '2') futStem = e.inf; // choisir -> choisir(ai)
    else futStem = e.inf.replace(/e$/, '');
  }
  const futur = futStem.endsWith('r') || /[aeiouy]r$/.test(futStem) || true
    ? PRON.map((p, i) => futStem + END.futur[i])
    : PRON.map((p, i) => futStem + END.futur[i]);
  const conditionnel = PRON.map((p, i) => futStem + END.conditionnel[i]);

  // --- subjonctif présent ---
  let subjPresent;
  if (e.subj) {
    subjPresent = e.subj;
  } else {
    const strongStem = present[5].replace(/ent$/, ''); // ils-форма без "ent"
    const weakStem = impStem; // = imparfait-стем (nous без "ons")
    subjPresent = PRON.map((p, i) => {
      const stem = (i === 3 || i === 4) ? weakStem : strongStem;
      if (pattern1 === 'ger' || pattern1 === 'cer') {
        // ger/cer не меняют написание перед i/e/ions/iez — правки не нужны
      }
      return stem + END.subjPresent[i];
    });
  }

  // --- impératif (tu, nous, vous) ---
  let imperatif;
  if (e.impOverride) {
    imperatif = e.impOverride;
  } else {
    const dropS = (group && group.startsWith('1')) || NO_S_IMPERATIVE_VERBS.has(e.inf);
    let tuForm = present[1];
    if (dropS) tuForm = tuForm.replace(/s$/, '');
    imperatif = [tuForm, present[3], present[4]];
  }

  // --- passé simple ---
  let passeSimple;
  if (e.ps) {
    const st = e.ps.stem;
    const table = { a: END.passeSimpleA, i: END.passeSimpleI, u: END.passeSimpleU, in: END.passeSimpleIN }[e.ps.type];
    passeSimple = PRON.map((p, i) => st + table[i]);
  } else if (group && group.startsWith('1')) {
    const st = e.inf.slice(0, -2);
    passeSimple = PRON.map((p, i) => gerCerFix(st, END.passeSimpleA[i], pattern1));
  } else {
    const st = e.inf.slice(0, -2);
    passeSimple = applyEndings(st, END.passeSimpleI);
  }

  // --- составные времена (aux + participe passé), с учётом согласования être ---
  const aux = e.aux || 'avoir';
  const auxParadigm = aux === 'être' ? EMPTY_AUX_ETRE : EMPTY_AUX_AVOIR;
  const ppAgreement = aux === 'être' ? ['(e)', '(e)', '(e)', '(e)s', '(e)(s)', '(e)s'] : ['', '', '', '', '', ''];
  const pp = e.pp;

  function compound(auxForms) {
    return PRON.map((p, i) => `${auxForms[i]} ${pp}${ppAgreement[i]}`);
  }

  const passeCompose = compound(auxParadigm.present);
  const plusQueParfait = compound(auxParadigm.imparfait);
  const futurAnterieur = compound(auxParadigm.futur);
  const conditionnelPasse = compound(auxParadigm.conditionnel);
  const subjPasse = compound(auxParadigm.subjPresent);

  let result = {
    inf: e.inf, group, aux, pp, translation: e.translation || '',
    present, imparfait, futur, conditionnel, subjPresent,
    imperatif, passeSimple,
    passeCompose, plusQueParfait, futurAnterieur, conditionnelPasse, subjPasse,
    note: e.note || null,
  };

  if (e.reflexive) {
    const fields = ['present', 'imparfait', 'futur', 'conditionnel', 'subjPresent', 'passeSimple',
      'passeCompose', 'plusQueParfait', 'futurAnterieur', 'conditionnelPasse', 'subjPasse'];
    fields.forEach(f => {
      result[f] = result[f].map((form, i) => attachReflexive(form, i));
    });
    // возвратный императив: aperçois-toi ! apercevons-nous ! apercevez-vous !
    result.imperatif = [imperatif[0] + '-toi', imperatif[1] + '-nous', imperatif[2] + '-vous'];
  }

  return result;
}

// Вспомогательные глаголы — их полная парадигма нужна как "кирпичики"
// для составных времён всех остальных глаголов.
const EMPTY_AUX_AVOIR = {
  present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
  imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
  futur: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
  conditionnel: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'],
  subjPresent: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
};
const EMPTY_AUX_ETRE = {
  present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
  imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
  futur: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
  conditionnel: ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'],
  subjPresent: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
};

// Образование "родственных" глаголов от базового (apprendre = "ap" + prendre)
function expandFamily(e, allVerbs) {
  const [baseInf, prefix] = e.family; // напр. ['prendre', 'ap']
  const baseEntry = allVerbs.find(v => v.inf === baseInf);
  if (!baseEntry) throw new Error('Base verb not found: ' + baseInf);
  const clone = JSON.parse(JSON.stringify(baseEntry));
  clone.inf = e.inf;
  clone.translation = e.translation;
  clone.aux = e.aux || clone.aux;
  clone.pp = prefix + clone.pp;
  if (clone.pres) clone.pres = clone.pres.map(f => prefix + f);
  if (clone.futureStem) clone.futureStem = prefix + clone.futureStem;
  if (clone.subj) clone.subj = clone.subj.map(f => prefix + f);
  if (clone.impOverride) clone.impOverride = clone.impOverride.map(f => prefix + f);
  if (clone.ps) clone.ps = { type: clone.ps.type, stem: prefix + clone.ps.stem };
  if (clone.impStem) clone.impStem = prefix + clone.impStem;
  if (e.note) clone.note = e.note;
  delete clone.family;
  return clone;
}

const TENSE_LABELS = {
  present: 'Présent (Indicatif)',
  imparfait: 'Imparfait',
  futur: 'Futur simple',
  conditionnel: 'Conditionnel présent',
  subjPresent: 'Subjonctif présent',
  passeSimple: 'Passé simple',
  passeCompose: 'Passé composé',
  plusQueParfait: 'Plus-que-parfait',
  futurAnterieur: 'Futur antérieur',
  conditionnelPasse: 'Conditionnel passé',
  subjPasse: 'Subjonctif passé',
};

if (typeof module !== 'undefined') {
  module.exports = { buildParadigm, TENSE_LABELS };
}
