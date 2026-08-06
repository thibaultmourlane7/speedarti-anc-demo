const { PlaquisteModuleRuntime, createMockConnectors } = window;
if (!PlaquisteModuleRuntime || !createMockConnectors) { throw new Error('Le moteur Plaquiste v2.1.0 n\'est pas chargé. Vérifiez engine-bundle.js.'); }

const runtime = new PlaquisteModuleRuntime(createMockConnectors());

const STEPS = [
  { title: 'Contexte', subtitle: 'Chantier et TVA' },
  { title: 'Ouvrages', subtitle: 'Pièces et murs' },
  { title: 'Parois', subtitle: 'Plaques et ossature' },
  { title: 'Équipements', subtitle: 'Ouvertures et plafond' },
  { title: 'Options', subtitle: 'Prix et complexité' },
  { title: 'Résultat', subtitle: 'Devis et commandes' },

];

const ABAQUE_ISOLANTS_V2 = [
  ['ldv-45','Laine de verre 45 mm',45,3.28,'Cloison','panel_roll'],
  ['ldr-45','Laine de roche 45 mm',45,4.92,'Cloison coupe-feu/phonique','panel_roll'],
  ['fdb-45','Fibre de bois 45 mm',45,6.56,'Cloison','panel_roll'],
  ['ldv-70','Laine de verre 70 mm',70,4.10,'Doublage','panel_roll'],
  ['ldr-70','Laine de roche 70 mm',70,5.74,'Doublage','panel_roll'],
  ['fdb-70','Fibre de bois 70 mm',70,8.20,'Doublage','panel_roll'],
  ['ldv-90','Laine de verre 90 mm',90,4.92,'Cloison R90','panel_roll'],
  ['ldr-90','Laine de roche 90 mm',90,6.56,'Phonique','panel_roll'],
  ['fdb-90','Fibre de bois 90 mm',90,9.84,'Phonique','panel_roll'],
  ['ldv-100','Laine de verre 100 mm',100,5.74,'ITI','panel_roll'],
  ['ldr-100','Laine de roche 100 mm',100,7.38,'ITI','panel_roll'],
  ['fdb-100','Fibre de bois 100 mm',100,11.48,'ITI','panel_roll'],
  ['ldv-120','Laine de verre 120 mm',120,6.56,'Combles','panel_roll'],
  ['ldr-120','Laine de roche 120 mm',120,8.20,'Combles','panel_roll'],
  ['fdb-120','Fibre de bois 120 mm',120,13.12,'Combles','panel_roll'],
  ['ldv-140','Laine de verre 140 mm',140,7.38,'Combles','panel_roll'],
  ['ldr-140','Laine de roche 140 mm',140,9.02,'Combles','panel_roll'],
  ['fdb-140','Fibre de bois 140 mm',140,14.76,'Combles','panel_roll'],
  ['ldv-160','Laine de verre 160 mm',160,8.20,'Combles','panel_roll'],
  ['ldr-160','Laine de roche 160 mm',160,9.84,'Combles','panel_roll'],
  ['fdb-160','Fibre de bois 160 mm',160,16.40,'Combles','panel_roll'],
  ['pse-blanc-80','PSE blanc 80 mm',80,7.38,'ITE','panel_roll'],
  ['pse-graphite-100','PSE graphité 100 mm',100,10.66,'ITE','panel_roll'],
  ['xps-80','XPS 80 mm',80,13.12,'Soubassement','panel_roll'],
  ['pur-pir-80','PUR/PIR 80 mm',80,18.04,'Toiture terrasse','panel_roll'],
  ['ouate-100','Ouate de cellulose 100 mm',100,9.02,'Combles','panel_roll'],
  ['chanvre-100','Chanvre 100 mm',100,12.30,'ITI','panel_roll'],
  ['lin-100','Lin 100 mm',100,13.12,'ITI','panel_roll'],
  ['liege-40','Liège expansé 40 mm',40,19.68,'ITE/sol','panel_roll'],
  ['combles-souffle-ldv-200','Laine de verre soufflée 200 mm',200,8,'Combles soufflés','blown'],
  ['combles-souffle-ldv-300','Laine de verre soufflée 300 mm',300,11,'Combles soufflés','blown'],
  ['combles-souffle-ldv-400','Laine de verre soufflée 400 mm',400,14,'Combles soufflés','blown'],
  ['combles-souffle-ldr-200','Laine de roche soufflée 200 mm',200,10,'Combles soufflés','blown'],
  ['combles-souffle-ldr-300','Laine de roche soufflée 300 mm',300,13,'Combles soufflés','blown'],
  ['combles-souffle-ouate-300','Ouate de cellulose soufflée 300 mm',300,15,'Combles soufflés','blown'],
  ['combles-souffle-ouate-400','Ouate de cellulose soufflée 400 mm',400,19,'Combles soufflés','blown'],
  ['combles-rouleau-ldv-200','Laine de verre rouleau 200 mm',200,9,'Combles rouleaux','panel_roll'],
  ['combles-rouleau-ldv-240','Laine de verre rouleau 240 mm',240,11,'Combles rouleaux','panel_roll'],
  ['combles-rouleau-ldv-300','Laine de verre rouleau 300 mm',300,14,'Combles rouleaux','panel_roll'],
  ['combles-rouleau-ldr-200','Laine de roche rouleau 200 mm',200,12,'Combles rouleaux','panel_roll'],
  ['combles-rouleau-ldr-300','Laine de roche rouleau 300 mm',300,16,'Combles rouleaux','panel_roll'],
  ['combles-rouleau-fdb-200','Fibre de bois rouleau 200 mm',200,22,'Combles rouleaux','panel_roll'],
  ['combles-rouleau-fdb-240','Fibre de bois rouleau 240 mm',240,25,'Combles rouleaux','panel_roll'],
].map(([id,label,thicknessMm,priceEuroM2,usage,kind]) => ({ id,label,thicknessMm,priceEuroM2,usage,kind }));

const state = {
  step: 0,
  input: loadDraft() ?? createInitialInput(),
  result: null,
  validation: { blocking: [], warnings: [] },
  selectedWallId: null,
  selectedPieceId: null,
  calculationInProgress: false,
};

normalizeInputForUi();

state.selectedWallId = allWalls().find((wall) => wall.actif)?.id ?? allWalls()[0]?.id ?? null;
state.selectedPieceId = state.input.pieces[0]?.id ?? null;

const stepper = document.querySelector('#stepper');
const stepContent = document.querySelector('#stepContent');
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const saveDraftBtn = document.querySelector('#saveDraftBtn');
const calculateTopBtn = document.querySelector('#calculateTopBtn');
const calculateSideBtn = document.querySelector('#calculateSideBtn');

stepContent.addEventListener('click', handlePlanWallActivation);
stepContent.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const target = event.target.closest?.('[data-plan-wall]');
  if (!target) return;
  event.preventDefault();
  activatePlanWall(target);
});

render();

prevBtn.addEventListener('click', () => goToStep(state.step - 1));
nextBtn.addEventListener('click', async () => {
  if (state.step === STEPS.length - 1) {
    await calculateAndRender();
    return;
  }
  goToStep(state.step + 1);
});
saveDraftBtn.addEventListener('click', () => saveDraft(true));
calculateTopBtn.addEventListener('click', calculateAndRender);
calculateSideBtn.addEventListener('click', calculateAndRender);

function render() {
  renderStepper();
  renderStep();
  renderNavigation();
  renderSummary();
  renderProjectInfo();
}

function renderStepper() {
  stepper.innerHTML = STEPS.map((step, index) => `
    <button class="step-button ${index === state.step ? 'active' : ''} ${index < state.step ? 'done' : ''}" data-step="${index}" type="button">
      <span class="step-index">${index < state.step ? '✓' : index + 1}</span>
      <span class="step-label"><strong>${escapeHtml(step.title)}</strong><span>${escapeHtml(step.subtitle)}</span></span>
    </button>
  `).join('');
  stepper.querySelectorAll('[data-step]').forEach((button) => {
    button.addEventListener('click', () => goToStep(Number(button.dataset.step)));
  });
}

function renderStep() {
  clearGlobalAlerts();
  switch (state.step) {
    case 0: renderContextStep(); break;
    case 1: renderWorksStep(); break;
    case 2: renderWallsStep(); break;
    case 3: renderEquipmentStep(); break;
    case 4: renderOptionsStep(); break;
    case 5: renderResultStep(); break;
    default: renderContextStep();
  }
}

function renderNavigation() {
  prevBtn.style.visibility = state.step === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = state.step === STEPS.length - 1 ? 'Recalculer le chiffrage' : 'Étape suivante →';
}

function pageHead(eyebrow, title, description) {
  return `
    <div class="page-head">
      <div><span class="eyebrow">${escapeHtml(eyebrow)}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div>
      <span class="step-number-pill">Étape ${state.step + 1} / ${STEPS.length}</span>
    </div>
  `;
}

function renderContextStep() {
  const c = state.input.contexte;
  stepContent.innerHTML = pageHead(
    'Contexte du chantier',
    'Commençons par les informations générales',
    'Ces données déterminent la TVA proposée et seront conservées avec le chiffrage. Le taux réduit n’est jamais appliqué sans confirmation.'
  ) + `
    <div class="card">
      <div class="card-header"><div><h2>Identification</h2><p>Nom visible dans la liste des chiffrages SpeedArti.</p></div></div>
      <div class="form-grid">
        ${textField('Nom du calcul', 'nomCalcul', state.input.nomCalcul, 'Ex. Rénovation chambre étage', 'PLQ.CONTEXTE.NOM', 'full')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Fiscalité et usage</h2><p>Les choix sont contrôlés ligne par ligne lors du calcul.</p></div></div>
      <div class="form-grid">
        <div class="field">
          ${labelWithTag('Usage du bâtiment', 'PLQ.CONTEXTE.USAGE')}
          <div class="segmented" id="usageSegment">
            ${segmentButton('Habitation', 'habitation', c.usageBatiment)}
            ${segmentButton('Autre usage', 'autre', c.usageBatiment)}
          </div>
        </div>
        <div class="field">
          ${labelWithTag('Logement achevé depuis plus de 2 ans ?', 'PLQ.CONTEXTE.LOGEMENT_2ANS')}
          <select class="select" id="olderThanTwoYears">
            <option value="true" ${c.logementAcheveDepuisPlusDe2Ans === true ? 'selected' : ''}>Oui</option>
            <option value="false" ${c.logementAcheveDepuisPlusDe2Ans === false ? 'selected' : ''}>Non</option>
            <option value="null" ${c.logementAcheveDepuisPlusDe2Ans === null ? 'selected' : ''}>À confirmer</option>
          </select>
        </div>
        <div class="field">
          ${labelWithTag('Mode de TVA', 'PLQ.CONTEXTE.TVA_MODE')}
          <div class="segmented" id="vatModeSegment">
            ${segmentButton('Suggestion contrôlée', 'suggestion_auto', c.tvaMode)}
            ${segmentButton('Manuel', 'manuel', c.tvaMode)}
          </div>
        </div>
        <div class="field ${c.tvaMode === 'manuel' ? '' : 'is-hidden'}" id="manualVatField">
          ${labelWithTag('Taux manuel', 'PLQ.CONTEXTE.TVA_MANUEL')}
          <select class="select" id="manualVatRate">
            <option value="" ${c.tauxManuel === undefined ? 'selected' : ''}>Choisir un taux</option>
            ${[5.5, 10, 20].map((rate) => `<option value="${rate}" ${Number(c.tauxManuel) === rate ? 'selected' : ''}>${String(rate).replace('.', ',')} %</option>`).join('')}
          </select>
        </div>
        <div class="field full">
          ${switchRow('Travaux de rénovation énergétique', 'Les lignes éligibles pourront recevoir une suggestion à 5,5 %, sans généralisation au reste du devis.', 'energyRenovation', c.renovationEnergetique, 'PLQ.CONTEXTE.RENOVATION_ENERGETIQUE')}
          ${switchRow('Éligibilité fiscale confirmée', 'Obligatoire pour valider un taux réduit. Sinon le devis sera bloqué.', 'eligibilityConfirmed', c.eligibiliteConfirmee, 'PLQ.CONTEXTE.ELIGIBILITE')}
        </div>
        <div class="field full">
          ${labelWithTag('Justification ou note fiscale', 'PLQ.CONTEXTE.JUSTIFICATION')}
          <textarea class="textarea" id="vatJustification" placeholder="Ex. logement de plus de 2 ans, attestation client à joindre…">${escapeHtml(c.justification ?? '')}</textarea>
        </div>
      </div>
    </div>
  `;

  bindInput('#nomCalcul', 'input', (value) => { state.input.nomCalcul = value; touch(); });
  bindSegments('#usageSegment', (value) => { c.usageBatiment = value; renderStep(); touch(); });
  bindInput('#olderThanTwoYears', 'change', (value) => { c.logementAcheveDepuisPlusDe2Ans = value === 'null' ? null : value === 'true'; touch(); });
  bindSegments('#vatModeSegment', (value) => {
    c.tvaMode = value;
    if (value === 'suggestion_auto') delete c.tauxManuel;
    renderStep(); touch();
  });
  bindInput('#manualVatRate', 'change', (value) => { if (value === '') delete c.tauxManuel; else c.tauxManuel = Number(value); touch(); });
  bindCheckbox('#energyRenovation', (checked) => { c.renovationEnergetique = checked; touch(); });
  bindCheckbox('#eligibilityConfirmed', (checked) => { c.eligibiliteConfirmee = checked; touch(); });
  bindInput('#vatJustification', 'input', (value) => {
    if (value.trim()) c.justification = value;
    else delete c.justification;
    touch();
  });
}

function renderWorksStep() {
  stepContent.innerHTML = pageHead(
    'Ouvrages à chiffrer',
    'Ajoutez les pièces et les murs indépendants',
    'Une pièce crée quatre murs clairement identifiés. Vous pouvez désactiver un mur, modifier ses dimensions ou ajouter des murs simples séparés.'
  ) + `
    <div class="card">
      <div class="card-header">
        <div><h2>Pièces</h2><p>Longueur, largeur et hauteur alimentent les murs et le plafond de la pièce.</p></div>
        <button class="btn btn-ghost" id="addPieceBtn" type="button">+ Ajouter une pièce</button>
      </div>
      <div id="piecesList">
        ${state.input.pieces.length ? state.input.pieces.map(renderPieceCard).join('') : emptyState('Aucune pièce ajoutée', 'Ajoutez une pièce pour chiffrer ses murs et éventuellement son plafond.')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><h2>Murs simples</h2><p>Utilisables seuls ou en complément des pièces. Le mode linéaire historique n’est pas repris.</p></div>
        <button class="btn btn-ghost" id="addWallBtn" type="button">+ Ajouter un mur simple</button>
      </div>
      <div id="simpleWallsList">
        ${state.input.mursSimples.length ? state.input.mursSimples.map(renderSimpleWallCard).join('') : emptyState('Aucun mur simple', 'Ajoutez un mur indépendant si le chantier ne correspond pas à une pièce complète.')}
      </div>
    </div>
  `;

  document.querySelector('#addPieceBtn').addEventListener('click', () => {
    const piece = createPiece(state.input.pieces.length + 1);
    state.input.pieces.push(piece);
    state.selectedPieceId = piece.id;
    state.selectedWallId = piece.murs[0].id;
    render(); touch();
  });
  document.querySelector('#addWallBtn').addEventListener('click', () => {
    const wall = createWall('mur_simple', undefined, `Mur simple ${state.input.mursSimples.length + 1}`, 2, 2.5);
    state.input.mursSimples.push(wall);
    state.selectedWallId = wall.id;
    render(); touch();
  });

  bindWorksEvents();
}

function renderPieceCard(piece, pieceIndex) {
  return `
    <div class="wall-card piece-card" data-piece-card="${piece.id}">
      <div class="wall-card-head">
        <div><strong>${escapeHtml(piece.nom)}</strong><span class="field-tag">PLQ.PIECE.${pieceIndex + 1}</span></div>
        <div class="inline-actions">
          <button class="btn btn-small btn-ghost" data-select-piece="${piece.id}" type="button">Configurer les murs</button>
          <button class="btn btn-small btn-danger" data-remove-piece="${piece.id}" type="button">Supprimer</button>
        </div>
      </div>
      <div class="piece-card-layout">
        <div class="piece-plan-column">
          <div class="piece-plan-host" data-piece-plan-host="${piece.id}" data-plan-target-step="2" data-plan-compact="true">
            ${renderPiecePlan(piece, { targetStep: 2, compact: true })}
          </div>
          ${renderPlanLegend(true)}
        </div>
        <div class="piece-fields-column">
          <div class="form-grid">
            ${textField('Nom', `piece-name-${piece.id}`, piece.nom, '', `PLQ.PIECE.${pieceIndex + 1}.NOM`, 'full')}
            ${numberField('Longueur', `piece-length-${piece.id}`, piece.longueurM, 'm', `PLQ.PIECE.${pieceIndex + 1}.LONGUEUR`, 'span-4', 0.01)}
            ${numberField('Largeur', `piece-width-${piece.id}`, piece.largeurM, 'm', `PLQ.PIECE.${pieceIndex + 1}.LARGEUR`, 'span-4', 0.01)}
            ${numberField('Hauteur', `piece-height-${piece.id}`, piece.hauteurM, 'm', `PLQ.PIECE.${pieceIndex + 1}.HAUTEUR`, 'span-4', 0.01)}
          </div>
          <div class="piece-live-status" data-piece-status="${piece.id}">${renderPieceStatus(piece)}</div>
          <p class="plan-help">Cliquez directement sur un mur A, B, C ou D pour ouvrir sa configuration.</p>
        </div>
      </div>
    </div>
  `;
}


function renderPieceStatus(piece) {
  const activeWalls = piece.murs.filter((wall) => wall.actif).length;
  const openingCount = piece.murs.reduce((sum, wall) => sum + wall.ouvertures.reduce((subtotal, opening) => subtotal + Math.max(0, Number(opening.quantite) || 0), 0), 0);
  return `<strong>${activeWalls} mur(s) actif(s) sur 4</strong><span>${openingCount} ouverture(s) · plafond ${piece.plafond?.actif ? 'activé' : 'désactivé'}</span>`;
}

function renderPiecePlanPanel(piece, targetStep = state.step, title = 'Plan 2D de la pièce') {
  return `
    <div class="card plan-focus-card">
      <div class="card-header">
        <div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(piece.nom)} · vue du dessus, à l’échelle automatique. Les murs sont directement cliquables.</p></div>
        <span class="plan-surface-chip">${formatPlanDimension(piece.longueurM * piece.largeurM)} m² au sol</span>
      </div>
      <div class="piece-plan-host plan-focus-host" data-piece-plan-host="${piece.id}" data-plan-target-step="${targetStep}" data-plan-compact="false">
        ${renderPiecePlan(piece, { targetStep, compact: false })}
      </div>
      ${renderPlanLegend(false)}
    </div>
  `;
}

function renderPiecePlan(piece, { targetStep = state.step, compact = false } = {}) {
  const viewWidth = 640;
  const viewHeight = compact ? 360 : 410;
  const length = Math.max(0.1, Number(piece.longueurM) || 0.1);
  const width = Math.max(0.1, Number(piece.largeurM) || 0.1);
  const availableWidth = compact ? 430 : 470;
  const availableHeight = compact ? 190 : 235;
  const scale = Math.min(availableWidth / length, availableHeight / width);
  const roomWidth = Math.max(48, length * scale);
  const roomHeight = Math.max(38, width * scale);
  const roomX = (viewWidth - roomWidth) / 2;
  const roomY = (viewHeight - roomHeight) / 2 + 8;
  const walls = [
    { wall: piece.murs[0], letter: 'A', side: 'top', x1: roomX, y1: roomY, x2: roomX + roomWidth, y2: roomY, labelX: roomX + roomWidth / 2, labelY: roomY - 20 },
    { wall: piece.murs[1], letter: 'B', side: 'right', x1: roomX + roomWidth, y1: roomY, x2: roomX + roomWidth, y2: roomY + roomHeight, labelX: roomX + roomWidth + 24, labelY: roomY + roomHeight / 2 },
    { wall: piece.murs[2], letter: 'C', side: 'bottom', x1: roomX + roomWidth, y1: roomY + roomHeight, x2: roomX, y2: roomY + roomHeight, labelX: roomX + roomWidth / 2, labelY: roomY + roomHeight + 29 },
    { wall: piece.murs[3], letter: 'D', side: 'left', x1: roomX, y1: roomY + roomHeight, x2: roomX, y2: roomY, labelX: roomX - 24, labelY: roomY + roomHeight / 2 },
  ].filter((item) => item.wall);
  const ceilingClass = piece.plafond?.actif ? 'ceiling-active' : 'ceiling-inactive';
  const ratioWarning = length / width > 8 || width / length > 8;

  return `
    <div class="plan2d-wrap ${compact ? 'compact' : ''}">
      <svg class="plan2d-svg" viewBox="0 0 ${viewWidth} ${viewHeight}" role="img" aria-label="Plan 2D interactif de ${escapeAttribute(piece.nom)}">
        <rect class="plan2d-canvas" x="1" y="1" width="${viewWidth - 2}" height="${viewHeight - 2}" rx="18" />
        <g class="plan-dimension plan-dimension-horizontal">
          <line x1="${roomX}" y1="${roomY - 48}" x2="${roomX + roomWidth}" y2="${roomY - 48}" />
          <line x1="${roomX}" y1="${roomY - 55}" x2="${roomX}" y2="${roomY - 41}" />
          <line x1="${roomX + roomWidth}" y1="${roomY - 55}" x2="${roomX + roomWidth}" y2="${roomY - 41}" />
          <text x="${roomX + roomWidth / 2}" y="${roomY - 57}">${formatPlanDimension(length)} m</text>
        </g>
        <g class="plan-dimension plan-dimension-vertical">
          <line x1="${roomX - 50}" y1="${roomY}" x2="${roomX - 50}" y2="${roomY + roomHeight}" />
          <line x1="${roomX - 57}" y1="${roomY}" x2="${roomX - 43}" y2="${roomY}" />
          <line x1="${roomX - 57}" y1="${roomY + roomHeight}" x2="${roomX - 43}" y2="${roomY + roomHeight}" />
          <text transform="translate(${roomX - 61} ${roomY + roomHeight / 2}) rotate(-90)">${formatPlanDimension(width)} m</text>
        </g>
        <rect class="plan-room-floor ${ceilingClass}" x="${roomX}" y="${roomY}" width="${roomWidth}" height="${roomHeight}" />
        <g class="plan-room-caption">
          <text class="plan-room-name" x="${roomX + roomWidth / 2}" y="${roomY + roomHeight / 2 - 7}">${escapeHtml(piece.nom)}</text>
          <text class="plan-room-meta" x="${roomX + roomWidth / 2}" y="${roomY + roomHeight / 2 + 14}">${formatPlanDimension(length)} × ${formatPlanDimension(width)} m · H ${formatPlanDimension(piece.hauteurM)} m</text>
          <text class="plan-room-ceiling" x="${roomX + roomWidth / 2}" y="${roomY + roomHeight / 2 + 34}">Plafond ${piece.plafond?.actif ? 'actif' : 'inactif'}</text>
        </g>
        ${walls.map((item) => renderPlanWall(piece, item, targetStep)).join('')}
        ${ratioWarning ? `<g class="plan-ratio-warning"><rect x="${viewWidth - 182}" y="18" width="164" height="28" rx="14"/><text x="${viewWidth - 100}" y="36">Pièce très allongée</text></g>` : ''}
      </svg>
      <div class="plan-mobile-wall-list">
        ${walls.map(({ wall, letter }) => `<button class="plan-mobile-wall ${wall.id === state.selectedWallId ? 'selected' : ''} ${wall.actif ? '' : 'inactive'}" data-plan-wall="${wall.id}" data-plan-piece="${piece.id}" data-plan-target-step="${targetStep}" type="button"><strong>Mur ${letter}</strong><span>${formatPlanDimension(wall.longueurM)} m · ${wall.actif ? 'actif' : 'inactif'}</span></button>`).join('')}
      </div>
    </div>
  `;
}

function renderPlanWall(piece, item, targetStep) {
  const { wall, letter, side, x1, y1, x2, y2, labelX, labelY } = item;
  const selected = wall.id === state.selectedWallId;
  const classes = [wall.actif ? 'active' : 'inactive', selected ? 'selected' : '', `side-${side}`].filter(Boolean).join(' ');
  const openingMarkers = renderPlanOpenings(wall, x1, y1, x2, y2);
  return `
    <g class="plan-wall-group ${classes}" data-plan-wall="${wall.id}" data-plan-piece="${piece.id}" data-plan-target-step="${targetStep}" role="button" tabindex="0" aria-pressed="${selected}" aria-label="Configurer le mur ${letter}, ${formatPlanDimension(wall.longueurM)} mètres, ${wall.actif ? 'actif' : 'inactif'}">
      <line class="plan-wall-hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />
      <line class="plan-wall-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />
      ${openingMarkers}
      <g class="plan-wall-badge" transform="translate(${labelX} ${labelY})">
        <circle r="15" />
        <text y="4">${letter}</text>
      </g>
    </g>
  `;
}

function renderPlanOpenings(wall, x1, y1, x2, y2) {
  const units = [];
  wall.ouvertures.forEach((opening) => {
    const quantity = Math.min(8, Math.max(0, Number(opening.quantite) || 0));
    for (let index = 0; index < quantity; index += 1) units.push(opening);
  });
  if (!units.length) return '';
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lineLength = Math.hypot(dx, dy);
  if (!lineLength) return '';
  const ux = dx / lineLength;
  const uy = dy / lineLength;
  return units.slice(0, 12).map((opening, index, array) => {
    const center = lineLength * ((index + 1) / (array.length + 1));
    const proportionalWidth = (Math.max(0.2, Number(opening.largeurM) || 0.2) / Math.max(0.2, Number(wall.longueurM) || 0.2)) * lineLength;
    const markerWidth = Math.min(lineLength * 0.28, Math.max(12, proportionalWidth));
    const centerX = x1 + ux * center;
    const centerY = y1 + uy * center;
    const startX = centerX - ux * markerWidth / 2;
    const startY = centerY - uy * markerWidth / 2;
    const endX = centerX + ux * markerWidth / 2;
    const endY = centerY + uy * markerWidth / 2;
    return `<g class="plan-opening ${escapeAttribute(opening.type)}" aria-hidden="true"><line class="plan-opening-gap" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}"/><line class="plan-opening-mark" x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}"/></g>`;
  }).join('');
}

function renderPlanLegend(compact) {
  return `<div class="plan-legend ${compact ? 'compact' : ''}">
    <span><i class="legend-line active"></i>Mur actif</span>
    <span><i class="legend-line selected"></i>Mur sélectionné</span>
    <span><i class="legend-line inactive"></i>Mur inactif</span>
    <span><i class="legend-opening"></i>Ouverture</span>
    ${compact ? '' : '<small>La position des ouvertures est indicative : le moteur utilise uniquement le mur, les dimensions et la quantité saisies.</small>'}
  </div>`;
}

function activatePlanWall(target) {
  state.selectedWallId = target.dataset.planWall;
  state.selectedPieceId = target.dataset.planPiece;
  const requestedStep = Number(target.dataset.planTargetStep);
  if (Number.isInteger(requestedStep) && requestedStep !== state.step) goToStep(requestedStep);
  else renderStep();
}

function handlePlanWallActivation(event) {
  const target = event.target.closest?.('[data-plan-wall]');
  if (!target) return;
  activatePlanWall(target);
}

function getPieceForWall(wall) {
  if (!wall || wall.source !== 'piece') return null;
  return state.input.pieces.find((piece) => piece.id === wall.pieceId || piece.murs.some((item) => item.id === wall.id)) ?? null;
}

function refreshPlanForWall(wall) {
  const piece = getPieceForWall(wall);
  if (piece) refreshPiecePlan(piece.id);
}

function refreshPiecePlan(pieceId) {
  const piece = state.input.pieces.find((item) => item.id === pieceId);
  if (!piece) return;
  document.querySelectorAll('[data-piece-plan-host]').forEach((host) => {
    if (host.dataset.piecePlanHost !== pieceId) return;
    host.innerHTML = renderPiecePlan(piece, {
      targetStep: Number(host.dataset.planTargetStep || state.step),
      compact: host.dataset.planCompact === 'true',
    });
  });
  document.querySelectorAll('[data-piece-status]').forEach((status) => {
    if (status.dataset.pieceStatus === pieceId) status.innerHTML = renderPieceStatus(piece);
  });
}

function formatPlanDimension(value) {
  return Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function renderSimpleWallCard(wall, index) {
  return `
    <div class="wall-card" data-wall-card="${wall.id}">
      <div class="wall-card-head">
        <div><strong>${escapeHtml(wall.label)}</strong><span class="field-tag">PLQ.MUR_SIMPLE.${index + 1}</span></div>
        <div class="inline-actions">
          <button class="btn btn-small btn-ghost" data-select-wall="${wall.id}" type="button">Configurer</button>
          <button class="btn btn-small btn-danger" data-remove-wall="${wall.id}" type="button">Supprimer</button>
        </div>
      </div>
      <div class="form-grid">
        ${textField('Libellé', `wall-label-${wall.id}`, wall.label, '', `PLQ.MUR_SIMPLE.${index + 1}.LIBELLE`, 'span-3')}
        ${numberField('Longueur', `wall-length-${wall.id}`, wall.longueurM, 'm', `PLQ.MUR_SIMPLE.${index + 1}.LONGUEUR`, 'span-3', 0.01)}
        ${numberField('Hauteur', `wall-height-${wall.id}`, wall.hauteurM, 'm', `PLQ.MUR_SIMPLE.${index + 1}.HAUTEUR`, 'span-3', 0.01)}
        <div class="field span-3">${switchRow('Mur actif', 'Inclus dans le calcul.', `wall-active-${wall.id}`, wall.actif, `PLQ.MUR_SIMPLE.${index + 1}.ACTIF`)}</div>
      </div>
    </div>
  `;
}

function bindWorksEvents() {
  state.input.pieces.forEach((piece) => {
    bindInput(`#piece-name-${cssEscape(piece.id)}`, 'input', (value) => { piece.nom = value; refreshPiecePlan(piece.id); touch(); renderProjectInfo(); });
    bindInput(`#piece-length-${cssEscape(piece.id)}`, 'input', (value) => { piece.longueurM = positiveNumber(value); syncPieceWalls(piece); refreshPiecePlan(piece.id); touch(); });
    bindInput(`#piece-width-${cssEscape(piece.id)}`, 'input', (value) => { piece.largeurM = positiveNumber(value); syncPieceWalls(piece); refreshPiecePlan(piece.id); touch(); });
    bindInput(`#piece-height-${cssEscape(piece.id)}`, 'input', (value) => { piece.hauteurM = positiveNumber(value); syncPieceWalls(piece); refreshPiecePlan(piece.id); touch(); });
  });
  state.input.mursSimples.forEach((wall) => {
    bindInput(`#wall-label-${cssEscape(wall.id)}`, 'input', (value) => { wall.label = value; touch(); });
    bindInput(`#wall-length-${cssEscape(wall.id)}`, 'input', (value) => { wall.longueurM = positiveNumber(value); touch(); });
    bindInput(`#wall-height-${cssEscape(wall.id)}`, 'input', (value) => { wall.hauteurM = positiveNumber(value); touch(); });
    bindCheckbox(`#wall-active-${cssEscape(wall.id)}`, (checked) => { wall.actif = checked; touch(); renderProjectInfo(); });
  });
  document.querySelectorAll('[data-remove-piece]').forEach((button) => button.addEventListener('click', () => {
    state.input.pieces = state.input.pieces.filter((piece) => piece.id !== button.dataset.removePiece);
    state.selectedPieceId = state.input.pieces[0]?.id ?? null;
    ensureSelectedWall(); render(); touch();
  }));
  document.querySelectorAll('[data-remove-wall]').forEach((button) => button.addEventListener('click', () => {
    state.input.mursSimples = state.input.mursSimples.filter((wall) => wall.id !== button.dataset.removeWall);
    ensureSelectedWall(); render(); touch();
  }));
  document.querySelectorAll('[data-select-piece]').forEach((button) => button.addEventListener('click', () => {
    state.selectedPieceId = button.dataset.selectPiece;
    const piece = state.input.pieces.find((item) => item.id === state.selectedPieceId);
    state.selectedWallId = piece?.murs[0]?.id ?? state.selectedWallId;
    goToStep(2);
  }));
  document.querySelectorAll('[data-select-wall]').forEach((button) => button.addEventListener('click', () => {
    state.selectedWallId = button.dataset.selectWall;
    goToStep(2);
  }));
}

function renderWallsStep() {
  ensureSelectedWall();
  const wall = getWall(state.selectedWallId);
  const piece = wall ? getPieceForWall(wall) : null;
  stepContent.innerHTML = pageHead(
    'Configuration des parois',
    'Plaques, faces et ossature mur par mur',
    'Chaque mur conserve sa nature réelle. Une cloison possède deux faces actives ; un doublage une seule face. Aucun ratio 60/40 n’est utilisé.'
  ) + (piece ? renderPiecePlanPanel(piece, 2, 'Sélectionnez un mur sur le plan') : '') + wallTabs() + (wall ? renderWallEditor(wall) : emptyState('Aucun mur disponible', 'Retournez à l’étape Ouvrages pour ajouter une pièce ou un mur simple.'));

  bindWallTabs();
  if (wall) bindWallEditor(wall);
}

function wallTabs() {
  const walls = allWalls();
  if (!walls.length) return '';
  return `<div class="item-tabs">${walls.map((wall) => `<button class="item-tab ${wall.id === state.selectedWallId ? 'active' : ''}" data-wall-tab="${wall.id}" type="button"><span class="mini-status"></span>${escapeHtml(wall.label)}</button>`).join('')}</div>`;
}

function renderWallEditor(wall) {
  const ref = wallReference(wall);
  const faceA = wall.parements.find((face) => face.face === 'A');
  const faceB = wall.parements.find((face) => face.face === 'B');
  return `
    <div class="card">
      <div class="card-header">
        <div><h2>${escapeHtml(wall.label)}</h2><p>${wall.source === 'piece' ? 'Mur rattaché à une pièce' : 'Mur simple indépendant'} · ${wall.longueurM.toFixed(2)} × ${wall.hauteurM.toFixed(2)} m</p></div>
        ${switchMarkup('Inclure ce mur', `active-wall-editor-${wall.id}`, wall.actif)}
      </div>
      <div class="form-grid">
        ${textField('Libellé du mur', `editor-wall-label-${wall.id}`, wall.label, '', `${ref}.LIBELLE`, 'span-4')}
        ${numberField('Longueur', `editor-wall-length-${wall.id}`, wall.longueurM, 'm', `${ref}.LONGUEUR`, 'span-4', 0.01)}
        ${numberField('Hauteur', `editor-wall-height-${wall.id}`, wall.hauteurM, 'm', `${ref}.HAUTEUR`, 'span-4', 0.01)}
        ${numberField('Angles sortants', `editor-wall-angles-${wall.id}`, wall.nombreAnglesSortants, 'u', `${ref}.ANGLES_SORTANTS.NOMBRE`, 'span-4', 1)}
        <div class="field full">
          ${labelWithTag('Type de paroi', `${ref}.TYPE_PAROI`)}
          <div class="segmented" id="wallTypeSegment">
            ${segmentButton('Cloison — 2 faces', 'cloison', wall.typeParoi)}
            ${segmentButton('Doublage — 1 face', 'doublage', wall.typeParoi)}
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Parements</h2><p>Le nombre de peaux, la plaque et la finition sont choisis indépendamment pour chaque face.</p></div></div>
      <div class="face-grid">
        ${renderFaceCard(wall, faceA, ref)}
        ${renderFaceCard(wall, faceB, ref)}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Ossature</h2><p>Les quantités seront calculées depuis la longueur réelle du mur et les profils sélectionnés.</p></div></div>
      <div class="form-grid">
        <div class="field span-4">
          ${labelWithTag('Système', `${ref}.OSSATURE.SYSTEME`)}
          <select class="select" id="frame-system">
            <option value="classique" ${wall.ossature.systeme === 'classique' ? 'selected' : ''}>Classique rails / montants</option>
            <option value="optima" ${wall.ossature.systeme === 'optima' ? 'selected' : ''}>Optima — règles Guillaume validées</option>
          </select>
        </div>
        <div class="field span-4">
          ${labelWithTag('Largeur du profil', `${ref}.OSSATURE.LARGEUR`)}
          <select class="select" id="frame-width">${[48,70,90,100,120,140,160].map((width) => `<option value="${width}" ${wall.ossature.largeurProfilMm === width ? 'selected' : ''}>M${width} / R${width}</option>`).join('')}</select>
        </div>
        <div class="field span-4">
          ${labelWithTag('Entraxe', `${ref}.OSSATURE.ENTRAXE`)}
          <select class="select" id="frame-spacing">${[300,400,600].map((value) => `<option value="${value}" ${wall.ossature.entraxeMm === value ? 'selected' : ''}>${value} mm</option>`).join('')}</select>
        </div>
        <div class="field full">
          ${switchRow('Montants doublés', 'Le doublement est visible dans le calcul et la trace.', 'frame-doubled', wall.ossature.montantsDoubles, `${ref}.OSSATURE.MONTANTS_DOUBLES`)}
        </div>
        ${wall.ossature.systeme === 'optima' ? numberField('Nombre de rangées d’appuis', 'frame-supports', wall.ossature.nombreRangeesAppuis ?? Math.max(1, Math.ceil(wall.hauteurM / 1.35)), 'rangée(s)', `${ref}.OSSATURE.RANGEES_APPUIS`, 'full', 1) : ''}
      </div>
      ${wall.ossature.systeme === 'optima' ? `<div class="alert info"><div><strong>Règles Optima intégrées</strong><p>Proposition automatique : 1 rangée tous les 1,35 m. Consommations : F530 1,8 ml/m², lisse 0,9 ml/m², appui 0,75 u/m², clé 0,75 u/m² et 2 fixations/m² par rangée. Les prix réels des appuis, clés et fixations restent requis dans le catalogue.</p></div></div>` : ''}
    </div>
  `;
}

function renderFaceCard(wall, face, ref) {
  const isDisabled = wall.typeParoi === 'doublage' && face.face === 'B';
  return `
    <div class="face-card ${isDisabled ? 'disabled' : ''}">
      <div class="face-title"><strong>Face ${face.face}</strong>${switchMarkup('Active', `face-active-${face.face}`, face.actif && !isDisabled, isDisabled)}</div>
      <div class="form-grid">
        <div class="field full">
          ${labelWithTag('Type de plaque', `${ref}.FACE_${face.face}.PLAQUE`)}
          <select class="select" id="face-plate-${face.face}" ${isDisabled ? 'disabled' : ''}>
            ${plateOptions(face.typePlaque)}
          </select>
        </div>
        <div class="field full">
          ${labelWithTag('Nombre de peaux', `${ref}.FACE_${face.face}.PEAUX`)}
          <div class="segmented" id="face-skins-${face.face}">
            ${segmentButton('1 peau', '1', String(face.nombrePeaux), isDisabled)}
            ${segmentButton('2 peaux', '2', String(face.nombrePeaux), isDisabled)}
          </div>
        </div>
        <div class="field full">
          ${labelWithTag('Niveau de finition', `${ref}.FACE_${face.face}.FINITION`)}
          <select class="select" id="face-finish-${face.face}" ${isDisabled ? 'disabled' : ''}>
            ${finishOptions(face.finition.niveau)}
          </select>
        </div>
        <div class="field full">
          ${switchRow('Impression', 'Disponible avec prêt à peindre ou finition soignée.', `face-impression-${face.face}`, face.finition.impression, `${ref}.FACE_${face.face}.IMPRESSION`, isDisabled)}
        </div>
      </div>
    </div>
  `;
}

function bindWallTabs() {
  document.querySelectorAll('[data-wall-tab]').forEach((button) => button.addEventListener('click', () => {
    state.selectedWallId = button.dataset.wallTab;
    renderStep();
  }));
}

function bindWallEditor(wall) {
  bindCheckbox(`#active-wall-editor-${cssEscape(wall.id)}`, (checked) => { wall.actif = checked; refreshPlanForWall(wall); touch(); renderProjectInfo(); });
  bindInput(`#editor-wall-label-${cssEscape(wall.id)}`, 'input', (value) => { wall.label = value; refreshPlanForWall(wall); touch(); renderStep(); });
  bindInput(`#editor-wall-length-${cssEscape(wall.id)}`, 'input', (value) => { wall.longueurM = positiveNumber(value); touch(); });
  bindInput(`#editor-wall-height-${cssEscape(wall.id)}`, 'input', (value) => { wall.hauteurM = positiveNumber(value); touch(); });
  bindInput(`#editor-wall-angles-${cssEscape(wall.id)}`, 'input', (value) => { wall.nombreAnglesSortants = positiveInteger(value); touch(); });
  bindSegments('#wallTypeSegment', (value) => {
    wall.typeParoi = value;
    const faceB = wall.parements.find((face) => face.face === 'B');
    faceB.actif = value === 'cloison';
    renderStep(); touch();
  });
  wall.parements.forEach((face) => {
    bindCheckbox(`#face-active-${face.face}`, (checked) => {
      if (wall.typeParoi === 'doublage' && face.face === 'B') return;
      face.actif = checked; touch();
    });
    bindInput(`#face-plate-${face.face}`, 'change', (value) => { face.typePlaque = value; touch(); });
    bindSegments(`#face-skins-${face.face}`, (value) => { setStableSkinIds(face, Number(value)); touch(); });
    bindInput(`#face-finish-${face.face}`, 'change', (value) => {
      face.finition.niveau = value;
      if (!['pret_a_peindre','soignee'].includes(value)) face.finition.impression = false;
      renderStep(); touch();
    });
    bindCheckbox(`#face-impression-${face.face}`, (checked) => {
      face.finition.impression = checked;
      touch();
    });
  });
  bindInput('#frame-system', 'change', (value) => {
    wall.ossature.systeme = value;
    if (value === 'classique') { delete wall.ossature.nombreRangeesAppuis; delete wall.ossature.nombreAppuisParM2; } else { wall.ossature.nombreRangeesAppuis = Math.max(1, Math.ceil(wall.hauteurM / 1.35)); }
    renderStep(); touch();
  });
  bindInput('#frame-width', 'change', (value) => { wall.ossature.largeurProfilMm = Number(value); touch(); });
  bindInput('#frame-spacing', 'change', (value) => { wall.ossature.entraxeMm = Number(value); touch(); });
  bindCheckbox('#frame-doubled', (checked) => { wall.ossature.montantsDoubles = checked; touch(); });
  bindInput('#frame-supports', 'input', (value) => { wall.ossature.nombreRangeesAppuis = positiveInteger(value); touch(); });
}

function renderEquipmentStep() {
  ensureSelectedWall();
  ensureSelectedPiece();
  const wall = getWall(state.selectedWallId);
  const wallPiece = wall ? getPieceForWall(wall) : null;
  if (wallPiece) state.selectedPieceId = wallPiece.id;
  const piece = state.input.pieces.find((item) => item.id === state.selectedPieceId);

  stepContent.innerHTML = pageHead(
    'Équipements et compléments',
    'Ouvertures, isolation, renforts et plafonds',
    'Les ouvertures sont rattachées à un mur unique. L’isolation est calculée sur l’ouvrage concerné et le plafond reste lié à sa pièce.'
  ) + `
    ${wallPiece ? renderPiecePlanPanel(wallPiece, 3, 'Ouvertures et mur sélectionné') : ''}
    ${wallTabs()}
    ${wall ? renderOpeningsIsolation(wall) : emptyState('Aucun mur disponible', 'Ajoutez un ouvrage pour configurer les ouvertures et l’isolation.')}
    ${renderCeilingSection(piece)}
  `;

  bindWallTabs();
  if (wall) bindEquipmentWallEvents(wall);
  bindCeilingEvents(piece);
}

function renderOpeningsIsolation(wall) {
  const ref = wallReference(wall);
  const isolation = wall.isolation;
  const thicknessWarning = isolation?.active && isolation.couches.some((layer) => Number(layer.epaisseurMm) > Number(wall.ossature.largeurProfilMm));
  return `
    <div class="card">
      <div class="card-header">
        <div><h2>Ouvertures — ${escapeHtml(wall.label)}</h2><p>La surface est déduite des parements, mais l’ossature périphérique peut rester active.</p></div>
        <button class="btn btn-ghost" id="addOpeningBtn" type="button">+ Ajouter une ouverture</button>
      </div>
      <div id="openingList">
        ${wall.ouvertures.length ? wall.ouvertures.map((opening, index) => renderOpening(opening, index, ref)).join('') : emptyState('Aucune ouverture', 'Ajoutez une porte, une fenêtre ou une autre réservation si nécessaire.')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Isolation — abaque Guillaume v2</h2><p>Les prix sont des coûts d’achat HT/m² à marger et restent modifiables. Pertes : 10 % panneaux/rouleaux, 3 % soufflé.</p></div></div>
      ${switchRow('Activer l’isolation', 'Suggestion selon l’usage et l’épaisseur du profil, avec choix manuel possible.', 'isolation-active', isolation?.active ?? false, `${ref}.ISOLATION.ACTIVE`)}
      ${isolation?.active ? `
        <div class="form-grid" style="margin-top:16px">
          ${renderIsolationLayer(isolation.couches[0], 1, ref)}
          <div class="field span-4">
            ${labelWithTag('Nombre de couches', `${ref}.ISOLATION.NB_COUCHES`)}
            <div class="segmented" id="isolation-layers-count">${segmentButton('1 couche','1',String(isolation.couches.length))}${segmentButton('2 couches','2',String(isolation.couches.length))}</div>
          </div>
          ${isolation.couches.length === 2 ? `${renderIsolationLayer(isolation.couches[1], 2, ref)}<div class="field full">${switchRow('Pose croisée', 'Coefficient ×1,15 sur la main-d’œuvre de la seconde couche uniquement.', 'isolation-crossed', isolation.poseCroisee === true, `${ref}.ISOLATION.POSE_CROISEE`)}</div>` : ''}
          <div class="field full">
            ${switchRow('Pare-vapeur', wall.typeParoi === 'doublage' ? 'Prix de vente direct : 3,50 €/m².' : 'Règle automatique limitée au doublage.', 'isolation-vapor', isolation.pareVapeur, `${ref}.ISOLATION.PARE_VAPEUR`, wall.typeParoi !== 'doublage')}
            ${switchRow('Membrane hygrovariable / frein-vapeur', wall.typeParoi === 'doublage' ? 'Prix de vente direct : 5 €/m², cumulable avec le pare-vapeur.' : 'Règle automatique limitée au doublage.', 'isolation-brake', isolation.freinVapeur, `${ref}.ISOLATION.FREIN_VAPEUR`, wall.typeParoi !== 'doublage')}
          </div>
          ${thicknessWarning ? `<div class="alert warning full"><div><strong>Épaisseur supérieure au profil</strong><p>L’isolant dépasse ${wall.ossature.largeurProfilMm} mm. Le calcul reste autorisé, mais l’artisan doit confirmer explicitement la configuration.</p></div></div>` : ''}
        </div>
      ` : ''}
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Renforts</h2><p>Chaque renfort est une ligne distincte, sans ajout automatique de matière cachée.</p></div><button class="btn btn-ghost" id="addReinforcementBtn" type="button">+ Ajouter un renfort</button></div>
      ${wall.renforts.length ? wall.renforts.map((reinforcement, index) => `
        <div class="wall-card">
          <div class="form-grid">
            ${textField('Libellé', `reinforcement-label-${reinforcement.id}`, reinforcement.label, '', `${ref}.RENFORT.${index + 1}.LIBELLE`, 'span-4')}
            ${numberField('Quantité', `reinforcement-qty-${reinforcement.id}`, reinforcement.quantite, 'u', `${ref}.RENFORT.${index + 1}.QUANTITE`, 'span-4', 1)}
            ${numberField('Prix unitaire HT', `reinforcement-price-${reinforcement.id}`, centsToEuros(reinforcement.prixVenteUnitaireOverrideCents ?? 7500), '€', `${ref}.RENFORT.${index + 1}.PRIX`, 'span-4', 0.01)}
          </div>
          <div class="inline-actions" style="justify-content:flex-end"><button class="btn btn-small btn-danger" data-remove-reinforcement="${reinforcement.id}" type="button">Supprimer</button></div>
        </div>
      `).join('') : emptyState('Aucun renfort', 'Ajoutez uniquement les renforts réellement prévus au chantier.')}
    </div>
  `;
}

function renderIsolationLayer(layer, number, ref) {
  const article = getIsolationArticle(layer?.articleCatalogueId) ?? ABAQUE_ISOLANTS_V2[0];
  const currentPrice = layer?.prixAchatM2OverrideCents === undefined ? article.priceEuroM2 : centsToEuros(layer.prixAchatM2OverrideCents);
  return `
    <div class="field span-6">${labelWithTag(`Article couche ${number}`, `${ref}.ISOLATION.COUCHE_${number}.ARTICLE`)}<select class="select" id="isolation-layer-${number}">${isolationOptions(layer?.articleCatalogueId)}</select></div>
    ${numberField(`Épaisseur couche ${number}`, `isolation-thickness-${number}`, layer?.epaisseurMm ?? article.thicknessMm, 'mm', `${ref}.ISOLATION.COUCHE_${number}.EPAISSEUR`, 'span-3', 1)}
    ${numberField(`Coût achat HT/m² couche ${number}`, `isolation-price-${number}`, currentPrice, '€', `${ref}.ISOLATION.COUCHE_${number}.PRIX_ACHAT`, 'span-3', 0.01)}
    <div class="field full">${switchRow(`Panneau semi-rigide couche ${number}`, 'Coefficient ×1,20 sur l’achat matière et la main-d’œuvre avant marge.', `isolation-semi-${number}`, layer?.semiRigide === true, `${ref}.ISOLATION.COUCHE_${number}.SEMI_RIGIDE`)}</div>
  `;
}

function renderOpening(opening, index, ref) {
  return `
    <div class="wall-card">
      <div class="wall-card-head"><strong>Ouverture ${index + 1}</strong><button class="btn btn-small btn-danger" data-remove-opening="${opening.id}" type="button">Supprimer</button></div>
      <div class="form-grid">
        <div class="field span-3">${labelWithTag('Type', `${ref}.OUVERTURE.${index + 1}.TYPE`)}<select class="select" id="opening-type-${opening.id}">${['porte','fenetre','autre'].map((type) => `<option value="${type}" ${opening.type === type ? 'selected' : ''}>${capitalize(type)}</option>`).join('')}</select></div>
        ${numberField('Largeur', `opening-width-${opening.id}`, opening.largeurM, 'm', `${ref}.OUVERTURE.${index + 1}.LARGEUR`, 'span-3', 0.01)}
        ${numberField('Hauteur', `opening-height-${opening.id}`, opening.hauteurM, 'm', `${ref}.OUVERTURE.${index + 1}.HAUTEUR`, 'span-3', 0.01)}
        ${numberField('Quantité', `opening-qty-${opening.id}`, opening.quantite, 'u', `${ref}.OUVERTURE.${index + 1}.QUANTITE`, 'span-3', 1)}
        <div class="field full">${switchRow('Ossature périphérique', 'Ajoute les montants et profils horizontaux validés.', `opening-frame-${opening.id}`, opening.ossaturePeripherique, `${ref}.OUVERTURE.${index + 1}.OSSATURE`)}</div>
      </div>
    </div>
  `;
}

function renderCeilingSection(piece) {
  if (!state.input.pieces.length) {
    return `<div class="card">${emptyState('Aucune pièce pour le plafond', 'Le plafond doit être rattaché à une pièce. Ajoutez une pièce à l’étape Ouvrages.')}</div>`;
  }
  const p = piece ?? state.input.pieces[0];
  const ceiling = p.plafond;
  return `
    <div class="card">
      <div class="card-header"><div><h2>Plafond</h2><p>Choisissez d’abord la pièce concernée, puis activez son plafond.</p></div></div>
      <div class="item-tabs">${state.input.pieces.map((item) => `<button class="item-tab ${item.id === p.id ? 'active' : ''}" data-piece-tab="${item.id}" type="button"><span class="mini-status"></span>${escapeHtml(item.nom)}</button>`).join('')}</div>
      ${switchRow('Activer le plafond de cette pièce', 'Le plafond droit utilise la surface de la pièce ou une surface saisie.', 'ceiling-active', ceiling?.actif ?? false, `PLQ.PIECE.${p.id}.PLAFOND.ACTIF`)}
      ${ceiling?.actif ? `
        <div class="form-grid" style="margin-top:16px">
          <div class="field span-4">${labelWithTag('Type de plafond', `PLQ.PIECE.${p.id}.PLAFOND.TYPE`)}<select class="select" id="ceiling-type"><option value="droit" ${ceiling.type === 'droit' ? 'selected' : ''}>Plafond droit</option><option value="rampant" ${ceiling.type === 'rampant' ? 'selected' : ''}>Rampant simple +5 €/m²</option><option value="rampant_complexe" ${ceiling.type === 'rampant_complexe' ? 'selected' : ''}>Rampant complexe +11 €/m²</option></select></div>
          <div class="field span-4">${labelWithTag('Calcul de surface', `PLQ.PIECE.${p.id}.PLAFOND.SURFACE_MODE`)}<div class="segmented" id="ceiling-surface-mode">${segmentButton('Depuis la pièce','piece',ceiling.calculDepuisPiece ? 'piece':'manual')}${segmentButton('Saisie directe','manual',ceiling.calculDepuisPiece ? 'piece':'manual')}</div></div>
          ${!ceiling.calculDepuisPiece ? numberField('Surface saisie', 'ceiling-surface', ceiling.surfaceSaisieM2 ?? p.longueurM * p.largeurM, 'm²', `PLQ.PIECE.${p.id}.PLAFOND.SURFACE`, 'span-4', 0.01) : ''}
          <div class="field span-4">${labelWithTag('Plaque', `PLQ.PIECE.${p.id}.PLAFOND.PLAQUE`)}<select class="select" id="ceiling-plate">${plateOptions(ceiling.typePlaque)}</select></div>
          <div class="field span-4">${labelWithTag('Nombre de peaux', `PLQ.PIECE.${p.id}.PLAFOND.PEAUX`)}<div class="segmented" id="ceiling-skins">${segmentButton('1 peau','1',String(ceiling.nombrePeaux))}${segmentButton('2 peaux','2',String(ceiling.nombrePeaux))}</div></div>
          <div class="field span-4">${labelWithTag('Suspente', `PLQ.PIECE.${p.id}.PLAFOND.SUSPENTE`)}<select class="select" id="ceiling-hanger">${hangerOptions(ceiling.suspenteArticleCatalogueId)}</select></div>
          <div class="field span-4">${labelWithTag('Finition', `PLQ.PIECE.${p.id}.PLAFOND.FINITION`)}<select class="select" id="ceiling-finish">${finishOptions(ceiling.finition.niveau)}</select></div>
          <div class="field span-8">${switchRow('Impression plafond', 'Disponible avec prêt à peindre ou finition soignée.', 'ceiling-impression', ceiling.finition.impression, `PLQ.PIECE.${p.id}.PLAFOND.IMPRESSION`)}</div>
          <div class="field full">${switchRow('Isolation du plafond / combles', 'Abaque v2 : rouleaux/panneaux 10 % de perte, soufflé 3 %. Le R reste informatif.', 'ceiling-isolation-active', ceiling.isolation?.active ?? false, `PLQ.PIECE.${p.id}.PLAFOND.ISOLATION.ACTIVE`)}</div>
          ${ceiling.isolation?.active ? `${renderCeilingIsolation(ceiling, p.id)}` : ''}
        </div>
        ${ceiling.type !== 'droit' ? `<div class="alert warning"><div><strong>Estimation simplifiée du rampant</strong><p>La plus-value est calculée, mais l’ossature complexe n’est pas redimensionnée automatiquement.</p></div></div>` : ''}
      ` : ''}
    </div>
  `;
}

function renderCeilingIsolation(ceiling, pieceId) {
  const isolation = ceiling.isolation;
  const first = isolation.couches[0] ?? newIsolationLayer(ceiling.id, 1, ABAQUE_ISOLANTS_V2.find((article) => article.usage.includes('Combles')) ?? ABAQUE_ISOLANTS_V2[0]);
  const article = getIsolationArticle(first.articleCatalogueId) ?? ABAQUE_ISOLANTS_V2[0];
  return `
    <div class="field span-6">${labelWithTag('Isolant plafond / combles', `PLQ.PIECE.${pieceId}.PLAFOND.ISOLATION.ARTICLE`)}<select class="select" id="ceiling-isolation-layer">${isolationOptions(first.articleCatalogueId)}</select></div>
    ${numberField('Épaisseur isolation', 'ceiling-isolation-thickness', first.epaisseurMm ?? article.thicknessMm, 'mm', `PLQ.PIECE.${pieceId}.PLAFOND.ISOLATION.EPAISSEUR`, 'span-3', 1)}
    ${numberField('Coût achat HT/m²', 'ceiling-isolation-price', first.prixAchatM2OverrideCents === undefined ? article.priceEuroM2 : centsToEuros(first.prixAchatM2OverrideCents), '€', `PLQ.PIECE.${pieceId}.PLAFOND.ISOLATION.PRIX_ACHAT`, 'span-3', 0.01)}
    <div class="field full">${switchRow('Panneau semi-rigide', 'Coefficient ×1,20 sur matière et main-d’œuvre.', 'ceiling-isolation-semi', first.semiRigide === true, `PLQ.PIECE.${pieceId}.PLAFOND.ISOLATION.SEMI_RIGIDE`)}</div>
  `;
}

function bindEquipmentWallEvents(wall) {
  document.querySelector('#addOpeningBtn')?.addEventListener('click', () => {
    wall.ouvertures.push({ id: uid('opening'), type: 'porte', largeurM: 0.9, hauteurM: 2.1, quantite: 1, ossaturePeripherique: true });
    renderStep(); touch();
  });
  wall.ouvertures.forEach((opening) => {
    bindInput(`#opening-type-${cssEscape(opening.id)}`, 'change', (value) => { opening.type = value; refreshPlanForWall(wall); touch(); });
    bindInput(`#opening-width-${cssEscape(opening.id)}`, 'input', (value) => { opening.largeurM = positiveNumber(value); refreshPlanForWall(wall); touch(); });
    bindInput(`#opening-height-${cssEscape(opening.id)}`, 'input', (value) => { opening.hauteurM = positiveNumber(value); refreshPlanForWall(wall); touch(); });
    bindInput(`#opening-qty-${cssEscape(opening.id)}`, 'input', (value) => { opening.quantite = positiveInteger(value); refreshPlanForWall(wall); touch(); });
    bindCheckbox(`#opening-frame-${cssEscape(opening.id)}`, (checked) => { opening.ossaturePeripherique = checked; touch(); });
  });
  document.querySelectorAll('[data-remove-opening]').forEach((button) => button.addEventListener('click', () => {
    wall.ouvertures = wall.ouvertures.filter((opening) => opening.id !== button.dataset.removeOpening);
    renderStep(); touch();
  }));
  bindCheckbox('#isolation-active', (checked) => {
    if (checked) {
      const suggested = suggestIsolationForWall(wall);
      wall.isolation = wall.isolation ?? { active: true, couches: [newIsolationLayer(wall.id, 1, suggested)], pareVapeur: false, freinVapeur: false, poseCroisee: false };
    }
    wall.isolation.active = checked;
    renderStep(); touch();
  });
  if (wall.isolation?.active) {
    [1,2].forEach((number) => {
      const layer = wall.isolation.couches[number - 1];
      if (!layer) return;
      bindInput(`#isolation-layer-${number}`, 'change', (value) => { applyIsolationArticle(layer, value); renderStep(); touch(); });
      bindInput(`#isolation-thickness-${number}`, 'input', (value) => { layer.epaisseurMm = positiveNumber(value); renderStep(); touch(); });
      bindInput(`#isolation-price-${number}`, 'input', (value) => { layer.prixAchatM2OverrideCents = eurosToCents(value); touch(); });
      bindCheckbox(`#isolation-semi-${number}`, (checked) => { layer.semiRigide = checked; touch(); });
    });
    bindSegments('#isolation-layers-count', (value) => {
      if (value === '2' && wall.isolation.couches.length === 1) {
        wall.isolation.couches.push(newIsolationLayer(wall.id, 2, suggestIsolationForWall(wall, true)));
      }
      if (value === '1') { wall.isolation.couches = wall.isolation.couches.slice(0, 1); wall.isolation.poseCroisee = false; }
      renderStep(); touch();
    });
    bindCheckbox('#isolation-crossed', (checked) => { wall.isolation.poseCroisee = checked; touch(); });
    bindCheckbox('#isolation-vapor', (checked) => { wall.isolation.pareVapeur = checked; touch(); });
    bindCheckbox('#isolation-brake', (checked) => { wall.isolation.freinVapeur = checked; touch(); });
  }
  document.querySelector('#addReinforcementBtn')?.addEventListener('click', () => {
    wall.renforts.push({ id: uid('reinforcement'), label: 'Renfort OSB', quantite: 1, prixVenteUnitaireOverrideCents: 7500 });
    renderStep(); touch();
  });
  wall.renforts.forEach((reinforcement) => {
    bindInput(`#reinforcement-label-${cssEscape(reinforcement.id)}`, 'input', (value) => { reinforcement.label = value; touch(); });
    bindInput(`#reinforcement-qty-${cssEscape(reinforcement.id)}`, 'input', (value) => { reinforcement.quantite = positiveInteger(value); touch(); });
    bindInput(`#reinforcement-price-${cssEscape(reinforcement.id)}`, 'input', (value) => { reinforcement.prixVenteUnitaireOverrideCents = eurosToCents(value); touch(); });
  });
  document.querySelectorAll('[data-remove-reinforcement]').forEach((button) => button.addEventListener('click', () => {
    wall.renforts = wall.renforts.filter((item) => item.id !== button.dataset.removeReinforcement);
    renderStep(); touch();
  }));
}

function bindCeilingEvents(piece) {
  document.querySelectorAll('[data-piece-tab]').forEach((button) => button.addEventListener('click', () => {
    state.selectedPieceId = button.dataset.pieceTab;
    renderStep();
  }));
  if (!piece) return;
  bindCheckbox('#ceiling-active', (checked) => {
    piece.plafond = piece.plafond ?? createCeiling();
    piece.plafond.actif = checked;
    refreshPiecePlan(piece.id);
    renderStep(); touch();
  });
  const ceiling = piece.plafond;
  if (!ceiling?.actif) return;
  bindInput('#ceiling-type', 'change', (value) => { ceiling.type = value; refreshPiecePlan(piece.id); renderStep(); touch(); });
  bindSegments('#ceiling-surface-mode', (value) => {
    ceiling.calculDepuisPiece = value === 'piece';
    if (!ceiling.calculDepuisPiece && ceiling.surfaceSaisieM2 === undefined) ceiling.surfaceSaisieM2 = piece.longueurM * piece.largeurM;
    if (ceiling.calculDepuisPiece) delete ceiling.surfaceSaisieM2;
    renderStep(); touch();
  });
  bindInput('#ceiling-surface', 'input', (value) => { ceiling.surfaceSaisieM2 = positiveNumber(value); touch(); });
  bindInput('#ceiling-plate', 'change', (value) => { ceiling.typePlaque = value; touch(); });
  bindSegments('#ceiling-skins', (value) => { setStableSkinIds(ceiling, Number(value)); touch(); });
  bindInput('#ceiling-hanger', 'change', (value) => { ceiling.suspenteArticleCatalogueId = value || undefined; touch(); });
  bindInput('#ceiling-finish', 'change', (value) => {
    ceiling.finition.niveau = value;
    if (!['pret_a_peindre','soignee'].includes(value)) ceiling.finition.impression = false;
    renderStep(); touch();
  });
  bindCheckbox('#ceiling-impression', (checked) => { ceiling.finition.impression = checked; touch(); });
  bindCheckbox('#ceiling-isolation-active', (checked) => {
    if (checked) {
      const article = ABAQUE_ISOLANTS_V2.find((item) => item.usage.includes('Combles')) ?? ABAQUE_ISOLANTS_V2[0];
      ceiling.isolation = ceiling.isolation ?? { active: true, couches: [newIsolationLayer(ceiling.id, 1, article)], pareVapeur: false, freinVapeur: false, poseCroisee: false };
    }
    ceiling.isolation.active = checked;
    renderStep(); touch();
  });
  if (ceiling.isolation?.active) {
    const layer = ceiling.isolation.couches[0];
    bindInput('#ceiling-isolation-layer', 'change', (value) => { applyIsolationArticle(layer, value); renderStep(); touch(); });
    bindInput('#ceiling-isolation-thickness', 'input', (value) => { layer.epaisseurMm = positiveNumber(value); touch(); });
    bindInput('#ceiling-isolation-price', 'input', (value) => { layer.prixAchatM2OverrideCents = eurosToCents(value); touch(); });
    bindCheckbox('#ceiling-isolation-semi', (checked) => { layer.semiRigide = checked; touch(); });
  }
}

function renderOptionsStep() {
  const o = state.input.optionsChantier;
  const materialPricing = state.input.overrides.materialPricing ?? { mode: 'markup_pct', value: 30 };
  stepContent.innerHTML = pageHead(
    'Options et paramètres',
    'Complexité, plus-values et réglages visibles',
    'Les paramètres modifiables restent explicites et sont enregistrés comme overrides avec un motif. Aucune option directe n’ajoute du temps ou de la matière automatiquement.'
  ) + `
    <div class="card">
      <div class="card-header"><div><h2>Complexité du chantier</h2><p>Le coefficient ne s’applique qu’aux temps de pose calculés, jamais aux forfaits à prix direct.</p></div></div>
      <div class="field full">
        ${labelWithTag('Niveau de complexité', 'PLQ.OPTIONS.COMPLEXITE')}
        <div class="segmented" id="complexitySegment">${segmentButton('Simple × 0,90','simple',o.complexite)}${segmentButton('Moyenne × 1,00','moyenne',o.complexite)}${segmentButton('Complexe × 1,30','complexe',o.complexite)}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Options chantier</h2><p>Chaque option active apparaît distinctement dans le devis.</p></div></div>
      ${switchRow('Accès difficile', 'Forfait initial de 450 € HT, modifiable.', 'option-access', o.accesDifficile, 'PLQ.OPTIONS.ACCES_DIFFICILE')}
      ${o.accesDifficile ? numberField('Prix accès difficile', 'option-access-price', centsToEuros(o.accesDifficilePrixOverrideCents ?? 45000), '€ HT', 'PLQ.OPTIONS.ACCES_DIFFICILE.PRIX', 'full', 0.01) : ''}
      ${switchRow('Reprise sur existant', 'Portée actuelle : une fois par chantier, paramétrable.', 'option-existing', o.repriseExistant, 'PLQ.OPTIONS.REPRISE_EXISTANT')}
      ${o.repriseExistant ? numberField('Prix reprise sur existant', 'option-existing-price', centsToEuros(o.repriseExistantPrixOverrideCents ?? 15000), '€ HT', 'PLQ.OPTIONS.REPRISE_EXISTANT.PRIX', 'full', 0.01) : ''}
      ${switchRow('Nombreuses découpes / spots', 'Plus-value de 2 € HT/m² uniquement sur les ouvrages sélectionnés.', 'option-cuts', o.nombreusesDecoupesSpots, 'PLQ.OPTIONS.DECOUPES_SPOTS')}
      ${o.nombreusesDecoupesSpots ? renderCutTargets(o) : ''}
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Paramètres de prix</h2><p>Ces réglages remplacent explicitement les paramètres entreprise de démonstration.</p></div></div>
      <div class="form-grid">
        ${numberField('Taux horaire', 'override-hourly-rate', centsToEuros(state.input.overrides.tauxHoraireCents ?? 4500), '€ HT/h', 'PLQ.OVERRIDE.TAUX_HORAIRE', 'span-4', 0.01)}
        <div class="field span-4">${labelWithTag('Mode de valorisation matière', 'PLQ.OVERRIDE.MATIERE.MODE')}<select class="select" id="material-pricing-mode"><option value="markup_pct" ${materialPricing.mode === 'markup_pct' ? 'selected':''}>Marge en %</option><option value="coefficient" ${materialPricing.mode === 'coefficient' ? 'selected':''}>Coefficient multiplicateur</option></select></div>
        ${numberField(materialPricing.mode === 'markup_pct' ? 'Marge matière' : 'Coefficient matière', 'material-pricing-value', materialPricing.value, materialPricing.mode === 'markup_pct' ? '%' : '×', 'PLQ.OVERRIDE.MATIERE.VALEUR', 'span-4', 0.01)}
        ${numberField('Perte plaques murs', 'override-plate-loss-wall', state.input.overrides.pertePlaquesMurPct ?? 7, '%', 'PLQ.OVERRIDE.PERTE_PLAQUES_MUR', 'span-4', 0.1)}${numberField('Perte plaques plafonds', 'override-plate-loss-ceiling', state.input.overrides.pertePlaquesPlafondPct ?? 10, '%', 'PLQ.OVERRIDE.PERTE_PLAQUES_PLAFOND', 'span-4', 0.1)}${numberField('Perte plaques rampants', 'override-plate-loss-sloped', state.input.overrides.pertePlaquesRampantPct ?? 12, '%', 'PLQ.OVERRIDE.PERTE_PLAQUES_RAMPANT', 'span-4', 0.1)}
        <div class="field span-8">${labelWithTag('Motif des modifications', 'PLQ.OVERRIDE.MOTIF')}<textarea class="textarea" id="override-reason" placeholder="Obligatoire pour tracer une modification manuelle.">${escapeHtml(state.input.overrides.motif ?? 'Paramètres ajustés par l’artisan dans l’interface Plaquiste V2.')}</textarea></div>
      </div>
      <div class="alert info"><div><strong>Pertes plaques validées par Guillaume</strong><p>Murs 7 %, plafonds droits 10 %, rampants 12 %. Toute modification artisan reste tracée.</p></div></div>
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Options directes</h2><p>Caisson, niche, éclairage intégré ou autre extra : libellé, quantité et prix uniquement.</p></div><button class="btn btn-ghost" id="addDirectOptionBtn" type="button">+ Ajouter une option</button></div>
      ${o.optionsDirectes.length ? o.optionsDirectes.map((option, index) => renderDirectOption(option, index)).join('') : emptyState('Aucune option directe', 'N’ajoutez que les extras réellement vendus au chantier.')}
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Articles libres</h2><p>Ajoutez un article manuel ou une référence catalogue. Aucun prix n’est inventé : au moins un coût, un prix de vente ou un identifiant catalogue est requis dès que la quantité est positive.</p></div><button class="btn btn-ghost" id="addFreeArticleBtn" type="button">+ Ajouter un article</button></div>
      ${o.articlesLibres.length ? o.articlesLibres.map((article, index) => renderFreeArticle(article, index)).join('') : emptyState('Aucun article libre', 'Utilisez cette zone pour les produits hors bibliothèque métier ou les compléments ponctuels.')}
    </div>
  `;

  bindSegments('#complexitySegment', (value) => { o.complexite = value; touch(); });
  bindCheckbox('#option-access', (checked) => { o.accesDifficile = checked; renderStep(); touch(); });
  bindInput('#option-access-price', 'input', (value) => { o.accesDifficilePrixOverrideCents = eurosToCents(value); touch(); });
  bindCheckbox('#option-existing', (checked) => { o.repriseExistant = checked; renderStep(); touch(); });
  bindInput('#option-existing-price', 'input', (value) => { o.repriseExistantPrixOverrideCents = eurosToCents(value); touch(); });
  bindCheckbox('#option-cuts', (checked) => { o.nombreusesDecoupesSpots = checked; if (!checked) o.nombreusesDecoupesSpotsOuvrageIds = []; renderStep(); touch(); });
  document.querySelectorAll('[data-cut-target]').forEach((element) => element.addEventListener('change', () => {
    const targetId = element.dataset.cutTarget;
    const selected = new Set(o.nombreusesDecoupesSpotsOuvrageIds);
    if (element.checked) selected.add(targetId); else selected.delete(targetId);
    o.nombreusesDecoupesSpotsOuvrageIds = [...selected];
    touch();
  }));
  bindInput('#override-hourly-rate', 'input', (value) => { state.input.overrides.tauxHoraireCents = eurosToCents(value); touch(); });
  bindInput('#material-pricing-mode', 'change', (value) => {
    state.input.overrides.materialPricing = { mode: value, value: state.input.overrides.materialPricing?.value ?? (value === 'markup_pct' ? 30 : 1.3) };
    renderStep(); touch();
  });
  bindInput('#material-pricing-value', 'input', (value) => {
    const mode = state.input.overrides.materialPricing?.mode ?? 'markup_pct';
    state.input.overrides.materialPricing = { mode, value: nonNegativeNumber(value) };
    touch();
  });
  bindInput('#override-plate-loss-wall', 'input', (value) => { state.input.overrides.pertePlaquesMurPct = nonNegativeNumber(value); touch(); });
  bindInput('#override-plate-loss-ceiling', 'input', (value) => { state.input.overrides.pertePlaquesPlafondPct = nonNegativeNumber(value); touch(); });
  bindInput('#override-plate-loss-sloped', 'input', (value) => { state.input.overrides.pertePlaquesRampantPct = nonNegativeNumber(value); touch(); });
  bindInput('#override-reason', 'input', (value) => { state.input.overrides.motif = value; touch(); });
  document.querySelector('#addDirectOptionBtn').addEventListener('click', () => {
    o.optionsDirectes.push({ id: uid('direct'), label: 'Option complémentaire', active: true, quantite: 1, unite: 'forfait', prixVenteUnitaireHtCents: 0, scope: 'chantier' });
    renderStep(); touch();
  });
  o.optionsDirectes.forEach((option) => {
    bindInput(`#direct-label-${cssEscape(option.id)}`, 'input', (value) => { option.label = value; touch(); });
    bindCheckbox(`#direct-active-${cssEscape(option.id)}`, (checked) => { option.active = checked; touch(); });
    bindInput(`#direct-qty-${cssEscape(option.id)}`, 'input', (value) => { option.quantite = nonNegativeNumber(value); touch(); });
    bindInput(`#direct-unit-${cssEscape(option.id)}`, 'change', (value) => { option.unite = value; touch(); });
    bindInput(`#direct-price-${cssEscape(option.id)}`, 'input', (value) => { option.prixVenteUnitaireHtCents = eurosToCents(value); touch(); });
  });
  document.querySelectorAll('[data-remove-direct]').forEach((button) => button.addEventListener('click', () => {
    o.optionsDirectes = o.optionsDirectes.filter((option) => option.id !== button.dataset.removeDirect);
    renderStep(); touch();
  }));

  document.querySelector('#addFreeArticleBtn')?.addEventListener('click', () => {
    o.articlesLibres.push({ id: uid('free-article'), label: 'Article libre', quantite: 0, unite: 'unit' });
    renderStep(); touch();
  });
  o.articlesLibres.forEach((article) => {
    bindInput(`#free-label-${cssEscape(article.id)}`, 'input', (value) => { article.label = value; touch(); });
    bindInput(`#free-qty-${cssEscape(article.id)}`, 'input', (value) => { article.quantite = nonNegativeNumber(value); touch(); });
    bindInput(`#free-unit-${cssEscape(article.id)}`, 'change', (value) => { article.unite = value; touch(); });
    bindInput(`#free-catalogue-${cssEscape(article.id)}`, 'input', (value) => {
      if (value.trim()) article.catalogueArticleId = value.trim(); else delete article.catalogueArticleId;
      touch();
    });
    bindInput(`#free-cost-${cssEscape(article.id)}`, 'input', (value) => {
      if (value === '') delete article.coutAchatUnitaireHtCents; else article.coutAchatUnitaireHtCents = eurosToCents(value);
      touch();
    });
    bindInput(`#free-sale-${cssEscape(article.id)}`, 'input', (value) => {
      if (value === '') delete article.prixVenteUnitaireHtCents; else article.prixVenteUnitaireHtCents = eurosToCents(value);
      touch();
    });
  });
  document.querySelectorAll('[data-remove-free]').forEach((button) => button.addEventListener('click', () => {
    o.articlesLibres = o.articlesLibres.filter((article) => article.id !== button.dataset.removeFree);
    renderStep(); touch();
  }));
}

function renderDirectOption(option, index) {
  return `
    <div class="wall-card">
      <div class="wall-card-head"><strong>Option ${index + 1}</strong><button class="btn btn-small btn-danger" data-remove-direct="${option.id}" type="button">Supprimer</button></div>
      <div class="form-grid">
        ${textField('Libellé', `direct-label-${option.id}`, option.label, '', `PLQ.OPTION_DIRECTE.${index + 1}.LIBELLE`, 'span-4')}
        ${numberField('Quantité', `direct-qty-${option.id}`, option.quantite, '', `PLQ.OPTION_DIRECTE.${index + 1}.QUANTITE`, 'span-3', 0.01)}
        <div class="field span-2">${labelWithTag('Unité', `PLQ.OPTION_DIRECTE.${index + 1}.UNITE`)}<select class="select" id="direct-unit-${option.id}">${['forfait','unit','m2','ml','kg'].map((unit) => `<option value="${unit}" ${option.unite === unit ? 'selected':''}>${unit}</option>`).join('')}</select></div>
        ${numberField('Prix unitaire HT', `direct-price-${option.id}`, centsToEuros(option.prixVenteUnitaireHtCents ?? 0), '€', `PLQ.OPTION_DIRECTE.${index + 1}.PRIX`, 'span-3', 0.01)}
        <div class="field full">${switchRow('Option active', 'Une option active sans prix provoque une erreur bloquante.', `direct-active-${option.id}`, option.active, `PLQ.OPTION_DIRECTE.${index + 1}.ACTIVE`)}</div>
      </div>
    </div>
  `;
}

function renderFreeArticle(article, index) {
  return `
    <div class="wall-card">
      <div class="wall-card-head"><strong>Article libre ${index + 1}</strong><button class="btn btn-small btn-danger" data-remove-free="${article.id}" type="button">Supprimer</button></div>
      <div class="form-grid">
        ${textField('Libellé', `free-label-${article.id}`, article.label, '', `PLQ.ARTICLE_LIBRE.${article.id}.LIBELLE`, 'span-4')}
        ${numberField('Quantité', `free-qty-${article.id}`, article.quantite, '', `PLQ.ARTICLE_LIBRE.${article.id}.QUANTITE`, 'span-2', 0.01)}
        <div class="field span-2">${labelWithTag('Unité', `PLQ.ARTICLE_LIBRE.${article.id}.UNITE`)}<select class="select" id="free-unit-${article.id}">${['unit','m2','ml','kg'].map((unit) => `<option value="${unit}" ${article.unite === unit ? 'selected':''}>${unit}</option>`).join('')}</select></div>
        ${textField('Identifiant catalogue', `free-catalogue-${article.id}`, article.catalogueArticleId ?? '', 'Optionnel', `PLQ.ARTICLE_LIBRE.${article.id}.CATALOGUE`, 'span-4')}
        ${numberField('Coût achat unitaire HT', `free-cost-${article.id}`, article.coutAchatUnitaireHtCents === undefined ? '' : centsToEuros(article.coutAchatUnitaireHtCents), '€', `PLQ.ARTICLE_LIBRE.${article.id}.COUT`, 'span-4', 0.01)}
        ${numberField('Prix vente unitaire HT', `free-sale-${article.id}`, article.prixVenteUnitaireHtCents === undefined ? '' : centsToEuros(article.prixVenteUnitaireHtCents), '€', `PLQ.ARTICLE_LIBRE.${article.id}.VENTE`, 'span-4', 0.01)}
      </div>
    </div>
  `;
}

function renderResultStep() {
  stepContent.innerHTML = pageHead(
    'Résultat du chiffrage',
    'Devis, commandes et traçabilité',
    'Le total provient exclusivement des lignes de vente finales. Les consommations internes n’entrent jamais deux fois dans le prix.'
  ) + (state.result ? renderResult(state.result) : renderNoResult());

  document.querySelector('#runCalculationBtn')?.addEventListener('click', calculateAndRender);
  document.querySelector('#downloadJsonBtn')?.addEventListener('click', downloadResultJson);
  document.querySelector('#downloadInputBtn')?.addEventListener('click', downloadInputJson);
  if (state.result) bindManualOverrides(state.result);
}

function renderNoResult() {
  return `
    <div class="card">
      <div class="empty-state">
        <strong>Aucun résultat calculé</strong>
        <p>Le moteur utilisera les données saisies, le catalogue de démonstration et les connecteurs préparés pour SpeedArti.</p>
        <button class="btn btn-primary" id="runCalculationBtn" type="button" style="margin-top:14px">Lancer le calcul maintenant</button>
      </div>
    </div>
    ${renderValidationBlocks(state.validation)}
  `;
}

function renderResult(result) {
  const warnings = [...result.validation.blocking, ...result.validation.warnings];
  return `
    ${renderValidationBlocks(result.validation)}
    <div class="result-hero">
      <div class="total-card"><span>Total TTC</span><strong>${formatMoney(result.totals.totalTtcCents)}</strong><small>${formatMoney(result.totals.totalHtCents)} HT · TVA ${formatMoney(result.totals.totalVatCents)}</small></div>
      <div class="kpi-stack">
        <div class="kpi-box"><span>Surface plaques</span><strong>${formatNumber(result.geometry.totalPlateM2)} m²</strong></div>
        <div class="kpi-box"><span>Main-d’œuvre</span><strong>${formatNumber(result.labor.reduce((sum, line) => sum + line.hours, 0))} h</strong></div>
        <div class="kpi-box"><span>Alertes visibles</span><strong>${warnings.length}</strong></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Lignes du devis</h2><p>Chaque ligne possède un identifiant unique et est incluse exactement une fois.</p></div><button class="btn btn-secondary" id="downloadJsonBtn" type="button">Télécharger le résultat JSON</button></div>
      <div style="overflow:auto"><table class="data-table"><thead><tr><th>Libellé</th><th>Source</th><th>Qté</th><th>TVA</th><th class="money">Total HT</th></tr></thead><tbody>
        ${result.sale.map((line) => `<tr><td><strong>${escapeHtml(line.label)}</strong><br><span class="field-tag">${escapeHtml(line.id)}</span></td><td><span class="badge badge-neutral">${escapeHtml(line.source)}</span></td><td>${formatNumber(line.quantity)} ${escapeHtml(line.unit)}</td><td>${String(line.vatRate).replace('.', ',')} %</td><td class="money">${formatMoney(line.totalHtCents)}</td></tr>`).join('')}
      </tbody></table></div>
    </div>

    <div class="card">
      <div class="card-header"><div><h2>Commande matériaux</h2><p>Besoin, conditionnement, stock et surplus sont séparés.</p></div></div>
      <div style="overflow:auto"><table class="data-table"><thead><tr><th>Article / besoin</th><th>Besoin</th><th>Acheté</th><th>Surplus</th><th class="money">Coût achat</th></tr></thead><tbody>
        ${result.orders.map((line) => `<tr><td><strong>${escapeHtml(line.label)}</strong>${line.internalOnly ? '<br><span class="badge badge-warning">Interne non facturé</span>' : ''}</td><td>${formatNumber(line.requiredQuantity)}</td><td>${formatNumber(line.purchasedQuantity)}</td><td>${formatNumber(line.surplus)}</td><td class="money">${formatMoney(line.purchaseCostHtCents)}</td></tr>`).join('')}
      </tbody></table></div>
    </div>

    ${renderManualOverrides(result)}

    <details class="details"><summary>Détail de la main-d’œuvre (${result.labor.length} ligne(s))</summary><div class="details-body"><table class="data-table"><thead><tr><th>Poste</th><th>Heures</th><th>Taux</th><th class="money">Vente HT</th></tr></thead><tbody>${result.labor.map((line) => `<tr><td>${escapeHtml(line.label)} ${line.billable ? '' : '<span class="badge badge-warning">Interne</span>'}</td><td>${formatNumber(line.hours)} h</td><td>${formatMoney(line.hourlyRateCents)}/h</td><td class="money">${formatMoney(line.saleHtCents)}</td></tr>`).join('')}</tbody></table></div></details>
    <details class="details"><summary>Audit des champs (${result.fieldAudit.length} balises)</summary><div class="details-body"><table class="data-table"><thead><tr><th>Balise</th><th>Chemin</th><th>Utilisé par</th><th>État</th></tr></thead><tbody>${result.fieldAudit.map((entry) => `<tr><td><span class="field-tag">${escapeHtml(entry.tag)}</span></td><td>${escapeHtml(entry.path)}</td><td>${escapeHtml(entry.consumedBy.join(', ') || '—')}</td><td><span class="badge ${entry.status === 'consumed' ? 'badge-success' : 'badge-warning'}">${escapeHtml(entry.status)}</span></td></tr>`).join('')}</tbody></table></div></details>
    <details class="details"><summary>Trace des formules (${result.trace.length} opérations)</summary><div class="details-body"><div class="code-block">${escapeHtml(result.trace.map((entry) => `[${entry.engine}] ${entry.formula}\n${entry.rawResult} → ${entry.roundedResult} ${entry.unit} · source: ${entry.source}`).join('\n\n'))}</div></div></details>
    <details class="details"><summary>Entrée normalisée</summary><div class="details-body"><button class="btn btn-secondary btn-small" id="downloadInputBtn" type="button">Télécharger l’entrée JSON</button><div class="code-block" style="margin-top:12px">${escapeHtml(JSON.stringify(result.input, null, 2))}</div></div></details>
  `;
}

function renderManualOverrides(result) {
  const priceOverrides = state.input.overrides.prixVenteLignesCents ?? {};
  const quantityOverrides = state.input.overrides.quantitesMateriaux ?? {};
  const vatOverrides = state.input.overrides.tauxTvaLignes ?? {};
  return `
    <div class="card">
      <div class="card-header"><div><h2>Ajustements manuels traçables</h2><p>Les valeurs ci-dessous ne modifient jamais le moteur en silence. Elles sont enregistrées séparément et nécessitent un motif.</p></div><button class="btn btn-primary" id="recalculateOverridesBtn" type="button">Recalculer après ajustements</button></div>
      <div class="field full" style="margin-bottom:18px">${labelWithTag('Motif obligatoire', 'PLQ.OVERRIDE.MOTIF')}<textarea class="textarea" id="manual-override-reason" placeholder="Ex. prix fournisseur du 03/08/2026, quantité ajustée après relevé chantier…">${escapeHtml(state.input.overrides.motif ?? '')}</textarea></div>
      <h3>Lignes de vente</h3>
      <div style="overflow:auto"><table class="data-table"><thead><tr><th>Ligne</th><th>Valeur calculée</th><th>Ajustement HT</th><th>TVA</th></tr></thead><tbody>
        ${result.sale.map((line) => {
          const isUnitOverride = line.source === 'direct_price' || line.source === 'finish_package';
          const currentValue = isUnitOverride ? line.unitSaleHtCents : line.totalHtCents;
          const override = priceOverrides[line.id];
          return `<tr><td><strong>${escapeHtml(line.label)}</strong><br><span class="field-tag">${escapeHtml(line.id)}</span><br><small>${isUnitOverride ? 'Ajustement du prix unitaire' : 'Ajustement du total de ligne'}</small></td><td>${formatMoney(currentValue)}</td><td><div class="input-group compact-input"><input class="input" type="number" min="0" step="0.01" data-price-override="${escapeAttribute(line.id)}" value="${override === undefined ? '' : centsToEuros(override)}" placeholder="${centsToEuros(currentValue)}"><span class="input-suffix">€</span></div></td><td><select class="select compact-select" data-vat-override="${escapeAttribute(line.id)}"><option value="auto" ${vatOverrides[line.id] === undefined ? 'selected':''}>Auto (${String(line.vatRate).replace('.', ',')} %)</option>${[5.5,10,20].map((rate) => `<option value="${rate}" ${vatOverrides[line.id] === rate ? 'selected':''}>${String(rate).replace('.', ',')} %</option>`).join('')}</select></td></tr>`;
        }).join('')}
      </tbody></table></div>
      <h3 style="margin-top:24px">Quantités techniques / commandes</h3>
      <div style="overflow:auto"><table class="data-table"><thead><tr><th>Besoin</th><th>Quantité calculée</th><th>Quantité manuelle</th></tr></thead><tbody>
        ${result.needs.map((need) => `<tr><td><strong>${escapeHtml(need.label)}</strong><br><span class="field-tag">${escapeHtml(need.id)}</span></td><td>${formatNumber(need.quantity)} ${escapeHtml(need.unit)}</td><td><div class="input-group compact-input"><input class="input" type="number" min="0" step="0.01" data-quantity-override="${escapeAttribute(need.id)}" value="${quantityOverrides[need.id] === undefined ? '' : quantityOverrides[need.id]}" placeholder="${need.quantity}"><span class="input-suffix">${escapeHtml(need.unit)}</span></div></td></tr>`).join('')}
      </tbody></table></div>
      <div class="alert info"><div><strong>Le résultat affiché reste celui du dernier calcul</strong><p>Après une modification, cliquez sur « Recalculer après ajustements » pour produire un nouveau résultat et une nouvelle trace.</p></div></div>
    </div>
  `;
}

function bindManualOverrides(result) {
  document.querySelector('#recalculateOverridesBtn')?.addEventListener('click', calculateAndRender);
  bindInput('#manual-override-reason', 'input', (value) => {
    if (value.trim()) state.input.overrides.motif = value; else delete state.input.overrides.motif;
    markOverridesStale();
  });
  document.querySelectorAll('[data-price-override]').forEach((element) => element.addEventListener('input', () => {
    const lineId = element.dataset.priceOverride;
    const map = { ...(state.input.overrides.prixVenteLignesCents ?? {}) };
    if (element.value === '') delete map[lineId]; else map[lineId] = eurosToCents(element.value);
    if (Object.keys(map).length) state.input.overrides.prixVenteLignesCents = map; else delete state.input.overrides.prixVenteLignesCents;
    markOverridesStale();
  }));
  document.querySelectorAll('[data-vat-override]').forEach((element) => element.addEventListener('change', () => {
    const lineId = element.dataset.vatOverride;
    const map = { ...(state.input.overrides.tauxTvaLignes ?? {}) };
    if (element.value === 'auto') delete map[lineId]; else map[lineId] = Number(element.value);
    if (Object.keys(map).length) state.input.overrides.tauxTvaLignes = map; else delete state.input.overrides.tauxTvaLignes;
    markOverridesStale();
  }));
  document.querySelectorAll('[data-quantity-override]').forEach((element) => element.addEventListener('input', () => {
    const needId = element.dataset.quantityOverride;
    const map = { ...(state.input.overrides.quantitesMateriaux ?? {}) };
    if (element.value === '') delete map[needId]; else map[needId] = nonNegativeNumber(element.value);
    if (Object.keys(map).length) state.input.overrides.quantitesMateriaux = map; else delete state.input.overrides.quantitesMateriaux;
    markOverridesStale();
  }));
}

function markOverridesStale() {
  state.result = null;
  state.validation = { blocking: [], warnings: [] };
  document.querySelector('#autosaveLabel').textContent = 'Ajustements à recalculer';
  saveDraft(false);
  renderSummary();
}

function renderValidationBlocks(validation) {
  if (!validation?.blocking?.length && !validation?.warnings?.length) return '';
  return `
    <div class="card compact">
      ${validation.blocking.map((alert) => renderAlert(alert, 'blocking')).join('')}
      ${validation.warnings.map((alert) => renderAlert(alert, alert.level === 'warning' ? 'warning' : 'info')).join('')}
    </div>
  `;
}

function renderAlert(alert, type) {
  return `<div class="alert ${type}"><div><strong>${escapeHtml(alert.code)} — ${escapeHtml(alert.condition)}</strong><p>${escapeHtml(alert.message)}${alert.fieldRefs?.length ? `<br><span class="field-tag">${escapeHtml(alert.fieldRefs.join(' · '))}</span>` : ''}</p></div></div>`;
}

async function calculateAndRender() {
  if (state.calculationInProgress) return;
  state.calculationInProgress = true;
  setCalculationButtons(true);
  clearGlobalAlerts();
  try {
    normalizeInputForUi();
    const result = await runtime.calculateAndPersist(structuredClone(state.input));
    state.result = result;
    state.validation = result.validation;
    saveDraft(false);
    renderSummary();
    showToast('Chiffrage calculé avec succès.', 'success');
    if (state.step !== STEPS.length - 1) state.step = STEPS.length - 1;
    render();
  } catch (error) {
    state.result = null;
    state.validation = error?.validation ?? { blocking: [{ code: 'UI-ERROR', condition: 'Erreur de calcul', message: error?.message ?? String(error), level: 'blocking', fieldRefs: [] }], warnings: [] };
    showGlobalValidation(state.validation);
    showToast(`${state.validation.blocking.length} erreur(s) empêchent le calcul.`, 'error');
    if (state.step === STEPS.length - 1) renderStep();
    renderSummary();
  } finally {
    state.calculationInProgress = false;
    setCalculationButtons(false);
  }
}

function normalizeInputForUi() {
  state.input.nomCalcul = state.input.nomCalcul.trim() || 'Nouveau chiffrage Plaquiste';
  if (state.input.contexte.tvaMode === 'suggestion_auto') delete state.input.contexte.tauxManuel;
  if (!state.input.contexte.justification?.trim()) delete state.input.contexte.justification;
  if (!state.input.overrides.motif?.trim()) delete state.input.overrides.motif;
  state.input.optionsChantier.nombreusesDecoupesSpotsOuvrageIds ??= [];
  state.input.pieces.forEach((piece) => {
    syncPieceWalls(piece);
    if (piece.plafond) {
      piece.plafond.id ??= `${piece.id}:ceiling`;
      setStableSkinIds(piece.plafond, Number(piece.plafond.nombrePeaux ?? 1));
      normalizeIsolationIds(piece.plafond.isolation, piece.plafond.id);
    }
  });
  allWalls().forEach((wall) => {
    wall.nombreAnglesSortants ??= 0;
    const faceB = wall.parements.find((face) => face.face === 'B');
    if (wall.typeParoi === 'doublage' && faceB) faceB.actif = false;
    if (wall.typeParoi === 'cloison' && faceB) faceB.actif = true;
    wall.parements.forEach((face, index) => {
      face.id ??= `${wall.id}:face:${index + 1}`;
      setStableSkinIds(face, Number(face.nombrePeaux ?? 1));
      if (!['pret_a_peindre', 'soignee'].includes(face.finition.niveau)) face.finition.impression = false;
    });
    normalizeIsolationIds(wall.isolation, wall.id);
  });
}

function normalizeIsolationIds(isolation, ownerId) {
  if (!isolation) return;
  isolation.poseCroisee ??= false;
  isolation.couches ??= [];
  isolation.couches.forEach((layer, index) => { layer.id ??= `${ownerId}:isolation:layer:${index + 1}`; layer.semiRigide ??= false; });
}

function setStableSkinIds(owner, count) {
  const safeCount = count === 2 ? 2 : 1;
  owner.nombrePeaux = safeCount;
  const ownerId = owner.id ?? 'ouvrage';
  owner.skinIds = Array.from({ length: safeCount }, (_, index) => owner.skinIds?.[index] ?? `${ownerId}:skin:${index + 1}`);
}

function renderSummary() {
  const result = state.result;
  document.querySelector('#metricPlate').textContent = result ? `${formatNumber(result.geometry.totalPlateM2)} m²` : '—';
  document.querySelector('#metricHours').textContent = result ? `${formatNumber(result.labor.reduce((sum, line) => sum + line.hours, 0))} h` : '—';
  document.querySelector('#metricHt').textContent = result ? formatMoney(result.totals.totalHtCents) : '—';
  document.querySelector('#metricTtc').textContent = result ? formatMoney(result.totals.totalTtcCents) : '—';
  document.querySelector('#summaryPieces').textContent = String(state.input.pieces.length);
  document.querySelector('#summaryWalls').textContent = String(state.input.mursSimples.length);
  document.querySelector('#summaryAlerts').textContent = String((state.validation.blocking?.length ?? 0) + (state.validation.warnings?.length ?? 0));
  document.querySelector('#summaryFields').textContent = result ? String(result.fieldAudit.length) : String(estimateTrackedFields());
  document.querySelector('#engineBadge').textContent = result?.engineVersion ?? 'V2';
}

function renderProjectInfo() {
  const activeWalls = allWalls().filter((wall) => wall.actif).length;
  document.querySelector('#projectNameSide').textContent = state.input.nomCalcul || 'Nouveau chiffrage';
  document.querySelector('#projectMetaSide').textContent = `${activeWalls} ouvrage${activeWalls > 1 ? 's' : ''} actif${activeWalls > 1 ? 's' : ''}`;
}

function showGlobalValidation(validation) {
  const host = document.querySelector('#globalAlertHost');
  host.innerHTML = renderValidationBlocks(validation);
  host.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearGlobalAlerts() {
  document.querySelector('#globalAlertHost').innerHTML = '';
}

function setCalculationButtons(busy) {
  [calculateTopBtn, calculateSideBtn].forEach((button) => {
    button.disabled = busy;
    button.textContent = busy ? 'Calcul en cours…' : button === calculateTopBtn ? 'Calculer le chiffrage' : 'Mettre à jour le calcul';
  });
}

function goToStep(nextStep) {
  state.step = Math.min(Math.max(nextStep, 0), STEPS.length - 1);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function touch() {
  state.result = null;
  state.validation = { blocking: [], warnings: [] };
  document.querySelector('#autosaveLabel').textContent = 'Modifications non calculées';
  renderSummary();
  renderProjectInfo();
  window.clearTimeout(touch.timer);
  touch.timer = window.setTimeout(() => saveDraft(false), 500);
}

function saveDraft(showNotification) {
  localStorage.setItem('speedarti-plaquiste-v2-draft-v050', JSON.stringify(state.input));
  document.querySelector('#autosaveLabel').textContent = `Brouillon enregistré à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  if (showNotification) showToast('Brouillon enregistré localement.', 'success');
}

function loadDraft() {
  try {
    const value = localStorage.getItem('speedarti-plaquiste-v2-draft-v050') ?? localStorage.getItem('speedarti-plaquiste-v2-draft-v040');
    if (!value) return null;
    const parsed = JSON.parse(value);
    return parsed?.schemaVersion === 2 ? parsed : null;
  } catch { return null; }
}

function createInitialInput() {
  const demoPiece = createPiece(1);
  demoPiece.nom = 'Chambre — démonstration';
  demoPiece.murs[0].ouvertures.push({ id: uid('opening'), type: 'porte', largeurM: 0.9, hauteurM: 2.1, quantite: 1, ossaturePeripherique: true });
  demoPiece.murs[1].ouvertures.push({ id: uid('opening'), type: 'fenetre', largeurM: 1.2, hauteurM: 1.15, quantite: 1, ossaturePeripherique: true });
  return {
    schemaVersion: 2,
    id: uid('quote'),
    nomCalcul: 'Chambre — démonstration plan 2D',
    contexte: {
      usageBatiment: 'habitation',
      logementAcheveDepuisPlusDe2Ans: true,
      renovationEnergetique: false,
      tvaMode: 'suggestion_auto',
      eligibiliteConfirmee: true,
    },
    pieces: [demoPiece],
    mursSimples: [],
    optionsChantier: {
      complexite: 'moyenne',
      accesDifficile: false,
      repriseExistant: false,
      nombreusesDecoupesSpots: false,
      nombreusesDecoupesSpotsOuvrageIds: [],
      optionsDirectes: [],
      articlesLibres: [],
    },
    overrides: {
      tauxHoraireCents: 4500,
      materialPricing: { mode: 'markup_pct', value: 30 },
      pertePlaquesMurPct: 7,
      pertePlaquesPlafondPct: 10,
      pertePlaquesRampantPct: 12,
      motif: 'Paramètres visibles de démonstration dans l’interface Plaquiste V2.',
    },
  };
}

function createWall(source, pieceId, label, length, height) {
  const id = uid('wall');
  const faceAId = uid('face-a');
  const faceBId = uid('face-b');
  return {
    id,
    source,
    ...(pieceId ? { pieceId } : {}),
    label,
    actif: true,
    longueurM: length,
    hauteurM: height,
    typeParoi: 'cloison',
    parements: [
      { id: faceAId, face: 'A', actif: true, nombrePeaux: 1, skinIds: [`${faceAId}:skin:1`], typePlaque: 'BA13_STANDARD', finition: { niveau: 'aucune', impression: false } },
      { id: faceBId, face: 'B', actif: true, nombrePeaux: 1, skinIds: [`${faceBId}:skin:1`], typePlaque: 'BA13_STANDARD', finition: { niveau: 'aucune', impression: false } },
    ],
    ossature: { systeme: 'classique', largeurProfilMm: 48, entraxeMm: height <= 2.5 ? 600 : 400, montantsDoubles: false },
    ouvertures: [],
    renforts: [],
    nombreAnglesSortants: 0,
  };
}

function createPiece(index) {
  const id = uid('piece');
  const piece = { id, nom: `Pièce ${index}`, longueurM: 4, largeurM: 3, hauteurM: 2.5, murs: [], plafond: createCeiling(false) };
  piece.murs = [
    createWall('piece', id, 'Mur A — longueur', piece.longueurM, piece.hauteurM),
    createWall('piece', id, 'Mur B — largeur', piece.largeurM, piece.hauteurM),
    createWall('piece', id, 'Mur C — longueur', piece.longueurM, piece.hauteurM),
    createWall('piece', id, 'Mur D — largeur', piece.largeurM, piece.hauteurM),
  ];
  return piece;
}

function createCeiling(active = false) {
  const id = uid('ceiling');
  return {
    id,
    actif: active,
    type: 'droit',
    calculDepuisPiece: true,
    nombrePeaux: 1,
    skinIds: [`${id}:skin:1`],
    typePlaque: 'BA13_STANDARD',
    suspenteArticleCatalogueId: 'hanger-120',
    finition: { niveau: 'aucune', impression: false },
  };
}

function syncPieceWalls(piece) {
  if (piece.murs[0]) { piece.murs[0].longueurM = piece.longueurM; piece.murs[0].hauteurM = piece.hauteurM; }
  if (piece.murs[1]) { piece.murs[1].longueurM = piece.largeurM; piece.murs[1].hauteurM = piece.hauteurM; }
  if (piece.murs[2]) { piece.murs[2].longueurM = piece.longueurM; piece.murs[2].hauteurM = piece.hauteurM; }
  if (piece.murs[3]) { piece.murs[3].longueurM = piece.largeurM; piece.murs[3].hauteurM = piece.hauteurM; }
}

function allWalls() {
  return [...state.input.pieces.flatMap((piece) => piece.murs), ...state.input.mursSimples];
}

function getWall(id) { return allWalls().find((wall) => wall.id === id); }
function ensureSelectedWall() {
  if (!getWall(state.selectedWallId)) state.selectedWallId = allWalls()[0]?.id ?? null;
}
function ensureSelectedPiece() {
  if (!state.input.pieces.some((piece) => piece.id === state.selectedPieceId)) state.selectedPieceId = state.input.pieces[0]?.id ?? null;
}

function wallReference(wall) {
  return `PLQ.MUR.${wall.id}`;
}

function renderCutTargets(options) {
  const targets = [
    ...allWalls().filter((wall) => wall.actif).map((wall) => ({ id: wall.id, label: `Mur — ${wall.label}` })),
    ...state.input.pieces
      .filter((piece) => piece.plafond?.actif)
      .map((piece) => ({ id: piece.plafond.id, label: `Plafond — ${piece.nom}` })),
  ];
  if (!targets.length) return `<div class="alert warning"><div><strong>Aucun ouvrage actif</strong><p>Activez au moins un mur ou un plafond avant d’appliquer cette plus-value.</p></div></div>`;
  return `<div class="cut-targets" style="margin-top:14px">
    <strong>Ouvrages concernés</strong>
    ${targets.map((target) => `<label class="check-row"><div class="check-copy"><strong>${escapeHtml(target.label)} <span class="field-tag">PLQ.OPTIONS.DECOUPES_SPOTS.CIBLE.${escapeHtml(target.id)}</span></strong><span>La plus-value sera calculée uniquement sur cet ouvrage.</span></div><span class="switch"><input type="checkbox" data-cut-target="${escapeAttribute(target.id)}" ${options.nombreusesDecoupesSpotsOuvrageIds.includes(target.id) ? 'checked' : ''}/><span class="switch-track"></span></span></label>`).join('')}
  </div>`;
}

function textField(label, id, value, placeholder, tag, span = '') {
  return `<div class="field ${span}">${labelWithTag(label, tag)}<input class="input" id="${id}" type="text" value="${escapeAttribute(value)}" placeholder="${escapeAttribute(placeholder)}" /></div>`;
}

function numberField(label, id, value, suffix, tag, span = '', step = 0.01) {
  const displayValue = value === '' || value === undefined || value === null ? '' : (Number.isFinite(Number(value)) ? Number(value) : '');
  return `<div class="field ${span}">${labelWithTag(label, tag)}<div class="input-group"><input class="input" id="${id}" type="number" min="0" step="${step}" value="${displayValue}" />${suffix ? `<span class="input-suffix">${escapeHtml(suffix)}</span>` : ''}</div></div>`;
}

function labelWithTag(label, tag) { return `<label>${escapeHtml(label)} <span class="field-tag">${escapeHtml(tag)}</span></label>`; }
function segmentButton(label, value, selected, disabled = false) { return `<button type="button" data-value="${escapeAttribute(value)}" class="${String(value) === String(selected) ? 'active' : ''}" ${disabled ? 'disabled' : ''}>${escapeHtml(label)}</button>`; }
function switchMarkup(label, id, checked, disabled = false) { return `<label class="switch" title="${escapeAttribute(label)}"><input id="${id}" type="checkbox" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}/><span class="switch-track"></span></label>`; }
function switchRow(title, subtitle, id, checked, tag, disabled = false) { return `<div class="check-row"><div class="check-copy"><strong>${escapeHtml(title)} <span class="field-tag">${escapeHtml(tag)}</span></strong><span>${escapeHtml(subtitle)}</span></div>${switchMarkup(title, id, checked, disabled)}</div>`; }
function emptyState(title, text) { return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>`; }
function plateOptions(selected) { return [
  ['BA13_STANDARD','BA13 standard'], ['BA13_HYDRO','BA13 hydrofuge'], ['BA13_PHONIQUE','BA13 phonique'], ['BA13_FEU','BA13 feu'], ['HABITO','Habito'], ['BA10','BA10 — valeur métier à valider'], ['BA15','BA15 — valeur métier à valider'], ['BA18','BA18 — valeur métier à valider'], ['FERMACELL','Fermacell — valeur métier à valider'],
].map(([value,label]) => `<option value="${value}" ${selected === value ? 'selected':''}>${label}</option>`).join(''); }
function finishOptions(selected) { return [['aucune','Aucune finition'],['bandes','Bandes uniquement — 5 €/m²'],['pret_a_peindre','Prêt à peindre — 9 €/m²'],['soignee','Finition soignée — 13 €/m²']].map(([value,label]) => `<option value="${value}" ${selected === value ? 'selected':''}>${label}</option>`).join(''); }
function isolationOptions(selected) {
  const groups = new Map();
  ABAQUE_ISOLANTS_V2.forEach((article) => {
    const group = groups.get(article.usage) ?? [];
    group.push(article); groups.set(article.usage, group);
  });
  return [...groups.entries()].map(([usage, articles]) => `<optgroup label="${escapeAttribute(usage)}">${articles.map((article) => `<option value="${article.id}" ${selected === article.id ? 'selected':''}>${escapeHtml(article.label)} — ${article.priceEuroM2.toFixed(2).replace('.', ',')} €/m² achat</option>`).join('')}</optgroup>`).join('');
}
function getIsolationArticle(id) { return ABAQUE_ISOLANTS_V2.find((article) => article.id === id); }
function applyIsolationArticle(layer, id) { const article = getIsolationArticle(id); if (!article) return; layer.articleCatalogueId = id; layer.epaisseurMm = article.thicknessMm; layer.prixAchatM2OverrideCents = eurosToCents(article.priceEuroM2); }
function newIsolationLayer(ownerId, number, article) { return { id: `${ownerId}:isolation:layer:${number}`, articleCatalogueId: article.id, epaisseurMm: article.thicknessMm, prixAchatM2OverrideCents: eurosToCents(article.priceEuroM2), semiRigide: false }; }
function suggestIsolationForWall(wall, secondLayer = false) {
  const preferredUsage = wall.typeParoi === 'cloison' ? 'Cloison' : 'Doublage';
  const maxThickness = secondLayer ? 45 : wall.ossature.largeurProfilMm;
  return ABAQUE_ISOLANTS_V2.find((article) => article.usage.startsWith(preferredUsage) && article.thicknessMm <= maxThickness)
    ?? ABAQUE_ISOLANTS_V2.find((article) => article.thicknessMm <= maxThickness)
    ?? ABAQUE_ISOLANTS_V2[0];
}
function hangerOptions(selected) { return [['hanger-90','Suspente 90 mm'],['hanger-120','Suspente 120 mm'],['hanger-180','Suspente 180 mm'],['hanger-240','Suspente 240 mm'],['hanger-300','Suspente 300 mm']].map(([value,label]) => `<option value="${value}" ${selected === value ? 'selected':''}>${label}</option>`).join(''); }

function bindInput(selector, event, callback) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.addEventListener(event, () => callback(element.value, element));
}
function bindCheckbox(selector, callback) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.addEventListener('change', () => callback(element.checked, element));
}
function bindSegments(selector, callback) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.querySelectorAll('[data-value]').forEach((button) => button.addEventListener('click', () => {
    if (button.disabled) return;
    callback(button.dataset.value);
  }));
}

function showToast(message, type = '') {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function downloadResultJson() { if (state.result) downloadJson(state.result, `plaquiste-resultat-${state.input.id}.json`); }
function downloadInputJson() { downloadJson(state.input, `plaquiste-entree-${state.input.id}.json`); }
function downloadJson(value, filename) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

function estimateTrackedFields() {
  let count = 10;
  allWalls().forEach((wall) => { count += 14 + wall.parements.length * 6 + wall.ouvertures.length * 6 + wall.renforts.length * 4; if (wall.isolation) count += 3 + wall.isolation.couches.length * 3; });
  state.input.pieces.forEach((piece) => { count += 5; if (piece.plafond) count += 8; });
  return count;
}
function uid(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function positiveNumber(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, n) : 0; }
function nonNegativeNumber(value) { return positiveNumber(value); }
function positiveInteger(value) { return Math.max(0, Math.round(positiveNumber(value))); }
function eurosToCents(value) { return Math.round(nonNegativeNumber(value) * 100); }
function centsToEuros(value) { return Math.round((Number(value) / 100) * 100) / 100; }
function formatMoney(cents) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format((cents ?? 0) / 100); }
function formatNumber(value) { return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value ?? 0); }
function capitalize(value) { return String(value).charAt(0).toUpperCase() + String(value).slice(1); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]); }
function escapeAttribute(value) { return escapeHtml(value); }
function cssEscape(value) { return CSS.escape(String(value)); }
