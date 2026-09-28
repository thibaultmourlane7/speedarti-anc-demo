# SpeedArti ANC — Démonstration V3.0 métier Fred

Démonstration autonome du module d'études d'assainissement non collectif (ANC) de SpeedArti.

## Règle de sécurité projet

Le code réel SpeedArti dans le projet GitHub **GSTAI** est une source de vérité consultable en lecture seule.

**Aucune écriture, branche, commit, push, pull request, suppression, renommage, workflow, paramètre ou autre manipulation n'est autorisée dans GSTAI par ChatGPT / FORGE / PILOTE. Anne-Sophie reste la seule personne autorisée à modifier GSTAI.**

Ce dépôt `speedarti-anc-demo` est le dépôt de démonstration ANC sur lequel les évolutions sont préparées et testées.

## Version publiée

- Version : **V3.0 bêta métier Fred**
- Build : 28/09/2026
- Fonctionnement : autonome dans le navigateur
- Stockage métier : IndexedDB local
- PWA : manifeste + Service Worker
- Connexion SpeedArti / Supabase réelle : **désactivée**
- Usage : démonstration, validation terrain et préparation d'intégration

## Évolutions principales V3

- gestion de plusieurs parcelles cadastrales ;
- addition automatique des surfaces en m² ;
- géocodage par adresse via la Géoplateforme IGN ;
- GPS mobile en confirmation/correction ;
- détection cadastrale via le Parcellaire Express ;
- récupération de la contenance cadastrale lorsqu'elle est fournie ;
- météo de visite automatique + tendance J-7 ;
- interrogation Géorisques avec traçabilité et état « source indisponible » en cas d'échec ;
- BRGM / InfoTerre : couche géologique 1:50 000 et tentative de détection feuille/code/notice au point ;
- vraie orthophoto IGN ;
- carte de travail multicouche ;
- affichage/masquage et opacité indépendante des calques ;
- dessin et édition vectoriels ;
- métrés en unités réelles ;
- échelle graphique et Nord visibles ;
- distinction entre échelle du document et échelle scientifique de la source ;
- Porchet : durée (min), volume (mL), niveau départ (cm), niveau fin (cm), K (mm/h) ;
- réglage CV déplacé en paramètres avancés ;
- photos Porchet : Caméra / Galerie / Fichier ;
- photos chantier : Caméra / Galerie / Fichier ;
- vérification finale de l'étude ;
- préparation de la Base de connaissances Ángel ANC et du routage dynamique ;
- rapport multi-parcelles.

## Sources cartographiques et données

### Géoplateforme IGN / cartes.gouv.fr

Utilisée pour :
- géocodage ;
- géocodage inverse ;
- parcelles cadastrales ;
- Plan IGN ;
- orthophotographies ;
- Parcellaire Express.

### BRGM / InfoTerre

Utilisé pour :
- carte géologique ;
- tableau d'assemblage ;
- Banque du sous-sol ;
- contexte géologique au point lorsque le service le permet.

La carte géologique BRGM utilisée comme couche de contexte conserve son **échelle source 1:50 000**. Un zoom ou un export à 1:500 ne transforme jamais cette précision scientifique.

### Géorisques

La démo peut interroger l'API publique v1.

Pour une future intégration production utilisant l'API v2 avec jeton, le jeton devra rester côté backend / Edge Function et ne jamais être exposé dans le navigateur.

### Météo

La démo utilise un `WeatherConnector` avec Open-Meteo comme provider technique de démonstration.

Le connecteur est volontairement abstrait afin de pouvoir utiliser Météo-France ou un autre provider validé lors de l'intégration SpeedArti.

## Plan d’implantation ANC & calcul métrique

La V3 utilise désormais **un seul éditeur cartographique principal** pour l’implantation ANC et les calculs métriques.

Dans l’onglet **Plan & métrés**, Fred dispose au même endroit de :
- toutes les cartes et couches officielles connectées ;
- l’orthophoto ;
- le cadastre ;
- la géologie BRGM ;
- les risques BRGM / Géorisques ;
- les vues Sondages / Porchet ;
- l’implantation ANC ;
- le dessin vectoriel ;
- les surfaces, longueurs et distances calculées à partir des objets dessinés ;
- l’échelle et le Nord.

L’onglet **Cartes dossier** n’est plus un second éditeur. Il sert de bibliothèque des images figées destinées au dossier et au rapport.

### Carte live et image figée

Chaque carte possède deux états distincts :

1. **carte live** : toujours modifiable ;
2. **image figée** : instantané enregistré dans le dossier.

Fred peut :
- dessiner / modifier ;
- cliquer sur **Figer l’image dans le dossier** ;
- continuer à modifier la carte live ;
- cliquer ensuite sur **Mettre à jour l’image figée**.

La mise à jour remplace l’image active de la carte et incrémente sa version de capture. La carte live n’est jamais verrouillée par le figement.

Les anciennes prévisualisations techniques ne sont pas considérées comme des images figées tant qu’une vraie capture n’a pas été réalisée.

## Échelle et cartographie

Deux logiques sont volontairement séparées :

1. **échelle source** : précision intrinsèque d'une donnée externe, par exemple BRGM 1:50 000 ;
2. **échelle du plan / export** : 1:100, 1:200, 1:250, 1:500, 1:1000, etc.

Les plans techniques locaux existants conservent le moteur métrique SpeedArti qui calcule le dénominateur à partir de l'emprise réelle et de la largeur d'impression.

Une carte n'est marquée « échelle vérifiée » que lorsque son échelle a réellement été contrôlée.

## Porchet

Le moteur conserve le calcul à niveau constant déjà présent.

Les champs supplémentaires niveau départ / niveau fin sont enregistrés avec leurs unités, mais ne sont pas injectés arbitrairement dans la formule tant que leur rôle exact n'a pas été validé métier avec Fred.

Le coefficient de variation (CV) reste utilisé pour le contrôle statistique des relevés mais son seuil est classé dans les paramètres avancés.

## Base de connaissances Ángel

Le domaine ANC prévoit :
- règles métier versionnées ;
- sources ;
- dates de validité ;
- séparation connaissances globales / données privées ;
- routage dynamique ;
- validation humaine obligatoire.

Ordre de priorité :
1. code réel GSTAI en lecture seule ;
2. données réelles SpeedArti / étude ;
3. Base de connaissances Ángel validée ;
4. connecteurs externes ;
5. raisonnement IA.

Ángel propose ; le professionnel valide.

## Hors connexion

Le dossier, les formulaires, l'historique et les données locales reposent sur IndexedDB.

La coque de l'application est mise en cache par Service Worker.

Les APIs BRGM, Géorisques, météo et Géoplateforme restent réseau-seulement : en l'absence de réseau, le logiciel doit indiquer que la source n'a pas été vérifiée plutôt que d'inventer une information.

## Intégration SpeedArti future

Les connecteurs prévus sont documentés dans `v3/ARCHITECTURE.md`.

Aucune écriture réelle vers SpeedArti, Supabase ou GSTAI n'est activée dans cette démo.

L'intégration réelle devra passer par :
- audit du code GSTAI en lecture seule ;
- connecteurs READ-ONLY ;
- staging ;
- RLS / user_id ;
- tests multi-utilisateurs ;
- validation ;
- intégration par Anne-Sophie.

## Fichiers V3

- `v3/ARCHITECTURE.md`
- `v3/ANGEL_KNOWLEDGE_BASE.md`
- `v3/anc-core.js`
- `v3/anc-connectors.js`
- `v3/anc-map.js`
- `v3/anc-ui.js`
- `v3/anc-v3.css`
- `manifest.webmanifest`
- `sw.js`

## Limites connues de la bêta

- les résultats automatiques BRGM / Géorisques doivent être confirmés par le professionnel ;
- la récupération automatique d'une notice BRGM dépend des informations réellement retournées par le service OGC au point interrogé ;
- les données cartographiques externes ne sont pas disponibles hors connexion ;
- aucune donnée SpeedArti réelle n'est lue ou écrite ;
- les connecteurs production restent à intégrer par Anne-Sophie dans GSTAI après validation du prototype.
