(() => {
  'use strict';

  let map = null;
  let drawn = null;
  const layers = new Map();
  let riskMarker = null;
  let northControl = null;
  let infoControl = null;
  let pendingRole = null;
  let activeDrawHandler = null;
  let activeEditHandler = null;
  let activeDeleteHandler = null;
  let resizeObserver = null;

  const getApi = () => window.SpeedArtiANC;
  const getState = () => getApi()?.getState?.();

  function groundWidthM(scale, printWidthMm=260) {
    const s = Number(scale)||500;
    return (printWidthMm * s) / 1000;
  }

  function geometryMetrics(layer) {
    if (!window.L || !layer) return {};
    if (layer instanceof L.Circle) {
      const r = layer.getRadius();
      return {radiusM:r, areaM2:Math.PI*r*r};
    }
    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
      const pts = layer.getLatLngs();
      let length=0;
      for(let i=1;i<pts.length;i++) length += pts[i-1].distanceTo(pts[i]);
      return {lengthM:length};
    }
    if (layer instanceof L.Polygon) {
      const pts = layer.getLatLngs()?.[0] || [];
      const area = L.GeometryUtil?.geodesicArea ? L.GeometryUtil.geodesicArea(pts) : 0;
      let perimeter=0;
      for(let i=0;i<pts.length;i++) perimeter += pts[i].distanceTo(pts[(i+1)%pts.length]);
      return {areaM2:area, perimeterM:perimeter};
    }
    return {};
  }

  function roleDefinition(role) {
    return window.ANCV3Core?.implantationObjectDefinition?.(role) || {
      role:role||'annotation',
      label:role||'Objet ANC',
      category:'other',
      geometry:'point',
      optional:true
    };
  }

  function roleLabel(role) {
    return roleDefinition(role).label || role || 'Objet ANC';
  }

  function roleIcon(role) {
    return roleDefinition(role).icon || '';
  }

  function pointIcon(role) {
    const symbol=roleIcon(role);
    if(!symbol || !window.L)return null;
    return L.divIcon({
      className:'anc-map-object-icon',
      html:`<span title="${roleLabel(role).replace(/"/g,'&quot;')}">${symbol}</span>`,
      iconSize:[30,30],
      iconAnchor:[15,15]
    });
  }

  function roleStyle(role) {
    const def=roleDefinition(role);
    const base={weight:3,fillOpacity:.16};
    if(def.category==='vegetation')return {...base,dashArray:role==='hedge'?'7 5':undefined};
    if(def.category==='water')return {...base,dashArray:(role==='ditch'||role==='watercourse')?'10 5':undefined};
    if(def.category==='network')return {...base,dashArray:'4 5'};
    if(def.category==='constraint')return {...base,dashArray:'8 5'};
    if(role==='fence')return {...base,dashArray:'3 4'};
    if(role==='wall')return {...base,weight:5};
    return base;
  }

  function featureFromLayer(layer) {
    const geo = layer.toGeoJSON();
    const role = layer.options?.ancRole || layer.feature?.properties?.role || 'annotation';
    return {
      id: layer.options?.ancId || layer.feature?.properties?.id || `feature_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      type:'Feature',
      role,
      geometry:geo.geometry,
      properties:{
        role,
        label:roleLabel(role),
        ...geometryMetrics(layer)
      },
      source:'MANUAL',
      createdAt: layer.feature?.properties?.createdAt || new Date().toISOString(),
      updatedAt:new Date().toISOString()
    };
  }

  function refreshOptionalObjectCount() {
    const state=getState();
    const el=document.querySelector('#anc-implantation-options>summary span');
    if(!state||!el)return;
    const roles=new Set((window.ANCV3Core?.optionalImplantationObjects?.()||[]).map(x=>x.role));
    const count=(state.mapFeatures||[]).filter(f=>roles.has(f.role||f.properties?.role)).length;
    el.textContent=`${count} placé(s)`;
  }

  function syncDrawnToState() {
    const state=getState();
    if(!state || !drawn) return;
    window.ANCV3Core?.ensureV3(state);
    const features=[];
    drawn.eachLayer(layer=>features.push(featureFromLayer(layer)));
    state.mapFeatures=features;
    getApi()?.save?.();
    refreshInfo();
    refreshOptionalObjectCount();
  }

  function layerFromFeature(feature) {
    if(!window.L || !feature?.geometry) return null;
    const wrapper={type:'Feature',properties:{...(feature.properties||{}),id:feature.id,role:feature.role},geometry:feature.geometry};
    const role=feature.role||feature.properties?.role||'annotation';
    const gj=L.geoJSON(wrapper,{
      pointToLayer:(f,latlng)=>{
        const icon=pointIcon(role);
        return icon?L.marker(latlng,{icon}):L.marker(latlng);
      },
      style:()=>roleStyle(role)
    });
    let out=null;
    gj.eachLayer(l=>out=l);
    if(out){
      out.options=out.options||{};
      out.options.ancId=feature.id;
      out.options.ancRole=feature.role||feature.properties?.role||'annotation';
      out.feature=wrapper;
      out.bindTooltip(`${roleLabel(out.options.ancRole)}`,{sticky:true});
    }
    return out;
  }

  function addWms(id,label,url,layerName,opacity,visible,attribution,transparent=true,options={}) {
    if(!map || !window.L) return;
    const isBrgm=/geoservices\.brgm\.fr/i.test(url);
    const baseLayer=options.base===true;
    const wmsOptions={
      layers:layerName,
      format:'image/png',
      transparent:transparent!==false,
      version:isBrgm?'1.1.1':'1.3.0',
      opacity:opacity,
      attribution:attribution||label,
      crossOrigin:'anonymous',
      maxZoom:21,
      pane:baseLayer?'anc-base-pane':'anc-data-pane',
      zIndex:baseLayer?200:360
    };
    if(isBrgm && L.CRS?.EPSG4326)wmsOptions.crs=L.CRS.EPSG4326;
    const layer=L.tileLayer.wms(url,wmsOptions);
    layer.on('tileerror',()=>{
      const el=document.getElementById('anc-map-source-status');
      if(el){
        el.className='notice warn';
        el.innerHTML='<b>Une couche cartographique n’a pas pu être chargée.</b> Essayez un autre niveau de zoom ou rechargez la source.';
      }
    });
    layers.set(id,{id,label,layer,baseLayer});
    if(visible) layer.addTo(map);
  }

  function layerConfig(id) {
    return getState()?.mapLayers?.find(l=>l.id===id) || {};
  }

  function registerOfficialLayers() {
    const cfg=id=>layerConfig(id);
    addWms('ign-plan','Plan IGN','https://data.geopf.fr/wms-r/wms','GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',cfg('ign-plan').opacity??1,!!cfg('ign-plan').visible,'IGN — cartes.gouv.fr',false,{base:true});
    addWms('ign-ortho','Photographies aériennes','https://data.geopf.fr/wms-r/wms','ORTHOIMAGERY.ORTHOPHOTOS',cfg('ign-ortho').opacity??1,!!cfg('ign-ortho').visible,'IGN — Photographies aériennes',false,{base:true});
    addWms('ign-cadastre','Parcelles cadastrales','https://data.geopf.fr/wms-r/wms','CADASTRALPARCELS.PARCELLAIRE_EXPRESS',cfg('ign-cadastre').opacity??0.78,!!cfg('ign-cadastre').visible,'IGN — Parcellaire Express',true,{base:false});
    addWms('brgm-geology','Géologie BRGM 1:50 000','https://geoservices.brgm.fr/geologie','SCAN_D_GEOL50',cfg('brgm-geology').opacity??0.55,!!cfg('brgm-geology').visible,'BRGM / InfoTerre — 1:50 000',true);
    addWms('brgm-groundwater-sedim','Remontée de nappe — sédimentaire','https://geoservices.brgm.fr/risques','REM_NAPPE_SEDIM',cfg('brgm-groundwater-sedim').opacity??0.55,!!cfg('brgm-groundwater-sedim').visible,'BRGM / Géorisques',true);
    addWms('brgm-groundwater-socle','Remontée de nappe — socle','https://geoservices.brgm.fr/risques','REM_NAPPE_SOCLE',cfg('brgm-groundwater-socle').opacity??0.55,!!cfg('brgm-groundwater-socle').visible,'BRGM / Géorisques',true);
    addWms('brgm-clay','Retrait-gonflement des argiles','https://geoservices.brgm.fr/risques','ALEARG',cfg('brgm-clay').opacity??0.50,!!cfg('brgm-clay').visible,'BRGM / Géorisques',true);
    addWms('brgm-cavities','Cavités souterraines','https://geoservices.brgm.fr/risques','CAVITE_LOCALISEE',cfg('brgm-cavities').opacity??0.85,!!cfg('brgm-cavities').visible,'BRGM / Géorisques',true);
    addWms('brgm-landslides','Mouvements de terrain','https://geoservices.brgm.fr/risques','MVT_LOCALISE',cfg('brgm-landslides').opacity??0.85,!!cfg('brgm-landslides').visible,'BRGM / Géorisques',true);
  }

  function addNorthControl() {
    const North=L.Control.extend({
      options:{position:'topright'},
      onAdd(){
        const el=L.DomUtil.create('div','anc-north-control');
        el.innerHTML='<span class="anc-north-arrow">▲</span><b>N</b>';
        el.title='Nord géographique';
        return el;
      }
    });
    northControl=new North();
    northControl.addTo(map);
  }

  function addInfoControl() {
    const Info=L.Control.extend({
      options:{position:'bottomright'},
      onAdd(){
        const el=L.DomUtil.create('div','anc-map-info');
        el.id='anc-map-live-info';
        return el;
      }
    });
    infoControl=new Info();
    infoControl.addTo(map);
  }

  function refreshInfo() {
    const el=document.getElementById('anc-map-live-info');
    const state=getState();
    if(!el||!state) return;
    const active=(state.maps||[]).find(m=>m.kind===(state.mapView?.activeKind||'layout'));
    const scale=Number(active?.scale||state.mapView?.exportScale)||500;
    const width=groundWidthM(scale, state.mapView?.printFormat==='A3'?380:260);
    let count=state.mapFeatures?.length||0;
    el.innerHTML=`<b>Plan ANC 1:${scale.toLocaleString('fr-FR')}</b><br>Largeur terrain cible ≈ ${width.toFixed(1)} m<br>${count} objet(s) éditable(s)<br><small>L'échelle source BRGM reste 1:50 000.</small>`;
  }

  function addDrawControl() {
    if(!window.L?.Control?.Draw || !drawn) return;
    const control=new L.Control.Draw({
      position:'topleft',
      draw:{
        polygon:{shapeOptions:{weight:3}},
        polyline:{shapeOptions:{weight:4}},
        rectangle:{shapeOptions:{weight:3}},
        circle:false,
        circlemarker:false,
        marker:true
      },
      edit:{featureGroup:drawn,remove:true}
    });
    map.addControl(control);

    map.on(L.Draw.Event.CREATED,e=>{
      const role=pendingRole||document.getElementById('anc-map-role')?.value||'annotation';
      activeDrawHandler=null;
      pendingRole=null;
      e.layer.options=e.layer.options||{};
      e.layer.options.ancRole=role;
      e.layer.options.ancId=`feature_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      const icon=pointIcon(role);
      if(icon&&e.layer.setIcon)e.layer.setIcon(icon);
      if(e.layer.setStyle)e.layer.setStyle(roleStyle(role));
      e.layer.bindTooltip(roleLabel(role),{sticky:true});
      drawn.addLayer(e.layer);
      syncDrawnToState();
    });
    map.on(L.Draw.Event.EDITED,()=>{
      activeEditHandler=null;
      syncDrawnToState();
      setToolStatus('<b>Modification enregistrée.</b>','good');
    });
    map.on(L.Draw.Event.DELETED,()=>{
      activeDeleteHandler=null;
      syncDrawnToState();
      setToolStatus('<b>Suppression enregistrée.</b>','good');
    });
  }

  function setToolStatus(text,kind='info') {
    const el=document.getElementById('anc-map-tool-status');
    if(!el)return;
    el.className='notice '+kind;
    el.innerHTML=text;
  }

  function stopActiveTools({clearPending=true}={}) {
    for(const handler of [activeDrawHandler,activeEditHandler,activeDeleteHandler]){
      try{handler?.disable?.()}catch(_){}
    }
    activeDrawHandler=null;
    activeEditHandler=null;
    activeDeleteHandler=null;
    if(clearPending)pendingRole=null;
  }

  function startDrawingRole(role) {
    if(!map||!window.L?.Draw){
      setToolStatus('<b>Dessin indisponible.</b> Rechargez la page : Leaflet Draw n’est pas initialisé.','warn');
      return false;
    }
    stopActiveTools();
    const def=roleDefinition(role);
    pendingRole=def.role;
    const select=document.getElementById('anc-map-role');
    if(select)select.value=def.role;

    if(def.geometry==='polyline') {
      activeDrawHandler=new L.Draw.Polyline(map,{shapeOptions:roleStyle(def.role)});
    } else if(def.geometry==='polygon') {
      activeDrawHandler=new L.Draw.Polygon(map,{
        allowIntersection:false,
        showArea:true,
        shapeOptions:roleStyle(def.role)
      });
    } else {
      const icon=pointIcon(def.role);
      activeDrawHandler=new L.Draw.Marker(map,icon?{icon}:{});
    }
    activeDrawHandler.enable();
    const instruction=def.geometry==='point'
      ?'Cliquez une fois sur la carte pour placer l’élément.'
      :def.geometry==='polyline'
        ?'Cliquez plusieurs points sur la carte, puis terminez la ligne.'
        :'Cliquez les sommets de la zone, puis fermez le polygone.';
    setToolStatus(`<b>Ajout : ${roleLabel(def.role)}</b><br>${instruction}`,'good');
    return true;
  }

  function startEditMode() {
    if(!map||!drawn||!window.L?.EditToolbar?.Edit)return false;
    stopActiveTools();
    if(!drawn.getLayers().length){
      setToolStatus('<b>Aucun élément à modifier.</b> Ajoutez d’abord un élément sur la carte.','warn');
      return false;
    }
    activeEditHandler=new L.EditToolbar.Edit(map,{featureGroup:drawn});
    activeEditHandler.enable();
    setToolStatus('<b>Mode modification actif.</b> Déplacez les points ou sommets, puis cliquez sur Enregistrer dans la barre de la carte.','good');
    return true;
  }

  function startDeleteMode() {
    if(!map||!drawn||!window.L?.EditToolbar?.Delete)return false;
    stopActiveTools();
    if(!drawn.getLayers().length){
      setToolStatus('<b>Aucun élément à supprimer.</b>','warn');
      return false;
    }
    activeDeleteHandler=new L.EditToolbar.Delete(map,{featureGroup:drawn});
    activeDeleteHandler.enable();
    setToolStatus('<b>Mode suppression actif.</b> Cliquez sur les éléments à retirer, puis validez.','warn');
    return true;
  }

  function cancelMapTool() {
    stopActiveTools();
    setToolStatus('<b>Mode navigation.</b> Vous pouvez déplacer et zoomer la carte.','info');
    return true;
  }

  function init(containerId='anc-v3-map') {
    const el=document.getElementById(containerId);
    const state=getState();
    if(!el || !state || !window.L) return false;
    if(map){try{map.remove()}catch(_){} map=null; layers.clear();}

    window.ANCV3Core?.ensureV3(state);
    const lat=Number(state.parcel?.lat)||44.0;
    const lng=Number(state.parcel?.lng)||1.35;
    map=L.map(el,{zoomControl:true,preferCanvas:true}).setView([lat,lng],19);
    map.createPane('anc-base-pane');
    map.getPane('anc-base-pane').style.zIndex='200';
    map.createPane('anc-data-pane');
    map.getPane('anc-data-pane').style.zIndex='360';

    registerOfficialLayers();

    drawn=new L.FeatureGroup().addTo(map);
    (state.mapFeatures||[]).forEach(f=>{
      const l=layerFromFeature(f);
      if(l) drawn.addLayer(l);
    });

    L.control.scale({imperial:false,metric:true,maxWidth:180,position:'bottomleft'}).addTo(map);
    addNorthControl();
    addInfoControl();
    addDrawControl();
    refreshInfo();
    refreshOptionalObjectCount();

    map.on('moveend zoomend',refreshInfo);

    if(resizeObserver){try{resizeObserver.disconnect()}catch(_){}}
    if(window.ResizeObserver){
      resizeObserver=new ResizeObserver(()=>map?.invalidateSize?.({pan:false}));
      resizeObserver.observe(el);
    }
    setTimeout(()=>map?.invalidateSize?.({pan:false}),80);
    setTimeout(()=>map?.invalidateSize?.({pan:false}),300);
    return true;
  }

  function clearRiskMarker() {
    if(riskMarker && map){try{map.removeLayer(riskMarker)}catch(_){}}
    riskMarker=null;
  }

  function addFloodStatusMarker() {
    clearRiskMarker();
    const state=getState();
    if(!map||!state||!window.L)return;
    const lat=Number(state.parcel?.lat),lng=Number(state.parcel?.lng);
    if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
    const c=state.constraints?.flood||{};
    const status=c.value==='yes'?'Risque détecté':c.value==='no'?'Aucun risque détecté par la source interrogée':'Risque non confirmé';
    const detail=[c.details,c.source].filter(Boolean).join(' — ');
    riskMarker=L.circleMarker([lat,lng],{
      radius:12,weight:4,fillOpacity:.35
    }).bindPopup(`<b>Géorisques — inondation</b><br>${status}<br><small>${String(detail||'Interroger Géorisques pour mettre à jour cette information.')}</small>`);
    riskMarker.addTo(map);
  }

  function refreshLayerControls() {
    const state=getState();
    for(const cfg of state?.mapLayers||[]){
      const checkbox=document.querySelector(`.anc-layer-visible[data-layer="${cfg.id}"]`);
      if(checkbox)checkbox.checked=!!cfg.visible;
      const range=document.querySelector(`.anc-layer-opacity[data-layer="${cfg.id}"]`);
      if(range)range.value=String(Math.round((Number(cfg.opacity??1))*100));
    }
  }

  function updateSourceStatus(message,kind='good') {
    const el=document.getElementById('anc-map-source-status');
    if(!el)return;
    el.className='notice '+kind;
    el.innerHTML=message;
  }

  function setManyVisibility(visibleIds=[]) {
    const allowed=new Set(visibleIds);
    layers.forEach((entry,id)=>{
      const visible=allowed.has(id);
      if(visible && !map.hasLayer(entry.layer)) entry.layer.addTo(map);
      if(!visible && map.hasLayer(entry.layer)) map.removeLayer(entry.layer);
    });
    const state=getState();
    (state?.mapLayers||[]).forEach(cfg=>{
      if(cfg.id==='anc-objects')return;
      cfg.visible=allowed.has(cfg.id);
    });
    refreshLayerControls();
    getApi()?.save?.();
  }

  function zoomForScale(scale) {
    const s=Number(scale)||500;
    if(s<=250)return 20;
    if(s<=500)return 19;
    if(s<=1000)return 18;
    if(s<=2500)return 17;
    if(s<=5000)return 15;
    if(s<=10000)return 14;
    return 12;
  }

  function applyPreset(kind) {
    if(!map)return;
    clearRiskMarker();
    updateSourceStatus('<b>Chargement de la carte…</b> Les fonds et surcouches officielles sont en cours d’affichage.','info');
    const state=getState();
    if(state?.mapView)state.mapView.activeKind=kind;
    const presets={
      location:['ign-plan'],
      cadastral:['ign-plan','ign-cadastre'],
      aerial:['ign-ortho','ign-cadastre'],
      flood:['ign-plan'],
      groundwater:['ign-plan','brgm-groundwater-sedim','brgm-groundwater-socle'],
      environment:['ign-plan','brgm-clay','brgm-cavities','brgm-landslides'],
      geology:['ign-plan','brgm-geology'],
      investigation:['ign-ortho','ign-cadastre'],
      layout:['ign-ortho','ign-cadastre'],
      trenches:['ign-ortho','ign-cadastre']
    };
    setManyVisibility(presets[kind]||['ign-ortho','ign-cadastre']);
    if(kind==='flood')addFloodStatusMarker();
    const item=(state?.maps||[]).find(m=>m.kind===kind);
    const lat=Number(state?.parcel?.lat),lng=Number(state?.parcel?.lng);
    let fitted=false;
    if(['layout','investigation','trenches'].includes(kind) && drawn){
      const workLayers=[];
      drawn.eachLayer(layer=>{
        const role=layer.options?.ancRole||layer.feature?.properties?.role;
        if(role==='parcel'||role==='available')workLayers.push(layer);
      });
      if(workLayers.length){
        const group=L.featureGroup(workLayers);
        const bounds=group.getBounds();
        if(bounds?.isValid?.()){
          map.fitBounds(bounds,{padding:[28,28],maxZoom:20});
          fitted=true;
        }
      }
    }
    if(!fitted && Number.isFinite(lat)&&Number.isFinite(lng)){
      map.setView([lat,lng],zoomForScale(item?.scale||state?.mapView?.exportScale));
    }
    setTimeout(()=>map?.invalidateSize?.({pan:false}),80);
    setTimeout(()=>updateSourceStatus('<b>Carte prête.</b> Si une zone reste blanche, désactivez/réactivez la couche concernée ou changez légèrement de zoom.','good'),500);
    refreshLayerControls();
    getApi()?.save?.();
    refreshInfo();
  }

  async function freezeCurrentMap(kindArg) {
    const state=getState();
    if(!state||!map)throw new Error('Carte non initialisée.');
    const kind=kindArg||state.mapView?.activeKind||'layout';
    const item=(state.maps||[]).find(m=>m.kind===kind);
    if(!item)throw new Error('Carte du dossier introuvable.');
    if(typeof window.html2canvas!=='function')throw new Error('Moteur de capture indisponible.');

    map.invalidateSize();
    await new Promise(resolve=>setTimeout(resolve,450));

    const node=document.getElementById('anc-v3-map');
    if(!node)throw new Error('Zone cartographique introuvable.');

    let canvas;
    try{
      canvas=await window.html2canvas(node,{
        useCORS:true,
        allowTaint:false,
        backgroundColor:'#ffffff',
        scale:2,
        logging:false
      });
    }catch(error){
      throw new Error('Capture impossible : '+(error?.message||error));
    }

    const image=canvas.toDataURL('image/png',0.95);
    const center=map.getCenter();
    const visibleLayers=(state.mapLayers||[])
      .filter(l=>l.id==='anc-objects'||l.visible)
      .map(l=>({
        id:l.id,label:l.label,opacity:Number(l.opacity??1),
        sourceScale:l.sourceScale||'',provider:l.provider||''
      }));

    item.preview=image;
    item.snapshotVersion=(Number(item.snapshotVersion)||0)+1;
    item.snapshotAt=new Date().toISOString();
    item.snapshotCenter={lat:center.lat,lng:center.lng};
    item.snapshotZoom=map.getZoom();
    item.snapshotLayers=visibleLayers;
    item.snapshotSourceSummary=visibleLayers.map(l=>l.label).join(' + ');
    item.north=true;
    item.scaleBar=true;
    item.scaleVerified=false;
    item.sourceDate=new Date().toISOString().slice(0,10);
    item.liveConnected=true;

    getApi()?.save?.();
    return {
      kind,
      version:item.snapshotVersion,
      at:item.snapshotAt,
      image
    };
  }

  function activeKind() {
    return getState()?.mapView?.activeKind||'layout';
  }

  function setLayerVisible(id,visible) {
    const x=layers.get(id);
    if(!map||!x) return;
    const state=getState();

    if(visible && x.baseLayer){
      layers.forEach((entry,otherId)=>{
        if(otherId===id||!entry.baseLayer)return;
        if(map.hasLayer(entry.layer))map.removeLayer(entry.layer);
        const otherCfg=state?.mapLayers?.find(l=>l.id===otherId);
        if(otherCfg)otherCfg.visible=false;
      });
    }

    if(visible && !map.hasLayer(x.layer)) x.layer.addTo(map);
    if(!visible && map.hasLayer(x.layer)) map.removeLayer(x.layer);
    const cfg=state?.mapLayers?.find(l=>l.id===id);
    if(cfg) cfg.visible=!!visible;
    refreshLayerControls();
    getApi()?.save?.();
  }

  function setLayerOpacity(id,opacity) {
    const x=layers.get(id);
    const value=Math.max(0,Math.min(1,Number(opacity)));
    x?.layer?.setOpacity?.(value);
    const state=getState();
    const cfg=state?.mapLayers?.find(l=>l.id===id);
    if(cfg) cfg.opacity=value;
    getApi()?.save?.();
  }

  function centerOnStudy() {
    const state=getState();
    if(!map||!state) return;
    const lat=Number(state.parcel?.lat),lng=Number(state.parcel?.lng);
    if(Number.isFinite(lat)&&Number.isFinite(lng)) map.setView([lat,lng],19);
  }

  function setExportScale(scale) {
    const state=getState();
    if(!state) return;
    window.ANCV3Core?.ensureV3(state);
    const value=Number(scale)||500;
    state.mapView.exportScale=value;
    const active=(state.maps||[]).find(m=>m.kind===(state.mapView.activeKind||'layout'));
    if(active)active.scale=value;
    const lat=Number(state.parcel?.lat),lng=Number(state.parcel?.lng);
    if(map&&Number.isFinite(lat)&&Number.isFinite(lng))map.setView([lat,lng],zoomForScale(value));
    getApi()?.save?.();
    refreshInfo();
  }

  function getMap(){return map;}

  window.ANCV3Map={
    init,
    getMap,
    setLayerVisible,
    setLayerOpacity,
    setExportScale,
    centerOnStudy,
    syncDrawnToState,
    startDrawingRole,
    startEditMode,
    startDeleteMode,
    cancelMapTool,
    applyPreset,
    freezeCurrentMap,
    activeKind,
    registerOfficialLayers,
    groundWidthM
  };
})();