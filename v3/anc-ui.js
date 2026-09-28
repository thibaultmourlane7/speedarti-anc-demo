(() => {
  'use strict';

  const api = () => window.SpeedArtiANC;
  const core = () => window.ANCV3Core;
  const connectors = () => window.ANCV3Connectors;

  const esc = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const num = v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v))) ? undefined : Number(v);

  function state() {
    const s=api()?.getState?.();
    if(s) core()?.ensureV3?.(s);
    return s;
  }

  function commit({render=true}={}) {
    const s=state();
    if(s) core()?.syncParcelSummary?.(s);
    api()?.save?.();
    if(render) api()?.render?.();
  }

  function card(id,title,subtitle,body) {
    return `<article id="${id}" class="anc-v3-card"><header><div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div></header><div class="anc-v3-body">${body}</div></article>`;
  }

  function statusBadge(status) {
    return `<span class="anc-v3-status ${esc(status)}">${esc(status)}</span>`;
  }

  function enhanceDossier() {
    const section=document.getElementById('dossier');
    const s=state();
    if(!section||!s||document.getElementById('anc-v3-parcels')) return;

    const rows=(s.parcels||[]).map((p,i)=>`
      <div class="anc-v3-parcel" data-parcel-id="${esc(p.id)}">
        <div class="field"><label>Libellé</label><input class="input anc-p-label" value="${esc(p.label||`Parcelle ${i+1}`)}"></div>
        <div class="field"><label>Section</label><input class="input anc-p-section" value="${esc(p.section||'')}"></div>
        <div class="field"><label>Numéro</label><input class="input anc-p-number" value="${esc(p.number||'')}"></div>
        <div class="field"><label>Surface (m²)</label><input class="input anc-p-surface" type="number" step="0.01" value="${esc(p.surfaceM2??'')}"></div>
        <div class="field"><label>Statut</label>${statusBadge(p.validationStatus||'TO_CONFIRM')}</div>
        <button class="btn danger small anc-p-remove" type="button" ${s.parcels.length<=1?'disabled':''}>Supprimer</button>
      </div>`).join('');

    const total=core()?.totalParcelSurface?.(s)||0;
    const body=`
      <div class="notice info"><b>Multi-parcelles :</b> une étude peut maintenant contenir plusieurs références cadastrales. La surface totale est la somme des parcelles sélectionnées.</div>
      <div id="anc-v3-parcel-list">${rows}</div>
      <div class="anc-v3-toolbar">
        <button class="btn primary" type="button" id="anc-add-parcel">+ Ajouter une parcelle</button>
        <button class="btn secondary" type="button" id="anc-detect-parcel">Détecter la parcelle au point localisé</button>
      </div>
      <div class="anc-v3-total"><span>Surface totale des parcelles</span><strong id="anc-parcel-total">${total.toLocaleString('fr-FR',{maximumFractionDigits:2})} m²</strong></div>
      <div class="anc-source-note">Source et statut conservés pour chaque parcelle. Une parcelle détectée automatiquement reste à confirmer par Fred.</div>`;
    section.insertAdjacentHTML('beforeend',card('anc-v3-parcels','Parcelles cadastrales','Gestion multi-parcelles et addition automatique des surfaces.',body));

    section.querySelectorAll('.anc-v3-parcel').forEach(row=>{
      const id=row.dataset.parcelId;
      const p=s.parcels.find(x=>x.id===id);
      if(!p) return;
      const bind=(sel,key,cast=false)=>{
        row.querySelector(sel)?.addEventListener('change',e=>{
          p[key]=cast?(num(e.target.value)??''):e.target.value;
          if(p.validationStatus==='AUTO_DETECTED')p.validationStatus='MANUALLY_CORRECTED';
          core()?.syncParcelSummary?.(s);commit();
        });
      };
      bind('.anc-p-label','label');
      bind('.anc-p-section','section');
      bind('.anc-p-number','number');
      bind('.anc-p-surface','surfaceM2',true);
      row.querySelector('.anc-p-remove')?.addEventListener('click',()=>{core()?.removeParcel?.(s,id);commit()});
    });

    document.getElementById('anc-add-parcel')?.addEventListener('click',()=>{core()?.addParcel?.(s);commit()});
    document.getElementById('anc-detect-parcel')?.addEventListener('click',async e=>{
      const lat=num(s.parcel?.lat),lng=num(s.parcel?.lng);
      if(lat===undefined||lng===undefined){alert('Localisez d’abord le chantier depuis son adresse ou le GPS mobile.');return}
      const b=e.currentTarget;b.disabled=true;b.textContent='Recherche…';
      try{
        const found=await connectors()?.parcelsAtPoint?.({latitude:lat,longitude:lng,limit:5})||[];
        if(!found.length){alert('Aucune parcelle trouvée autour de ce point.');return}
        let added=0;
        for(const f of found){
          const duplicate=s.parcels.some(p=>String(p.section)===String(f.section)&&String(p.number)===String(f.number)&&f.number);
          if(duplicate)continue;
          core()?.addParcel?.(s,{
            label:'Parcelle détectée',
            communeCode:f.cityCode||'',
            section:f.section||'',
            number:String(f.number||''),
            surfaceM2:f.surfaceM2??'',
            geometry:f.geometry||null,
            source:f.source,
            retrievedAt:f.retrievedAt,
            validationStatus:'AUTO_DETECTED'
          });
          added++;
        }
        s.dataStatus.cadastre=added?'AUTO_DETECTED':s.dataStatus.cadastre;
        commit();
      }catch(err){alert(`Cadastre indisponible : ${err.message}`)}
      finally{b.disabled=false;b.textContent='Détecter la parcelle au point localisé'}
    });
  }

  function weatherSummary(w) {
    const t=(w.temperatureMinC!==undefined||w.temperatureMaxC!==undefined)?`${w.temperatureMinC??'—'} à ${w.temperatureMaxC??'—'} °C`:'température indisponible';
    return `${t} · pluie ${w.precipitationMm??'—'} mm · vent max ${w.windMaxKmh??'—'} km/h`;
  }

  function enhanceTerrain() {
    const section=document.getElementById('terrain');
    const s=state();
    if(!section||!s||document.getElementById('anc-v3-auto-terrain'))return;

    const w=s.externalData?.weather||{};
    const body=`
      <div class="grid g2">
        <div>
          <h3 style="margin-top:0">Météo de la visite</h3>
          <p class="anc-source-note">${w.data?esc(weatherSummary(w.data)):'Aucune donnée météo automatique récupérée.'}</p>
          <p>${statusBadge(s.dataStatus.weather)}</p>
          <button class="btn primary" type="button" id="anc-weather-fetch">☁️ Récupérer automatiquement</button>
        </div>
        <div>
          <h3 style="margin-top:0">Contraintes environnementales</h3>
          <p class="anc-source-note">La démo interroge Géorisques v1 automatiquement. La future intégration production v2 devra passer par le backend afin de ne jamais exposer son jeton.</p>
          <p>${statusBadge(s.dataStatus.environment)}</p>
          <div class="anc-v3-toolbar"><button class="btn secondary" type="button" id="anc-env-prepare">Analyser automatiquement</button><button class="btn secondary" type="button" id="anc-georisques-report">Ouvrir le rapport Géorisques</button></div>
        </div>
      </div>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e5edf4">
        <h3 style="margin:0 0 6px">BRGM / InfoTerre</h3>
        <p class="anc-source-note" id="anc-brgm-summary">${s.externalData?.geology?.data?.catalog?.summary?esc(s.externalData.geology.data.catalog.summary):'Feuille, code et contexte géologique non encore interrogés.'}</p>
        <p>${statusBadge(s.dataStatus.geology)}</p>
        <div class="anc-v3-toolbar"><button class="btn secondary" type="button" id="anc-brgm-fetch">🪨 Rechercher automatiquement</button><button class="btn ghost" type="button" id="anc-brgm-open">Ouvrir InfoTerre</button></div>
        <p class="anc-source-note"><b>Échelle source géologique : 1:50 000.</b> Cette précision ne change pas lorsque le plan ANC est zoomé ou exporté à une autre échelle.</p>
      </div>`;
    section.insertAdjacentHTML('afterbegin',card('anc-v3-auto-terrain','Automatisation de la visite','La météo et les sources environnementales sont liées au lieu et à la date de visite.',body));

    document.getElementById('anc-weather-fetch')?.addEventListener('click',async e=>{
      const lat=num(s.parcel?.lat),lng=num(s.parcel?.lng);
      if(lat===undefined||lng===undefined){alert('Localisez d’abord le chantier.');return}
      const b=e.currentTarget;b.disabled=true;b.textContent='Récupération…';
      try{
        const w=await connectors()?.weatherForVisit?.({latitude:lat,longitude:lng,date:s.visit?.studyDate});
        s.externalData.weather={status:'AUTO_DETECTED',provider:w.provider,retrievedAt:w.retrievedAt,data:w,warning:''};
        s.dataStatus.weather='AUTO_DETECTED';
        s.visit.weather=weatherSummary(w);
        s.visit.weather7=`Donnée automatique ${w.mode==='historical'?'historique':'prévisionnelle'} — à confirmer si nécessaire`;
        commit();
      }catch(err){
        s.externalData.weather={status:'UNAVAILABLE',provider:'WeatherConnector',retrievedAt:new Date().toISOString(),data:null,warning:err.message};
        s.dataStatus.weather='UNAVAILABLE';
        commit();
      }
    });

    document.getElementById('anc-env-prepare')?.addEventListener('click',async e=>{
      const lat=num(s.parcel?.lat),lng=num(s.parcel?.lng);
      if(lat===undefined||lng===undefined){alert('Localisez d’abord le chantier.');return}
      const b=e.currentTarget;b.disabled=true;b.textContent='Analyse automatique…';
      try{
        const report=await connectors()?.georisquesRiskReport?.({latitude:lat,longitude:lng,rayon:1000});
        const risks=report?.risks||[];
        const stamp=new Date().toISOString().slice(0,10);
        const apply=(regex,key)=>{
          const hit=risks.find(r=>regex.test(String(r.label||'')+' '+String(r.key||'')));
          if(!hit||!s.constraints?.[key])return false;
          s.constraints[key].value=hit.present?'yes':'no';
          s.constraints[key].details=hit.statutAdresse||hit.statutCommune||hit.specifique||hit.label;
          s.constraints[key].source='Géorisques API v1 — détection automatique à confirmer';
          s.constraints[key].date=stamp;
          return true;
        };
        const mapped=[
          apply(/inond|submers/i,'flood'),
          apply(/remont.{0,12}nappe|nappe/i,'groundwater')
        ].filter(Boolean).length;
        const present=risks.filter(r=>r.present).map(r=>r.label).filter(Boolean);
        if(present.length){
          const summary='Géorisques détectés : '+present.join(' ; ');
          s.constraints.other=[s.constraints.other,summary].filter(Boolean).join('\n');
        }
        s.externalData.environment={
          status:risks.length?'AUTO_DETECTED':'TO_CONFIRM',
          provider:'Géorisques API v1 + BRGM',
          retrievedAt:report?.retrievedAt||new Date().toISOString(),
          data:{georisques:report,brgm:connectors()?.brgmLayers?.()},
          warning:risks.length?'Résultats automatiques à confirmer par Fred.':'Réponse reçue sans détail exploitable : vérification manuelle requise.'
        };
        s.dataStatus.environment=risks.length?'AUTO_DETECTED':'TO_CONFIRM';
        commit();
      }catch(err){
        s.externalData.environment={
          status:'UNAVAILABLE',
          provider:'Géorisques',
          retrievedAt:new Date().toISOString(),
          data:null,
          warning:err.message
        };
        s.dataStatus.environment='UNAVAILABLE';
        commit();
      }finally{
        b.disabled=false;b.textContent='Analyser automatiquement';
      }
    });

    document.getElementById('anc-georisques-report')?.addEventListener('click',()=>{
      const lat=num(s.parcel?.lat),lng=num(s.parcel?.lng);
      if(lat===undefined||lng===undefined){alert('Localisez d’abord le chantier.');return}
      window.open(`https://www.georisques.gouv.fr/api/v1/rapport_pdf?latlon=${encodeURIComponent(lng+','+lat)}`,'_blank','noopener');
    });

    document.getElementById('anc-brgm-fetch')?.addEventListener('click',async e=>{
      const lat=num(s.parcel?.lat),lng=num(s.parcel?.lng);
      if(lat===undefined||lng===undefined){alert('Localisez d’abord le chantier.');return}
      const b=e.currentTarget;b.disabled=true;b.textContent='Recherche BRGM…';
      try{
        const data=await connectors()?.brgmContextAtPoint?.({latitude:lat,longitude:lng});
        s.externalData.geology={
          status:data?.status||'TO_CONFIRM',
          provider:'BRGM / InfoTerre',
          retrievedAt:data?.retrievedAt||new Date().toISOString(),
          data,
          warning:data?.warning||''
        };
        s.dataStatus.geology=data?.status||'TO_CONFIRM';
        const cat=data?.catalog||{};
        const parts=[
          cat.sheetCode?('Code / feuille : '+cat.sheetCode):'',
          cat.sheetName?('Nom : '+cat.sheetName):'',
          cat.noticeRef?('Notice : '+cat.noticeRef):'',
          cat.summary?cat.summary:''
        ].filter(Boolean);
        if(s.parcel){
          s.parcel.geology=parts.join(' · ') || 'BRGM interrogé — données détaillées à confirmer';
          s.parcel.geologySource='BRGM / InfoTerre — carte géologique source 1:50 000';
          if(cat.sheetCode)s.parcel.geologyCode=cat.sheetCode;
          if(cat.noticeRef)s.parcel.geologyNotice=cat.noticeRef;
          if(cat.summary)s.parcel.geologyText=cat.summary;
        }
        commit();
      }catch(err){
        s.externalData.geology={status:'UNAVAILABLE',provider:'BRGM / InfoTerre',retrievedAt:new Date().toISOString(),data:null,warning:err.message};
        s.dataStatus.geology='UNAVAILABLE';
        commit();
      }finally{
        b.disabled=false;b.textContent='🪨 Rechercher automatiquement';
      }
    });

    document.getElementById('anc-brgm-open')?.addEventListener('click',()=>{
      window.open('https://infoterre.brgm.fr/viewer/MainTileForward.do','_blank','noopener');
    });
  }

  function filePicker({camera=false,multiple=false,onFiles}) {
    const input=document.createElement('input');
    input.type='file';input.accept='image/*';input.multiple=multiple;
    if(camera)input.setAttribute('capture','environment');
    input.style.display='none';document.body.appendChild(input);
    input.addEventListener('change',async()=>{try{await onFiles(Array.from(input.files||[]))}finally{input.remove()}},{once:true});
    input.click();
  }

  async function addPhoto(file,category,targetType='',targetId='') {
    if(!file)return;
    await api()?.addPhotoFile?.(file,category,targetType,targetId);
  }

  function enhancePorchet() {
    const section=document.getElementById('porchet');
    const s=state();
    if(!section||!s)return;

    section.querySelectorAll('.reading-table thead th').forEach(th=>{
      const t=th.textContent.trim();
      if(t==='Durée')th.textContent='Durée (min)';
      if(t==='Volume')th.textContent='Volume (mL)';
      if(t==='Niveau')th.textContent='Niveau d’eau (cm)';
      if(t==='K brut')th.textContent='K brut (mm/h)';
    });

    section.querySelectorAll('.item-card').forEach((item,i)=>{
      if(item.querySelector('.anc-porchet-photo-actions'))return;
      const p=s.porchets?.[i];if(!p)return;
      const box=document.createElement('div');
      box.className='anc-photo-actions anc-porchet-photo-actions';
      box.innerHTML=`<button class="btn primary small anc-cam">📷 Caméra</button><button class="btn secondary small anc-gallery">🖼 Galerie</button><button class="btn secondary small anc-file">📁 Fichier</button><span class="anc-source-note">Photos rattachées au test ${esc(p.label||i+1)}</span>`;
      item.querySelector('.item-card-body')?.prepend(box);
      box.querySelector('.anc-cam')?.addEventListener('click',()=>filePicker({camera:true,onFiles:async files=>{for(const f of files)await addPhoto(f,'porchet','porchet',p.id);commit()}}));
      box.querySelector('.anc-gallery')?.addEventListener('click',()=>filePicker({multiple:true,onFiles:async files=>{for(const f of files)await addPhoto(f,'porchet','porchet',p.id);commit()}}));
      box.querySelector('.anc-file')?.addEventListener('click',()=>filePicker({multiple:true,onFiles:async files=>{for(const f of files)await addPhoto(f,'porchet','porchet',p.id);commit()}}));
    });

    if(!document.getElementById('anc-porchet-units-note')){
      section.insertAdjacentHTML('afterbegin',`<div id="anc-porchet-units-note" class="notice info"><b>Unités Porchet explicites :</b> durée en minutes, volume en mL, niveau d’eau en cm et perméabilité K en mm/h. Le réglage « Stabilité max CV (%) » reste un paramètre avancé à valider avec Fred.</div>`);
    }
  }

  function enhancePhotos() {
    const section=document.getElementById('photos');
    if(!section||document.getElementById('anc-photo-terrain-actions'))return;
    const body=`<div class="anc-photo-actions"><button class="btn primary" id="anc-site-camera">📷 Caméra</button><button class="btn secondary" id="anc-site-gallery">🖼 Galerie</button><button class="btn secondary" id="anc-site-file">📁 Fichier</button></div><div class="anc-source-note">Sur smartphone, Caméra demande directement la prise de vue lorsque le navigateur l’autorise. Le GPS de la photo reste facultatif.</div>`;
    section.insertAdjacentHTML('afterbegin',card('anc-photo-terrain-actions','Ajout rapide sur chantier','Trois entrées distinctes comme demandé par Fred.',body));
    const launch=(camera,multiple)=>filePicker({camera,multiple,onFiles:async files=>{for(const f of files)await addPhoto(f,'site');commit()}});
    document.getElementById('anc-site-camera')?.addEventListener('click',()=>launch(true,false));
    document.getElementById('anc-site-gallery')?.addEventListener('click',()=>launch(false,true));
    document.getElementById('anc-site-file')?.addEventListener('click',()=>launch(false,true));
  }

  function layerRow(l) {
    return `<div class="anc-layer-row"><input type="checkbox" class="anc-layer-visible" data-layer="${esc(l.id)}" ${l.visible?'checked':''}><label>${esc(l.label)}<br><small>${esc(l.sourceScale||'')}</small></label><input class="anc-layer-opacity" data-layer="${esc(l.id)}" type="range" min="0" max="100" value="${Math.round((Number(l.opacity)||0)*100)}"></div>`;
  }

  function enhanceMaps() {
    const section=document.getElementById('cartes');
    const s=state();
    if(!section||!s||document.getElementById('anc-v3-live-map'))return;
    const layers=(s.mapLayers||[]).filter(l=>l.id!=='anc-objects');
    const scale=s.mapView?.exportScale||500;
    const body=`<div class="anc-map-grid"><div><div id="anc-v3-map"></div></div><aside><div class="field"><label>Objet à dessiner</label><select id="anc-map-role" class="select"><option value="house">Bâtiment</option><option value="treatment">Filière ANC</option><option value="pipe">Canalisation</option><option value="borehole">Sondage</option><option value="porchet">Test Porchet</option><option value="well">Puits / captage</option><option value="outlet">Exutoire / fossé</option><option value="exclusion">Zone d’exclusion</option><option value="access">Accès</option><option value="tree">Arbre / végétation</option><option value="annotation">Annotation</option></select></div><div class="field" style="margin-top:10px"><label>Échelle du plan / export</label><select id="anc-map-scale" class="select">${[100,200,250,500,1000].map(x=>`<option value="${x}" ${Number(scale)===x?'selected':''}>1:${x}</option>`).join('')}</select></div><h3>Calques et intensité</h3>${layers.map(layerRow).join('')}<div class="notice warn" style="margin-top:12px"><b>BRGM :</b> source géologique 1:50 000. Zoomer ou exporter le plan au 1:500 ne transforme jamais la précision de cette source.</div></aside></div>`;
    section.insertAdjacentHTML('afterbegin',card('anc-v3-live-map','Carte de travail multicouche','Orthophoto réelle, cadastre, BRGM, dessin vectoriel et métrés. Échelle et Nord restent visibles.',body));

    document.querySelectorAll('.anc-layer-visible').forEach(el=>el.addEventListener('change',e=>{
      const id=e.target.dataset.layer;const cfg=s.mapLayers.find(x=>x.id===id);if(cfg)cfg.visible=e.target.checked;
      window.ANCV3Map?.setLayerVisible?.(id,e.target.checked);api()?.save?.();
    }));
    document.querySelectorAll('.anc-layer-opacity').forEach(el=>el.addEventListener('input',e=>{
      const id=e.target.dataset.layer,v=Number(e.target.value)/100;const cfg=s.mapLayers.find(x=>x.id===id);if(cfg)cfg.opacity=v;
      window.ANCV3Map?.setLayerOpacity?.(id,v);api()?.save?.();
    }));
    document.getElementById('anc-map-scale')?.addEventListener('change',e=>window.ANCV3Map?.setExportScale?.(e.target.value));
    setTimeout(()=>window.ANCV3Map?.init?.('anc-v3-map'),80);
  }

  function enhanceReview() {
    const section=document.getElementById('controles');
    const s=state();
    if(!section||!s||document.getElementById('anc-v3-final-review'))return;
    const review=s.finalReview?.checks?.length?s.finalReview:core()?.finalChecks?.(s);
    const rows=(review?.checks||[]).map(c=>`<div class="anc-review-row ${esc(c.severity)}"><b>${esc(c.section)}</b><span>${esc(c.label)}${c.detail?`<br><small>${esc(c.detail)}</small>`:''}</span><span>${c.status==='COMPLETE'?'✅ COMPLET':c.severity==='BLOCKING'?'❌ MANQUANT':c.severity==='WARNING'?'⚠️ À VÉRIFIER':'ℹ️ INFO'}</span></div>`).join('');
    const body=`<div class="stats"><div class="stat"><strong>${review.blocking||0}</strong><span>bloquant(s)</span></div><div class="stat"><strong>${review.warnings||0}</strong><span>à vérifier</span></div><div class="stat"><strong>${review.infos||0}</strong><span>information(s)</span></div><div class="stat"><strong>${(review.checks||[]).filter(c=>c.status==='COMPLETE').length}</strong><span>complets</span></div></div><div class="anc-v3-toolbar" style="margin:12px 0"><button class="btn primary" id="anc-review-run">Relancer la vérification</button></div><div class="anc-review-list">${rows}</div>`;
    section.insertAdjacentHTML('afterbegin',card('anc-v3-final-review','Vérification finale de l’étude','Contrôle global avant génération du rapport : dossier, parcelles, météo, géologie, environnement, Porchet, photos et cartographie.',body));
    document.getElementById('anc-review-run')?.addEventListener('click',()=>{core()?.finalChecks?.(s);commit()});
  }

  function enhanceAngel() {
    const section=document.getElementById('automatisation');
    const s=state();
    if(!section||!s||document.getElementById('anc-v3-angel-kb'))return;
    const kb=s.knowledgeBase||{};
    const body=`<div class="grid g2"><div><b>Domaine :</b> ANC<br><b>Version :</b> ${esc(kb.version||'1.0')}<br><b>Routage :</b> dynamique<br><b>Validation humaine :</b> obligatoire</div><div><b>Priorité des sources</b><br>${(kb.sourcePriority||[]).map(x=>`<span class="anc-metric-chip">${esc(x)}</span>`).join('')}</div></div><div class="notice warn" style="margin-top:12px"><b>Règle Ángel :</b> Ángel peut expliquer, rechercher, préremplir et signaler. Elle ne valide jamais seule une mesure Porchet, une conclusion ANC, une correction critique ou la publication du rapport.</div>`;
    section.insertAdjacentHTML('beforeend',card('anc-v3-angel-kb','Base de connaissances Ángel — ANC','Préparation du domaine de connaissances et du routage dynamique sans dupliquer les données réelles SpeedArti.',body));
  }

  function enhanceAll() {
    try{enhanceDossier();enhanceTerrain();enhancePorchet();enhancePhotos();enhanceMaps();enhanceReview();enhanceAngel()}catch(err){console.error('ANC V3 UI',err)}
  }

  let queued=false;
  function queue(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;enhanceAll()});
  }

  const observer=new MutationObserver(queue);
  function start(){
    const root=document.getElementById('app');
    if(!root){setTimeout(start,50);return}
    observer.observe(root,{childList:true,subtree:true});
    queue();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

  window.ANCV3UI={enhanceAll};
})();