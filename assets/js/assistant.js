/**
 * assistant.js — Assistant de recherche de mots-clés PANORAMIC
 *
 * Le développeur tape son besoin en français ("je veux dessiner un cercle"),
 * l'assistant propose les mots-clés les plus pertinents.
 *
 * 3 briques :
 *   1. Normalisation (accents, casse, stemming léger des infinitifs FR)
 *   2. Thésaurus (~100 synonymes français → mots-clés/groupes/préfixes PANORAMIC)
 *   3. Moteur de scoring (classe les résultats par pertinence)
 *
 * Marche hors-ligne (pas de fetch). Les données viennent de
 * assets/data/keywords-data.js chargé en <script src> juste avant.
 */

(() => {
  'use strict';

  // ============================================================
  // 1. THÉSAURUS français → PANORAMIC
  // ============================================================
  // Chaque entrée : { noms: [noms exacts], groupes: [groupes], prefixes: [préfixes de nom] }
  // Les noms/groupes/préfixes sont comparés en version NORMALISÉE (voir normalize()).
  // À enrichir librement au fil du temps — c'est ce qui donne l'illusion d'une AI.

  const THESAURUS = {
    // --- Objets système (noms anglais → français) ---
    bouton:        { noms: ['BUTTON'] },
    boutons:       { noms: ['BUTTON'] },
    fenetre:       { noms: ['FORM', 'MAINMENU'] },
    fenetres:      { noms: ['FORM', 'MAINMENU'] },
    liste:         { noms: ['LIST', 'CHECKLIST', 'COMBO'] },
    listes:        { noms: ['LIST', 'CHECKLIST', 'COMBO'] },
    combo:         { noms: ['COMBO'] },
    menuderoulant: { noms: ['COMBO'] },
    caseacocher:   { noms: ['CHECKBOX'] },
    checkbox:      { noms: ['CHECKBOX'] },
    cocher:        { noms: ['CHECKBOX'] },
    radiobutton:   { noms: ['OPTION_BUTTON', 'CHECKBOX'] },
    etiquette:     { noms: ['LABEL'] },
    label:         { noms: ['LABEL'] },
    legende:       { noms: ['LABEL'] },
    barredefilement: { noms: ['SCROLLBAR', 'HSCROLLBAR', 'VSCROLLBAR'] },
    ascenseur:     { noms: ['SCROLLBAR', 'HSCROLLBAR', 'VSCROLLBAR'] },
    menu:          { noms: ['MAINMENU', 'POPUPMENU'] },
    menus:         { noms: ['MAINMENU', 'POPUPMENU'] },
    image:         { noms: ['PICTURE'] },
    picture:       { noms: ['PICTURE'] },
    photo:         { noms: ['PICTURE'] },
    images:        { noms: ['PICTURE'] },
    zonesaisie:    { noms: ['EDIT', 'MEMO'] },
    champtexte:    { noms: ['EDIT', 'MEMO'] },
    saisie:        { noms: ['EDIT', 'MEMO'] },
    saisir:        { noms: ['EDIT', 'MEMO'] },
    editeur:       { noms: ['EDIT', 'MEMO'] },
    memo:          { noms: ['MEMO'] },
    blocnotes:     { noms: ['MEMO'] },
    grid:          { noms: ['GRID'] },
    grille:        { noms: ['GRID'] },
    tableau:       { noms: ['GRID', 'STRINGGRID'] },
    colonne:       { noms: ['GRID', 'STRINGGRID'] },
    movie:         { noms: ['MOVIE'] },
    video:         { noms: ['MOVIE'] },
    film:          { noms: ['MOVIE'] },
    videos:        { noms: ['MOVIE'] },
    timer:         { noms: ['TIMER'] },
    horloge:       { noms: ['TIMER'] },
    chronometre:   { noms: ['TIMER'] },
    comptearebours: { noms: ['TIMER'] },
    alpha:         { noms: ['ALPHA'] },
    calque:        { noms: ['ALPHA'] },
    scene2d:       { noms: ['SCENE2D'] },
    scene:         { noms: ['SCENE2D'] },

    // --- Son / Audio ---
    son:           { noms: ['SOUND'], prefixes: ['PLAY', 'MIDI'] },
    sons:          { noms: ['SOUND'], prefixes: ['MIDI'] },
    audio:         { noms: ['SOUND'], prefixes: ['MIDI'] },
    musique:       { noms: ['SOUND'], prefixes: ['MIDI'] },
    bruitage:      { noms: ['SOUND'] },
    jouer:         { noms: ['PLAY', 'SOUND', 'MIDI_PLAY'] },
    jouerunson:    { noms: ['PLAY', 'SOUND'] },
    piano:         { prefixes: ['MIDI'] },
    instrument:    { prefixes: ['MIDI'] },
    midi:          { groupes: ['MIDI'] },
    note:          { prefixes: ['MIDI'] },

    // --- Dessin 2D ---
    dessiner:      { groupes: ['Dessin'] },
    dessin:        { groupes: ['Dessin'] },
    tracer:        { groupes: ['Dessin'] },
    tracertrait:   { noms: ['2D_LINE'] },
    cercle:        { noms: ['2D_CIRCLE'] },
    rond:          { noms: ['2D_CIRCLE'] },
    ronds:         { noms: ['2D_CIRCLE'] },
    cercles:       { noms: ['2D_CIRCLE'] },
    ligne:         { noms: ['2D_LINE'] },
    lignes:        { noms: ['2D_LINE'] },
    trait:         { noms: ['2D_LINE'] },
    rectangle:     { noms: ['2D_RECTANGLE'] },
    rectangles:    { noms: ['2D_RECTANGLE'] },
    carre:         { noms: ['2D_RECTANGLE'] },
    carres:        { noms: ['2D_RECTANGLE'] },
    ellipse:       { noms: ['2D_ELLIPSE'] },
    point:         { noms: ['2D_POINT'] },
    pixel:         { noms: ['2D_POINT'] },
    couleur:       { noms: ['2D_PEN_COLOR', '2D_FILL_COLOR', 'COLOR'] },
    couleurs:      { noms: ['2D_PEN_COLOR', '2D_FILL_COLOR'] },
    remplir:       { prefixes: ['2D_FILL'] },
    remplissage:   { prefixes: ['2D_FILL'] },
    effacer:       { noms: ['2D_CLEAR'] },
    vider:         { noms: ['2D_CLEAR'] },
    epaisseur:     { noms: ['2D_PEN_WIDTH'] },
    traitpointille:{ prefixes: ['2D_PEN_DASH'] },
    arc:           { noms: ['2D_ARC'] },

    // --- Maths ---
    maths:         { groupes: ['Mathématiques'] },
    math:          { groupes: ['Mathématiques'] },
    mathematiques: { groupes: ['Mathématiques'] },
    mathematique:  { groupes: ['Mathématiques'] },
    calcul:        { groupes: ['Mathématiques'] },
    calculer:      { groupes: ['Mathématiques'] },
    nombre:        { groupes: ['Mathématiques'] },
    nombres:       { groupes: ['Mathématiques'] },
    sinus:         { noms: ['SIN()'] },
    cosinus:       { noms: ['COS()'] },
    tangente:      { noms: ['TAN()'] },
    racinecarree:  { noms: ['SQR()'] },
    racine:        { noms: ['SQR()'] },
    carre_nombre:  { noms: ['SQR()'] },
    absolue:       { noms: ['ABS()'] },
    absolu:        { noms: ['ABS()'] },
    valeurabsolue: { noms: ['ABS()'] },
    puissance:     { noms: ['POWER'] },
    exposant:      { noms: ['POWER'] },
    log:           { noms: ['LOG()'] },
    logarithme:    { noms: ['LOG()'] },
    exponentielle: { noms: ['EXP()'] },
    exp:           { noms: ['EXP()'] },
    random:        { noms: ['RNDC'] },
    rnd:           { prefixes: ['RND'] },
    aleatoire:     { prefixes: ['RND'] },
    hasard:        { prefixes: ['RND'] },
    arrondi:       { noms: ['INT()'] },
    arrondir:      { noms: ['INT()'] },
    entier:        { noms: ['INT()'] },
    pi:            { noms: ['PI'] },
    signe:         { noms: ['SGN()'] },

    // --- Fichiers ---
    fichier:       { groupes: ['Fichiers', 'Fichiers Texte', 'Fichiers Binaires'] },
    fichiers:      { groupes: ['Fichiers', 'Fichiers Texte', 'Fichiers Binaires'] },
    lire:          { noms: ['FILE_OPEN_READ', 'FILE_READ', 'FILEBIN_BLOCK_READ'] },
    ouvrir:        { noms: ['FILE_OPEN_READ', 'FILE_OPEN_WRITE'] },
    ecrire:        { noms: ['FILE_OPEN_WRITE', 'FILE_WRITE', 'FILE_WRITELN'] },
    sauver:        { noms: ['FILE_OPEN_WRITE'] },
    sauvegarder:   { noms: ['FILE_OPEN_WRITE'] },
    sauvegarde:    { noms: ['FILE_OPEN_WRITE'] },
    stocker:       { noms: ['FILE_OPEN_WRITE'] },
    binaire:       { groupes: ['Fichiers Binaires'] },
    repertoire:    { groupes: ['Répertoires'] },
    repertoires:   { groupes: ['Répertoires'] },
    dossier:       { groupes: ['Répertoires'] },
    dossiers:      { groupes: ['Répertoires'] },
    copierfichier: { noms: ['FILE_COPY'] },
    supprimerfichier: { noms: ['FILE_DELETE'] },
    archiver:      { prefixes: ['ARCHIVER'] },
    zip:           { prefixes: ['ARCHIVER'] },

    // --- Souris / Clavier ---
    souris:        { groupes: ['Souris'] },
    clique:        { prefixes: ['MOUSE'] },
    clic:          { prefixes: ['MOUSE'] },
    click:         { prefixes: ['MOUSE'] },
    curseur:       { noms: ['MOUSE_X_POSITION()', 'MOUSE_Y_POSITION()'] },
    positionsouris:{ prefixes: ['MOUSE'] },
    clavier:       { prefixes: ['KEY', 'SCAN_CODE'] },
    touche:        { prefixes: ['KEY'] },
    touches:       { prefixes: ['KEY'] },
    taper:         { prefixes: ['KEY'] },
    frappe:        { prefixes: ['KEY'] },

    // --- Événements ---
    evenement:     { groupes: ['Evénements'] },
    evenements:    { groupes: ['Evénements'] },
    desactiver:    { prefixes: ['OFF_'] },
    desactive:     { prefixes: ['OFF_'] },
    annuler:       { prefixes: ['OFF_'] },
    ignorer:       { prefixes: ['OFF_'] },
    arret:         { prefixes: ['OFF_'] },
    arreter:       { prefixes: ['OFF_'] },
    activer:       { prefixes: ['ON_'] },
    capter:        { groupes: ['Evénements'] },
    detecter:      { groupes: ['Evénements'] },

    // --- 3D ---
    '3d':          { groupes: ['Objets 3D'] },
    '3dobjets':    { groupes: ['Objets 3D'] },
    volume:        { groupes: ['Objets 3D'] },
    scene3d:       { prefixes: ['3D_'] },
    sphere:        { noms: ['3D_SPHERE'] },
    spheres:       { noms: ['3D_SPHERE'] },
    cube:          { noms: ['3D_CUBE', '3D_BOX'] },
    cubes:         { noms: ['3D_CUBE', '3D_BOX'] },
    cone:          { noms: ['3D_CONE'] },
    cylindre:      { noms: ['3D_CYLINDER'] },
    theiere:       { noms: ['3D_TEAPOT'] },
    torus:         { noms: ['3D_TORUS'] },
    anneau:        { noms: ['3D_TORUS'] },
    plan3d:        { noms: ['3D_PLANE'] },
    textures:      { prefixes: ['3D_LOAD_TEXTURE'] },
    texture:       { prefixes: ['3D_LOAD_TEXTURE'] },

    // --- Sprites / Jeux ---
    sprite:        { groupes: ['SPRITE'] },
    sprites:       { groupes: ['SPRITE'] },
    jeu:           { groupes: ['SPRITE'] },
    jeux:          { groupes: ['SPRITE'] },
    animation:     { groupes: ['SPRITE'] },
    animer:        { groupes: ['SPRITE'] },
    collision:     { prefixes: ['COLLISION', '3D_COLLISION'] },
    deplacement:   { prefixes: ['SPRITE_X', 'SPRITE_Y'] },
    deplacer:      { prefixes: ['SPRITE_X', 'SPRITE_Y', '3D_MOVE'] },

    // --- Chaînes de caractères ---
    chaine:        { groupes: ['Chaines de caractères'] },
    chaines:       { groupes: ['Chaines de caractères'] },
    texte:         { groupes: ['Chaines de caractères'] },
    textes:        { groupes: ['Chaines de caractères'] },
    caractere:     { groupes: ['Chaines de caractères'] },
    caracteres:    { groupes: ['Chaines de caractères'] },
    lettre:        { groupes: ['Chaines de caractères'] },
    lettres:       { groupes: ['Chaines de caractères'] },
    string:        { groupes: ['Chaines de caractères'] },
    mot:           { groupes: ['Chaines de caractères'] },
    mots:          { groupes: ['Chaines de caractères'] },
    majuscule:     { noms: ['UPPER$()', 'UCASE$()'] },
    majuscules:    { noms: ['UPPER$()', 'UCASE$()'] },
    minuscule:     { noms: ['LOWER$()', 'LCASE$()'] },
    minuscules:    { noms: ['LOWER$()', 'LCASE$()'] },
    longueur:      { noms: ['LEN()'] },
    extraire:      { noms: ['LEFT$()', 'RIGHT$()', 'MID$()'] },
    chercher:      { noms: ['INSTR()'] },
    trouver:       { noms: ['INSTR()'] },
    remplacer:     { noms: ['REPLACE$()'] },
    concatenation: { noms: ['CONCAT$()'] },
    concatener:    { noms: ['CONCAT$()'] },

    // --- Système / Divers ---
    systeme:       { groupes: ['Système'] },
    ecran:         { prefixes: ['SCREEN', 'WIDTH_MAX', 'HEIGHT_MAX'] },
    resolution:    { prefixes: ['SCREEN'] },
    impression:    { prefixes: ['PRINT', 'NUMBER_PRINT'] },
    imprimer:      { prefixes: ['PRINT', 'NUMBER_PRINT'] },
    imprimante:    { prefixes: ['PRINT', 'NUMBER_PRINT'] },
    papier:        { prefixes: ['PRINT', 'NUMBER_PRINT'] },
    print:         { prefixes: ['PRINT', 'NUMBER_PRINT'] },
    affichertexte: { noms: ['PRINT', 'CAPTION', 'LABEL'] },
    ecriretexte:   { noms: ['PRINT', 'CAPTION'] },
    excel:         { groupes: ['Excel'] },
    tableur:       { groupes: ['Excel'] },
    dll:           { groupes: ['DLL'] },
    apicall:       { groupes: ['DLL'] },
    polices:       { groupes: ['Police'] },
    police:        { groupes: ['Police'] },
    typographie:   { groupes: ['Police'] },
    font:          { groupes: ['Police'] },
    structure:     { groupes: ['Structures'] },
    structures:    { groupes: ['Structures'] },
    variable:      { groupes: ['Référence', 'Structures'] },
    variables:     { groupes: ['Référence', 'Structures'] },
    boucle:        { groupes: ['Structures'] },
    boucles:       { groupes: ['Structures'] },
    condition:     { groupes: ['Structures'] },
    si:            { groupes: ['Structures'] },
    tantque:       { groupes: ['Structures'] },
    pour:          { groupes: ['Structures'] },
    commentaire:   { noms: ['REM'] },
    commenter:     { noms: ['REM'] },
  };

  // ============================================================
  // 2. NORMALISATION
  // ============================================================

  function normalize(s) {
    if (!s) return '';
    return String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // retire les accents
      .replace(/_/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Stemming léger FR : ramène "dessiner/dessine/dessinent/dessins" → "dessin".
  // N'applique que si le radical restant fait >= 4 lettres (évite trop de casse).
  function stem(word) {
    const w = word.trim();
    if (w.length < 5) return w;
    const tries = ['ent', 'ons', 'er', 'ez', 'es', 'ees', 'e', 's'];
    for (const suf of tries) {
      if (w.endsWith(suf)) {
        const radical = w.slice(0, -suf.length);
        if (radical.length >= 4) return radical;
      }
    }
    return w;
  }

  //stopwords FR : mots-outils à ignorer dans la requête
  const STOP = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'a',
    'au', 'aux', 'avec', 'sans', 'pour', 'par', 'sur', 'sous', 'dans',
    'en', 'd', 'l', 'que', 'qui', 'quoi', 'dont', 'où', 'je', 'tu', 'il',
    'on', 'nous', 'vous', 'ils', 'me', 'te', 'se', 'mon', 'ton', 'son',
    'mes', 'tes', 'ses', 'ce', 'cet', 'cette', 'ces', 'mon', 'ma', 'ta',
    'sa', 'est', 'sont', 'etre', 'avoir', 'fait', 'faire', 'veux', 'vouloir',
    'voudrais', 'souhaite', 'souhaiter', 'cherche', 'chercher', 'trouver',
    'voir', 'afficher', 'mais', 'donc', 'car', 'plus', 'moins', 'tres',
    'comme', 'si', 'alors', 'the', 'of', 'to',
  ]);

  function tokenize(query) {
    const norm = normalize(query).split(' ').filter(Boolean);
    const out = [];
    const seen = new Set();
    for (let w of norm) {
      if (w.length < 2) continue;
      if (STOP.has(w)) continue;
      const s = stem(w);
      if (s.length < 2) continue;
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    }
    return out;
  }

  // ============================================================
  // 3. INDEX + SCORING
  // ============================================================

  let INDEX = [];
  let NAME_TO_IDX = {};
  let THESAURUS_BOOSTS = {}; // token normalisé-stemé → [{type, valeur}]

  function buildIndex(rawData) {
    INDEX = rawData.map((e, i) => {
      const nameNorm = normalize(e.n);
      const nameTokens = nameNorm.split(' ').filter(Boolean);
      return {
        idx: i,
        raw: e,
        nameNorm,
        nameTokens,
        descNorm: ' ' + normalize(e.d) + ' ',
        groupNorm: normalize(e.g),
        actionNorm: ' ' + normalize(e.a).slice(0, 400) + ' ',
      };
    });

    NAME_TO_IDX = {};
    for (const k of INDEX) {
      NAME_TO_IDX[k.nameNorm] = k.idx;
    }

    // Précalcule des boosts du thésaurus
    THESAURUS_BOOSTS = {};
    for (const [frWord, targets] of Object.entries(THESAURUS)) {
      const stemWord = stem(normalize(frWord));
      const list = THESAURUS_BOOSTS[stemWord] || (THESAURUS_BOOSTS[stemWord] = []);
      if (targets.noms) for (const n of targets.noms) {
        const nn = normalize(n);
        const idx = NAME_TO_IDX[nn];
        list.push({ kind: 'name', val: nn, idx });
      }
      if (targets.groupes) for (const g of targets.groupes) {
        list.push({ kind: 'group', val: normalize(g) });
      }
      if (targets.prefixes) for (const p of targets.prefixes) {
        list.push({ kind: 'prefix', val: normalize(p) });
      }
    }
  }

  function scoreKeyword(kw, queryTokens) {
    let score = 0;

    // 1. Tokens de la requête vs texte
    for (const t of queryTokens) {
      const inName = kw.nameTokens.includes(t);
      const inDesc = kw.descNorm.includes(' ' + t);
      const inGroup = kw.groupNorm === t || kw.groupNorm.includes(' ' + t);
      const inAction = kw.actionNorm.includes(' ' + t);

      if (inName) score += 6;
      if (inDesc)  score += 5;
      if (inGroup) score += 4;
      if (inAction) score += 1;

      // Match par préfixe (>= 4 car) sur la description (ex: "dessin" dans "dessiner")
      if (!inDesc && t.length >= 4) {
        const re = new RegExp(' ' + t);
        if (re.test(kw.descNorm)) score += 2;
        if (re.test(kw.actionNorm)) score += 1;
      }

      // 2. Boost du thésaurus
      const boosts = THESAURUS_BOOSTS[t];
      if (boosts) {
        for (const b of boosts) {
          if (b.kind === 'name' && b.idx === kw.idx) score += 9;
          else if (b.kind === 'group' && (kw.groupNorm === b.val || kw.groupNorm.includes(' ' + b.val))) score += 7;
          else if (b.kind === 'prefix' && kw.nameNorm.startsWith(b.val)) score += 7;
        }
      }
    }

    return score;
  }

  function search(query, limit = Infinity) {
    if (!INDEX.length) return [];
    const tokens = tokenize(query);
    if (!tokens.length) return [];

    const scored = [];
    for (const kw of INDEX) {
      const s = scoreKeyword(kw, tokens);
      if (s > 0) scored.push({ kw, score: s });
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tie-break alphabétique
      return a.kw.raw.n.localeCompare(b.kw.raw.n, 'fr', { numeric: true });
    });

    return scored.slice(0, limit).map(s => ({
      keyword: s.kw.raw,
      score: s.score,
    }));
  }

  // ============================================================
  // 4. RENDU DOM
  // ============================================================

  const TYPE_COLORS = {
    'Commande': 'var(--secondary)',
    'Fonction': 'var(--accent, #10b981)',
    'Directive': 'var(--primary, #6366f1)',
    'Opérateur': '#f59e0b',
    'Variable système': '#ec4899',
  };

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function prettifyDesc(s) {
    // La description courte est en MAJUSCULES dans la source ; on la passe en casse phrase.
    if (!s) return '';
    const lower = s.charAt(0) + s.slice(1).toLowerCase();
    return lower;
  }

  function renderResults(results, query) {
    const container = document.getElementById('assistant-results');
    if (!container) return;

    if (!results.length) {
      container.innerHTML = `
        <div class="assistant-empty">
          <p>Aucun mot-clé ne correspond à «&nbsp;<strong>${esc(query)}</strong>&nbsp;».</p>
          <p class="assistant-empty-hint">Essaie avec d'autres mots, ou explore&nbsp;:</p>
          <div class="assistant-empty-links">
            <a href="./manuel-a-z.html" class="btn btn-secondary">Index A à Z</a>
            <a href="./manuel-theme.html" class="btn btn-secondary">Par thèmes</a>
          </div>
        </div>`;
      return;
    }

    const cards = results.map(r => {
      const k = r.keyword;
      const typeColor = TYPE_COLORS[k.t] || 'var(--text-muted)';
      const stars = r.score >= 15 ? 3 : r.score >= 9 ? 2 : 1;
      const starHtml = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      return `
        <a href="${esc(k.f)}" class="assistant-card">
          <div class="assistant-card-header">
            <span class="assistant-card-name">${esc(k.s || k.n)}</span>
            <span class="assistant-card-score" title="Pertinence">${starHtml}</span>
          </div>
          <p class="assistant-card-desc">${esc(prettifyDesc(k.d) || k.a.slice(0, 120))}</p>
          <div class="assistant-card-badges">
            ${k.t ? `<span class="assistant-badge" style="border-color:${typeColor}; color:${typeColor};">${esc(k.t)}</span>` : ''}
            ${k.g ? `<span class="assistant-badge assistant-badge-group">${esc(k.g)}</span>` : ''}
          </div>
        </a>`;
    }).join('');

    container.innerHTML = `
      <p class="assistant-results-count">${results.length} résultat${results.length > 1 ? 's' : ''}</p>
      <div class="assistant-cards">${cards}</div>`;
  }

  // ============================================================
  // 5. ÉVÉNEMENTS
  // ============================================================

  function runSearch(query) {
    const trimmed = (query || '').trim();
    if (!trimmed) {
      const container = document.getElementById('assistant-results');
      if (container) container.innerHTML = '';
      return;
    }
    const results = search(trimmed);
    renderResults(results, trimmed);
  }

  function init() {
    const rawData = (typeof window !== 'undefined' && window.PANORAMIC_KEYWORDS_DATA) || [];
    if (!rawData.length) {
      console.error('[assistant] Données PANORAMIC_KEYWORDS_DATA introuvables.');
      return;
    }
    buildIndex(rawData);

    const input = document.getElementById('assistant-input');

    if (input) {
      let timer;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => runSearch(input.value), 120);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); runSearch(input.value); }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposé pour tests éventuels
  window.PANORAMIC_ASSISTANT = { search, tokenize, normalize, stem, buildIndex };
})();
