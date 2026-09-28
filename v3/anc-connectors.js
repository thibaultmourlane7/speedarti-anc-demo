(() => {
  'use strict';

  const GPF_GEOCODING = 'https://data.geopf.fr/geocodage';
  const GPF_WMS_RASTER = 'https://data.geopf.fr/wms-r/wms';
  const GPF_WFS = 'https://data.geopf.fr/wfs/ows';
  const BRGM_WMS = 'https://geoservices.brgm.fr/geologie';
  const BRGM_RISKS_WMS = 'https://geoservices.brgm.fr/risques';
  const GEORISQUES_REPORT = 'https://www.georisques.gouv.fr/api/v1/rapport_pdf';
  const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
  const OPEN_METEO_ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive';

  async function json(url, options={}) {
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), options.timeout || 12000);
    try {
      const r = await fetch(url, {headers:{Accept:'application/json', ...(options.headers||{})}, signal:ctrl.signal});
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } finally { clearTimeout(timer); }
  }

  async function text(url, options={}) {
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), options.timeout || 12000);
    try {
      const r = await fetch(url, {headers:{Accept:'text/plain,application/vnd.ogc.gml,text/xml,*/*', ...(options.headers||{})}, signal:ctrl.signal});
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } finally { clearTimeout(timer); }
  }

  function url(base, params) {
    const u = new URL(base);
    Object.entries(params||{}).forEach(([k,v])=>{
      if (v !== '' && v !== null && v !== undefined) u.searchParams.set(k,String(v));
    });
    return u.toString();
  }

  async function geocodeAddress({address, postalCode, city}) {
    const q = [address, postalCode, city].filter(Boolean).join(' ').trim();
    if (!address || (!postalCode && !city)) throw new Error('Adresse et commune/code postal requis.');
    const data = await json(url(`${GPF_GEOCODING}/search`, {
      q, index:'address', limit:5, postcode:postalCode || undefined, returntruegeometry:'true'
    }));
    return (data.features||[]).map(f=>({
      type:'address',
      label:f.properties?.label || q,
      score:f.properties?.score,
      city:f.properties?.city || city || '',
      postcode:f.properties?.postcode || postalCode || '',
      cityCode:f.properties?.citycode || '',
      longitude:f.geometry?.coordinates?.[0],
      latitude:f.geometry?.coordinates?.[1],
      geometry:f.geometry || null,
      source:'Géoplateforme IGN / BAN',
      retrievedAt:new Date().toISOString()
    }));
  }

  async function reverseGeocode({latitude, longitude, index='address', limit=5}) {
    const data = await json(url(`${GPF_GEOCODING}/reverse`, {
      lat:latitude, lon:longitude, index, limit, returntruegeometry:'true'
    }));
    return (data.features||[]).map(f=>({
      type:index,
      id:f.properties?.id || '',
      label:f.properties?.label || '',
      city:f.properties?.city || '',
      postcode:f.properties?.postcode || '',
      cityCode:f.properties?.citycode || '',
      departmentCode:f.properties?.departmentcode || '',
      section:f.properties?.section || '',
      number:f.properties?.number || '',
      longitude:f.geometry?.coordinates?.[0],
      latitude:f.geometry?.coordinates?.[1],
      geometry:f.geometry || null,
      properties:f.properties || {},
      surfaceM2:index==='parcel'?Number(f.properties?.contenance ?? f.properties?.CONTENANCE ?? f.properties?.surface ?? f.properties?.area ?? '')||undefined:undefined,
      source:index==='parcel'?'Géoplateforme IGN / Parcellaire Express':'Géoplateforme IGN / BAN',
      retrievedAt:new Date().toISOString()
    }));
  }

  async function parcelsAtPoint({latitude, longitude, limit=10}) {
    return reverseGeocode({latitude,longitude,index:'parcel',limit});
  }

  async function parcelWfsByBbox({minLon,minLat,maxLon,maxLat,count=100}) {
    const req = url(GPF_WFS,{
      SERVICE:'WFS', VERSION:'2.0.0', REQUEST:'GetFeature',
      TYPENAMES:'CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle',
      OUTPUTFORMAT:'application/json', SRSNAME:'EPSG:4326',
      BBOX:`${minLat},${minLon},${maxLat},${maxLon},EPSG:4326`,
      COUNT:count
    });
    return json(req);
  }

  function weatherDateMode(dateString) {
    if (!dateString) return 'forecast';
    const target = new Date(`${dateString}T12:00:00`);
    const today = new Date();
    const diff = (today-target)/(86400000);
    return diff > 5 ? 'historical' : 'forecast';
  }

  function isoDay(d){return new Date(d).toISOString().slice(0,10)}
  function addDaysIso(dateString,days){
    const d=new Date((dateString||isoDay(new Date()))+'T12:00:00');
    d.setDate(d.getDate()+days);
    return isoDay(d);
  }

  async function weatherForVisit({latitude, longitude, date}) {
    if (latitude === undefined || longitude === undefined) throw new Error('Coordonnées manquantes.');
    const targetDate=date || isoDay(new Date());
    const mode = weatherDateMode(targetDate);
    let data;

    if(mode==='historical'){
      data=await json(url(OPEN_METEO_ARCHIVE,{
        latitude,longitude,timezone:'Europe/Paris',
        daily:'precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weather_code',
        start_date:addDaysIso(targetDate,-7),
        end_date:targetDate
      }),{timeout:15000});
    }else{
      data=await json(url(OPEN_METEO,{
        latitude,longitude,timezone:'Europe/Paris',
        daily:'precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weather_code',
        past_days:7,forecast_days:16
      }),{timeout:15000});
    }

    const times=data.daily?.time||[];
    let idx=times.indexOf(targetDate);
    if(idx<0){
      const today=isoDay(new Date());
      idx=times.indexOf(today);
      if(idx<0)idx=Math.max(0,times.length-1);
    }

    const selected={
      date:times[idx]||targetDate,
      temperatureMinC:data.daily?.temperature_2m_min?.[idx],
      temperatureMaxC:data.daily?.temperature_2m_max?.[idx],
      precipitationMm:data.daily?.precipitation_sum?.[idx],
      windMaxKmh:data.daily?.wind_speed_10m_max?.[idx],
      weatherCode:data.daily?.weather_code?.[idx]
    };

    const targetTs=new Date(targetDate+'T12:00:00').getTime();
    const trendIndexes=times.map((t,i)=>({t,i,ts:new Date(t+'T12:00:00').getTime()}))
      .filter(x=>x.ts<targetTs && x.ts>=targetTs-7*86400000)
      .map(x=>x.i);
    const trend=trendIndexes.length?trendIndexes:times.slice(Math.max(0,idx-7),idx).map((_,j)=>Math.max(0,idx-7)+j);
    const precip=trend.map(i=>Number(data.daily?.precipitation_sum?.[i])).filter(Number.isFinite);
    const mins=trend.map(i=>Number(data.daily?.temperature_2m_min?.[i])).filter(Number.isFinite);
    const maxs=trend.map(i=>Number(data.daily?.temperature_2m_max?.[i])).filter(Number.isFinite);
    const totalRain=precip.reduce((a,b)=>a+b,0);
    const wetDays=precip.filter(x=>x>=0.2).length;
    const avg=(arr)=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:undefined;
    const avgMin=avg(mins),avgMax=avg(maxs);
    const trend7Text=trend.length
      ? `J-7 : ${totalRain.toFixed(1)} mm de pluie cumulée, ${wetDays} jour(s) avec pluie${avgMin!==undefined&&avgMax!==undefined?`, températures moyennes min/max ${avgMin.toFixed(1)} / ${avgMax.toFixed(1)} °C`:''}`
      : 'Tendance J-7 indisponible pour cette date.';

    return {
      provider:'Open-Meteo — provider de démonstration remplaçable par Météo-France',
      mode,
      retrievedAt:new Date().toISOString(),
      ...selected,
      trend7Days:trend.length,
      trendRainMm:totalRain,
      trendWetDays:wetDays,
      trend7Text,
      raw:data
    };
  }

  function ignLayers() {
    return {
      plan: {
        provider:'Géoplateforme IGN',
        service:'WMS',
        url:GPF_WMS_RASTER,
        layers:'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
        attribution:'IGN — cartes.gouv.fr',
        sourceScale:'multi-échelles'
      },
      orthophoto: {
        provider:'Géoplateforme IGN',
        service:'WMS',
        url:GPF_WMS_RASTER,
        layers:'ORTHOIMAGERY.ORTHOPHOTOS',
        attribution:'IGN — Photographies aériennes',
        sourceScale:'orthophoto'
      },
      cadastre: {
        provider:'Géoplateforme IGN',
        service:'WMS',
        url:GPF_WMS_RASTER,
        layers:'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
        attribution:'IGN — Parcellaire Express PCI',
        sourceScale:'PCI'
      }
    };
  }

  function parseBrgmFeatureInfo(raw='') {
    const clean=String(raw||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
    const lines=String(raw||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const entries={};
    for(const line of lines){
      const m=line.match(/^([^:=]{1,80})\s*[:=]\s*(.+)$/);
      if(m)entries[m[1].trim()]=m[2].trim();
    }
    const pick=(patterns)=>{
      for(const [k,v] of Object.entries(entries)){
        if(patterns.some(rx=>rx.test(k)))return v;
      }
      return '';
    };
    return {
      sheetCode:pick([/code/i,/numero/i,/num.?feuille/i,/n.?carte/i]),
      sheetName:pick([/nom/i,/feuille/i,/titre/i]),
      noticeRef:pick([/notice/i,/rapport/i,/document/i]),
      summary:clean.slice(0,1200),
      fields:entries
    };
  }

  async function brgmFeatureInfo({latitude,longitude,layer='SCAN_F_GEOL50_CATALOG'}) {
    if(latitude===undefined||longitude===undefined)throw new Error('Coordonnées manquantes.');
    const delta=0.02;
    const requestUrl=url(BRGM_WMS,{
      SERVICE:'WMS',VERSION:'1.1.1',REQUEST:'GetFeatureInfo',
      LAYERS:layer,QUERY_LAYERS:layer,STYLES:'',
      SRS:'EPSG:4326',
      BBOX:`${Number(longitude)-delta},${Number(latitude)-delta},${Number(longitude)+delta},${Number(latitude)+delta}`,
      WIDTH:101,HEIGHT:101,X:50,Y:50,
      FORMAT:'image/png',INFO_FORMAT:'text/plain',FEATURE_COUNT:10
    });
    const raw=await text(requestUrl,{timeout:15000});
    const parsed=parseBrgmFeatureInfo(raw);
    return {
      provider:'BRGM / InfoTerre',
      layer,
      sourceScale:layer.includes('GEOL50')?'1:50 000':'variable',
      retrievedAt:new Date().toISOString(),
      requestUrl,
      ...parsed,
      raw
    };
  }

  async function brgmContextAtPoint({latitude,longitude}) {
    const result={
      provider:'BRGM / InfoTerre',
      retrievedAt:new Date().toISOString(),
      status:'TO_CONFIRM',
      catalog:null,
      geology:null,
      warning:''
    };
    const errors=[];
    try{result.catalog=await brgmFeatureInfo({latitude,longitude,layer:'SCAN_F_GEOL50_CATALOG'});}catch(e){errors.push('catalogue : '+e.message);}
    try{result.geology=await brgmFeatureInfo({latitude,longitude,layer:'SCAN_D_GEOL50'});}catch(e){errors.push('géologie : '+e.message);}
    const useful=!!(result.catalog?.sheetCode||result.catalog?.sheetName||result.catalog?.noticeRef||result.catalog?.summary||result.geology?.summary);
    result.status=useful?'AUTO_DETECTED':'TO_CONFIRM';
    result.warning=errors.join(' · ');
    return result;
  }

  function brgmLayers() {
    return {
      geology50: {
        provider:'BRGM / InfoTerre',
        service:'WMS',
        url:BRGM_WMS,
        layers:'SCAN_D_GEOL50',
        attribution:'BRGM / InfoTerre — carte géologique 1:50 000',
        sourceScale:'1:50 000',
        scientificScaleDenominator:50000,
        warning:'Le zoom écran ne change pas la précision scientifique de la source 1:50 000.'
      },
      geology50Catalog: {
        provider:'BRGM / InfoTerre',
        service:'WMS',
        url:BRGM_WMS,
        layers:'SCAN_F_GEOL50_CATALOG',
        attribution:'BRGM / InfoTerre — tableau d’assemblage 1:50 000',
        sourceScale:'1:50 000'
      },
      bss: {
        provider:'BRGM / InfoTerre',
        service:'WMS',
        url:BRGM_WMS,
        layers:'BSS',
        attribution:'BRGM / Banque du sous-sol',
        sourceScale:'variable'
      }
    };
  }

  function extractGeorisquesRisks(payload) {
    const out=[];
    const seen=new Set();
    function walk(value,path='root'){
      if(!value || typeof value!=='object')return;
      if(!Array.isArray(value) && typeof value.present==='boolean'){
        const label=String(value.libelle || value.label || value.nom || path.split('.').at(-1) || '').trim();
        const key=label.toLowerCase();
        if(label && !seen.has(key)){
          seen.add(key);
          out.push({
            key:path,
            label,
            present:value.present,
            statutAdresse:value.libelleStatutAdresse || value.statutAdresse || '',
            statutCommune:value.libelleStatutCommune || value.statutCommune || '',
            specifique:value.specifique || ''
          });
        }
      }
      if(Array.isArray(value))value.forEach((x,i)=>walk(x,`${path}[${i}]`));
      else Object.entries(value).forEach(([k,v])=>walk(v,`${path}.${k}`));
    }
    walk(payload);
    return out;
  }

  async function georisquesRiskReport({latitude,longitude,rayon=1000}) {
    if(latitude===undefined || longitude===undefined)throw new Error('Coordonnées manquantes.');
    const endpoint='https://georisques.gouv.fr/api/v1/resultats_rapport_risque';
    const requestUrl=url(endpoint,{latlon:`${longitude},${latitude}`,rayon});
    const raw=await json(requestUrl,{timeout:15000});
    return {
      provider:'Géorisques API v1',
      apiVersion:'v1',
      retrievedAt:new Date().toISOString(),
      requestUrl,
      risks:extractGeorisquesRisks(raw),
      raw
    };
  }

  function georisquesConnectorInfo() {
    return {
      provider:'Géorisques',
      demoApiVersion:'v1',
      productionTarget:'v2',
      v1DirectRead:true,
      v2RequiresBackendToken:true,
      browserDirectWrite:false,
      status:'READY_V1__BACKEND_REQUIRED_V2',
      reason:'La démo peut lire l’API publique v1. La migration production vers v2 doit garder le jeton côté backend.',
      fallback:'Saisie/validation manuelle si la source est indisponible ; ne jamais conclure « aucune contrainte » en cas d’échec.',
      sourceUrl:'https://www.georisques.gouv.fr/'
    };
  }

  function webMercator({latitude,longitude}) {
    const x=Number(longitude)*20037508.34/180;
    let y=Math.log(Math.tan((90+Number(latitude))*Math.PI/360))/(Math.PI/180);
    y=y*20037508.34/180;
    return {x,y};
  }

  function wmsStaticMapUrl({url:serviceUrl,layers,latitude,longitude,scale=500,width=1200,height=800,printWidthMm=178,format='image/png',transparent=false,styles=''}) {
    const lat=Number(latitude),lon=Number(longitude);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return '';
    const center=webMercator({latitude:lat,longitude:lon});
    const groundWidthM=Math.max(20,(Number(scale)||500)*(Number(printWidthMm)||178)/1000);
    const groundHeightM=groundWidthM*(Number(height)||800)/(Number(width)||1200);
    const minX=center.x-groundWidthM/2,maxX=center.x+groundWidthM/2;
    const minY=center.y-groundHeightM/2,maxY=center.y+groundHeightM/2;
    return url(serviceUrl,{
      SERVICE:'WMS',VERSION:'1.3.0',REQUEST:'GetMap',
      LAYERS:layers,STYLES:styles,FORMAT:format,
      TRANSPARENT:transparent?'TRUE':'FALSE',
      CRS:'EPSG:3857',
      BBOX:`${minX},${minY},${maxX},${maxY}`,
      WIDTH:width,HEIGHT:height
    });
  }

  function georisquesReportUrl({latitude,longitude}) {
    const lat=Number(latitude),lon=Number(longitude);
    if(!Number.isFinite(lat)||!Number.isFinite(lon))return '';
    return url(GEORISQUES_REPORT,{latlon:`${lon},${lat}`});
  }

  function mapSourceRegistry() {
    return {
      location:{
        id:'location',label:'Carte de situation',mode:'wms',
        provider:'IGN / cartes.gouv.fr',url:GPF_WMS_RASTER,layers:'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
        source:'Plan IGN v2 — Géoplateforme',sourceScale:'multi-échelles',defaultScale:25000,opacity:1
      },
      cadastral:{
        id:'cadastral',label:'Plan cadastral',mode:'wms',
        provider:'IGN / cartes.gouv.fr',url:GPF_WMS_RASTER,layers:'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
        source:'Parcellaire Express PCI — Géoplateforme',sourceScale:'PCI',defaultScale:2000,opacity:1,transparent:true
      },
      aerial:{
        id:'aerial',label:'Orthophoto',mode:'wms',
        provider:'IGN / cartes.gouv.fr',url:GPF_WMS_RASTER,layers:'ORTHOIMAGERY.ORTHOPHOTOS',
        source:'Photographies aériennes IGN — Géoplateforme',sourceScale:'orthophoto',defaultScale:500,opacity:1
      },
      flood:{
        id:'flood',label:'Risque d’inondation',mode:'georisques',
        provider:'Géorisques',source:'Géorisques — rapport de risques et carte officielle au point',
        sourceScale:'variable selon donnée disponible',defaultScale:5000
      },
      groundwater:{
        id:'groundwater',label:'Remontée de nappe',mode:'wms',
        provider:'BRGM / Géorisques',url:BRGM_RISKS_WMS,layers:'REM_NAPPE_SEDIM,REM_NAPPE_SOCLE',
        source:'BRGM / Géorisques — remontées de nappes',sourceScale:'donnée nationale',defaultScale:5000,opacity:0.65,transparent:true
      },
      environment:{
        id:'environment',label:'Contraintes environnementales',mode:'wms-group',
        provider:'BRGM / Géorisques',
        source:'BRGM / Géorisques — aléas et contraintes géoscientifiques',
        sourceScale:'variable selon couche',defaultScale:5000,
        children:[
          {id:'clay',label:'Retrait-gonflement des argiles',url:BRGM_RISKS_WMS,layers:'ALEARG',opacity:0.50,sourceScale:'variable'},
          {id:'cavities',label:'Cavités souterraines',url:BRGM_RISKS_WMS,layers:'CAVITE_LOCALISEE',opacity:0.80,sourceScale:'ponctuel'},
          {id:'landslides',label:'Mouvements de terrain',url:BRGM_RISKS_WMS,layers:'MVT_LOCALISE',opacity:0.80,sourceScale:'ponctuel'}
        ]
      },
      geology:{
        id:'geology',label:'Carte géologique',mode:'wms',
        provider:'BRGM / InfoTerre',url:BRGM_WMS,layers:'SCAN_D_GEOL50',
        source:'BRGM / InfoTerre — carte géologique papier',sourceScale:'1:50 000',defaultScale:25000,opacity:0.60
      },
      investigation:{
        id:'investigation',label:'Sondages et Porchet',mode:'composite',
        provider:'SpeedArti + IGN',source:'Orthophoto IGN + cadastre + objets ANC',sourceScale:'plan métrique',defaultScale:400,
        baseLayers:['aerial','cadastral'],vectorLayer:'anc-objects'
      },
      layout:{
        id:'layout',label:'Implantation ANC',mode:'composite',
        provider:'SpeedArti + IGN',source:'Orthophoto IGN + cadastre + objets ANC',sourceScale:'plan métrique',defaultScale:400,
        baseLayers:['aerial','cadastral'],vectorLayer:'anc-objects'
      },
      trenches:{
        id:'trenches',label:'Tranchées d’infiltration',mode:'composite',
        provider:'SpeedArti + IGN',source:'Plan technique SpeedArti + orthophoto IGN + cadastre',sourceScale:'plan métrique',defaultScale:200,
        baseLayers:['aerial','cadastral'],vectorLayer:'anc-objects'
      }
    };
  }

  function connectedMapDescriptor(kind,{latitude,longitude,scale,printWidthMm=178}={}) {
    const registry=mapSourceRegistry();
    const src=registry[kind];
    if(!src)return null;
    const effectiveScale=Number(scale)||src.defaultScale||500;
    const base={
      kind,provider:src.provider,source:src.source,sourceScale:src.sourceScale,
      scale:effectiveScale,connectedAt:new Date().toISOString(),mode:src.mode
    };
    if(src.mode==='wms'){
      base.imageUrl=wmsStaticMapUrl({
        url:src.url,layers:src.layers,latitude,longitude,scale:effectiveScale,
        printWidthMm,transparent:!!src.transparent
      });
      base.wms={url:src.url,layers:src.layers,opacity:src.opacity??1,transparent:!!src.transparent};
    }else if(src.mode==='georisques'){
      base.externalUrl=georisquesReportUrl({latitude,longitude});
      const plan=registry.location;
      base.imageUrl=wmsStaticMapUrl({
        url:plan.url,layers:plan.layers,latitude,longitude,scale:effectiveScale,printWidthMm
      });
      base.note='Le fond cartographique est IGN ; le zonage inondation détaillé est fourni par le rapport officiel Géorisques au point.';
    }else if(src.mode==='wms-group'){
      base.children=src.children||[];
      const plan=registry.location;
      base.imageUrl=wmsStaticMapUrl({
        url:plan.url,layers:plan.layers,latitude,longitude,scale:effectiveScale,printWidthMm
      });
      base.note='Carte interactive : superposition des couches BRGM/Géorisques sur fond IGN.';
    }else if(src.mode==='composite'){
      base.baseLayers=src.baseLayers||['aerial','cadastral'];
      const aerial=registry.aerial;
      base.imageUrl=wmsStaticMapUrl({
        url:aerial.url,layers:aerial.layers,latitude,longitude,scale:effectiveScale,printWidthMm
      });
      base.note='Fond orthophoto connecté ; objets ANC et cadastre superposés dans l’éditeur interactif.';
    }
    return base;
  }

  function connectAllStudyMaps({maps,latitude,longitude,printWidthMm=178}) {
    if(!Array.isArray(maps))return [];
    return maps.map(m=>{
      const d=connectedMapDescriptor(m.kind,{
        latitude,longitude,scale:m.scale,printWidthMm:m.printWidthMm||printWidthMm
      });
      if(!d)return m;
      m.connection=d;
      m.liveConnected=!!(d.imageUrl||d.externalUrl||d.children||d.baseLayers);
      m.liveConnectedAt=d.connectedAt;
      m.source=d.source||m.source;
      m.sourceDate=new Date().toISOString().slice(0,10);
      m.sourceScale=d.sourceScale||m.sourceScale||'';
      if(d.imageUrl && !m.preview)m.background=d.imageUrl;
      return m;
    });
  }

  function officialSourceRegistry() {
    return {
      geoplateforme:{
        name:'Géoplateforme IGN / cartes.gouv.fr',
        geocoding:'https://data.geopf.fr/geocodage',
        wms:'https://data.geopf.fr/wms-r/wms',
        wfs:'https://data.geopf.fr/wfs/ows'
      },
      brgm:{
        name:'BRGM / InfoTerre',
        wms:BRGM_WMS,
        geologyScale:'1:50 000 pour SCAN_D_GEOL50'
      },
      georisques:georisquesConnectorInfo()
    };
  }

  window.ANCV3Connectors = {
    geocodeAddress,
    reverseGeocode,
    parcelsAtPoint,
    parcelWfsByBbox,
    weatherForVisit,
    weatherDateMode,
    ignLayers,
    brgmLayers,
    brgmFeatureInfo,
    brgmContextAtPoint,
    parseBrgmFeatureInfo,
    georisquesConnectorInfo,
    georisquesRiskReport,
    extractGeorisquesRisks,
    mapSourceRegistry,
    connectedMapDescriptor,
    connectAllStudyMaps,
    wmsStaticMapUrl,
    georisquesReportUrl,
    officialSourceRegistry
  };
})();