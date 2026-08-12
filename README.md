# SpeedArti ANC — Démonstration V2.6

Démonstration autonome du module d'études d'assainissement non collectif (ANC) de SpeedArti.

## Version publiée

- Version : V2.6 géolocalisation automatisée
- Fonctionnement : autonome dans le navigateur
- Stockage : local via IndexedDB
- Connexion à SpeedArti / Supabase : désactivée
- Usage : démonstration et validation métier uniquement

## Nouveautés V2.6

- géocodage automatique de l'adresse du chantier via la Géoplateforme IGN / Base Adresse Nationale ;
- bouton « Utiliser ma position GPS » pour confirmer ou corriger la localisation sur le terrain ;
- détection automatique de la parcelle cadastrale probable à partir des coordonnées ;
- latitude et longitude masquées dans l'usage courant, accessibles en correction avancée ;
- coordonnées communes propagées automatiquement à toutes les cartes du dossier ;
- aperçu cartographique centré sur le chantier ;
- conservation de la source, de la date et du mode de localisation dans le dossier.

## Sécurité

Cette version ne lit et n'écrit aucune donnée dans SpeedArti ou Supabase. Les connecteurs réels et les migrations ne sont pas inclus dans ce dépôt public.

Les appels réseau de la V2.6 sont limités aux services publics de géocodage/cadastre de la Géoplateforme IGN et à l'aperçu cartographique OpenStreetMap. La géolocalisation GPS nécessite l'autorisation explicite du navigateur de l'utilisateur.
