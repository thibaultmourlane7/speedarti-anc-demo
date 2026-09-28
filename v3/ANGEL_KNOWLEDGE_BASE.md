# Base de connaissances Ángel — domaine ANC

## Règle transversale SpeedArti

La Base de connaissances Ángel fait partie de l'architecture centrale de SpeedArti.

Pour l'ANC, Ángel doit distinguer :
- le code réel SpeedArti consulté dans GSTAI en lecture seule ;
- les données réelles du client / chantier / étude ;
- les règles métier ANC validées ;
- les données de connecteurs externes ;
- les propositions ou raisonnements IA.

Ordre de priorité :

1. code réel SpeedArti / GSTAI en lecture seule ;
2. données réelles SpeedArti et dossier ANC ;
3. Base de connaissances Ángel validée ;
4. connecteurs externes ;
5. raisonnement IA.

L'IA ne remplace jamais une donnée réelle.

## Règles absolues
- Ángel ne doit pas inventer une mesure, une parcelle, une contrainte, une donnée BRGM ou une valeur Porchet.
- Ángel peut expliquer, rechercher, préremplir, synthétiser et signaler une anomalie.
- Ángel ne valide jamais seule une conclusion professionnelle ANC.
- Ángel ne modifie jamais silencieusement une mesure critique.
- Ángel ne publie jamais seule un rapport.
- Les données privées utilisateur/client/chantier ne deviennent jamais des connaissances globales.
- Les connaissances susceptibles d'évoluer doivent être versionnées et sourcées.

## Routage dynamique

Une demande ANC doit charger uniquement :
- les outils ANC nécessaires ;
- les données du dossier concerné ;
- le sous-ensemble ANC de la Base de connaissances.

Ne pas injecter l'ensemble des outils SpeedArti à chaque demande.

## Connaissances ANC à maintenir
- définitions des champs ;
- unités utilisées ;
- procédure de sondage ;
- procédure et calcul Porchet ;
- explication du coefficient de variation ;
- règles métier validées avec Fred ;
- cartographie et fonctionnement des calques ;
- différence entre échelle source et échelle d'export ;
- données BRGM / InfoTerre ;
- contraintes environnementales et provenance ;
- checklist de contrôle final ;
- fonctionnement du rapport ;
- limites et validations humaines.

## Modèle minimal d'une connaissance

```json
{
  "knowledgeId": "anc.porchet.volume",
  "domain": "anc",
  "version": "1.0",
  "title": "Volume d'eau du relevé Porchet",
  "content": "Le volume doit toujours être associé à une unité explicite.",
  "source": "Validation métier Fred",
  "status": "CONFIRMED",
  "validFrom": "2026-09-28",
  "validTo": null,
  "humanValidationRequired": true
}
```

## Sécurité

La Base de connaissances générale ne doit jamais permettre l'accès aux données d'un autre artisan.

Lors de l'intégration réelle dans SpeedArti :
- respecter user_id ;
- respecter company_id lorsqu'il existe ;
- respecter RLS ;
- respecter les permissions collaborateur ;
- conserver les sources et versions.

## GSTAI

GSTAI est consultable uniquement pour connaître le code réel actuel.

Aucun agent IA de ce projet n'est autorisé à :
- écrire ;
- créer ;
- supprimer ;
- pousser ;
- fusionner ;
- créer une branche ou une PR ;
- modifier un workflow ou un paramètre.

Anne-Sophie reste la seule personne autorisée à modifier GSTAI.
