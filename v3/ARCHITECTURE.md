# ANC V3 — Architecture et règles de sprint

## Source de vérité
- Le code réel SpeedArti dans le projet GitHub GSTAI est une source de vérité technique en **lecture seule stricte**.
- ChatGPT / FORGE / PILOTE ne doivent effectuer **aucune écriture ni manipulation** dans GSTAI.
- Anne-Sophie est la seule personne autorisée à modifier GSTAI.
- Les évolutions ANC sont développées uniquement dans `speedarti-anc-demo` tant qu'elles ne sont pas reprises par Anne-Sophie.

## Principes SpeedArti
- moteur métier séparé de l'interface ;
- champs, types et unités explicites ;
- aucune donnée métier inventée ;
- toute donnée automatique conserve sa source, sa date et son statut ;
- validation humaine des éléments professionnels importants ;
- non-régression des études V2.6 ;
- préparation RLS / user_id / staging avant toute intégration réelle ;
- aucun secret dans ce dépôt public ;
- Base de connaissances Ángel prévue pour chaque domaine métier ;
- routage dynamique Ángel : uniquement les outils et connaissances utiles au domaine ANC.

## Périmètre sprint métier Fred
1. multi-parcelles + somme des surfaces ;
2. adresse -> géocodage -> parcelles ; GPS mobile uniquement en confirmation/correction ;
3. météo automatique pour la visite ;
4. contraintes environnementales préremplies depuis les sources officielles ;
5. BRGM / InfoTerre : géologie, feuille, code, notice et échelle source lorsque disponibles ;
6. Porchet : unités explicites et photos Caméra / Galerie / Fichier ;
7. cartographie multicouche avec opacité ;
8. vraie orthophoto et cadastre Géoplateforme / cartes.gouv.fr ;
9. dessin et édition vectoriels avec métrés ;
10. échelle graphique et Nord toujours visibles ;
11. distinction stricte entre échelle source (ex. BRGM 1:50 000) et échelle d'export ;
12. vérification finale avant rapport ;
13. préparation Base de connaissances Ángel ANC et connecteurs SpeedArti.

## Connecteurs externes prévus
- Géoplateforme IGN : géocodage, géocodage inverse, cadastre, orthophoto, plan ;
- BRGM / InfoTerre : WMS/WFS géologie et sous-sol ;
- Géorisques : risques ; API v2 derrière backend si jeton nécessaire ;
- météo : WeatherConnector avec provider remplaçable ;
- urbanisme / environnement : connecteurs spécialisés et remplaçables.

## Connecteurs SpeedArti prévus
- AuthConnector
- ModuleAccessConnector
- ClientConnector
- ChantierConnector
- AgendaChantierConnector
- TeamPlanningConnector
- PhotoConnector
- AncStudyRepository
- StorageConnector
- OfflineSyncConnector
- DocumentsConnector
- PortailClientConnector
- NotificationConnector
- AuditConnector
- AngelConnector
- KnowledgeBaseConnector

Aucun de ces connecteurs internes n'écrit dans GSTAI depuis ce dépôt de démonstration.
