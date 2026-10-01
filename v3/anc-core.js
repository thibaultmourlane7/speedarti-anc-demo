(() => {
  'use strict';

  const STATUS = Object.freeze({
    AUTO_DETECTED: 'AUTO_DETECTED',
    TO_CONFIRM: 'TO_CONFIRM',
    CONFIRMED: 'CONFIRMED',
    MANUALLY_CORRECTED: 'MANUALLY_CORRECTED',
    UNAVAILABLE: 'UNAVAILABLE'
  });

  const now = () => new Date().toISOString();
  const uid = (p='id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const n = v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v))) ? undefined : Number(v);

  const IMPLANTATION_OBJECTS = Object.freeze([
    { role:'parcel', label:'Parcelle', category:'base', geometry:'polygon', optional:false },
    { role:'available', label:'Zone disponible ANC', category:'base', geometry:'polygon', optional:false },
    { role:'house', label:'Bâtiment', category:'anc', geometry:'polygon', optional:false },
    { role:'treatment', label:'Filière ANC', category:'anc', geometry:'polygon', optional:false },
    { role:'pipe', label:'Canalisation', category:'anc', geometry:'polyline', optional:false },
    { role:'borehole', label:'Sondage', category:'anc', geometry:'point', optional:false },
    { role:'porchet', label:'Test Porchet', category:'anc', geometry:'point', optional:false },
    { role:'well', label:'Puits / captage', category:'water', geometry:'point', optional:true, icon:'💧' },
    { role:'pond', label:'Mare / bassin', category:'water', geometry:'polygon', optional:true, icon:'🌊' },
    { role:'ditch', label:'Fossé', category:'water', geometry:'polyline', optional:true, icon:'〰️' },
    { role:'watercourse', label:'Cours d’eau', category:'water', geometry:'polyline', optional:true, icon:'🌊' },
    { role:'outlet', label:'Exutoire', category:'water', geometry:'point', optional:true, icon:'↘' },
    { role:'tree', label:'Arbre', category:'vegetation', geometry:'point', optional:true, icon:'🌳' },
    { role:'shrub', label:'Buisson / arbuste', category:'vegetation', geometry:'point', optional:true, icon:'🌿' },
    { role:'hedge', label:'Haie', category:'vegetation', geometry:'polyline', optional:true, icon:'🌿' },
    { role:'fence', label:'Clôture', category:'layout', geometry:'polyline', optional:true, icon:'│' },
    { role:'wall', label:'Mur', category:'layout', geometry:'polyline', optional:true, icon:'▰' },
    { role:'terrace', label:'Terrasse', category:'layout', geometry:'polygon', optional:true, icon:'▦' },
    { role:'annex', label:'Annexe / cabanon', category:'layout', geometry:'polygon', optional:true, icon:'⌂' },
    { role:'access', label:'Accès / voirie', category:'layout', geometry:'polyline', optional:true, icon:'↔' },
    { role:'manhole', label:'Regard', category:'network', geometry:'point', optional:true, icon:'◉' },
    { role:'network', label:'Réseau existant', category:'network', geometry:'polyline', optional:true, icon:'⚡' },
    { role:'exclusion', label:'Zone d’exclusion', category:'constraint', geometry:'polygon', optional:true, icon:'⚠' },
    { role:'annotation', label:'Annotation', category:'other', geometry:'point', optional:true, icon:'✎' }
  ]);

  function implantationObjectDefinition(role) {
    return IMPLANTATION_OBJECTS.find(x=>x.role===role) || {
      role:role||'annotation',
      label:role||'Objet ANC',
      category:'other',
      geometry:'point',
      optional:true
    };
  }

  function optionalImplantationObjects() {
    return IMPLANTATION_OBJECTS.filter(x=>x.optional);
  }

  function parcelTemplate(index=1) {
    return {
      id: uid('parcel'),
      label: `Parcelle ${index}`,
      communeCode: '',
      section: '',
      number: '',
      surfaceM2: '',
      geometry: null,
      source: '',
      retrievedAt: '',
      validationStatus: STATUS.TO_CONFIRM,
      selected: true
    };
  }

  function ensureV3(state) {
    if (!state || typeof state !== 'object') return state;

    state.v3 = state.v3 || {};
    state.v3.schemaVersion = 3;
    state.v3.migratedAt = state.v3.migratedAt || now();

    if (!Array.isArray(state.parcels) || !state.parcels.length) {
      const p = parcelTemplate(1);
      p.label = 'Parcelle principale';
      p.section = state.parcel?.section || '';
      p.number = state.parcel?.number || '';
      p.surfaceM2 = state.parcel?.totalArea || '';
      p.communeCode = state.parcel?.cityCode || '';
      p.source = state.parcel?.parcelDetectedAt ? 'Migration V2.6 — parcelle détectée' : 'Migration étude existante';
      p.retrievedAt = state.parcel?.parcelDetectedAt || '';
      p.validationStatus = (p.section || p.number) ? STATUS.TO_CONFIRM : STATUS.TO_CONFIRM;
      state.parcels = [p];
    } else {
      state.parcels = state.parcels.map((p,i) => Object.assign(parcelTemplate(i+1), p));
    }

    state.dataStatus = Object.assign({
      location: STATUS.TO_CONFIRM,
      cadastre: STATUS.TO_CONFIRM,
      geology: STATUS.TO_CONFIRM,
      weather: STATUS.TO_CONFIRM,
      environment: STATUS.TO_CONFIRM
    }, state.dataStatus || {});

    state.externalData = Object.assign({
      weather: { status: STATUS.TO_CONFIRM, provider: '', retrievedAt: '', data: null, warning: '' },
      geology: { status: STATUS.TO_CONFIRM, provider: '', retrievedAt: '', data: null, warning: '' },
      environment: { status: STATUS.TO_CONFIRM, provider: '', retrievedAt: '', data: null, warning: '' }
    }, state.externalData || {});

    const defaultMapLayers = [
      { id:'ign-plan', label:'Plan IGN', provider:'Géoplateforme IGN', type:'wms', visible:false, opacity:0.70, sourceScale:'multi-échelles', order:10 },
      { id:'ign-ortho', label:'Photographies aériennes', provider:'Géoplateforme IGN', type:'wms', visible:true, opacity:1, sourceScale:'orthophoto', order:20 },
      { id:'ign-cadastre', label:'Parcelles cadastrales', provider:'Géoplateforme IGN', type:'wms', visible:true, opacity:0.72, sourceScale:'PCI', order:30 },
      { id:'brgm-geology', label:'Carte géologique BRGM', provider:'BRGM / InfoTerre', type:'wms', visible:false, opacity:0.55, sourceScale:'1:50 000', order:40 },
      { id:'brgm-groundwater-sedim', label:'Remontée de nappe — domaine sédimentaire', provider:'BRGM / Géorisques', type:'wms', visible:false, opacity:0.55, sourceScale:'donnée nationale', order:50 },
      { id:'brgm-groundwater-socle', label:'Remontée de nappe — domaine de socle', provider:'BRGM / Géorisques', type:'wms', visible:false, opacity:0.55, sourceScale:'donnée nationale', order:51 },
      { id:'brgm-clay', label:'Retrait-gonflement des argiles', provider:'BRGM / Géorisques', type:'wms', visible:false, opacity:0.50, sourceScale:'variable', order:60 },
      { id:'brgm-cavities', label:'Cavités souterraines', provider:'BRGM / Géorisques', type:'wms', visible:false, opacity:0.85, sourceScale:'ponctuel', order:61 },
      { id:'brgm-landslides', label:'Mouvements de terrain', provider:'BRGM / Géorisques', type:'wms', visible:false, opacity:0.85, sourceScale:'ponctuel', order:62 },
      { id:'anc-objects', label:'Objets ANC', provider:'SpeedArti ANC', type:'vector', visible:true, opacity:1, sourceScale:'métrique', order:100 }
    ];
    if (!Array.isArray(state.mapLayers) || !state.mapLayers.length) state.mapLayers = defaultMapLayers;
    else {
      const current = new Map(state.mapLayers.map(x=>[x.id,x]));
      defaultMapLayers.forEach(def=>{
        if(!current.has(def.id)) state.mapLayers.push(def);
      });
      state.mapLayers.sort((a,b)=>(a.order||0)-(b.order||0));
    }

    state.mapFeatures = Array.isArray(state.mapFeatures) ? state.mapFeatures : [];
    state.mapView = Object.assign({
      exportScale: 500,
      scaleMode: 'fixed',
      northAlwaysVisible: true,
      scaleAlwaysVisible: true,
      printFormat: 'A4',
      orientation: 'landscape',
      activeKind: 'layout'
    }, state.mapView || {});

    if (Array.isArray(state.maps)) {
      state.maps.forEach(m=>{
        if(!Object.prototype.hasOwnProperty.call(m,'snapshotVersion')) m.snapshotVersion = m.snapshotAt ? 1 : 0;
        if(!Object.prototype.hasOwnProperty.call(m,'snapshotAt')) m.snapshotAt = '';
        if(!Object.prototype.hasOwnProperty.call(m,'snapshotCenter')) m.snapshotCenter = null;
        if(!Object.prototype.hasOwnProperty.call(m,'snapshotZoom')) m.snapshotZoom = null;
        if(!Object.prototype.hasOwnProperty.call(m,'snapshotLayers')) m.snapshotLayers = [];
        if(!Object.prototype.hasOwnProperty.call(m,'snapshotSourceSummary')) m.snapshotSourceSummary = '';
      });
    }

    state.knowledgeBase = Object.assign({
      domain: 'anc',
      version: '1.0',
      status: 'DRAFT',
      routingMode: 'dynamic',
      sourcePriority: ['GSTAI_CODE_READONLY','SPEEDARTI_DATA','ANGEL_KNOWLEDGE_BASE','EXTERNAL_CONNECTORS','AI_REASONING'],
      humanValidationRequired: true,
      rules: [
        { id:'angel-no-invention', text:'Ángel ne doit jamais inventer une donnée ANC absente.', status:'CONFIRMED', source:'Règle SpeedArti' },
        { id:'angel-human-validation', text:'Ángel propose ; le professionnel valide mesures, conclusions et publications.', status:'CONFIRMED', source:'Règle SpeedArti' }
      ]
    }, state.knowledgeBase || {});

    state.finalReview = Object.assign({
      lastRunAt: '',
      checks: [],
      blocking: 0,
      warnings: 0,
      infos: 0
    }, state.finalReview || {});

    syncParcelSummary(state);
    return state;
  }

  function selectedParcels(state) {
    ensureV3(state);
    return state.parcels.filter(p => p.selected !== false);
  }

  function totalParcelSurface(state) {
    return selectedParcels(state).reduce((sum,p) => sum + (n(p.surfaceM2) || 0), 0);
  }

  function syncParcelSummary(state) {
    if (!state?.parcel) return 0;
    const list = Array.isArray(state.parcels) ? state.parcels.filter(p=>p.selected!==false) : [];
    const total = list.reduce((sum,p)=>sum+(n(p.surfaceM2)||0),0);
    if (total > 0) state.parcel.totalArea = Math.round(total * 100) / 100;
    const first = list[0];
    if (first) {
      state.parcel.section = first.section || state.parcel.section || '';
      state.parcel.number = first.number || state.parcel.number || '';
      state.parcel.cityCode = first.communeCode || state.parcel.cityCode || '';
    }
    return total;
  }

  function addParcel(state, seed={}) {
    ensureV3(state);
    const p = Object.assign(parcelTemplate(state.parcels.length + 1), seed);
    state.parcels.push(p);
    syncParcelSummary(state);
    return p;
  }

  function removeParcel(state, id) {
    ensureV3(state);
    if (state.parcels.length <= 1) return false;
    state.parcels = state.parcels.filter(p => p.id !== id);
    syncParcelSummary(state);
    return true;
  }

  function parcelLabel(p) {
    const ref = [p.section, p.number].filter(Boolean).join(' ');
    return ref || p.label || 'Parcelle';
  }

  function addFeature(state, feature) {
    ensureV3(state);
    const f = Object.assign({
      id: uid('feature'),
      type: 'Feature',
      role: 'annotation',
      geometry: null,
      properties: {},
      source: 'MANUAL',
      createdAt: now(),
      updatedAt: now()
    }, feature || {});
    state.mapFeatures.push(f);
    return f;
  }

  function updateFeature(state, id, patch) {
    ensureV3(state);
    const f = state.mapFeatures.find(x=>x.id===id);
    if (!f) return null;
    Object.assign(f, patch || {}, {updatedAt: now()});
    return f;
  }

  function removeFeature(state, id) {
    ensureV3(state);
    state.mapFeatures = state.mapFeatures.filter(x=>x.id!==id);
  }

  function geometryRepresentativePoint(feature) {
    const g=feature?.geometry;
    if(!g)return null;
    if(g.type==='Point' && Array.isArray(g.coordinates))return g.coordinates.slice(0,2);
    let coords=[];
    if(g.type==='LineString')coords=g.coordinates||[];
    if(g.type==='Polygon')coords=g.coordinates?.[0]||[];
    if(!coords.length)return null;
    const valid=coords.filter(c=>Array.isArray(c)&&Number.isFinite(Number(c[0]))&&Number.isFinite(Number(c[1])));
    if(!valid.length)return null;
    return [
      valid.reduce((a,c)=>a+Number(c[0]),0)/valid.length,
      valid.reduce((a,c)=>a+Number(c[1]),0)/valid.length
    ];
  }

  function haversineM(a,b) {
    if(!a||!b)return undefined;
    const [lon1,lat1]=a.map(Number),[lon2,lat2]=b.map(Number);
    if(![lon1,lat1,lon2,lat2].every(Number.isFinite))return undefined;
    const R=6371008.8,toRad=x=>x*Math.PI/180;
    const dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1);
    const q=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.min(1,Math.sqrt(q)));
  }

  function mapMetricSummary(state) {
    ensureV3(state);
    const features=state.mapFeatures||[];
    const byRole=role=>features.find(f=>f.role===role||f.properties?.role===role);
    const point=role=>geometryRepresentativePoint(byRole(role));
    const areaFor=role=>features.filter(f=>f.role===role||f.properties?.role===role)
      .reduce((a,f)=>a+(n(f.properties?.areaM2)||0),0);
    const lengthFor=role=>features.filter(f=>f.role===role||f.properties?.role===role)
      .reduce((a,f)=>a+(n(f.properties?.lengthM)||n(f.properties?.perimeterM)||0),0);
    const allArea=features.reduce((a,f)=>a+(n(f.properties?.areaM2)||0),0);
    const allLength=features.reduce((a,f)=>a+(n(f.properties?.lengthM)||0),0);
    const house=point('house'),treatment=point('treatment'),well=point('well'),outlet=point('outlet');
    return {
      featureCount:features.length,
      totalDrawnAreaM2:allArea,
      totalDrawnLengthM:allLength,
      parcelAreaM2:areaFor('parcel')||undefined,
      availableAreaM2:areaFor('available')||undefined,
      pipeLengthM:lengthFor('pipe')||undefined,
      houseToTreatmentM:haversineM(house,treatment),
      treatmentToWellM:haversineM(treatment,well),
      treatmentToOutletM:haversineM(treatment,outlet)
    };
  }

  function finalChecks(state) {
    ensureV3(state);
    const checks = [];
    const add = (severity, section, label, ok, detail='') => checks.push({
      id: uid('check'), severity, section, label,
      status: ok ? 'COMPLETE' : severity === 'BLOCKING' ? 'MISSING' : 'TO_VERIFY',
      detail
    });

    add('BLOCKING','Dossier','Client identifié', !!(state.owner?.lastName || state.owner?.company));
    add('BLOCKING','Dossier','Adresse du chantier', !!(state.parcel?.address && (state.parcel?.city || state.parcel?.postalCode)));
    add('WARNING','Dossier','Localisation confirmée', !!(state.parcel?.lat && state.parcel?.lng), state.parcel?.geocodeSource || '');
    const parcels=selectedParcels(state);
    add('BLOCKING','Parcelles','Au moins une parcelle', parcels.length > 0);
    add('WARNING','Parcelles','Références cadastrales complètes', parcels.length>0 && parcels.every(p=>String(p.section||'').trim() && String(p.number||'').trim()), parcels.map(parcelLabel).join(' · '));
    add('WARNING','Parcelles','Surface de chaque parcelle renseignée', parcels.length>0 && parcels.every(p=>(n(p.surfaceM2)||0)>0), parcels.map(p=>`${parcelLabel(p)} : ${n(p.surfaceM2)||'—'} m²`).join(' · '));
    add('WARNING','Parcelles','Surface cadastrale totale', totalParcelSurface(state) > 0, totalParcelSurface(state) ? `${totalParcelSurface(state).toFixed(2)} m²` : '');
    add('WARNING','Géologie','Contexte géologique vérifié', state.dataStatus.geology === STATUS.CONFIRMED || state.dataStatus.geology === STATUS.MANUALLY_CORRECTED);
    add('WARNING','Visite','Météo vérifiée', state.dataStatus.weather === STATUS.CONFIRMED || state.dataStatus.weather === STATUS.MANUALLY_CORRECTED);
    add('WARNING','Environnement','Contraintes environnementales vérifiées', state.dataStatus.environment === STATUS.CONFIRMED || state.dataStatus.environment === STATUS.MANUALLY_CORRECTED);
    add('WARNING','Sondages','Au moins un sondage', (state.boreholes||[]).length > 0);
    const porchets=state.porchets||[];
    add('WARNING','Porchet','Tests Porchet renseignés', porchets.length > 0);
    const porchetReadings=porchets.flatMap(p=>p.readings||[]);
    add('WARNING','Porchet','Unités et mesures principales renseignées', porchetReadings.length>0 && porchetReadings.every(r=>n(r.durationMin)!==undefined && n(r.volumeMl)!==undefined), porchetReadings.length?`${porchetReadings.length} relevé(s)`:'');
    add('WARNING','Porchet','Niveaux départ / fin renseignés', porchetReadings.length>0 && porchetReadings.every(r=>n(r.startLevelCm)!==undefined && n(r.endLevelCm)!==undefined), 'Unités : cm');
    add('INFO','Photos','Photos du chantier', (state.photos||[]).length > 0);
    add('INFO','Porchet','Photos d’essai Porchet', porchets.length===0 || (state.photos||[]).some(p=>p.targetType==='porchet'), 'Caméra / Galerie / Fichier disponibles');
    const requiredMaps=(state.maps||[]).filter(m=>m.requirement==='mandatory');
    add('WARNING','Cartographie','Cartes obligatoires connectées', requiredMaps.length>0 && requiredMaps.every(m=>m.liveConnected===true), requiredMaps.length?`${requiredMaps.filter(m=>m.liveConnected).length}/${requiredMaps.length} connectée(s)`:'');
    add('WARNING','Cartographie','Images figées des cartes obligatoires', requiredMaps.length>0 && requiredMaps.every(m=>!!m.preview&&!!m.snapshotAt), requiredMaps.length?`${requiredMaps.filter(m=>!!m.preview&&!!m.snapshotAt).length}/${requiredMaps.length} figée(s)`:'');
    add('WARNING','Cartographie','Échelle toujours visible', state.mapView.scaleAlwaysVisible === true);
    add('WARNING','Cartographie','Nord toujours visible', state.mapView.northAlwaysVisible === true);

    const blocking = checks.filter(c=>!['COMPLETE'].includes(c.status) && c.severity==='BLOCKING').length;
    const warnings = checks.filter(c=>!['COMPLETE'].includes(c.status) && c.severity==='WARNING').length;
    const infos = checks.filter(c=>!['COMPLETE'].includes(c.status) && c.severity==='INFO').length;
    state.finalReview = {lastRunAt:now(), checks, blocking, warnings, infos};
    return state.finalReview;
  }

  window.ANCV3Core = {
    STATUS,
    ensureV3,
    parcelTemplate,
    selectedParcels,
    totalParcelSurface,
    syncParcelSummary,
    addParcel,
    removeParcel,
    parcelLabel,
    addFeature,
    updateFeature,
    removeFeature,
    finalChecks,
    mapMetricSummary,
    haversineM,
    geometryRepresentativePoint,
    IMPLANTATION_OBJECTS,
    implantationObjectDefinition,
    optionalImplantationObjects
  };
})();