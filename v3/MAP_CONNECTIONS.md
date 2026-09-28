# Connexions cartographiques ANC V3

## Principe

Toutes les cartes du dossier utilisent le même centre géographique issu du dossier ANC.

Ordre de localisation :
1. adresse chantier ;
2. géocodage Géoplateforme IGN ;
3. parcelle(s) cadastrale(s) ;
4. GPS mobile en confirmation/correction.

Les sources externes restent indépendantes du dessin ANC.

## Matrice des cartes

| Carte ANC | Connexion principale | Type | Échelle / précision |
|---|---|---|---|
| Situation | IGN / cartes.gouv.fr — Plan IGN v2 | WMS | multi-échelles |
| Cadastre | IGN — Parcellaire Express PCI | WMS | donnée cadastrale |
| Vue aérienne | IGN — orthophotographies | WMS | orthophoto |
| Inondation | Géorisques | API + rapport/carte officielle au point | variable selon données disponibles |
| Remontée de nappe | BRGM / Géorisques | WMS | donnée nationale |
| Contraintes environnementales | BRGM / Géorisques | WMS multicouche | variable |
| Géologie | BRGM / InfoTerre | WMS | source 1:50 000 |
| Sondages / Porchet | IGN orthophoto + cadastre + objets ANC | composite | plan métrique |
| Implantation ANC | IGN orthophoto + cadastre + objets ANC | composite | plan métrique |
| Tranchées | SpeedArti + IGN orthophoto/cadastre | composite | plan métrique |

## Couches interactives

- Plan IGN ;
- photographies aériennes ;
- parcelles cadastrales ;
- géologie BRGM 1:50 000 ;
- remontée de nappe — domaine sédimentaire ;
- remontée de nappe — domaine de socle ;
- retrait-gonflement des argiles ;
- cavités souterraines ;
- mouvements de terrain ;
- objets ANC dessinés par le technicien.

Chaque couche cartographique dispose de :
- affichage / masquage ;
- opacité réglable ;
- source ;
- échelle/précision source lorsque pertinente.

## Géorisques / inondation

La carte inondation suit une règle particulière.

Le module interroge Géorisques pour déterminer le statut au point et conserve la source. Le bouton de source officielle ouvre le rapport Géorisques associé aux coordonnées du dossier.

Le fond IGN utilisé dans l'éditeur ne doit jamais être confondu avec le zonage d'inondation lui-même.

## BRGM

Couches connectées :
- `SCAN_D_GEOL50` — carte géologique 1:50 000 ;
- `REM_NAPPE_SEDIM` — remontée de nappe, domaine sédimentaire ;
- `REM_NAPPE_SOCLE` — remontée de nappe, domaine de socle ;
- `ALEARG` — retrait-gonflement ;
- `CAVITE_LOCALISEE` — cavités ;
- `MVT_LOCALISE` — mouvements de terrain.

La précision intrinsèque de la donnée est conservée indépendamment du zoom de l'écran.

## Échelle et Nord

Règles absolues :
- barre d'échelle toujours disponible ;
- Nord toujours visible ;
- distinction échelle du document / échelle source ;
- l'échelle d'une source BRGM 1:50 000 ne devient jamais 1:500 par simple zoom ;
- les plans techniques SpeedArti utilisent le moteur métrique existant pour les exports physiques.

## Fallback

Si une source externe est indisponible :
- ne jamais afficher « aucun risque » par défaut ;
- indiquer « source non vérifiée » ;
- permettre à Fred de continuer le dossier ;
- conserver la possibilité d'importer un fond manuellement comme solution de secours.

Un fond manuel importé par Fred n'est jamais écrasé automatiquement.

## GSTAI

Aucune connexion cartographique de ce dépôt de démonstration n'écrit dans GSTAI.

GSTAI reste strictement en lecture seule pour les agents IA ; seule Anne-Sophie est autorisée à le modifier.
