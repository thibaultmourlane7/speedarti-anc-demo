# Compte rendu sprint ANC V3 — 28/09/2026

## Statut

Sprint poussé étape par étape sur `main` du dépôt de démonstration ANC.

**GSTAI n'a fait l'objet d'aucune écriture ni manipulation.**

## Réalisé

### Architecture
- règles SpeedArti documentées ;
- GSTAI lecture seule stricte ;
- moteur métier V3 séparé ;
- connecteurs externes séparés ;
- Base de connaissances Ángel ANC documentée ;
- routage dynamique Ángel prévu.

### Dossier
- multi-parcelles ;
- ajout / retrait ;
- références cadastrales séparées ;
- somme automatique des surfaces ;
- récupération de la contenance cadastrale quand la source la fournit ;
- compatibilité avec l'ancien champ parcelle.

### Localisation
- adresse comme méthode principale ;
- Géoplateforme IGN pour géocodage ;
- GPS mobile conservé pour confirmation / correction ;
- détection parcellaire au point.

### Fiche chantier
- météo automatique ;
- tendance J-7 ;
- séparation météo automatique / observations terrain ;
- analyse Géorisques automatique avec traçabilité ;
- échec d'une source => état indisponible, jamais « aucun risque ».

### BRGM
- couche géologique 1:50 000 ;
- tableau d'assemblage ;
- interrogation au point ;
- tentative automatique de code / feuille / notice selon les informations réellement retournées ;
- source et date conservées ;
- aucune référence inventée.

### Porchet
- unités explicites ;
- durée : min ;
- volume : mL ;
- niveau départ : cm ;
- niveau fin : cm ;
- K : mm/h ;
- CV déplacé dans les paramètres avancés ;
- photos d'essai : Caméra / Galerie / Fichier ;
- les nouveaux niveaux ne sont pas ajoutés arbitrairement à la formule avant validation métier.

### Photos
- chantier : Caméra / Galerie / Fichier ;
- Porchet : Caméra / Galerie / Fichier ;
- rattachement au test Porchet prévu dans les métadonnées.

### Cartographie
- orthophoto IGN réelle ;
- Plan IGN ;
- cadastre ;
- géologie BRGM ;
- fonctionnement par calques ;
- visibilité indépendante ;
- opacité / intensité indépendante ;
- dessin vectoriel ;
- modification / suppression ;
- métrés réels ;
- barre d'échelle ;
- Nord ;
- choix d'échelle du plan ;
- distinction échelle plan / échelle source.

### Rapport
- plusieurs parcelles ;
- surface cumulée ;
- feuille / code BRGM lorsque disponible ;
- échelle, Nord et source dans les blocs cartographiques ;
- plans techniques locaux conservant le moteur métrique existant.

### Vérification finale
- client ;
- adresse ;
- localisation ;
- références de chaque parcelle ;
- surfaces ;
- géologie ;
- météo ;
- environnement ;
- sondages ;
- Porchet ;
- niveaux départ / fin ;
- photos ;
- Nord ;
- échelle.

### Hors connexion
- IndexedDB conservé ;
- manifeste PWA ajouté ;
- Service Worker ajouté ;
- coque locale mise en cache ;
- données externes réseau-seulement : aucune donnée simulée hors connexion.

## Contrôles exécutés

- syntaxe JavaScript de l'application principale : OK ;
- syntaxe `anc-core.js` : OK ;
- syntaxe `anc-connectors.js` : OK ;
- syntaxe `anc-map.js` : OK ;
- syntaxe `anc-ui.js` : OK ;
- syntaxe `sw.js` : OK ;
- JSON du manifeste : OK ;
- fichiers V3 présents sur `main` : OK ;
- branche unique `main` : OK.

## À valider sur appareil réel

Ces points nécessitent une recette navigateur / terrain et ne sont pas déclarés validés uniquement par contrôle statique :

- autorisation GPS sur iPhone / Android ;
- ouverture directe de la caméra selon navigateur ;
- réponses CORS réelles des services BRGM depuis GitHub Pages ;
- affichage des WMS IGN / BRGM dans Leaflet ;
- comportement Géorisques sur plusieurs adresses réelles ;
- météo sur dates historiques et futures ;
- impression physique d'un plan à 100 % ;
- comportement PWA réellement hors réseau ;
- ergonomie terrain avec Fred.

## À valider avec Fred

- rôle exact des niveaux départ / fin dans son protocole Porchet ;
- unités terrain définitives si elles diffèrent de cm / mL ;
- seuil CV et nombre de relevés utilisés ;
- règles d'interprétation professionnelle ;
- informations réellement indispensables dans le rapport ;
- calques environnementaux supplémentaires souhaités.

## Intégration SpeedArti

Aucune intégration réelle SpeedArti / Supabase n'a été activée dans cette démo.

Étapes futures :
1. consultation du vrai code GSTAI en lecture seule ;
2. définition des connecteurs compatibles avec le code réel ;
3. intégration READ-ONLY ;
4. staging ;
5. sécurité RLS / user_id ;
6. tests multi-utilisateurs ;
7. intégration dans GSTAI exclusivement par Anne-Sophie.

## Règle permanente GSTAI

Seule Anne-Sophie modifie GSTAI.

Les agents IA peuvent lire, analyser et préparer des modifications à l'extérieur, mais ne doivent jamais effectuer de manipulation dans GSTAI.
