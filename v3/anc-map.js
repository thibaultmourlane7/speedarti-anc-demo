(() => {
  'use strict';

  let map = null;
  let drawn = null;
  const layers = new Map();
  let riskMarker = null;
  let northControl = null;
  let infoControl = null;

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

  function roleLabel(role) {
    return ({
      house:'Bâtiment', treatment:'Filière ANC', pipe:'Canalisation', borehole:'Sondage',
      porchet:'Test Porchet', well:'Puits / captage', outlet:'Exutoire / fossé',
      exclusion:'Zone d’exclusion', access:'Accès', tree:'Arbre / végétation',
      parcel:'Parcelle', available:'Zone disponible ANC',
      annotation:'Annotation'
    })[role] || role || 'Objet ANC';
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

  function syncDrawnToState() {
    const state=getState();
    if(!state || !drawn) return;
    window.ANCV3Core?.ensureV3(state);
    const features=[];
    drawn.eachLayer(layer=>features.push(featureFromLayer(layer)));
    state.mapFeatures=features;
    getApi()?.save?.();
    refreshInfo();
  }

  function layerFromFeature(feature) {
    if(!window.L || !feature?.geometry) return null;
    const wrapper={type:'Feature',properties:{...(feature.properties||{}),id:feature.id,role:feature.role},geometry:feature.geometry};
    const gj=L.geoJSON(wrapper,{
      pointToLayer:(f,latlng)=>L.marker(latlng),
      style:()=>({weight:3})
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

  function addWms(id,label,url,layerName,opacity,visible,attribution,transparent=true) {
    if(!map || !window.L) return;
    const layer=L.tileLayer.wms(url,{
      layers:layerName,
      format:'image/png',
      transparent:transparent!==false,
      version:'1.3.0',
      opacity:opacity,
      attribution:attribution||label,
      crossOrigin:'anonymous',
      maxZoom:21
    });
    layers.set(id,{id,label,layer});
    if(visible) layer.addTo(map);
  }

  function layerConfig(id) {
    return getState()?.mapLayers?.find(l=>l.id===id) || {};
  }

  function registerOfficialLayers() {
    const cfg=id=>layerConfig(id);
    addWms('ign-plan','Plan IGN','https://data.geopf.fr/wms-r/wms','GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',cfg('ign-plan').opacity??0.70,!!cfg('ign-plan').visible,'IGN — cartes.gouv.fr',false);
    addWms('ign-ortho','Photographies aériennes','https://data.geopf.fr/wms-r/wms','ORTHOIMAGERY.ORTHOPHOTOS',cfg('ign-ortho').opacity??1,!!cfg('ign-ortho').visible,'IGN — Photographies aériennes',false);
    addWms('ign-cadastre','Parcelles cadastrales','https://data.geopf.fr/wms-r/wms','CADASTRALPARCELS.PARCELLAIRE_EXPRESS',cfg('ign-cadastre').opacity??0.72,!!cfg('ign-cadastre').visible,'IGN — Parcellaire Express',true);
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
      const role=document.getElementById('anc-map-role')?.value||'annotation';
      e.layer.options=e.layer.options||{};
      e.layer.options.ancRole=role;
      e.layer.options.ancId=`feature_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      e.layer.bindTooltip(roleLabel(role),{sticky:true});
      drawn.addLayer(e.layer);
      syncDrawnToState();
    });
    map.on(L.Draw.Event.EDITED,syncDrawnToState);
    map.on(L.Draw.Event.DELETED,syncDrawnToState);
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

    map.on('moveend zoomend',refreshInfo);
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
    if(Number.isFinite(lat)&&Number.isFinite(lng))map.setView([lat,lng],zoomForScale(item?.scale||state?.mapView?.exportScale));
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
    if(visible && !map.hasLayer(x.layer)) x.layer.addTo(map);
    if(!visible && map.hasLayer(x.layer)) map.removeLayer(x.layer);
    const state=getState();
    const cfg=state?.mapLayers?.find(l=>l.id===id);
    if(cfg) cfg.visible=!!visible;
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
    applyPreset,
    freezeCurrentMap,
    activeKind,
    registerOfficialLayers,
    groundWidthM
  };
})();