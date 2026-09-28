(() => {
  'use strict';

  let map = null;
  let drawn = null;
  const layers = new Map();
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

  function addWms(id,label,url,layerName,opacity,visible,attribution) {
    if(!map || !window.L) return;
    const layer=L.tileLayer.wms(url,{
      layers:layerName,
      format:'image/png',
      transparent:true,
      version:'1.3.0',
      opacity:opacity,
      attribution:attribution||label,
      maxZoom:21
    });
    layers.set(id,{id,label,layer});
    if(visible) layer.addTo(map);
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
    const scale=Number(state.mapView?.exportScale)||500;
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

    addWms('ign-ortho','Photographies aériennes','https://data.geopf.fr/wms-r/wms','ORTHOIMAGERY.ORTHOPHOTOS',1,true,'IGN — cartes.gouv.fr');
    addWms('ign-plan','Plan IGN','https://data.geopf.fr/wms-r/wms','GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',0.70,false,'IGN — cartes.gouv.fr');
    addWms('ign-cadastre','Parcelles cadastrales','https://data.geopf.fr/wms-r/wms','CADASTRALPARCELS.PARCELLAIRE_EXPRESS',0.72,true,'IGN — Parcellaire Express');
    addWms('brgm-geology','Géologie BRGM 1:50 000','https://geoservices.brgm.fr/geologie','SCAN_D_GEOL50',0.55,false,'BRGM / InfoTerre — source 1:50 000');

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
    state.mapView.exportScale=Number(scale)||500;
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
    groundWidthM
  };
})();