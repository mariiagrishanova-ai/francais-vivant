/* ============================================================
   БАЗА ГЛАГОЛОВ — блок «Спряжение глаголов»
   Как дополнять базу — см. README.md в корне проекта.
   ============================================================ */

// ---------- вспомогательные генераторы для целых семей глаголов ----------

// craindre / peindre / joindre и т.п. (-aindre / -eindre / -oindre)
function aindreLike(inf) {
  const base = inf.replace(/dre$/, '');           // craindre -> crain
  const soft = base.replace(/n$/, 'gn');           // crain -> craign
  return {
    pres: [base + 's', base + 's', base + 't', soft + 'ons', soft + 'ez', soft + 'ent'],
    pp: base + 't',
    ps: { type: 'i', stem: soft },
  };
}

// partir / sortir / dormir / sentir / servir / mentir и их семьи
function partirLike(inf) {
  const strong = inf.slice(0, -3);
  const weak = inf.slice(0, -2);
  return {
    pres: [strong + 's', strong + 's', strong + 't', weak + 'ons', weak + 'ez', weak + 'ent'],
    pp: weak + 'i',
  };
}

// ouvrir / couvrir / offrir / souffrir (наст. вр. как у 1-й группы, pp на -ert)
function ouvrirLike(stem) {
  return {
    pres: [stem + 'e', stem + 'es', stem + 'e', stem + 'ons', stem + 'ez', stem + 'ent'],
    pp: stem.slice(0, -1) + 'ert',
  };
}

const VERBS = [
  // ================= 1-Я ГРУППА (-ER): базовая модель =================
  { inf: 'arriver', group: '1', aux: 'être', pp: 'arrivé', translation: 'приезжать, случаться', model: true, modelLabel: 'Базовая модель 1-й группы' },
  { inf: 'parler', group: '1', aux: 'avoir', pp: 'parlé', translation: 'говорить' },
  { inf: 'aimer', group: '1', aux: 'avoir', pp: 'aimé', translation: 'любить' },
  { inf: 'travailler', group: '1', aux: 'avoir', pp: 'travaillé', translation: 'работать' },
  { inf: 'regarder', group: '1', aux: 'avoir', pp: 'regardé', translation: 'смотреть' },
  { inf: 'écouter', group: '1', aux: 'avoir', pp: 'écouté', translation: 'слушать' },
  { inf: 'chercher', group: '1', aux: 'avoir', pp: 'cherché', translation: 'искать' },
  { inf: 'trouver', group: '1', aux: 'avoir', pp: 'trouvé', translation: 'находить' },
  { inf: 'demander', group: '1', aux: 'avoir', pp: 'demandé', translation: 'просить, спрашивать' },
  { inf: 'donner', group: '1', aux: 'avoir', pp: 'donné', translation: 'давать' },
  { inf: 'penser', group: '1', aux: 'avoir', pp: 'pensé', translation: 'думать' },
  { inf: 'passer', group: '1', aux: 'être', pp: 'passé', translation: 'проходить, проводить (время)' },
  { inf: 'montrer', group: '1', aux: 'avoir', pp: 'montré', translation: 'показывать' },
  { inf: 'jouer', group: '1', aux: 'avoir', pp: 'joué', translation: 'играть' },
  { inf: 'habiter', group: '1', aux: 'avoir', pp: 'habité', translation: 'жить (где-л.)' },
  { inf: 'rester', group: '1', aux: 'être', pp: 'resté', translation: 'оставаться' },
  { inf: 'entrer', group: '1', aux: 'être', pp: 'entré', translation: 'входить' },
  { inf: 'retourner', group: '1', aux: 'être', pp: 'retourné', translation: 'возвращаться' },
  { inf: 'tomber', group: '1', aux: 'être', pp: 'tombé', translation: 'падать' },
  { inf: 'monter', group: '1', aux: 'être', pp: 'monté', translation: 'подниматься' },

  // ----- сложные случаи 1-й группы -----
  { inf: 'appeler', group: '1-doubling', aux: 'avoir', pp: 'appelé', translation: 'звать, называть', model: true,
    modelLabel: 'Удвоение согласной (l→ll) перед немым -e', note: 'j\'appelle, но nous appelons' },
  { inf: 'rappeler', group: '1-doubling', aux: 'avoir', pp: 'rappelé', translation: 'напоминать; перезванивать' },
  { inf: 'jeter', group: '1-doubling', aux: 'avoir', pp: 'jeté', translation: 'бросать', note: 'je jette, но nous jetons' },
  { inf: 'rejeter', group: '1-doubling', aux: 'avoir', pp: 'rejeté', translation: 'отвергать' },
  { inf: 'projeter', group: '1-doubling', aux: 'avoir', pp: 'projeté', translation: 'планировать' },

  { inf: 'lever', group: '1-e-open', aux: 'avoir', pp: 'levé', translation: 'поднимать', model: true,
    modelLabel: 'e → è перед немым окончанием', note: 'je lève, но nous levons' },
  { inf: 'acheter', group: '1-e-open', aux: 'avoir', pp: 'acheté', translation: 'покупать', note: 'j\'achète, но nous achetons' },
  { inf: 'peser', group: '1-e-open', aux: 'avoir', pp: 'pesé', translation: 'весить' },
  { inf: 'promener', group: '1-e-open', aux: 'avoir', pp: 'promené', translation: 'прогуливать' },
  { inf: 'emmener', group: '1-e-open', aux: 'avoir', pp: 'emmené', translation: 'уводить, увозить' },
  { inf: 'geler', group: '1-e-open', aux: 'avoir', pp: 'gelé', translation: 'замерзать' },

  { inf: 'préférer', group: '1-e-acute', aux: 'avoir', pp: 'préféré', translation: 'предпочитать', model: true,
    modelLabel: 'é → è только в наст./сослаг. (НЕ в futur/cond!)', note: 'je préfère, но je préférerai' },
  { inf: 'espérer', group: '1-e-acute', aux: 'avoir', pp: 'espéré', translation: 'надеяться' },
  { inf: 'répéter', group: '1-e-acute', aux: 'avoir', pp: 'répété', translation: 'повторять' },
  { inf: 'considérer', group: '1-e-acute', aux: 'avoir', pp: 'considéré', translation: 'считать, рассматривать' },
  { inf: 'suggérer', group: '1-e-acute', aux: 'avoir', pp: 'suggéré', translation: 'предлагать, намекать' },
  { inf: 'célébrer', group: '1-e-acute', aux: 'avoir', pp: 'célébré', translation: 'праздновать' },

  { inf: 'payer', group: '1-yer', aux: 'avoir', pp: 'payé', translation: 'платить', model: true,
    modelLabel: 'y → i перед немым -e (для -ayer — необязательно)', note: 'je paye / je paie — оба варианта верны' },
  { inf: 'essayer', group: '1-yer', aux: 'avoir', pp: 'essayé', translation: 'пробовать' },
  { inf: 'nettoyer', group: '1-yer', aux: 'avoir', pp: 'nettoyé', translation: 'убирать, чистить', note: 'для -oyer/-uyer переход y→i ОБЯЗАТЕЛЕН' },
  { inf: 'employer', group: '1-yer', aux: 'avoir', pp: 'employé', translation: 'использовать; нанимать' },
  { inf: 'ennuyer', group: '1-yer', aux: 'avoir', pp: 'ennuyé', translation: 'надоедать; скучать' },
  { inf: 'envoyer', group: '1-yer', aux: 'avoir', pp: 'envoyé', translation: 'отправлять', futureStem: 'enverr',
    note: 'ИСКЛЮЧЕНИЕ: futur/conditionnel строятся от особой основы enverr- (j\'enverrai), а не envoier-!' },
  { inf: 'renvoyer', group: '1-yer', aux: 'avoir', pp: 'renvoyé', translation: 'увольнять; отсылать обратно', futureStem: 'renverr' },

  { inf: 'manger', group: '1-ger', aux: 'avoir', pp: 'mangé', translation: 'есть, кушать', model: true,
    modelLabel: 'добавляем «e» перед a/o, чтобы g оставалась мягкой', note: 'nous mangeons, il mangeait' },
  { inf: 'nager', group: '1-ger', aux: 'avoir', pp: 'nagé', translation: 'плавать' },
  { inf: 'changer', group: '1-ger', aux: 'avoir', pp: 'changé', translation: 'менять' },
  { inf: 'voyager', group: '1-ger', aux: 'avoir', pp: 'voyagé', translation: 'путешествовать' },
  { inf: 'partager', group: '1-ger', aux: 'avoir', pp: 'partagé', translation: 'делить, делиться' },
  { inf: 'déménager', group: '1-ger', aux: 'être', pp: 'déménagé', translation: 'переезжать' },
  { inf: 'corriger', group: '1-ger', aux: 'avoir', pp: 'corrigé', translation: 'исправлять' },

  { inf: 'commencer', group: '1-cer', aux: 'avoir', pp: 'commencé', translation: 'начинать', model: true,
    modelLabel: 'c → ç перед a/o, чтобы сохранить звук [s]', note: 'nous commençons, il commençait' },
  { inf: 'placer', group: '1-cer', aux: 'avoir', pp: 'placé', translation: 'размещать' },
  { inf: 'lancer', group: '1-cer', aux: 'avoir', pp: 'lancé', translation: 'бросать; запускать' },
  { inf: 'avancer', group: '1-cer', aux: 'avoir', pp: 'avancé', translation: 'продвигать(ся)' },
  { inf: 'remplacer', group: '1-cer', aux: 'avoir', pp: 'remplacé', translation: 'заменять' },
  { inf: 'prononcer', group: '1-cer', aux: 'avoir', pp: 'prononcé', translation: 'произносить' },

  // ================= 2-Я ГРУППА (-IR, тип choisir) =================
  { inf: 'choisir', group: '2', aux: 'avoir', pp: 'choisi', translation: 'выбирать', model: true, modelLabel: 'Базовая модель 2-й группы' },
  { inf: 'finir', group: '2', aux: 'avoir', pp: 'fini', translation: 'заканчивать' },
  { inf: 'réussir', group: '2', aux: 'avoir', pp: 'réussi', translation: 'преуспевать, справляться' },
  { inf: 'grandir', group: '2', aux: 'avoir', pp: 'grandi', translation: 'расти' },
  { inf: 'réfléchir', group: '2', aux: 'avoir', pp: 'réfléchi', translation: 'размышлять' },
  { inf: 'remplir', group: '2', aux: 'avoir', pp: 'rempli', translation: 'заполнять' },
  { inf: 'obéir', group: '2', aux: 'avoir', pp: 'obéi', translation: 'подчиняться' },
  { inf: 'agir', group: '2', aux: 'avoir', pp: 'agi', translation: 'действовать' },
  { inf: 'punir', group: '2', aux: 'avoir', pp: 'puni', translation: 'наказывать' },
  { inf: 'guérir', group: '2', aux: 'avoir', pp: 'guéri', translation: 'вылечивать(ся)' },
  { inf: 'ralentir', group: '2', aux: 'avoir', pp: 'ralenti', translation: 'замедлять' },
  { inf: 'vieillir', group: '2', aux: 'être', pp: 'vieilli', translation: 'стареть' },
  { inf: 'maigrir', group: '2', aux: 'avoir', pp: 'maigri', translation: 'худеть' },
  { inf: 'rougir', group: '2', aux: 'avoir', pp: 'rougi', translation: 'краснеть' },

  // ================= 3-Я ГРУППА, регулярный тип -RE (attendre) =================
  { inf: 'attendre', group: '3', aux: 'avoir', pp: 'attendu', translation: 'ждать', model: true, modelLabel: 'Регулярная модель на -RE' },
  { inf: 'vendre', group: '3', aux: 'avoir', pp: 'vendu', translation: 'продавать' },
  { inf: 'répondre', group: '3', aux: 'avoir', pp: 'répondu', translation: 'отвечать' },
  { inf: 'entendre', group: '3', aux: 'avoir', pp: 'entendu', translation: 'слышать' },
  { inf: 'descendre', group: '3', aux: 'être', pp: 'descendu', translation: 'спускаться', note: 'с прямым дополнением — с avoir' },
  { inf: 'perdre', group: '3', aux: 'avoir', pp: 'perdu', translation: 'терять' },
  { inf: 'rendre', group: '3', aux: 'avoir', pp: 'rendu', translation: 'возвращать, отдавать' },
  { inf: 'confondre', group: '3', aux: 'avoir', pp: 'confondu', translation: 'путать' },
  { inf: 'défendre', group: '3', aux: 'avoir', pp: 'défendu', translation: 'защищать; запрещать' },
  { inf: 'dépendre', group: '3', aux: 'avoir', pp: 'dépendu', translation: 'зависеть' },
  { inf: 'tendre', group: '3', aux: 'avoir', pp: 'tendu', translation: 'протягивать' },
  { inf: 'prétendre', group: '3', aux: 'avoir', pp: 'prétendu', translation: 'утверждать; претендовать' },

  // ================= ВСПОМОГАТЕЛЬНЫЕ ГЛАГОЛЫ =================
  { inf: 'avoir', group: 'irregular', aux: 'avoir', pp: 'eu', translation: 'иметь',
    pres: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], futureStem: 'aur',
    subj: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'], impOverride: ['aie', 'ayons', 'ayez'],
    ps: { type: 'u', stem: 'e' }, essential: true },
  { inf: 'être', group: 'irregular', aux: 'avoir', pp: 'été', translation: 'быть',
    pres: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], futureStem: 'ser', impStem: 'ét',
    subj: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'], impOverride: ['sois', 'soyons', 'soyez'],
    ps: { type: 'u', stem: 'f' }, essential: true },

  // ================= ПОЛНЫЙ СВОД НЕПРАВИЛЬНЫХ ГЛАГОЛОВ =================
  { inf: 'accueillir', group: 'irregular', aux: 'avoir', pp: 'accueilli', translation: 'встречать, принимать (гостя)',
    pres: ['accueille', 'accueilles', 'accueille', 'accueillons', 'accueillez', 'accueillent'], futureStem: 'accueiller' },
  { inf: 'cueillir', group: 'irregular', aux: 'avoir', pp: 'cueilli', translation: 'собирать (цветы, плоды)',
    pres: ['cueille', 'cueilles', 'cueille', 'cueillons', 'cueillez', 'cueillent'], futureStem: 'cueiller' },
  { inf: 'recueillir', group: 'irregular', aux: 'avoir', pp: 'recueilli', translation: 'собирать (сведения); приютить',
    pres: ['recueille', 'recueilles', 'recueille', 'recueillons', 'recueillez', 'recueillent'], futureStem: 'recueiller' },

  { inf: 'acquérir', group: 'irregular', aux: 'avoir', pp: 'acquis', translation: 'приобретать',
    pres: ['acquiers', 'acquiers', 'acquiert', 'acquérons', 'acquérez', 'acquièrent'],
    futureStem: 'acquerr', ps: { type: 'i', stem: 'acqu' } },
  { inf: 'conquérir', group: 'irregular', aux: 'avoir', pp: 'conquis', translation: 'завоёвывать',
    pres: ['conquiers', 'conquiers', 'conquiert', 'conquérons', 'conquérez', 'conquièrent'],
    futureStem: 'conquerr', ps: { type: 'i', stem: 'conqu' } },

  { inf: 'aller', group: 'irregular', aux: 'être', pp: 'allé', translation: 'идти, ехать',
    pres: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], futureStem: 'ir',
    subj: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
    impOverride: ['va', 'allons', 'allez'], ps: { type: 'a', stem: 'all' }, essential: true,
    note: 'один из самых нерегулярных глаголов: 3 разных корня (va-/all-/ir-)' },

  { inf: 'battre', group: 'irregular', aux: 'avoir', pp: 'battu', translation: 'бить',
    pres: ['bats', 'bats', 'bat', 'battons', 'battez', 'battent'], note: 'в ед.ч. одна t, во мн.ч. — tt' },
  { inf: 'abattre', family: ['battre', 'a'], aux: 'avoir', translation: 'сбивать, валить' },
  { inf: 'combattre', family: ['battre', 'com'], aux: 'avoir', translation: 'сражаться, бороться' },

  { inf: 'boire', group: 'irregular', aux: 'avoir', pp: 'bu', translation: 'пить',
    pres: ['bois', 'bois', 'boit', 'buvons', 'buvez', 'boivent'], ps: { type: 'u', stem: 'b' } },

  { inf: 'conclure', group: 'irregular', aux: 'avoir', pp: 'conclu', translation: 'заключать (сделку); делать вывод',
    pres: ['conclus', 'conclus', 'conclut', 'concluons', 'concluez', 'concluent'], ps: { type: 'u', stem: 'concl' } },
  { inf: 'exclure', group: 'irregular', aux: 'avoir', pp: 'exclu', translation: 'исключать',
    pres: ['exclus', 'exclus', 'exclut', 'excluons', 'excluez', 'excluent'], ps: { type: 'u', stem: 'excl' } },
  { inf: 'inclure', group: 'irregular', aux: 'avoir', pp: 'inclus', translation: 'включать',
    pres: ['inclus', 'inclus', 'inclut', 'incluons', 'incluez', 'incluent'], ps: { type: 'u', stem: 'incl' },
    note: 'причастие inclus (не inclu!) — единственное отличие от conclure' },

  { inf: 'connaître', group: 'irregular', aux: 'avoir', pp: 'connu', translation: 'знать, быть знакомым',
    pres: ['connais', 'connais', 'connaît', 'connaissons', 'connaissez', 'connaissent'],
    ps: { type: 'u', stem: 'conn' }, note: 'circonflexe перед t: il connaît' },
  { inf: 'reconnaître', family: ['connaître', 're'], aux: 'avoir', translation: 'узнавать (кого-л./что-л.)' },
  { inf: 'paraître', group: 'irregular', aux: 'avoir', pp: 'paru', translation: 'казаться; появляться (в печати)',
    pres: ['parais', 'parais', 'paraît', 'paraissons', 'paraissez', 'paraissent'], ps: { type: 'u', stem: 'par' } },
  { inf: 'apparaître', family: ['paraître', 'ap'], aux: 'être', translation: 'появляться', note: 'спрягается с être' },
  { inf: 'disparaître', family: ['paraître', 'dis'], aux: 'avoir', translation: 'исчезать' },

  { inf: 'vaincre', group: 'irregular', aux: 'avoir', pp: 'vaincu', translation: 'побеждать',
    pres: ['vaincs', 'vaincs', 'vainc', 'vainquons', 'vainquez', 'vainquent'],
    futureStem: 'vaincr', ps: { type: 'i', stem: 'vainqu' }, note: 'c → qu перед гласной (nous vainquons)' },
  { inf: 'convaincre', family: ['vaincre', 'con'], aux: 'avoir', translation: 'убеждать' },

  { inf: 'courir', group: 'irregular', aux: 'avoir', pp: 'couru', translation: 'бежать',
    pres: ['cours', 'cours', 'court', 'courons', 'courez', 'courent'],
    futureStem: 'courr', ps: { type: 'u', stem: 'cour' }, note: 'удвоение r в futur: je courrai' },
  { inf: 'accourir', family: ['courir', 'ac'], aux: 'être', translation: 'прибежать' },
  { inf: 'parcourir', family: ['courir', 'par'], aux: 'avoir', translation: 'пробежать, объехать' },
  { inf: 'secourir', family: ['courir', 'se'], aux: 'avoir', translation: 'помогать, спасать' },

  Object.assign({ inf: 'craindre', group: 'irregular', aux: 'avoir', translation: 'бояться' }, aindreLike('craindre')),
  Object.assign({ inf: 'plaindre', group: 'irregular', aux: 'avoir', translation: 'жалеть (кого-л.)' }, aindreLike('plaindre')),
  Object.assign({ inf: 'contraindre', group: 'irregular', aux: 'avoir', translation: 'принуждать' }, aindreLike('contraindre')),
  Object.assign({ inf: 'atteindre', group: 'irregular', aux: 'avoir', translation: 'достигать' }, aindreLike('atteindre')),
  Object.assign({ inf: 'éteindre', group: 'irregular', aux: 'avoir', translation: 'гасить, выключать' }, aindreLike('éteindre')),
  Object.assign({ inf: 'peindre', group: 'irregular', aux: 'avoir', translation: 'красить; рисовать' }, aindreLike('peindre')),
  Object.assign({ inf: 'feindre', group: 'irregular', aux: 'avoir', translation: 'притворяться' }, aindreLike('feindre')),
  Object.assign({ inf: 'joindre', group: 'irregular', aux: 'avoir', translation: 'соединять; связываться (с кем-л.)' }, aindreLike('joindre')),
  Object.assign({ inf: 'rejoindre', group: 'irregular', aux: 'avoir', translation: 'присоединяться, воссоединяться' }, aindreLike('rejoindre')),

  { inf: 'croire', group: 'irregular', aux: 'avoir', pp: 'cru', translation: 'верить, думать',
    pres: ['crois', 'crois', 'croit', 'croyons', 'croyez', 'croient'], ps: { type: 'u', stem: 'cr' } },

  { inf: 'devoir', group: 'irregular', aux: 'avoir', pp: 'dû', translation: 'быть должным',
    pres: ['dois', 'dois', 'doit', 'devons', 'devez', 'doivent'], futureStem: 'devr', ps: { type: 'u', stem: 'd' },
    note: 'accent circonflexe только в форме м.р. ед.ч.: dû, но due / dus / dues' },

  { inf: 'dire', group: 'irregular', aux: 'avoir', pp: 'dit', translation: 'говорить, сказать',
    pres: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], ps: { type: 'i', stem: 'd' },
    note: 'ВНИМАНИЕ: vous dites (а не disez!)' },
  { inf: 'redire', family: ['dire', 're'], aux: 'avoir', translation: 'повторять, говорить снова' },
  { inf: 'interdire', group: 'irregular', aux: 'avoir', pp: 'interdit', translation: 'запрещать',
    pres: ['interdis', 'interdis', 'interdit', 'interdisons', 'interdisez', 'interdisent'], ps: { type: 'i', stem: 'interd' },
    note: 'ИСКЛЮЧЕНИЕ из исключения: vous interdisez (а не dites!)' },
  { inf: 'prédire', group: 'irregular', aux: 'avoir', pp: 'prédit', translation: 'предсказывать',
    pres: ['prédis', 'prédis', 'prédit', 'prédisons', 'prédisez', 'prédisent'], ps: { type: 'i', stem: 'préd' },
    note: 'vous prédisez (а не dites!)' },
  { inf: 'contredire', group: 'irregular', aux: 'avoir', pp: 'contredit', translation: 'противоречить',
    pres: ['contredis', 'contredis', 'contredit', 'contredisons', 'contredisez', 'contredisent'], ps: { type: 'i', stem: 'contred' },
    note: 'vous contredisez (а не dites!)' },

  { inf: 'écrire', group: 'irregular', aux: 'avoir', pp: 'écrit', translation: 'писать',
    pres: ['écris', 'écris', 'écrit', 'écrivons', 'écrivez', 'écrivent'], ps: { type: 'i', stem: 'écriv' } },
  { inf: 'décrire', family: ['écrire', 'd'], aux: 'avoir', translation: 'описывать' },
  { inf: 'inscrire', family: ['écrire', 'in'], aux: 'avoir', translation: 'записывать, вносить' },
  { inf: 'prescrire', family: ['écrire', 'pr'], aux: 'avoir', translation: 'предписывать' },
  { inf: 'transcrire', family: ['écrire', 'trans'], aux: 'avoir', translation: 'переписывать, транскрибировать' },
  { inf: 'souscrire', family: ['écrire', 'sou'], aux: 'avoir', translation: 'подписываться (на что-л.)' },

  { inf: 'faillir', group: 'irregular', aux: 'avoir', pp: 'failli', translation: 'чуть не сделать что-л.',
    pres: [null, null, null, null, null, null], onlyCompound: true,
    note: 'практически не употребляется в простых временах: j\'ai failli tomber — «я чуть не упал»' },

  { inf: 'faire', group: 'irregular', aux: 'avoir', pp: 'fait', translation: 'делать',
    pres: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], futureStem: 'fer',
    subj: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
    ps: { type: 'i', stem: 'f' }, essential: true,
    note: 'nous faisons произносится [fəzɔ̃]; vous faites, ils font — запомнить как исключения' },
  { inf: 'refaire', family: ['faire', 're'], aux: 'avoir', translation: 'переделывать' },
  { inf: 'défaire', family: ['faire', 'dé'], aux: 'avoir', translation: 'расстёгивать, разбирать' },
  { inf: 'satisfaire', family: ['faire', 'satis'], aux: 'avoir', translation: 'удовлетворять' },

  { inf: 'falloir', impersonal: true, aux: 'avoir', pp: 'fallu', translation: 'быть нужным, следовать (безличный)',
    formsIl: { present: 'faut', imparfait: 'fallait', futur: 'faudra', conditionnel: 'faudrait',
      subjPresent: 'faille', passeSimple: 'fallut', passeCompose: 'a fallu', plusQueParfait: 'avait fallu',
      futurAnterieur: 'aura fallu', conditionnelPasse: 'aurait fallu', subjPasse: 'ait fallu' },
    note: 'употребляется ТОЛЬКО в 3-м лице ед.ч.: il faut, il fallait, il faudra…' },

  { inf: 'fuir', group: 'irregular', aux: 'avoir', pp: 'fui', translation: 'убегать; избегать',
    pres: ['fuis', 'fuis', 'fuit', 'fuyons', 'fuyez', 'fuient'] },
  { inf: "s'enfuir", group: 'irregular', aux: 'être', pp: 'enfui', translation: 'сбежать', reflexive: true,
    pres: ['fuis', 'fuis', 'fuit', 'fuyons', 'fuyez', 'fuient'], note: 'спрягается как fuir + возвратная частица' },

  { inf: 'interrompre', family: ['rompre', 'inter'], aux: 'avoir', translation: 'прерывать' },
  { inf: 'rompre', group: 'irregular', aux: 'avoir', pp: 'rompu', translation: 'разрывать, порвать',
    pres: ['romps', 'romps', 'rompt', 'rompons', 'rompez', 'rompent'], note: 'il rompt — единственная -RE форма 3 л. с окончанием -t' },
  { inf: 'corrompre', family: ['rompre', 'cor'], aux: 'avoir', translation: 'подкупать; портить' },

  { inf: 'lire', group: 'irregular', aux: 'avoir', pp: 'lu', translation: 'читать',
    pres: ['lis', 'lis', 'lit', 'lisons', 'lisez', 'lisent'], ps: { type: 'u', stem: 'l' } },
  { inf: 'relire', family: ['lire', 're'], aux: 'avoir', translation: 'перечитывать' },
  { inf: 'élire', family: ['lire', 'é'], aux: 'avoir', translation: 'избирать (голосованием)' },

  { inf: 'mettre', group: 'irregular', aux: 'avoir', pp: 'mis', translation: 'класть, ставить',
    pres: ['mets', 'mets', 'met', 'mettons', 'mettez', 'mettent'], ps: { type: 'i', stem: 'm' } },
  { inf: 'admettre', family: ['mettre', 'ad'], aux: 'avoir', translation: 'допускать, признавать' },
  { inf: 'commettre', family: ['mettre', 'com'], aux: 'avoir', translation: 'совершать (ошибку, преступление)' },
  { inf: 'permettre', family: ['mettre', 'per'], aux: 'avoir', translation: 'позволять' },
  { inf: 'promettre', family: ['mettre', 'pro'], aux: 'avoir', translation: 'обещать' },
  { inf: 'remettre', family: ['mettre', 're'], aux: 'avoir', translation: 'вручать; откладывать' },
  { inf: 'soumettre', family: ['mettre', 'sou'], aux: 'avoir', translation: 'подчинять; представлять на рассмотрение' },
  { inf: 'transmettre', family: ['mettre', 'trans'], aux: 'avoir', translation: 'передавать' },
  { inf: 'omettre', family: ['mettre', 'o'], aux: 'avoir', translation: 'упускать, не упоминать' },
  { inf: 'compromettre', family: ['mettre', 'com'], aux: 'avoir', translation: 'компрометировать; ставить под угрозу' },

  { inf: 'mourir', group: 'irregular', aux: 'être', pp: 'mort', translation: 'умирать',
    pres: ['meurs', 'meurs', 'meurt', 'mourons', 'mourez', 'meurent'], futureStem: 'mourr', ps: { type: 'u', stem: 'mour' } },

  { inf: 'naître', group: 'irregular', aux: 'être', pp: 'né', translation: 'рождаться',
    pres: ['nais', 'nais', 'naît', 'naissons', 'naissez', 'naissent'], ps: { type: 'i', stem: 'naqu' } },
  { inf: 'renaître', family: ['naître', 're'], aux: 'être', translation: 'возрождаться' },

  Object.assign({ inf: 'ouvrir', group: 'irregular', aux: 'avoir', translation: 'открывать' }, ouvrirLike('ouvr')),
  Object.assign({ inf: 'couvrir', group: 'irregular', aux: 'avoir', translation: 'покрывать' }, ouvrirLike('couvr')),
  { inf: 'découvrir', family: ['couvrir', 'dé'], aux: 'avoir', translation: 'открывать, обнаруживать' },
  { inf: 'recouvrir', family: ['couvrir', 're'], aux: 'avoir', translation: 'покрывать заново' },
  Object.assign({ inf: 'offrir', group: 'irregular', aux: 'avoir', translation: 'предлагать; дарить' }, ouvrirLike('offr')),
  Object.assign({ inf: 'souffrir', group: 'irregular', aux: 'avoir', translation: 'страдать' }, ouvrirLike('souffr')),

  Object.assign({ inf: 'partir', group: 'irregular', aux: 'être', translation: 'уезжать, уходить' }, partirLike('partir')),
  Object.assign({ inf: 'sortir', group: 'irregular', aux: 'être', translation: 'выходить', note: 'с прямым дополнением — с avoir' }, partirLike('sortir')),
  Object.assign({ inf: 'dormir', group: 'irregular', aux: 'avoir', translation: 'спать' }, partirLike('dormir')),
  Object.assign({ inf: 'sentir', group: 'irregular', aux: 'avoir', translation: 'чувствовать; пахнуть' }, partirLike('sentir')),
  Object.assign({ inf: 'servir', group: 'irregular', aux: 'avoir', translation: 'служить; подавать (еду)' }, partirLike('servir')),
  Object.assign({ inf: 'mentir', group: 'irregular', aux: 'avoir', translation: 'лгать' }, partirLike('mentir')),
  { inf: 'repartir', family: ['partir', 're'], aux: 'être', translation: 'уезжать снова, отправляться в путь заново' },
  Object.assign({ inf: 'ressortir', group: 'irregular', aux: 'être', translation: 'снова выходить; вытекать (из чего-л.)' }, partirLike('ressortir')),
  Object.assign({ inf: 'endormir', group: 'irregular', aux: 'avoir', translation: 'усыплять' }, partirLike('endormir')),
  Object.assign({ inf: 'desservir', group: 'irregular', aux: 'avoir', translation: 'обслуживать (о транспорте)' }, partirLike('desservir')),

  { inf: 'perdre', group: '3', aux: 'avoir', pp: 'perdu', translation: 'терять (дубль, см. выше)', skip: true },

  { inf: 'plaire', group: 'irregular', aux: 'avoir', pp: 'plu', translation: 'нравиться',
    pres: ['plais', 'plais', 'plaît', 'plaisons', 'plaisez', 'plaisent'], ps: { type: 'u', stem: 'pl' } },
  { inf: 'déplaire', family: ['plaire', 'dé'], aux: 'avoir', translation: 'не нравиться' },
  { inf: 'taire', group: 'irregular', aux: 'avoir', pp: 'tu', translation: 'умалчивать, скрывать (se taire — молчать)',
    pres: ['tais', 'tais', 'tait', 'taisons', 'taisez', 'taisent'], ps: { type: 'u', stem: 't' },
    note: 'в отличие от plaire — БЕЗ accent circonflexe: il tait' },

  { inf: 'pleuvoir', impersonal: true, aux: 'avoir', pp: 'plu', translation: 'идти (о дожде, безличный)',
    formsIl: { present: 'pleut', imparfait: 'pleuvait', futur: 'pleuvra', conditionnel: 'pleuvrait',
      subjPresent: 'pleuve', passeSimple: 'plut', passeCompose: 'a plu', plusQueParfait: 'avait plu',
      futurAnterieur: 'aura plu', conditionnelPasse: 'aurait plu', subjPasse: 'ait plu' } },

  { inf: 'pouvoir', group: 'irregular', aux: 'avoir', pp: 'pu', translation: 'мочь',
    pres: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'], futureStem: 'pourr',
    subj: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
    ps: { type: 'u', stem: 'p' }, essential: true, note: 'вопросительная форма 1 л.: puis-je…?' },

  { inf: 'prendre', group: 'irregular', aux: 'avoir', pp: 'pris', translation: 'брать',
    pres: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], ps: { type: 'i', stem: 'pr' } },
  { inf: 'apprendre', family: ['prendre', 'ap'], aux: 'avoir', translation: 'учить(ся)' },
  { inf: 'comprendre', family: ['prendre', 'com'], aux: 'avoir', translation: 'понимать' },
  { inf: 'entreprendre', family: ['prendre', 'entre'], aux: 'avoir', translation: 'предпринимать' },
  { inf: 'reprendre', family: ['prendre', 're'], aux: 'avoir', translation: 'возобновлять; брать снова' },
  { inf: 'surprendre', family: ['prendre', 'sur'], aux: 'avoir', translation: 'удивлять; заставать врасплох' },

  { inf: 'recevoir', group: 'irregular', aux: 'avoir', pp: 'reçu', translation: 'получать',
    pres: ['reçois', 'reçois', 'reçoit', 'recevons', 'recevez', 'reçoivent'], futureStem: 'recevr', ps: { type: 'u', stem: 'reç' } },
  { inf: "s'apercevoir", group: 'irregular', aux: 'être', pp: 'aperçu', translation: 'замечать', reflexive: true,
    pres: ['aperçois', 'aperçois', 'aperçoit', 'apercevons', 'apercevez', 'aperçoivent'], futureStem: 'apercevr', ps: { type: 'u', stem: 'aperç' } },
  { inf: 'décevoir', group: 'irregular', aux: 'avoir', pp: 'déçu', translation: 'разочаровывать',
    pres: ['déçois', 'déçois', 'déçoit', 'décevons', 'décevez', 'déçoivent'], futureStem: 'décevr', ps: { type: 'u', stem: 'déç' } },

  { inf: 'résoudre', group: 'irregular', aux: 'avoir', pp: 'résolu', translation: 'решать (проблему)',
    pres: ['résous', 'résous', 'résout', 'résolvons', 'résolvez', 'résolvent'], ps: { type: 'u', stem: 'résol' } },

  { inf: 'rire', group: 'irregular', aux: 'avoir', pp: 'ri', translation: 'смеяться',
    pres: ['ris', 'ris', 'rit', 'rions', 'riez', 'rient'], ps: { type: 'i', stem: 'r' } },
  { inf: 'sourire', family: ['rire', 'sou'], aux: 'avoir', translation: 'улыбаться' },

  { inf: 'savoir', group: 'irregular', aux: 'avoir', pp: 'su', translation: 'знать (факт); уметь',
    pres: ['sais', 'sais', 'sait', 'savons', 'savez', 'savent'], futureStem: 'saur',
    subj: ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent'],
    impOverride: ['sache', 'sachons', 'sachez'], ps: { type: 'u', stem: 's' }, essential: true },

  { inf: 'suffire', group: 'irregular', aux: 'avoir', pp: 'suffi', translation: 'быть достаточным',
    pres: ['suffis', 'suffis', 'suffit', 'suffisons', 'suffisez', 'suffisent'], ps: { type: 'i', stem: 'suff' } },

  { inf: 'suivre', group: 'irregular', aux: 'avoir', pp: 'suivi', translation: 'следовать (за кем-л.); проходить (курс)',
    pres: ['suis', 'suis', 'suit', 'suivons', 'suivez', 'suivent'] },
  { inf: 'poursuivre', family: ['suivre', 'pour'], aux: 'avoir', translation: 'преследовать; продолжать' },

  { inf: 'valoir', group: 'irregular', aux: 'avoir', pp: 'valu', translation: 'стоить, иметь ценность',
    pres: ['vaux', 'vaux', 'vaut', 'valons', 'valez', 'valent'], futureStem: 'vaudr',
    subj: ['vaille', 'vailles', 'vaille', 'valions', 'valiez', 'vaillent'], ps: { type: 'u', stem: 'val' } },
  { inf: 'équivaloir', family: ['valoir', 'équi'], aux: 'avoir', translation: 'быть равноценным' },

  { inf: 'tenir', group: 'irregular', aux: 'avoir', pp: 'tenu', translation: 'держать',
    pres: ['tiens', 'tiens', 'tient', 'tenons', 'tenez', 'tiennent'], futureStem: 'tiendr',
    ps: { type: 'in', stem: 't' } },
  { inf: 'obtenir', family: ['tenir', 'ob'], aux: 'avoir', translation: 'получать, добиваться' },
  { inf: 'maintenir', family: ['tenir', 'main'], aux: 'avoir', translation: 'поддерживать, сохранять' },
  { inf: 'retenir', family: ['tenir', 're'], aux: 'avoir', translation: 'удерживать; запоминать; бронировать' },
  { inf: 'soutenir', family: ['tenir', 'sou'], aux: 'avoir', translation: 'поддерживать' },
  { inf: 'contenir', family: ['tenir', 'con'], aux: 'avoir', translation: 'содержать (в себе)' },
  { inf: 'entretenir', family: ['tenir', 'entre'], aux: 'avoir', translation: 'поддерживать в порядке; содержать (кого-л.)' },
  { inf: 'appartenir', family: ['tenir', 'ap'], aux: 'avoir', translation: 'принадлежать' },
  { inf: 'détenir', family: ['tenir', 'dé'], aux: 'avoir', translation: 'удерживать; владеть' },

  { inf: 'venir', group: 'irregular', aux: 'être', pp: 'venu', translation: 'приходить',
    pres: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], futureStem: 'viendr',
    ps: { type: 'in', stem: 'v' }, essential: true },
  { inf: 'devenir', family: ['venir', 'de'], aux: 'être', translation: 'становиться' },
  { inf: 'revenir', family: ['venir', 're'], aux: 'être', translation: 'возвращаться' },
  { inf: 'provenir', family: ['venir', 'pro'], aux: 'être', translation: 'происходить (из чего-л.)' },
  { inf: 'survenir', family: ['venir', 'sur'], aux: 'être', translation: 'внезапно случаться' },
  { inf: 'parvenir', family: ['venir', 'par'], aux: 'être', translation: 'добираться; суметь (сделать что-л.)' },
  { inf: 'prévenir', family: ['venir', 'pré'], aux: 'avoir', translation: 'предупреждать', note: 'исключение: спрягается с AVOIR' },
  { inf: 'convenir', family: ['venir', 'con'], aux: 'avoir', translation: 'подходить; договариваться (о чём-л.)', note: 'с avoir; с être — «мириться, соглашаться»' },
  { inf: 'subvenir', family: ['venir', 'sub'], aux: 'avoir', translation: 'обеспечивать (нужды)', note: 'исключение: спрягается с AVOIR' },

  { inf: 'vivre', group: 'irregular', aux: 'avoir', pp: 'vécu', translation: 'жить',
    pres: ['vis', 'vis', 'vit', 'vivons', 'vivez', 'vivent'], ps: { type: 'u', stem: 'véc' } },
  { inf: 'survivre', family: ['vivre', 'sur'], aux: 'avoir', translation: 'выживать' },

  { inf: 'voir', group: 'irregular', aux: 'avoir', pp: 'vu', translation: 'видеть',
    pres: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'], futureStem: 'verr', ps: { type: 'i', stem: 'v' } },
  { inf: 'revoir', family: ['voir', 're'], aux: 'avoir', translation: 'снова видеть; пересматривать' },
  { inf: 'prévoir', group: 'irregular', aux: 'avoir', pp: 'prévu', translation: 'предвидеть, планировать',
    pres: ['prévois', 'prévois', 'prévoit', 'prévoyons', 'prévoyez', 'prévoient'],
    futureStem: 'prévoir', ps: { type: 'i', stem: 'prév' },
    note: 'ИСКЛЮЧЕНИЕ: futur регулярный — je prévoirai (а НЕ préverrai, как у voir!)' },

  { inf: 'vouloir', group: 'irregular', aux: 'avoir', pp: 'voulu', translation: 'хотеть',
    pres: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'], futureStem: 'voudr',
    subj: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
    impOverride: ['veuille', 'veuillons', 'veuillez'], ps: { type: 'u', stem: 'voul' }, essential: true,
    note: 'вежливый императив veuillez — «будьте добры»' },
].filter(v => !v.skip);

if (typeof module !== 'undefined') module.exports = { VERBS };
