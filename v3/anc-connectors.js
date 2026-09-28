(() => {
  'use strict';

  const GPF_GEOCODING = 'https://data.geopf.fr/geocodage';
  const GPF_WMS_RASTER = 'https://data.geopf.fr/wms-r/wms';
  const GPF_WFS = 'https://data.geopf.fr/wfs/ows';
  const BRGM_WMS = 'https://geoservices.brgm.fr/geologie';
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

  async function weatherForVisit({latitude, longitude, date}) {
    if (latitude === undefined || longitude === undefined) throw new Error('Coordonnées manquantes.');
    const mode = weatherDateMode(date);
    const base = mode === 'historical' ? OPEN_METEO_ARCHIVE : OPEN_METEO;
    const params = {
      latitude, longitude,
      timezone:'Europe/Paris',
      hourly:'temperature_2m,precipitation,weather_code,wind_speed_10m',
      daily:'precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max',
      start_date: date || undefined,
      end_date: date || undefined
    };
    if (mode === 'forecast' && !date) {
      delete params.start_date; delete params.end_date;
      params.forecast_days = 7;
    }
    const data = await json(url(base,params),{timeout:15000});
    return {
      provider:'Open-Meteo — provider de démonstration remplaçable par Météo-France',
      mode,
      retrievedAt:new Date().toISOString(),
      date: date || data.daily?.time?.[0] || '',
      temperatureMinC:data.daily?.temperature_2m_min?.[0],
      temperatureMaxC:data.daily?.temperature_2m_max?.[0],
      precipitationMm:data.daily?.precipitation_sum?.[0],
      windMaxKmh:data.daily?.wind_speed_10m_max?.[0],
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
    officialSourceRegistry
  };
})();