(function (global) {
  'use strict';
  const registry = Object.create(null);
  const cache = Object.create(null);
  function define(name, deps, factory) { registry[name] = { deps, factory }; }
  function load(name) {
    if (Object.prototype.hasOwnProperty.call(cache, name)) return cache[name];
    const record = registry[name];
    if (!record) throw new Error('Module AMD introuvable : ' + name);
    const exports = {};
    cache[name] = exports;
    const localRequire = (dependency) => load(dependency);
    const args = record.deps.map((dependency) => dependency === 'require' ? localRequire : dependency === 'exports' ? exports : load(dependency));
    const returned = record.factory.apply(global, args);
    if (returned !== undefined) cache[name] = returned;
    return cache[name];
  }
  global.define = define;
  global.__plaquisteAmdLoad = load;
})(globalThis);
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define("core/types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("core/config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_PLAQUISTE_CONFIG = void 0;
    const validated = (value, source, note) => ({
        value,
        status: 'validated',
        source,
        ...(note ? { note } : {}),
    });
    const provisional = (value, source, note) => ({
        value,
        status: 'provisional',
        source,
        ...(note ? { note } : {}),
    });
    const unresolved = (value, source, note) => ({
        value,
        status: 'unresolved',
        source,
        ...(note ? { note } : {}),
    });
    const plateSurcharges = {
        BA13_STANDARD: validated(0, 'notice-section-9.1'),
        BA13_HYDRO: validated(85, 'notice-section-9.1', '0,85 €/m² acheté'),
        BA13_PHONIQUE: validated(135, 'notice-section-9.1', '1,35 €/m² acheté'),
        BA13_FEU: validated(200, 'notice-section-9.1', '2,00 €/m² acheté'),
        HABITO: validated(320, 'notice-section-9.1', '3,20 €/m² acheté'),
        BA10: unresolved(0, 'absence-de-valeur', 'Aucune plus-value validée dans la notice.'),
        BA15: unresolved(0, 'absence-de-valeur', 'Aucune plus-value validée dans la notice.'),
        BA18: unresolved(0, 'absence-de-valeur', 'Aucune plus-value validée dans la notice.'),
        FERMACELL: unresolved(0, 'absence-de-valeur', 'Aucune plus-value validée dans la notice.'),
    };
    exports.DEFAULT_PLAQUISTE_CONFIG = {
        version: 'plaquiste-config-2026-08-05-v2',
        plate: {
            widthM: validated(1.2, 'notice-section-9'),
            lossPct: validated(7, 'questionnaire-guillaume-2026-08-05-q1', 'Murs : 7 % en plus du calcul par formats commerciaux.'),
            ceilingLossPct: validated(10, 'questionnaire-guillaume-2026-08-05-q1', 'Plafonds droits : 10 %.'),
            slopedCeilingLossPct: validated(12, 'questionnaire-guillaume-2026-08-05-q1', 'Plafonds rampants : 12 %.'),
            surchargePurchaseCentsPerM2: plateSurcharges,
        },
        frame: {
            lossPct: validated(5, 'notice-section-10'),
        },
        insulation: {
            lossPct: validated(10, 'questionnaire-guillaume-2026-08-05-q8', 'Panneaux et rouleaux.'),
            blownLossPct: validated(3, 'questionnaire-guillaume-2026-08-05-q8', 'Isolants soufflés.'),
            secondLayerLaborSaleCentsPerM2: validated(300, 'notice-section-12', 'Plus-value de pose, matière calculée couche par couche.'),
            crossedInstallationLaborCoefficient: validated(1.15, 'questionnaire-guillaume-2026-08-05-q10', 'Uniquement si deux couches et pose croisée cochée.'),
            semiRigidMaterialCoefficient: validated(1.2, 'questionnaire-guillaume-2026-08-05-q10', 'Appliqué au coût d’achat matière avant marge.'),
            semiRigidLaborCoefficient: validated(1.2, 'questionnaire-guillaume-2026-08-05-q10', 'La portée exacte dans les temps globaux reste signalée dans la trace.'),
            pareVapeurSaleCentsPerM2: validated(350, 'questionnaire-guillaume-2026-08-05-q11', 'Prix de vente direct.'),
            freinVapeurSaleCentsPerM2: validated(500, 'questionnaire-guillaume-2026-08-05-q11', 'Membrane hygrovariable = frein-vapeur, prix de vente direct.'),
        },
        optima: {
            supportVerticalSpacingM: validated(1.35, 'questionnaire-guillaume-2026-08-05-q4'),
            furringMlM2: validated(1.8, 'questionnaire-guillaume-2026-08-05-q4'),
            clipTrackMlM2: validated(0.9, 'questionnaire-guillaume-2026-08-05-q4'),
            supportUnitM2: validated(0.75, 'questionnaire-guillaume-2026-08-05-q4'),
            keyUnitM2: validated(0.75, 'questionnaire-guillaume-2026-08-05-q4'),
            fixingUnitM2PerRow: validated(2, 'notice-section-10.2', '2 fixations/m² par rangée d’appuis.'),
        },
        finish: {
            wallBandMlM2: validated(1.8, 'notice-section-13'),
            ceilingBandMlM2: validated(2.2, 'notice-section-11.1'),
            wallCompoundKgM2: validated(0.5, 'notice-section-13'),
            ceilingCompoundKgM2: validated(0.6, 'notice-section-11.1'),
            horizontalJointCompoundKgPerMl: validated(0, 'questionnaire-guillaume-2026-08-05-q3', 'Aucun complément séparé : temps et matériaux inclus dans le forfait de finition.'),
            firstLayerScrewsWallUnitM2: provisional(25, 'notice-section-13', 'Valeur V1 explicitement laissée configurable.'),
            screwLossPct: validated(10, 'audit-guillaume-plaquiste', 'Ajouter 10 % avant conversion en boîtes.'),
            secondLayerScrewsUnitM2: validated(20, 'notice-section-13'),
            firstLayerScrewsCeilingUnitM2: validated(18, 'notice-section-11.1'),
            finishSaleCentsPerM2: {
                aucune: validated(0, 'notice-section-13.1'),
                bandes: validated(500, 'notice-section-13.1'),
                pret_a_peindre: validated(900, 'notice-section-13.1'),
                soignee: validated(1300, 'notice-section-13.1'),
            },
            impressionSaleCentsPerM2: validated(500, 'notice-section-13.1'),
        },
        labor: {
            cloisonSimpleHoursM2: validated(0.35, 'notice-section-14'),
            doublageOptimaHoursM2: validated(0.4, 'notice-section-14'),
            doublageClassiqueSansIsolantHoursM2: validated(0.26, 'notice-section-14'),
            doublageClassiqueAvecIsolantHoursM2: validated(0.32, 'notice-section-14'),
            plafondDroitHoursM2: validated(0.4, 'notice-section-14'),
            secondSkinExtraHoursM2: validated(0.05, 'notice-section-14'),
            doubledStudLaborCoefficient: validated(1.5, 'audit-guillaume-plaquiste', 'Montants doublés : main-d’œuvre ×1,5.'),
            complexityCoefficient: {
                simple: validated(0.9, 'notice-section-14'),
                moyenne: validated(1, 'notice-section-14'),
                complexe: validated(1.3, 'notice-section-14'),
            },
        },
        directPrices: {
            renfortOsbCentsPerUnit: validated(7500, 'notice-section-10.3'),
            angleSortantCentsPerMl: validated(700, 'notice-section-15'),
            repriseExistantCents: validated(15000, 'notice-section-15'),
            repriseExistantScope: validated('chantier', 'questionnaire-guillaume-2026-08-05-q2', 'Une seule fois par chantier/chiffrage ; montant modifiable.'),
            accesDifficileCents: validated(45000, 'notice-section-15'),
            heightThresholdM: validated(3.5, 'notice-section-15'),
            heightSurchargeCentsPerM2: validated(400, 'notice-section-15'),
            manyCutsCentsPerM2: validated(200, 'notice-section-15'),
            rampantSimpleCentsPerM2: validated(500, 'notice-section-11.2'),
            rampantComplexeCentsPerM2: validated(1100, 'notice-section-11.2'),
        },
    };
});
define("core/errors", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.alert = exports.PlaquisteValidationError = void 0;
    class PlaquisteValidationError extends Error {
        validation;
        constructor(validation) {
            super(`Calcul Plaquiste V2 bloqué par ${validation.blocking.length} erreur(s).`);
            this.name = 'PlaquisteValidationError';
            this.validation = validation;
        }
    }
    exports.PlaquisteValidationError = PlaquisteValidationError;
    const alert = (code, condition, message, level, fieldRefs, details) => ({
        code,
        condition,
        message,
        level,
        fieldRefs,
        ...(details ? { details } : {}),
    });
    exports.alert = alert;
});
define("core/context", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createCalculationContext = void 0;
    const pathToTag = (path) => `PLQ.${path}`
        .replaceAll('[', '.')
        .replaceAll(']', '')
        .replaceAll(/[^a-zA-Z0-9_.-]/g, '_')
        .replaceAll('..', '.')
        .toUpperCase();
    class FieldRegistry {
        entries = new Map();
        register(path, value, source = 'artisan', note, tag) {
            if (this.entries.has(path))
                return;
            this.entries.set(path, {
                tag: tag ?? pathToTag(path),
                path,
                value,
                source,
                consumedBy: [],
                status: 'registered',
                ...(note ? { note } : {}),
            });
        }
        consume(path, engine, note) {
            const entry = this.entries.get(path);
            if (!entry) {
                this.register(path, undefined, 'system', 'Champ consommé mais non pré-enregistré.');
            }
            const current = this.entries.get(path);
            if (!current)
                return;
            if (!current.consumedBy.includes(engine))
                current.consumedBy.push(engine);
            current.status = 'consumed';
            if (note)
                current.note = current.note ? `${current.note} | ${note}` : note;
        }
        getAudit() {
            return [...this.entries.values()].map((entry) => ({
                ...entry,
                consumedBy: [...entry.consumedBy],
                status: entry.consumedBy.length > 0 ? 'consumed' : 'unused',
            }));
        }
        getUnusedArtisanFields() {
            return this.getAudit().filter((entry) => entry.source === 'artisan' && entry.status === 'unused');
        }
    }
    const createCalculationContext = () => {
        const fields = new FieldRegistry();
        const trace = [];
        const warnings = [];
        let traceCounter = 0;
        return {
            fields,
            trace(entry) {
                traceCounter += 1;
                trace.push({ id: `PLQ-TRACE-${String(traceCounter).padStart(5, '0')}`, ...entry });
            },
            getTrace() {
                return [...trace];
            },
            warn(alert) {
                warnings.push(alert);
            },
            getWarnings() {
                return [...warnings];
            },
        };
    };
    exports.createCalculationContext = createCalculationContext;
});
define("core/fieldTags", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerPlaquisteInputFields = void 0;
    const sanitizeTag = (value) => value.replaceAll(/[^a-zA-Z0-9_.-]/g, '_').toUpperCase();
    const r = (ctx, path, value, source = 'artisan', note, tag) => ctx.fields.register(path, value, source, note, tag ? sanitizeTag(tag) : undefined);
    const registerPlaquisteInputFields = (input, ctx) => {
        r(ctx, 'schemaVersion', input.schemaVersion, 'system', undefined, 'PLQ.ROOT.SCHEMA_VERSION');
        r(ctx, 'id', input.id, 'system', undefined, `PLQ.CHIFFRAGE.${input.id}.ID`);
        r(ctx, 'nomCalcul', input.nomCalcul, 'artisan', undefined, `PLQ.CHIFFRAGE.${input.id}.NOM`);
        r(ctx, 'contexte.usageBatiment', input.contexte.usageBatiment, 'artisan', undefined, 'PLQ.CONTEXTE.USAGE_BATIMENT');
        r(ctx, 'contexte.logementAcheveDepuisPlusDe2Ans', input.contexte.logementAcheveDepuisPlusDe2Ans, 'artisan', undefined, 'PLQ.CONTEXTE.LOGEMENT_PLUS_2_ANS');
        r(ctx, 'contexte.renovationEnergetique', input.contexte.renovationEnergetique, 'artisan', undefined, 'PLQ.CONTEXTE.RENOVATION_ENERGETIQUE');
        r(ctx, 'contexte.tvaMode', input.contexte.tvaMode, 'artisan', undefined, 'PLQ.CONTEXTE.TVA_MODE');
        if (input.contexte.tauxManuel !== undefined) {
            r(ctx, 'contexte.tauxManuel', input.contexte.tauxManuel, 'artisan', undefined, 'PLQ.CONTEXTE.TVA_TAUX_MANUEL');
        }
        r(ctx, 'contexte.eligibiliteConfirmee', input.contexte.eligibiliteConfirmee, 'artisan', undefined, 'PLQ.CONTEXTE.TVA_ELIGIBILITE_CONFIRMEE');
        if (input.contexte.justification !== undefined) {
            r(ctx, 'contexte.justification', input.contexte.justification, 'artisan', undefined, 'PLQ.CONTEXTE.TVA_JUSTIFICATION');
        }
        input.pieces.forEach((piece, pieceIndex) => {
            const p = `pieces[${pieceIndex}]`;
            const t = `PLQ.PIECE.${piece.id}`;
            r(ctx, `${p}.id`, piece.id, 'system', undefined, `${t}.ID`);
            r(ctx, `${p}.nom`, piece.nom, 'artisan', undefined, `${t}.NOM`);
            r(ctx, `${p}.longueurM`, piece.longueurM, 'artisan', undefined, `${t}.LONGUEUR_M`);
            r(ctx, `${p}.largeurM`, piece.largeurM, 'artisan', undefined, `${t}.LARGEUR_M`);
            r(ctx, `${p}.hauteurM`, piece.hauteurM, 'artisan', undefined, `${t}.HAUTEUR_M`);
            piece.murs.forEach((wall, wallIndex) => registerWall(ctx, `${p}.murs[${wallIndex}]`, wall));
            if (piece.plafond)
                registerCeiling(ctx, `${p}.plafond`, piece.plafond, piece.id);
        });
        input.mursSimples.forEach((wall, wallIndex) => registerWall(ctx, `mursSimples[${wallIndex}]`, wall));
        r(ctx, 'optionsChantier.complexite', input.optionsChantier.complexite, 'artisan', undefined, 'PLQ.OPTIONS.COMPLEXITE');
        r(ctx, 'optionsChantier.accesDifficile', input.optionsChantier.accesDifficile, 'artisan', undefined, 'PLQ.OPTIONS.ACCES_DIFFICILE.ACTIF');
        if (input.optionsChantier.accesDifficilePrixOverrideCents !== undefined) {
            r(ctx, 'optionsChantier.accesDifficilePrixOverrideCents', input.optionsChantier.accesDifficilePrixOverrideCents, 'artisan', undefined, 'PLQ.OPTIONS.ACCES_DIFFICILE.PRIX_OVERRIDE_CENTS');
        }
        r(ctx, 'optionsChantier.repriseExistant', input.optionsChantier.repriseExistant, 'artisan', undefined, 'PLQ.OPTIONS.REPRISE_EXISTANT.ACTIF');
        if (input.optionsChantier.repriseExistantPrixOverrideCents !== undefined) {
            r(ctx, 'optionsChantier.repriseExistantPrixOverrideCents', input.optionsChantier.repriseExistantPrixOverrideCents, 'artisan', undefined, 'PLQ.OPTIONS.REPRISE_EXISTANT.PRIX_OVERRIDE_CENTS');
        }
        r(ctx, 'optionsChantier.nombreusesDecoupesSpots', input.optionsChantier.nombreusesDecoupesSpots, 'artisan', undefined, 'PLQ.OPTIONS.DECOUPES_SPOTS.ACTIF');
        input.optionsChantier.nombreusesDecoupesSpotsOuvrageIds.forEach((ouvrageId, index) => {
            r(ctx, `optionsChantier.nombreusesDecoupesSpotsOuvrageIds[${index}]`, ouvrageId, 'artisan', undefined, `PLQ.OPTIONS.DECOUPES_SPOTS.CIBLE.${ouvrageId}`);
        });
        input.optionsChantier.optionsDirectes.forEach((option, index) => {
            const p = `optionsChantier.optionsDirectes[${index}]`;
            const t = `PLQ.OPTION_DIRECTE.${option.id}`;
            r(ctx, `${p}.id`, option.id, 'system', undefined, `${t}.ID`);
            r(ctx, `${p}.label`, option.label, 'artisan', undefined, `${t}.LIBELLE`);
            r(ctx, `${p}.active`, option.active, 'artisan', undefined, `${t}.ACTIVE`);
            r(ctx, `${p}.quantite`, option.quantite, 'artisan', undefined, `${t}.QUANTITE`);
            r(ctx, `${p}.unite`, option.unite, 'artisan', undefined, `${t}.UNITE`);
            if (option.prixVenteUnitaireHtCents !== undefined) {
                r(ctx, `${p}.prixVenteUnitaireHtCents`, option.prixVenteUnitaireHtCents, 'artisan', undefined, `${t}.PRIX_VENTE_UNITAIRE_HT_CENTS`);
            }
            r(ctx, `${p}.scope`, option.scope, 'artisan', undefined, `${t}.PORTEE`);
            if (option.ouvrageId !== undefined) {
                r(ctx, `${p}.ouvrageId`, option.ouvrageId, 'artisan', undefined, `${t}.OUVRAGE.${option.ouvrageId}`);
            }
        });
        input.optionsChantier.articlesLibres.forEach((article, index) => {
            const p = `optionsChantier.articlesLibres[${index}]`;
            const t = `PLQ.ARTICLE_LIBRE.${article.id}`;
            r(ctx, `${p}.id`, article.id, 'system', undefined, `${t}.ID`);
            r(ctx, `${p}.label`, article.label, 'artisan', undefined, `${t}.LIBELLE`);
            r(ctx, `${p}.quantite`, article.quantite, 'artisan', undefined, `${t}.QUANTITE`);
            r(ctx, `${p}.unite`, article.unite, 'artisan', undefined, `${t}.UNITE`);
            if (article.catalogueArticleId !== undefined)
                r(ctx, `${p}.catalogueArticleId`, article.catalogueArticleId, 'artisan', undefined, `${t}.ARTICLE_CATALOGUE.${article.catalogueArticleId}`);
            if (article.coutAchatUnitaireHtCents !== undefined)
                r(ctx, `${p}.coutAchatUnitaireHtCents`, article.coutAchatUnitaireHtCents, 'artisan', undefined, `${t}.COUT_ACHAT_UNITAIRE_HT_CENTS`);
            if (article.prixVenteUnitaireHtCents !== undefined)
                r(ctx, `${p}.prixVenteUnitaireHtCents`, article.prixVenteUnitaireHtCents, 'artisan', undefined, `${t}.PRIX_VENTE_UNITAIRE_HT_CENTS`);
        });
        registerOverrides(input, ctx);
    };
    exports.registerPlaquisteInputFields = registerPlaquisteInputFields;
    const registerWall = (ctx, path, wall) => {
        const t = `PLQ.MUR.${wall.id}`;
        r(ctx, `${path}.id`, wall.id, 'system', undefined, `${t}.ID`);
        r(ctx, `${path}.source`, wall.source, 'system', undefined, `${t}.SOURCE`);
        if (wall.pieceId !== undefined)
            r(ctx, `${path}.pieceId`, wall.pieceId, 'system', undefined, `${t}.PIECE.${wall.pieceId}`);
        r(ctx, `${path}.label`, wall.label, 'artisan', undefined, `${t}.LIBELLE`);
        r(ctx, `${path}.actif`, wall.actif, 'artisan', undefined, `${t}.ACTIF`);
        r(ctx, `${path}.longueurM`, wall.longueurM, 'artisan', undefined, `${t}.LONGUEUR_M`);
        r(ctx, `${path}.hauteurM`, wall.hauteurM, 'artisan', undefined, `${t}.HAUTEUR_M`);
        r(ctx, `${path}.typeParoi`, wall.typeParoi, 'artisan', undefined, `${t}.TYPE_PAROI`);
        r(ctx, `${path}.nombreAnglesSortants`, wall.nombreAnglesSortants, 'artisan', undefined, `${t}.ANGLES_SORTANTS.NOMBRE`);
        wall.parements.forEach((parement, index) => registerParement(ctx, `${path}.parements[${index}]`, parement, wall.id));
        r(ctx, `${path}.ossature.systeme`, wall.ossature.systeme, 'artisan', undefined, `${t}.OSSATURE.SYSTEME`);
        r(ctx, `${path}.ossature.largeurProfilMm`, wall.ossature.largeurProfilMm, 'artisan', undefined, `${t}.OSSATURE.LARGEUR_PROFIL_MM`);
        r(ctx, `${path}.ossature.entraxeMm`, wall.ossature.entraxeMm, 'artisan', undefined, `${t}.OSSATURE.ENTRAXE_MM`);
        r(ctx, `${path}.ossature.montantsDoubles`, wall.ossature.montantsDoubles, 'artisan', undefined, `${t}.OSSATURE.MONTANTS_DOUBLES`);
        if (wall.ossature.nombreRangeesAppuis !== undefined)
            r(ctx, `${path}.ossature.nombreRangeesAppuis`, wall.ossature.nombreRangeesAppuis, 'artisan', undefined, `${t}.OSSATURE.RANGEES_APPUIS`);
        if (wall.ossature.nombreAppuisParM2 !== undefined)
            r(ctx, `${path}.ossature.nombreAppuisParM2`, wall.ossature.nombreAppuisParM2, 'system', 'Ancien champ lu puis normalisé vers nombreRangeesAppuis.', `${t}.OSSATURE.APPUIS_PAR_M2_LEGACY`);
        if (wall.isolation)
            registerIsolation(ctx, `${path}.isolation`, wall.isolation, wall.id);
        wall.ouvertures.forEach((opening, index) => {
            const p = `${path}.ouvertures[${index}]`;
            const ot = `${t}.OUVERTURE.${opening.id}`;
            r(ctx, `${p}.id`, opening.id, 'system', undefined, `${ot}.ID`);
            r(ctx, `${p}.type`, opening.type, 'artisan', undefined, `${ot}.TYPE`);
            r(ctx, `${p}.largeurM`, opening.largeurM, 'artisan', undefined, `${ot}.LARGEUR_M`);
            r(ctx, `${p}.hauteurM`, opening.hauteurM, 'artisan', undefined, `${ot}.HAUTEUR_M`);
            r(ctx, `${p}.quantite`, opening.quantite, 'artisan', undefined, `${ot}.QUANTITE`);
            r(ctx, `${p}.ossaturePeripherique`, opening.ossaturePeripherique, 'artisan', undefined, `${ot}.OSSATURE_PERIPHERIQUE`);
        });
        wall.renforts.forEach((reinforcement, index) => {
            const p = `${path}.renforts[${index}]`;
            const rt = `${t}.RENFORT.${reinforcement.id}`;
            r(ctx, `${p}.id`, reinforcement.id, 'system', undefined, `${rt}.ID`);
            r(ctx, `${p}.label`, reinforcement.label, 'artisan', undefined, `${rt}.LIBELLE`);
            r(ctx, `${p}.quantite`, reinforcement.quantite, 'artisan', undefined, `${rt}.QUANTITE`);
            if (reinforcement.prixVenteUnitaireOverrideCents !== undefined)
                r(ctx, `${p}.prixVenteUnitaireOverrideCents`, reinforcement.prixVenteUnitaireOverrideCents, 'artisan', undefined, `${rt}.PRIX_VENTE_UNITAIRE_OVERRIDE_CENTS`);
        });
    };
    const registerParement = (ctx, path, parement, wallId) => {
        const t = `PLQ.MUR.${wallId}.PAREMENT.${parement.id}`;
        r(ctx, `${path}.id`, parement.id, 'system', undefined, `${t}.ID`);
        r(ctx, `${path}.face`, parement.face, 'artisan', undefined, `${t}.FACE`);
        r(ctx, `${path}.actif`, parement.actif, 'artisan', undefined, `${t}.ACTIF`);
        r(ctx, `${path}.nombrePeaux`, parement.nombrePeaux, 'artisan', undefined, `${t}.NOMBRE_PEAUX`);
        parement.skinIds.forEach((skinId, index) => r(ctx, `${path}.skinIds[${index}]`, skinId, 'system', undefined, `${t}.PEAU.${skinId}.ID`));
        r(ctx, `${path}.typePlaque`, parement.typePlaque, 'artisan', undefined, `${t}.TYPE_PLAQUE`);
        registerFinish(ctx, `${path}.finition`, parement.finition, `${t}.FINITION`);
    };
    const registerCeiling = (ctx, path, ceiling, pieceId) => {
        const t = `PLQ.PIECE.${pieceId}.PLAFOND.${ceiling.id}`;
        r(ctx, `${path}.id`, ceiling.id, 'system', undefined, `${t}.ID`);
        r(ctx, `${path}.actif`, ceiling.actif, 'artisan', undefined, `${t}.ACTIF`);
        r(ctx, `${path}.type`, ceiling.type, 'artisan', undefined, `${t}.TYPE`);
        if (ceiling.surfaceSaisieM2 !== undefined)
            r(ctx, `${path}.surfaceSaisieM2`, ceiling.surfaceSaisieM2, 'artisan', undefined, `${t}.SURFACE_SAISIE_M2`);
        r(ctx, `${path}.calculDepuisPiece`, ceiling.calculDepuisPiece, 'artisan', undefined, `${t}.CALCUL_DEPUIS_PIECE`);
        r(ctx, `${path}.nombrePeaux`, ceiling.nombrePeaux, 'artisan', undefined, `${t}.NOMBRE_PEAUX`);
        ceiling.skinIds.forEach((skinId, index) => r(ctx, `${path}.skinIds[${index}]`, skinId, 'system', undefined, `${t}.PEAU.${skinId}.ID`));
        r(ctx, `${path}.typePlaque`, ceiling.typePlaque, 'artisan', undefined, `${t}.TYPE_PLAQUE`);
        if (ceiling.suspenteArticleCatalogueId !== undefined)
            r(ctx, `${path}.suspenteArticleCatalogueId`, ceiling.suspenteArticleCatalogueId, 'artisan', undefined, `${t}.SUSPENTE.${ceiling.suspenteArticleCatalogueId}`);
        if (ceiling.isolation)
            registerIsolation(ctx, `${path}.isolation`, ceiling.isolation, ceiling.id);
        registerFinish(ctx, `${path}.finition`, ceiling.finition, `${t}.FINITION`);
    };
    const registerIsolation = (ctx, path, isolation, ownerId) => {
        const t = `PLQ.OUVRAGE.${ownerId}.ISOLATION`;
        r(ctx, `${path}.active`, isolation.active, 'artisan', undefined, `${t}.ACTIVE`);
        r(ctx, `${path}.pareVapeur`, isolation.pareVapeur, 'artisan', undefined, `${t}.PARE_VAPEUR`);
        r(ctx, `${path}.freinVapeur`, isolation.freinVapeur, 'artisan', undefined, `${t}.FREIN_VAPEUR`);
        r(ctx, `${path}.poseCroisee`, isolation.poseCroisee ?? false, 'artisan', undefined, `${t}.POSE_CROISEE`);
        isolation.couches.forEach((layer, index) => {
            const p = `${path}.couches[${index}]`;
            const lt = `${t}.COUCHE.${layer.id}`;
            r(ctx, `${p}.id`, layer.id, 'system', undefined, `${lt}.ID`);
            r(ctx, `${p}.articleCatalogueId`, layer.articleCatalogueId, 'artisan', undefined, `${lt}.ARTICLE.${layer.articleCatalogueId}`);
            r(ctx, `${p}.epaisseurMm`, layer.epaisseurMm, 'artisan', undefined, `${lt}.EPAISSEUR_MM`);
            if (layer.prixAchatM2OverrideCents !== undefined)
                r(ctx, `${p}.prixAchatM2OverrideCents`, layer.prixAchatM2OverrideCents, 'artisan', undefined, `${lt}.PRIX_ACHAT_M2_OVERRIDE_CENTS`);
            r(ctx, `${p}.semiRigide`, layer.semiRigide ?? false, 'artisan', undefined, `${lt}.SEMI_RIGIDE`);
        });
    };
    const registerFinish = (ctx, path, finish, tagBase) => {
        r(ctx, `${path}.niveau`, finish.niveau, 'artisan', undefined, `${tagBase}.NIVEAU`);
        r(ctx, `${path}.impression`, finish.impression, 'artisan', undefined, `${tagBase}.IMPRESSION`);
        if (finish.internalPlanningMinutesOverride !== undefined)
            r(ctx, `${path}.internalPlanningMinutesOverride`, finish.internalPlanningMinutesOverride, 'artisan', undefined, `${tagBase}.PLANNING_MINUTES_OVERRIDE`);
    };
    const registerOverrides = (input, ctx) => {
        if (input.overrides.tauxHoraireCents !== undefined)
            r(ctx, 'overrides.tauxHoraireCents', input.overrides.tauxHoraireCents, 'artisan', undefined, 'PLQ.OVERRIDE.TAUX_HORAIRE_CENTS');
        if (input.overrides.materialPricing !== undefined) {
            r(ctx, 'overrides.materialPricing.mode', input.overrides.materialPricing.mode, 'artisan', undefined, 'PLQ.OVERRIDE.MATERIAL_PRICING.MODE');
            r(ctx, 'overrides.materialPricing.value', input.overrides.materialPricing.value, 'artisan', undefined, 'PLQ.OVERRIDE.MATERIAL_PRICING.VALUE');
        }
        if (input.overrides.pertePlaquesPct !== undefined)
            r(ctx, 'overrides.pertePlaquesPct', input.overrides.pertePlaquesPct, 'artisan', 'Ancien override global conservé pour compatibilité.', 'PLQ.OVERRIDE.PERTE_PLAQUES_PCT');
        if (input.overrides.pertePlaquesMurPct !== undefined)
            r(ctx, 'overrides.pertePlaquesMurPct', input.overrides.pertePlaquesMurPct, 'artisan', undefined, 'PLQ.OVERRIDE.PERTE_PLAQUES_MUR_PCT');
        if (input.overrides.pertePlaquesPlafondPct !== undefined)
            r(ctx, 'overrides.pertePlaquesPlafondPct', input.overrides.pertePlaquesPlafondPct, 'artisan', undefined, 'PLQ.OVERRIDE.PERTE_PLAQUES_PLAFOND_PCT');
        if (input.overrides.pertePlaquesRampantPct !== undefined)
            r(ctx, 'overrides.pertePlaquesRampantPct', input.overrides.pertePlaquesRampantPct, 'artisan', undefined, 'PLQ.OVERRIDE.PERTE_PLAQUES_RAMPANT_PCT');
        Object.entries(input.overrides.quantitesMateriaux ?? {}).forEach(([key, value]) => r(ctx, `overrides.quantitesMateriaux.${key}`, value, 'artisan', undefined, `PLQ.OVERRIDE.QUANTITE.${key}`));
        Object.entries(input.overrides.prixVenteLignesCents ?? {}).forEach(([key, value]) => r(ctx, `overrides.prixVenteLignesCents.${key}`, value, 'artisan', undefined, `PLQ.OVERRIDE.PRIX_VENTE.${key}`));
        Object.entries(input.overrides.tauxTvaLignes ?? {}).forEach(([key, value]) => r(ctx, `overrides.tauxTvaLignes.${key}`, value, 'artisan', undefined, `PLQ.OVERRIDE.TVA.${key}`));
        if (input.overrides.motif !== undefined)
            r(ctx, 'overrides.motif', input.overrides.motif, 'artisan', undefined, 'PLQ.OVERRIDE.MOTIF');
    };
});
define("core/normalize", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizePlaquiste = void 0;
    const cleanNumber = (value) => (Number.isFinite(value) ? value : 0);
    const normalizeParement = (parement) => {
        const existingIds = Array.isArray(parement.skinIds) ? parement.skinIds.filter(Boolean) : [];
        return {
            ...parement,
            skinIds: Array.from({ length: parement.nombrePeaux }, (_, index) => existingIds[index] ?? `${parement.id}:skin:${index + 1}`),
        };
    };
    const normalizeIsolation = (isolation, ownerId) => ({
        ...isolation,
        poseCroisee: isolation.poseCroisee ?? false,
        couches: isolation.couches.map((layer, index) => ({
            ...layer,
            id: layer.id || `${ownerId}:isolation-layer:${index + 1}`,
            epaisseurMm: cleanNumber(layer.epaisseurMm),
            semiRigide: layer.semiRigide ?? false,
        })),
    });
    const normalizeWall = (wall, source, pieceId) => {
        const { isolation, pieceId: _existingPieceId, ...rest } = wall;
        return {
            ...rest,
            source,
            ...(pieceId !== undefined ? { pieceId } : {}),
            label: wall.label.trim(),
            longueurM: cleanNumber(wall.longueurM),
            hauteurM: cleanNumber(wall.hauteurM),
            nombreAnglesSortants: cleanNumber(wall.nombreAnglesSortants ?? 0),
            parements: wall.parements.map(normalizeParement),
            ossature: {
                ...wall.ossature,
                ...(wall.ossature.systeme === 'optima'
                    ? {
                        nombreRangeesAppuis: wall.ossature.nombreRangeesAppuis ??
                            wall.ossature.nombreAppuisParM2 ??
                            Math.max(1, Math.ceil(cleanNumber(wall.hauteurM) / 1.35)),
                    }
                    : {}),
            },
            ...(isolation ? { isolation: normalizeIsolation(isolation, wall.id) } : {}),
            ouvertures: wall.ouvertures.map((opening) => ({
                ...opening,
                largeurM: cleanNumber(opening.largeurM),
                hauteurM: cleanNumber(opening.hauteurM),
                quantite: cleanNumber(opening.quantite),
            })),
        };
    };
    const normalizeCeiling = (ceiling, pieceId) => {
        const { isolation, surfaceSaisieM2, ...rest } = ceiling;
        const id = ceiling.id || `${pieceId}:ceiling`;
        const existingIds = Array.isArray(ceiling.skinIds) ? ceiling.skinIds.filter(Boolean) : [];
        return {
            ...rest,
            id,
            skinIds: Array.from({ length: ceiling.nombrePeaux }, (_, index) => existingIds[index] ?? `${id}:skin:${index + 1}`),
            ...(surfaceSaisieM2 !== undefined ? { surfaceSaisieM2: cleanNumber(surfaceSaisieM2) } : {}),
            ...(isolation ? { isolation: normalizeIsolation(isolation, id) } : {}),
        };
    };
    const normalizePlaquiste = (raw) => ({
        ...raw,
        // Ne jamais transformer silencieusement un ancien schéma en V2.
        schemaVersion: raw.schemaVersion,
        nomCalcul: raw.nomCalcul.trim(),
        pieces: raw.pieces.map((piece) => ({
            ...piece,
            nom: piece.nom.trim(),
            longueurM: cleanNumber(piece.longueurM),
            largeurM: cleanNumber(piece.largeurM),
            hauteurM: cleanNumber(piece.hauteurM),
            murs: piece.murs.map((wall) => normalizeWall(wall, 'piece', piece.id)),
            ...(piece.plafond ? { plafond: normalizeCeiling(piece.plafond, piece.id) } : {}),
        })),
        mursSimples: raw.mursSimples.map((wall) => normalizeWall(wall, 'mur_simple')),
        optionsChantier: {
            ...raw.optionsChantier,
            nombreusesDecoupesSpotsOuvrageIds: raw.optionsChantier.nombreusesDecoupesSpotsOuvrageIds ?? [],
        },
    });
    exports.normalizePlaquiste = normalizePlaquiste;
});
define("core/modelUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPieceIndexById = exports.getWallsWithPaths = void 0;
    const getWallsWithPaths = (input) => {
        const fromPieces = input.pieces.flatMap((piece, pieceIndex) => piece.murs.map((wall, wallIndex) => ({
            wall,
            path: `pieces[${pieceIndex}].murs[${wallIndex}]`,
            pieceId: piece.id,
        })));
        const simple = input.mursSimples.map((wall, wallIndex) => ({
            wall,
            path: `mursSimples[${wallIndex}]`,
        }));
        return [...fromPieces, ...simple];
    };
    exports.getWallsWithPaths = getWallsWithPaths;
    const getPieceIndexById = (input, pieceId) => input.pieces.findIndex((piece) => piece.id === pieceId);
    exports.getPieceIndexById = getPieceIndexById;
});
define("core/validate", ["require", "exports", "core/errors", "core/modelUtils"], function (require, exports, errors_js_1, modelUtils_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validatePlaquisteInput = void 0;
    const push = (target, item) => {
        if (item.level === 'blocking' || item.level === 'blocking_order' || item.level === 'blocking_quote') {
            target.blocking.push(item);
        }
        else {
            target.warnings.push(item);
        }
    };
    const validatePlaquisteInput = (input, catalogue, company, ctx) => {
        const result = { blocking: [], warnings: [] };
        const walls = (0, modelUtils_js_1.getWallsWithPaths)(input);
        const activeWalls = walls.filter(({ wall }) => wall.actif);
        const activeCeilings = input.pieces.filter((piece) => piece.plafond?.actif);
        ctx.fields.consume('schemaVersion', 'validation');
        ctx.fields.consume('id', 'validation');
        ctx.fields.consume('nomCalcul', 'validation', 'Libellé fonctionnel conservé avec le résultat et les exports.');
        validateStableTechnicalIds(input, result);
        if (input.schemaVersion !== 2) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-000', 'schemaVersion différent de 2', 'Ce calcul n’est pas un chiffrage Plaquiste V2.', 'blocking', ['schemaVersion']));
        }
        if (activeWalls.length === 0 && activeCeilings.length === 0) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-001', 'Aucune pièce, aucun mur simple et aucun plafond actif', 'Ajoutez au moins un mur ou un plafond à chiffrer.', 'blocking', []));
        }
        input.pieces.forEach((piece, pieceIndex) => {
            const p = `pieces[${pieceIndex}]`;
            ctx.fields.consume(`${p}.id`, 'validation');
            ctx.fields.consume(`${p}.nom`, 'validation');
            ctx.fields.consume(`${p}.longueurM`, 'validation');
            ctx.fields.consume(`${p}.largeurM`, 'validation');
            ctx.fields.consume(`${p}.hauteurM`, 'validation');
            if (piece.longueurM <= 0 || piece.largeurM <= 0 || piece.hauteurM <= 0) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-002', 'Dimension de pièce inférieure ou égale à zéro', 'Les dimensions de la pièce doivent être supérieures à zéro.', 'blocking', [`${p}.longueurM`, `${p}.largeurM`, `${p}.hauteurM`]));
            }
        });
        walls.forEach(({ wall, path }) => {
            ctx.fields.consume(`${path}.id`, 'validation');
            ctx.fields.consume(`${path}.source`, 'validation');
            if (wall.pieceId !== undefined)
                ctx.fields.consume(`${path}.pieceId`, 'validation');
            ctx.fields.consume(`${path}.label`, 'validation');
            ctx.fields.consume(`${path}.actif`, 'validation');
            if (!wall.actif) {
                consumeInactiveWallFields(input, path, wall, ctx);
                return;
            }
            ctx.fields.consume(`${path}.longueurM`, 'validation');
            ctx.fields.consume(`${path}.hauteurM`, 'validation');
            ctx.fields.consume(`${path}.typeParoi`, 'validation');
            ctx.fields.consume(`${path}.nombreAnglesSortants`, 'validation');
            if (!Number.isInteger(wall.nombreAnglesSortants) || wall.nombreAnglesSortants < 0) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-026', 'Nombre d’angles sortants invalide', 'Le nombre d’angles sortants doit être un entier positif ou nul.', 'blocking', [`${path}.nombreAnglesSortants`]));
            }
            if (wall.longueurM <= 0 || wall.hauteurM <= 0) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-002', 'Longueur ou hauteur de mur inférieure ou égale à zéro', 'La longueur et la hauteur doivent être supérieures à zéro.', 'blocking', [`${path}.longueurM`, `${path}.hauteurM`]));
            }
            const gross = wall.longueurM * wall.hauteurM;
            const openings = wall.ouvertures.reduce((sum, opening) => sum + opening.largeurM * opening.hauteurM * opening.quantite, 0);
            if (openings > gross) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-003', 'La somme des ouvertures dépasse la surface brute du mur', 'Les ouvertures dépassent la surface du mur.', 'blocking', wall.ouvertures.flatMap((_, index) => [
                    `${path}.ouvertures[${index}].largeurM`,
                    `${path}.ouvertures[${index}].hauteurM`,
                    `${path}.ouvertures[${index}].quantite`,
                ])));
            }
            const activeFaces = wall.parements.filter((face) => face.actif);
            if (wall.typeParoi === 'cloison' && activeFaces.length !== 2) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-004', 'Cloison ne comportant pas exactement deux faces actives', 'Une cloison doit comporter deux faces de parement.', 'blocking', wall.parements.map((_, index) => `${path}.parements[${index}].actif`)));
            }
            if (wall.typeParoi === 'doublage' && activeFaces.length !== 1) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-005', 'Doublage ne comportant pas exactement une face active', 'Un doublage ne peut comporter qu’une face de parement.', 'blocking', wall.parements.map((_, index) => `${path}.parements[${index}].actif`)));
            }
            if (wall.hauteurM > 4.15) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-011', 'Hauteur supérieure à 4,15 m', 'La hauteur dépasse le domaine du calcul automatique. Validation technique requise.', 'blocking', [`${path}.hauteurM`]));
            }
            else if (wall.hauteurM > 3.45) {
                const hasDoubleSkin = activeFaces.every((face) => face.nombrePeaux === 2);
                const hasLargerProfile = wall.ossature.largeurProfilMm >= 70;
                if (!hasDoubleSkin && !hasLargerProfile) {
                    push(result, (0, errors_js_1.alert)('PLQ-V2-017', 'Mur entre 3,45 m et 4,15 m sans double parement ni profil élargi', 'Choisissez un double parement ou un profil M70/M90 adapté. Le M48 simple ne peut pas être forcé.', 'blocking', [
                        `${path}.hauteurM`,
                        `${path}.ossature.largeurProfilMm`,
                        ...wall.parements.map((_, index) => `${path}.parements[${index}].nombrePeaux`),
                    ]));
                }
            }
            if (wall.ossature.systeme === 'optima' &&
                (!wall.ossature.nombreRangeesAppuis || wall.ossature.nombreRangeesAppuis <= 0)) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-015', 'Système Optima sans nombre de rangées d’appuis', 'Le nombre de rangées d’appuis doit être supérieur à zéro. La proposition automatique suit un appui tous les 1,35 m.', 'blocking', [`${path}.ossature.systeme`, `${path}.ossature.nombreRangeesAppuis`]));
            }
            if (wall.isolation?.active &&
                wall.typeParoi !== 'doublage' &&
                (wall.isolation.pareVapeur || wall.isolation.freinVapeur)) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-029', 'Membrane sélectionnée hors doublage', 'Les nouveaux prix directs de membrane restent limités au doublage, faute de réponse étendant leur portée à la cloison.', 'blocking', [`${path}.typeParoi`, `${path}.isolation.pareVapeur`, `${path}.isolation.freinVapeur`]));
            }
            if (wall.isolation?.active) {
                const isolationPath = `${path}.isolation`;
                ctx.fields.consume(`${isolationPath}.poseCroisee`, 'validation');
                if (wall.isolation.poseCroisee && wall.isolation.couches.length !== 2) {
                    push(result, (0, errors_js_1.alert)('PLQ-V2-035', 'Pose croisée sans deux couches', 'La pose croisée est disponible uniquement lorsque deux couches d’isolant sont sélectionnées.', 'blocking', [`${isolationPath}.poseCroisee`, `${isolationPath}.couches`]));
                }
                wall.isolation.couches.forEach((layer, layerIndex) => {
                    const layerPath = `${isolationPath}.couches[${layerIndex}]`;
                    ctx.fields.consume(`${layerPath}.semiRigide`, 'validation');
                    if (layer.epaisseurMm > wall.ossature.largeurProfilMm) {
                        push(result, (0, errors_js_1.alert)('PLQ-V2-W004', 'Épaisseur d’isolant supérieure au profil', `L’isolant de ${layer.epaisseurMm} mm dépasse le profil de ${wall.ossature.largeurProfilMm} mm. Le calcul reste autorisé mais l’artisan doit confirmer la configuration.`, 'warning', [`${layerPath}.epaisseurMm`, `${path}.ossature.largeurProfilMm`]));
                    }
                });
            }
            wall.parements.forEach((parement, index) => {
                const p = `${path}.parements[${index}]`;
                ctx.fields.consume(`${p}.id`, 'validation');
                ctx.fields.consume(`${p}.face`, 'validation');
                ctx.fields.consume(`${p}.actif`, 'validation');
                if (!parement.actif) {
                    const note = 'Parement inactif : données volontairement exclues des calculs.';
                    ctx.fields.consume(`${p}.face`, 'validation', note);
                    ctx.fields.consume(`${p}.actif`, 'validation', note);
                    ctx.fields.consume(`${p}.nombrePeaux`, 'validation', note);
                    parement.skinIds.forEach((_, skinIndex) => ctx.fields.consume(`${p}.skinIds[${skinIndex}]`, 'validation', note));
                    ctx.fields.consume(`${p}.typePlaque`, 'validation', note);
                    ctx.fields.consume(`${p}.finition.niveau`, 'validation', note);
                    ctx.fields.consume(`${p}.finition.impression`, 'validation', note);
                    if (parement.finition.internalPlanningMinutesOverride !== undefined) {
                        ctx.fields.consume(`${p}.finition.internalPlanningMinutesOverride`, 'validation', note);
                    }
                    return;
                }
                ctx.fields.consume(`${p}.nombrePeaux`, 'validation');
                parement.skinIds.forEach((_, skinIndex) => {
                    ctx.fields.consume(`${p}.skinIds[${skinIndex}]`, 'validation');
                });
                const skinIdsValid = parement.skinIds.length === parement.nombrePeaux &&
                    new Set(parement.skinIds).size === parement.skinIds.length &&
                    parement.skinIds.every((id) => id.trim().length > 0);
                if (!skinIdsValid) {
                    push(result, (0, errors_js_1.alert)('PLQ-V2-027', 'Identifiants de peaux absents, dupliqués ou incohérents', 'Chaque peau doit posséder un identifiant stable et unique.', 'blocking', [`${p}.nombrePeaux`, ...parement.skinIds.map((_, skinIndex) => `${p}.skinIds[${skinIndex}]`)]));
                }
                ctx.fields.consume(`${p}.typePlaque`, 'validation');
                ctx.fields.consume(`${p}.finition.niveau`, 'validation');
                ctx.fields.consume(`${p}.finition.impression`, 'validation');
                if (parement.finition.internalPlanningMinutesOverride !== undefined) {
                    ctx.fields.consume(`${p}.finition.internalPlanningMinutesOverride`, 'validation');
                }
                if (parement.finition.impression &&
                    !['pret_a_peindre', 'soignee'].includes(parement.finition.niveau)) {
                    push(result, (0, errors_js_1.alert)('PLQ-V2-018', 'Impression sélectionnée avec un niveau de finition incompatible', 'L’impression est autorisée uniquement avec « prêt à peindre » ou « finition soignée ».', 'blocking', [`${p}.finition.niveau`, `${p}.finition.impression`]));
                }
            });
            ctx.fields.consume(`${path}.ossature.systeme`, 'validation');
            ctx.fields.consume(`${path}.ossature.largeurProfilMm`, 'validation');
            ctx.fields.consume(`${path}.ossature.entraxeMm`, 'validation');
            ctx.fields.consume(`${path}.ossature.montantsDoubles`, 'validation');
            if (wall.ossature.nombreRangeesAppuis !== undefined) {
                ctx.fields.consume(`${path}.ossature.nombreRangeesAppuis`, 'validation');
            }
            if (wall.ossature.nombreAppuisParM2 !== undefined) {
                ctx.fields.consume(`${path}.ossature.nombreAppuisParM2`, 'validation', 'Ancien champ normalisé vers le nombre de rangées.');
            }
            wall.renforts.forEach((reinforcement, index) => {
                const p = `${path}.renforts[${index}]`;
                ctx.fields.consume(`${p}.id`, 'validation');
                if (reinforcement.quantite <= 0) {
                    push(result, (0, errors_js_1.alert)('PLQ-V2-031', 'Renfort avec quantité non positive', 'La quantité d’un renfort doit être supérieure à zéro.', 'blocking', [`${p}.quantite`]));
                }
            });
            wall.ouvertures.forEach((opening, index) => {
                const p = `${path}.ouvertures[${index}]`;
                ctx.fields.consume(`${p}.id`, 'validation');
                ctx.fields.consume(`${p}.type`, 'validation');
                ctx.fields.consume(`${p}.largeurM`, 'validation');
                ctx.fields.consume(`${p}.hauteurM`, 'validation');
                ctx.fields.consume(`${p}.quantite`, 'validation');
                ctx.fields.consume(`${p}.ossaturePeripherique`, 'validation');
                if (opening.largeurM <= 0 || opening.hauteurM <= 0 || opening.quantite <= 0) {
                    push(result, (0, errors_js_1.alert)('PLQ-V2-019', 'Ouverture comportant une dimension ou quantité non positive', 'Les dimensions et la quantité de l’ouverture doivent être supérieures à zéro.', 'blocking', [`${p}.largeurM`, `${p}.hauteurM`, `${p}.quantite`]));
                }
            });
        });
        input.pieces.forEach((piece, pieceIndex) => {
            const ceiling = piece.plafond;
            if (!ceiling)
                return;
            const p = `pieces[${pieceIndex}].plafond`;
            ctx.fields.consume(`${p}.id`, 'validation');
            ctx.fields.consume(`${p}.actif`, 'validation');
            ctx.fields.consume(`${p}.type`, 'validation');
            ctx.fields.consume(`${p}.calculDepuisPiece`, 'validation');
            ctx.fields.consume(`${p}.nombrePeaux`, 'validation');
            ceiling.skinIds.forEach((_, skinIndex) => ctx.fields.consume(`${p}.skinIds[${skinIndex}]`, 'validation'));
            if (ceiling.skinIds.length !== ceiling.nombrePeaux ||
                new Set(ceiling.skinIds).size !== ceiling.skinIds.length ||
                ceiling.skinIds.some((id) => !id.trim())) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-027', 'Identifiants de peaux plafond incohérents', 'Chaque peau du plafond doit posséder un identifiant stable et unique.', 'blocking', [`${p}.nombrePeaux`, ...ceiling.skinIds.map((_, skinIndex) => `${p}.skinIds[${skinIndex}]`)]));
            }
            ctx.fields.consume(`${p}.typePlaque`, 'validation');
            ctx.fields.consume(`${p}.finition.niveau`, 'validation');
            ctx.fields.consume(`${p}.finition.impression`, 'validation');
            if (ceiling.surfaceSaisieM2 !== undefined)
                ctx.fields.consume(`${p}.surfaceSaisieM2`, 'validation');
            if (ceiling.suspenteArticleCatalogueId !== undefined) {
                ctx.fields.consume(`${p}.suspenteArticleCatalogueId`, 'validation');
            }
            if (ceiling.isolation?.active &&
                (ceiling.isolation.pareVapeur || ceiling.isolation.freinVapeur)) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-029', 'Membrane sélectionnée au plafond sans règle validée', 'Les prix directs de pare-vapeur et membrane hygrovariable restent validés pour le doublage uniquement. Aucun prix automatique n’est appliqué au plafond.', 'blocking', [`${p}.isolation.pareVapeur`, `${p}.isolation.freinVapeur`]));
            }
            if (!ceiling.actif) {
                if (ceiling.isolation)
                    consumeExcludedIsolation(`${p}.isolation`, ceiling.isolation, ctx, 'Plafond inactif : isolation volontairement exclue.');
                return;
            }
            if (!ceiling.calculDepuisPiece && (!ceiling.surfaceSaisieM2 || ceiling.surfaceSaisieM2 <= 0)) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-020', 'Plafond actif sans surface positive', 'Saisissez une surface de plafond positive ou activez le calcul depuis la pièce.', 'blocking', [`${p}.surfaceSaisieM2`, `${p}.calculDepuisPiece`]));
            }
            if (ceiling.type !== 'droit') {
                push(result, (0, errors_js_1.alert)('PLQ-V2-012', 'Rampant sélectionné', 'Le rampant est chiffré par plus-value simplifiée, sans recalcul détaillé de l’ossature.', 'warning', [`${p}.type`]));
            }
            if (ceiling.finition.impression &&
                !['pret_a_peindre', 'soignee'].includes(ceiling.finition.niveau)) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-018', 'Impression plafond incompatible avec le niveau de finition', 'L’impression est autorisée uniquement avec « prêt à peindre » ou « finition soignée ».', 'blocking', [`${p}.finition.niveau`, `${p}.finition.impression`]));
            }
        });
        const validCutTargets = new Set([
            ...activeWalls.map(({ wall }) => wall.id),
            ...input.pieces
                .filter((piece) => piece.plafond?.actif)
                .map((piece) => piece.plafond.id),
        ]);
        input.optionsChantier.nombreusesDecoupesSpotsOuvrageIds.forEach((ouvrageId, index) => {
            const path = `optionsChantier.nombreusesDecoupesSpotsOuvrageIds[${index}]`;
            ctx.fields.consume(path, 'validation');
            if (!validCutTargets.has(ouvrageId)) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-030', 'Cible de découpes/spots inconnue ou inactive', 'Chaque plus-value de découpes/spots doit viser un mur ou un plafond actif.', 'blocking', [path]));
            }
        });
        if (input.optionsChantier.nombreusesDecoupesSpots &&
            input.optionsChantier.nombreusesDecoupesSpotsOuvrageIds.length === 0) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-030', 'Plus-value découpes/spots sans ouvrage cible', 'Sélectionnez au moins un ouvrage concerné. La plus-value ne peut pas être appliquée silencieusement à tout le chantier.', 'blocking', ['optionsChantier.nombreusesDecoupesSpots']));
        }
        if (!input.optionsChantier.nombreusesDecoupesSpots &&
            input.optionsChantier.nombreusesDecoupesSpotsOuvrageIds.length > 0) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-030', 'Cibles de découpes/spots renseignées alors que l’option est inactive', 'Activez la plus-value ou retirez les ouvrages ciblés.', 'blocking', ['optionsChantier.nombreusesDecoupesSpots']));
        }
        input.optionsChantier.optionsDirectes.forEach((option, index) => {
            const p = `optionsChantier.optionsDirectes[${index}]`;
            ctx.fields.consume(`${p}.id`, 'validation');
            ctx.fields.consume(`${p}.label`, 'validation');
            ctx.fields.consume(`${p}.active`, 'validation');
            ctx.fields.consume(`${p}.quantite`, 'validation');
            ctx.fields.consume(`${p}.unite`, 'validation');
            ctx.fields.consume(`${p}.scope`, 'validation');
            if (option.ouvrageId !== undefined)
                ctx.fields.consume(`${p}.ouvrageId`, 'validation');
            if (option.prixVenteUnitaireHtCents !== undefined) {
                ctx.fields.consume(`${p}.prixVenteUnitaireHtCents`, 'validation');
            }
            if (option.active && (!option.prixVenteUnitaireHtCents || option.prixVenteUnitaireHtCents <= 0)) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-008', 'Option directe active avec prix nul ou absent', 'Cette option est activée mais aucun prix n’est défini.', 'blocking', [`${p}.prixVenteUnitaireHtCents`]));
            }
            if (option.active && option.scope === 'ouvrage' && (!option.ouvrageId || !validCutTargets.has(option.ouvrageId))) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-034', 'Option directe par ouvrage sans cible active valide', 'Sélectionnez un mur ou un plafond actif pour cette option directe.', 'blocking', [`${p}.scope`, `${p}.ouvrageId`]));
            }
            if (option.active && option.scope === 'chantier' && option.ouvrageId !== undefined) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-034', 'Option directe chantier avec cible ouvrage renseignée', 'Retirez la cible ouvrage ou choisissez la portée « ouvrage ».', 'blocking', [`${p}.scope`, `${p}.ouvrageId`]));
            }
        });
        input.optionsChantier.articlesLibres.forEach((article, index) => {
            const p = `optionsChantier.articlesLibres[${index}]`;
            ctx.fields.consume(`${p}.id`, 'validation');
            ctx.fields.consume(`${p}.label`, 'validation');
            ctx.fields.consume(`${p}.quantite`, 'validation');
            ctx.fields.consume(`${p}.unite`, 'validation');
            if (article.catalogueArticleId !== undefined)
                ctx.fields.consume(`${p}.catalogueArticleId`, 'validation');
            if (article.coutAchatUnitaireHtCents !== undefined) {
                ctx.fields.consume(`${p}.coutAchatUnitaireHtCents`, 'validation');
            }
            if (article.prixVenteUnitaireHtCents !== undefined) {
                ctx.fields.consume(`${p}.prixVenteUnitaireHtCents`, 'validation');
            }
            if (article.quantite > 0 &&
                article.catalogueArticleId === undefined &&
                article.coutAchatUnitaireHtCents === undefined &&
                article.prixVenteUnitaireHtCents === undefined) {
                push(result, (0, errors_js_1.alert)('PLQ-V2-021', 'Article libre sans prix ni référence catalogue', 'Rattachez l’article au catalogue ou saisissez un coût/prix explicite.', 'blocking', [`${p}.catalogueArticleId`, `${p}.coutAchatUnitaireHtCents`, `${p}.prixVenteUnitaireHtCents`]));
            }
        });
        ctx.fields.consume('optionsChantier.complexite', 'validation');
        ctx.fields.consume('optionsChantier.accesDifficile', 'validation');
        ctx.fields.consume('optionsChantier.repriseExistant', 'validation');
        ctx.fields.consume('optionsChantier.nombreusesDecoupesSpots', 'validation');
        if (input.optionsChantier.accesDifficilePrixOverrideCents !== undefined) {
            ctx.fields.consume('optionsChantier.accesDifficilePrixOverrideCents', 'validation');
        }
        if (input.optionsChantier.repriseExistantPrixOverrideCents !== undefined) {
            ctx.fields.consume('optionsChantier.repriseExistantPrixOverrideCents', 'validation');
        }
        ctx.fields.consume('contexte.usageBatiment', 'validation');
        ctx.fields.consume('contexte.logementAcheveDepuisPlusDe2Ans', 'validation');
        ctx.fields.consume('contexte.renovationEnergetique', 'validation');
        ctx.fields.consume('contexte.tvaMode', 'validation');
        ctx.fields.consume('contexte.eligibiliteConfirmee', 'validation');
        if (input.contexte.tauxManuel !== undefined)
            ctx.fields.consume('contexte.tauxManuel', 'validation');
        if (input.contexte.justification !== undefined)
            ctx.fields.consume('contexte.justification', 'validation', 'Justification fiscale conservée avec le chiffrage.');
        if (input.contexte.tvaMode === 'manuel' && input.contexte.tauxManuel === undefined) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-028', 'Mode TVA manuel sans taux', 'Choisissez explicitement un taux de TVA de 5,5 %, 10 % ou 20 %. Aucun taux par défaut ne sera appliqué.', 'blocking_quote', ['contexte.tvaMode', 'contexte.tauxManuel']));
        }
        if (!input.contexte.eligibiliteConfirmee) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-010', 'Éligibilité TVA non confirmée', 'Confirmez l’éligibilité au taux proposé ou choisissez manuellement 20 %.', 'blocking_quote', ['contexte.eligibiliteConfirmee']));
        }
        const hourlyRate = input.overrides.tauxHoraireCents ?? company.hourlyRateCents;
        if (!hourlyRate || hourlyRate <= 0) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-013', 'Taux horaire absent', 'Renseignez le taux horaire dans les paramètres entreprise ou dans un remplacement manuel motivé.', 'blocking', ['overrides.tauxHoraireCents']));
        }
        if (input.overrides.tauxHoraireCents !== undefined) {
            ctx.fields.consume('overrides.tauxHoraireCents', 'validation');
        }
        const pricing = input.overrides.materialPricing ?? company.materialPricing;
        if (!pricing || pricing.value <= 0) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-022', 'Méthode de prix matériaux absente', 'Définissez la marge ou le coefficient matériaux dans les paramètres entreprise.', 'blocking', ['overrides.materialPricing.mode', 'overrides.materialPricing.value']));
        }
        if (input.overrides.materialPricing !== undefined) {
            ctx.fields.consume('overrides.materialPricing.mode', 'validation');
            ctx.fields.consume('overrides.materialPricing.value', 'validation');
        }
        const hasManualOverride = input.overrides.tauxHoraireCents !== undefined ||
            input.overrides.materialPricing !== undefined ||
            input.overrides.pertePlaquesPct !== undefined ||
            input.overrides.pertePlaquesMurPct !== undefined ||
            input.overrides.pertePlaquesPlafondPct !== undefined ||
            input.overrides.pertePlaquesRampantPct !== undefined ||
            input.overrides.quantitesMateriaux !== undefined ||
            input.overrides.prixVenteLignesCents !== undefined ||
            input.overrides.tauxTvaLignes !== undefined;
        if (hasManualOverride && !input.overrides.motif?.trim()) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-014', 'Remplacement manuel sans motif', 'Indiquez le motif du remplacement manuel afin de conserver une trace.', 'blocking', ['overrides.motif']));
        }
        if (input.overrides.motif !== undefined)
            ctx.fields.consume('overrides.motif', 'validation');
        if (input.overrides.pertePlaquesPct !== undefined) {
            ctx.fields.consume('overrides.pertePlaquesPct', 'validation');
        }
        if (input.overrides.pertePlaquesMurPct !== undefined) {
            ctx.fields.consume('overrides.pertePlaquesMurPct', 'validation');
        }
        if (input.overrides.pertePlaquesPlafondPct !== undefined) {
            ctx.fields.consume('overrides.pertePlaquesPlafondPct', 'validation');
        }
        if (input.overrides.pertePlaquesRampantPct !== undefined) {
            ctx.fields.consume('overrides.pertePlaquesRampantPct', 'validation');
        }
        if (catalogue.articles.length === 0) {
            push(result, (0, errors_js_1.alert)('PLQ-V2-006', 'Catalogue vide', 'Aucun article Plaquiste n’est disponible dans le catalogue.', 'blocking', []));
        }
        return result;
    };
    exports.validatePlaquisteInput = validatePlaquisteInput;
    const validateStableTechnicalIds = (input, result) => {
        const occurrences = new Map();
        const add = (id, path) => {
            if (!id?.trim())
                return;
            const paths = occurrences.get(id) ?? [];
            paths.push(path);
            occurrences.set(id, paths);
        };
        input.pieces.forEach((piece, pieceIndex) => {
            const piecePath = `pieces[${pieceIndex}]`;
            add(piece.id, `${piecePath}.id`);
            piece.murs.forEach((wall, wallIndex) => {
                collectWallTechnicalIds(wall, `${piecePath}.murs[${wallIndex}]`, add);
            });
            if (piece.plafond) {
                const ceilingPath = `${piecePath}.plafond`;
                add(piece.plafond.id, `${ceilingPath}.id`);
                piece.plafond.skinIds.forEach((id, skinIndex) => add(id, `${ceilingPath}.skinIds[${skinIndex}]`));
                piece.plafond.isolation?.couches.forEach((layer, layerIndex) => add(layer.id, `${ceilingPath}.isolation.couches[${layerIndex}].id`));
            }
        });
        input.mursSimples.forEach((wall, wallIndex) => collectWallTechnicalIds(wall, `mursSimples[${wallIndex}]`, add));
        input.optionsChantier.optionsDirectes.forEach((option, index) => add(option.id, `optionsChantier.optionsDirectes[${index}].id`));
        input.optionsChantier.articlesLibres.forEach((article, index) => add(article.id, `optionsChantier.articlesLibres[${index}].id`));
        occurrences.forEach((paths, id) => {
            if (paths.length < 2)
                return;
            push(result, (0, errors_js_1.alert)('PLQ-V2-033', `Identifiant technique dupliqué : ${id}`, 'Chaque pièce, mur, parement, peau, ouverture, plafond, couche, renfort, option et article libre doit posséder un identifiant unique.', 'blocking', paths));
        });
    };
    const collectWallTechnicalIds = (wall, path, add) => {
        add(wall.id, `${path}.id`);
        wall.parements.forEach((face, faceIndex) => {
            const facePath = `${path}.parements[${faceIndex}]`;
            add(face.id, `${facePath}.id`);
            face.skinIds.forEach((id, skinIndex) => add(id, `${facePath}.skinIds[${skinIndex}]`));
        });
        wall.ouvertures.forEach((opening, index) => add(opening.id, `${path}.ouvertures[${index}].id`));
        wall.renforts.forEach((reinforcement, index) => add(reinforcement.id, `${path}.renforts[${index}].id`));
        wall.isolation?.couches.forEach((layer, index) => add(layer.id, `${path}.isolation.couches[${index}].id`));
    };
    const consumeInactiveWallFields = (_input, path, wall, ctx) => {
        ctx.fields.consume(`${path}.longueurM`, 'validation', 'Mur inactif : valeur volontairement exclue.');
        ctx.fields.consume(`${path}.hauteurM`, 'validation', 'Mur inactif : valeur volontairement exclue.');
        ctx.fields.consume(`${path}.typeParoi`, 'validation', 'Mur inactif : valeur volontairement exclue.');
        ctx.fields.consume(`${path}.nombreAnglesSortants`, 'validation', 'Mur inactif : valeur volontairement exclue.');
        wall.parements.forEach((face, index) => {
            const p = `${path}.parements[${index}]`;
            ctx.fields.consume(`${p}.id`, 'validation');
            ctx.fields.consume(`${p}.face`, 'validation');
            ctx.fields.consume(`${p}.actif`, 'validation');
            ctx.fields.consume(`${p}.nombrePeaux`, 'validation');
            face.skinIds.forEach((_, skinIndex) => ctx.fields.consume(`${p}.skinIds[${skinIndex}]`, 'validation'));
            ctx.fields.consume(`${p}.typePlaque`, 'validation');
            ctx.fields.consume(`${p}.finition.niveau`, 'validation');
            ctx.fields.consume(`${p}.finition.impression`, 'validation');
            if (face.finition.internalPlanningMinutesOverride !== undefined) {
                ctx.fields.consume(`${p}.finition.internalPlanningMinutesOverride`, 'validation');
            }
        });
        ctx.fields.consume(`${path}.ossature.systeme`, 'validation');
        ctx.fields.consume(`${path}.ossature.largeurProfilMm`, 'validation');
        ctx.fields.consume(`${path}.ossature.entraxeMm`, 'validation');
        ctx.fields.consume(`${path}.ossature.montantsDoubles`, 'validation');
        if (wall.ossature.nombreRangeesAppuis !== undefined) {
            ctx.fields.consume(`${path}.ossature.nombreRangeesAppuis`, 'validation');
        }
        if (wall.ossature.nombreAppuisParM2 !== undefined) {
            ctx.fields.consume(`${path}.ossature.nombreAppuisParM2`, 'validation');
        }
        if (wall.isolation) {
            consumeExcludedIsolation(`${path}.isolation`, wall.isolation, ctx, 'Mur inactif : isolation volontairement exclue.');
        }
        wall.renforts.forEach((reinforcement, index) => {
            const p = `${path}.renforts[${index}]`;
            ctx.fields.consume(`${p}.id`, 'validation');
            ctx.fields.consume(`${p}.label`, 'validation', 'Mur inactif : renfort volontairement exclu.');
            ctx.fields.consume(`${p}.quantite`, 'validation', 'Mur inactif : renfort volontairement exclu.');
            if (reinforcement.prixVenteUnitaireOverrideCents !== undefined) {
                ctx.fields.consume(`${p}.prixVenteUnitaireOverrideCents`, 'validation', 'Mur inactif : renfort volontairement exclu.');
            }
        });
        wall.ouvertures.forEach((opening, index) => {
            const p = `${path}.ouvertures[${index}]`;
            ctx.fields.consume(`${p}.id`, 'validation');
            ctx.fields.consume(`${p}.type`, 'validation');
            ctx.fields.consume(`${p}.largeurM`, 'validation');
            ctx.fields.consume(`${p}.hauteurM`, 'validation');
            ctx.fields.consume(`${p}.quantite`, 'validation');
            ctx.fields.consume(`${p}.ossaturePeripherique`, 'validation');
        });
    };
    const consumeExcludedIsolation = (path, isolation, ctx, note) => {
        ctx.fields.consume(`${path}.active`, 'validation', note);
        ctx.fields.consume(`${path}.pareVapeur`, 'validation', note);
        ctx.fields.consume(`${path}.freinVapeur`, 'validation', note);
        ctx.fields.consume(`${path}.poseCroisee`, 'validation', note);
        isolation.couches.forEach((layer, index) => {
            const p = `${path}.couches[${index}]`;
            ctx.fields.consume(`${p}.id`, 'validation', note);
            ctx.fields.consume(`${p}.articleCatalogueId`, 'validation', note);
            ctx.fields.consume(`${p}.epaisseurMm`, 'validation', note);
            if (layer.prixAchatM2OverrideCents !== undefined) {
                ctx.fields.consume(`${p}.prixAchatM2OverrideCents`, 'validation', note);
            }
            ctx.fields.consume(`${p}.semiRigide`, 'validation', note);
        });
    };
});
define("core/catalogueUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPackageCandidates = exports.toPackageCandidate = exports.findArticle = void 0;
    const findArticle = (catalogue, articleId) => catalogue.articles.find((article) => article.id === articleId);
    exports.findArticle = findArticle;
    const toPackageCandidate = (article) => {
        if (article.purchasePriceHtCents === undefined || article.purchasePriceHtCents < 0)
            return undefined;
        if (article.packageQuantity <= 0)
            return undefined;
        return {
            articleId: article.id,
            packageQuantity: article.packageQuantity,
            packagePriceHtCents: article.purchasePriceHtCents,
            purchaseUnit: article.purchaseUnit,
        };
    };
    exports.toPackageCandidate = toPackageCandidate;
    const getPackageCandidates = (articles) => articles.map(exports.toPackageCandidate).filter((candidate) => candidate !== undefined);
    exports.getPackageCandidates = getPackageCandidates;
});
define("core/money", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.centsToEuros = exports.applyMaterialPricing = exports.multiplyCents = exports.roundCents = exports.roundQuantity = void 0;
    const roundQuantity = (value, decimals = 4) => {
        const factor = 10 ** decimals;
        return Math.round((value + Number.EPSILON) * factor) / factor;
    };
    exports.roundQuantity = roundQuantity;
    const roundCents = (value) => Math.round(value);
    exports.roundCents = roundCents;
    const multiplyCents = (unitCents, quantity) => (0, exports.roundCents)(unitCents * quantity);
    exports.multiplyCents = multiplyCents;
    const applyMaterialPricing = (purchaseCostCents, settings) => {
        if (settings.mode === 'markup_pct') {
            return (0, exports.roundCents)(purchaseCostCents * (1 + settings.value / 100));
        }
        return (0, exports.roundCents)(purchaseCostCents * settings.value);
    };
    exports.applyMaterialPricing = applyMaterialPricing;
    const centsToEuros = (cents) => (0, exports.roundQuantity)(cents / 100, 2);
    exports.centsToEuros = centsToEuros;
});
define("core/engines/ceilingEngine", ["require", "exports", "core/catalogueUtils", "core/errors", "core/money"], function (require, exports, catalogueUtils_js_1, errors_js_2, money_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateCeilingNeeds = void 0;
    const calculateCeilingNeeds = (input, geometry, catalogue, config, ctx) => {
        const needs = [];
        const directSales = [];
        input.pieces.forEach((piece, pieceIndex) => {
            const ceiling = piece.plafond;
            if (!ceiling?.actif)
                return;
            const p = `pieces[${pieceIndex}].plafond`;
            const ceilingGeometry = geometry.ceilings.find((item) => item.pieceId === piece.id);
            if (!ceilingGeometry)
                return;
            const surface = ceilingGeometry.surfaceM2;
            ctx.fields.consume(`${p}.typePlaque`, 'ceiling');
            ctx.fields.consume(`${p}.nombrePeaux`, 'ceiling');
            ctx.fields.consume(`${p}.type`, 'ceiling');
            const plate = selectCeilingPlate(catalogue, ceiling.typePlaque);
            if (!plate || !plate.widthM || !plate.heightM) {
                ctx.warn((0, errors_js_2.alert)('PLQ-V2-024', 'Plaque plafond par défaut non résolue', 'Définissez explicitement dans le catalogue la plaque à utiliser pour le plafond.', 'blocking', [`${p}.typePlaque`]));
            }
            else {
                const plateArea = plate.widthM * plate.heightM;
                const defaultLossPct = ceiling.type === 'droit'
                    ? config.plate.ceilingLossPct.value
                    : config.plate.slopedCeilingLossPct.value;
                const lossPct = ceiling.type === 'droit'
                    ? input.overrides.pertePlaquesPlafondPct ??
                        input.overrides.pertePlaquesPct ??
                        defaultLossPct
                    : input.overrides.pertePlaquesRampantPct ??
                        input.overrides.pertePlaquesPct ??
                        defaultLossPct;
                if (ceiling.type === 'droit' && input.overrides.pertePlaquesPlafondPct !== undefined) {
                    ctx.fields.consume('overrides.pertePlaquesPlafondPct', 'ceiling');
                }
                if (ceiling.type !== 'droit' && input.overrides.pertePlaquesRampantPct !== undefined) {
                    ctx.fields.consume('overrides.pertePlaquesRampantPct', 'ceiling');
                }
                if (input.overrides.pertePlaquesPct !== undefined) {
                    ctx.fields.consume('overrides.pertePlaquesPct', 'ceiling', 'Ancien override global appliqué au plafond.');
                }
                const requiredSurface = surface * (1 + lossPct / 100) * ceiling.nombrePeaux;
                const plateCount = Math.ceil(requiredSurface / plateArea);
                needs.push({
                    id: `need:ceiling:plate:${piece.id}`,
                    label: `${plate.label} — plafond ${piece.nom}`,
                    quantity: plateCount,
                    unit: 'unit',
                    lossPct,
                    articleCatalogueId: plate.id,
                    packageCandidates: (0, catalogueUtils_js_1.getPackageCandidates)([plate]),
                    inputRefs: [`${p}.typePlaque`, `${p}.nombrePeaux`],
                    metadata: {
                        surfaceM2: surface,
                        consumptionM2PerM2: (0, money_js_1.roundQuantity)(1 + lossPct / 100),
                        lossPct,
                        plateAreaM2: (0, money_js_1.roundQuantity)(plateArea),
                    },
                });
                ctx.trace({
                    engine: 'ceiling',
                    inputRefs: [`${p}.typePlaque`, `${p}.nombrePeaux`],
                    formula: 'nbPlaquesPlafond = ceil(surface × (1 + pertePlafond) × nombrePeaux / surfacePlaque)',
                    rawResult: requiredSurface / plateArea,
                    roundedResult: plateCount,
                    unit: 'plate',
                    source: 'guillaume_rule',
                    warnings: [],
                });
            }
            addFamilyNeed(needs, catalogue, 'furring', `need:ceiling:furring:${piece.id}`, `Fourrures plafond — ${piece.nom}`, surface * 1.67, 'ml', 0, [`${p}.actif`]);
            addFamilyNeed(needs, catalogue, 'angle', `need:ceiling:angle:${piece.id}`, `Cornières plafond — ${piece.nom}`, surface * 0.42, 'ml', 0, [`${p}.actif`]);
            addFamilyNeed(needs, catalogue, 'splice', `need:ceiling:splice:${piece.id}`, `Éclisses plafond — ${piece.nom}`, surface * 0.2, 'unit', 0, [`${p}.actif`]);
            addFamilyNeed(needs, catalogue, 'connector', `need:ceiling:connector:${piece.id}`, `Cavaliers / connecteurs — ${piece.nom}`, surface * 0.35, 'unit', 0, [`${p}.actif`]);
            const hanger = selectHanger(catalogue, ceiling.suspenteArticleCatalogueId);
            if (ceiling.suspenteArticleCatalogueId !== undefined) {
                ctx.fields.consume(`${p}.suspenteArticleCatalogueId`, 'ceiling');
            }
            if (!hanger) {
                ctx.warn((0, errors_js_2.alert)('PLQ-V2-025', 'Suspente plafond non sélectionnée', 'Choisissez une longueur de suspente dans le catalogue. Aucune longueur ne sera choisie silencieusement.', 'blocking', [`${p}.suspenteArticleCatalogueId`]));
            }
            else {
                needs.push({
                    id: `need:ceiling:hanger:${piece.id}`,
                    label: `${hanger.label} — ${piece.nom}`,
                    quantity: (0, money_js_1.roundQuantity)(surface * 1.45),
                    unit: 'unit',
                    lossPct: 0,
                    articleCatalogueId: hanger.id,
                    packageCandidates: (0, catalogueUtils_js_1.getPackageCandidates)([hanger]),
                    inputRefs: [`${p}.suspenteArticleCatalogueId`],
                });
            }
            const screwRate = config.finish.firstLayerScrewsCeilingUnitM2.value +
                (ceiling.nombrePeaux === 2 ? config.finish.secondLayerScrewsUnitM2.value : 0);
            addFamilyNeed(needs, catalogue, 'screw', `need:ceiling:screw:${piece.id}`, `Vis plafond — ${piece.nom}`, surface * screwRate * (1 + config.finish.screwLossPct.value / 100), 'unit', config.finish.screwLossPct.value, [`${p}.nombrePeaux`], (article) => article.metadata?.usage === 'ceiling');
            if (ceiling.type === 'rampant' || ceiling.type === 'rampant_complexe') {
                const isComplex = ceiling.type === 'rampant_complexe';
                const unitPrice = isComplex
                    ? config.directPrices.rampantComplexeCentsPerM2.value
                    : config.directPrices.rampantSimpleCentsPerM2.value;
                directSales.push({
                    id: `sale:rampant:${piece.id}`,
                    label: `${isComplex ? 'Plus-value rampant complexe' : 'Plus-value rampant simple'} — ${piece.nom}`,
                    quantity: surface,
                    unit: 'm2',
                    unitSaleHtCents: unitPrice,
                    source: 'direct_price',
                    inputRefs: [`${p}.type`, `${p}.surfaceSaisieM2`],
                });
            }
        });
        return { needs, directSales };
    };
    exports.calculateCeilingNeeds = calculateCeilingNeeds;
    const selectCeilingPlate = (catalogue, plateType) => {
        const candidates = catalogue.articles.filter((article) => article.family === 'plate' && article.plateType === plateType);
        return candidates.find((article) => article.metadata?.defaultForCeiling === true);
    };
    const selectHanger = (catalogue, explicitId) => {
        if (explicitId)
            return catalogue.articles.find((article) => article.id === explicitId && article.family === 'hanger');
        return catalogue.articles.find((article) => article.family === 'hanger' && article.metadata?.defaultForCeiling === true);
    };
    const addFamilyNeed = (needs, catalogue, family, id, label, quantity, unit, lossPct, inputRefs, predicate) => {
        const articles = catalogue.articles.filter((article) => article.family === family && (!predicate || predicate(article)));
        needs.push({
            id,
            label,
            quantity: (0, money_js_1.roundQuantity)(quantity),
            unit,
            lossPct,
            packageCandidates: (0, catalogueUtils_js_1.getPackageCandidates)(articles),
            inputRefs,
        });
    };
});
define("core/engines/directOptionsEngine", ["require", "exports", "core/catalogueUtils", "core/errors", "core/modelUtils"], function (require, exports, catalogueUtils_js_2, errors_js_3, modelUtils_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateDirectOptions = void 0;
    const calculateDirectOptions = (input, geometry, catalogue, config, ctx) => {
        const needs = [];
        const directSales = [];
        (0, modelUtils_js_2.getWallsWithPaths)(input).forEach(({ wall, path }) => {
            if (!wall.actif)
                return;
            const wallGeometry = geometry.walls.find((item) => item.wallId === wall.id);
            if (!wallGeometry)
                return;
            ctx.fields.consume(`${path}.nombreAnglesSortants`, 'pricing');
            if (wall.nombreAnglesSortants > 0) {
                const angleLengthMl = wall.nombreAnglesSortants * wall.hauteurM;
                directSales.push({
                    id: `sale:outside-angles:${wall.id}`,
                    label: `Angles sortants — ${wall.label}`,
                    quantity: angleLengthMl,
                    unit: 'ml',
                    unitSaleHtCents: config.directPrices.angleSortantCentsPerMl.value,
                    source: 'direct_price',
                    inputRefs: [`${path}.nombreAnglesSortants`, `${path}.hauteurM`],
                });
                ctx.trace({
                    engine: 'pricing',
                    inputRefs: [`${path}.nombreAnglesSortants`, `${path}.hauteurM`],
                    formula: 'longueurAnglesSortants = nombreAnglesSortants × hauteurMur',
                    rawResult: angleLengthMl,
                    roundedResult: angleLengthMl,
                    unit: 'ml',
                    source: 'guillaume_rule',
                    warnings: [],
                });
            }
            wall.renforts.forEach((reinforcement, index) => {
                const p = `${path}.renforts[${index}]`;
                ctx.fields.consume(`${p}.label`, 'pricing');
                ctx.fields.consume(`${p}.quantite`, 'pricing');
                if (reinforcement.prixVenteUnitaireOverrideCents !== undefined) {
                    ctx.fields.consume(`${p}.prixVenteUnitaireOverrideCents`, 'pricing');
                }
                directSales.push({
                    id: `sale:reinforcement:${wall.id}:${reinforcement.id}`,
                    label: `${reinforcement.label} — ${wall.label}`,
                    quantity: reinforcement.quantite,
                    unit: 'unit',
                    unitSaleHtCents: reinforcement.prixVenteUnitaireOverrideCents ??
                        config.directPrices.renfortOsbCentsPerUnit.value,
                    source: 'direct_price',
                    inputRefs: [`${p}.quantite`, `${p}.prixVenteUnitaireOverrideCents`],
                });
            });
            if (wall.hauteurM > config.directPrices.heightThresholdM.value) {
                const heightSurchargeSurfaceM2 = wall.typeParoi === 'cloison'
                    ? wallGeometry.faces.reduce((sum, face) => sum + face.netM2, 0)
                    : wallGeometry.netOneSideM2;
                directSales.push({
                    id: `sale:height:${wall.id}`,
                    label: `Plus-value grande hauteur — ${wall.label}`,
                    quantity: heightSurchargeSurfaceM2,
                    unit: 'm2',
                    unitSaleHtCents: config.directPrices.heightSurchargeCentsPerM2.value,
                    source: 'direct_price',
                    inputRefs: [`${path}.hauteurM`],
                });
            }
            if (input.optionsChantier.nombreusesDecoupesSpots &&
                input.optionsChantier.nombreusesDecoupesSpotsOuvrageIds.includes(wall.id)) {
                directSales.push({
                    id: `sale:cuts:${wall.id}`,
                    label: `Nombreuses découpes / spots — ${wall.label}`,
                    quantity: wallGeometry.netOneSideM2,
                    unit: 'm2',
                    unitSaleHtCents: config.directPrices.manyCutsCentsPerM2.value,
                    source: 'direct_price',
                    inputRefs: ['optionsChantier.nombreusesDecoupesSpots'],
                });
            }
        });
        geometry.ceilings.forEach((ceiling) => {
            const piece = input.pieces.find((item) => item.id === ceiling.pieceId);
            const ceilingId = piece?.plafond?.id;
            if (!ceilingId ||
                !input.optionsChantier.nombreusesDecoupesSpots ||
                !input.optionsChantier.nombreusesDecoupesSpotsOuvrageIds.includes(ceilingId))
                return;
            directSales.push({
                id: `sale:cuts:ceiling:${ceilingId}`,
                label: `Nombreuses découpes / spots — plafond ${piece?.nom ?? ''}`.trim(),
                quantity: ceiling.surfaceM2,
                unit: 'm2',
                unitSaleHtCents: config.directPrices.manyCutsCentsPerM2.value,
                source: 'direct_price',
                inputRefs: ['optionsChantier.nombreusesDecoupesSpots'],
            });
        });
        ctx.fields.consume('optionsChantier.nombreusesDecoupesSpots', 'pricing');
        input.optionsChantier.nombreusesDecoupesSpotsOuvrageIds.forEach((_, index) => {
            ctx.fields.consume(`optionsChantier.nombreusesDecoupesSpotsOuvrageIds[${index}]`, 'pricing');
        });
        ctx.fields.consume('optionsChantier.accesDifficile', 'pricing');
        if (input.optionsChantier.accesDifficile) {
            if (input.optionsChantier.accesDifficilePrixOverrideCents !== undefined) {
                ctx.fields.consume('optionsChantier.accesDifficilePrixOverrideCents', 'pricing');
            }
            directSales.push({
                id: 'sale:access-difficult',
                label: 'Accès difficile',
                quantity: 1,
                unit: 'forfait',
                unitSaleHtCents: input.optionsChantier.accesDifficilePrixOverrideCents ??
                    config.directPrices.accesDifficileCents.value,
                source: 'direct_price',
                inputRefs: [
                    'optionsChantier.accesDifficile',
                    'optionsChantier.accesDifficilePrixOverrideCents',
                ],
            });
        }
        ctx.fields.consume('optionsChantier.repriseExistant', 'pricing');
        if (input.optionsChantier.repriseExistant) {
            if (input.optionsChantier.repriseExistantPrixOverrideCents !== undefined) {
                ctx.fields.consume('optionsChantier.repriseExistantPrixOverrideCents', 'pricing');
            }
            directSales.push({
                id: 'sale:existing-rework',
                label: `Reprise sur existant — portée ${config.directPrices.repriseExistantScope.value}`,
                quantity: 1,
                unit: 'forfait',
                unitSaleHtCents: input.optionsChantier.repriseExistantPrixOverrideCents ??
                    config.directPrices.repriseExistantCents.value,
                source: 'direct_price',
                inputRefs: [
                    'optionsChantier.repriseExistant',
                    'optionsChantier.repriseExistantPrixOverrideCents',
                ],
            });
            if (config.directPrices.repriseExistantScope.status !== 'validated') {
                ctx.warn((0, errors_js_3.alert)('PLQ-V2-W003', 'Portée reprise sur existant non définitivement fermée', `La portée actuellement affichée est « ${config.directPrices.repriseExistantScope.value} » et reste paramétrable.`, 'warning', ['optionsChantier.repriseExistant']));
            }
        }
        input.optionsChantier.optionsDirectes.forEach((option, index) => {
            const p = `optionsChantier.optionsDirectes[${index}]`;
            ctx.fields.consume(`${p}.active`, 'pricing');
            if (!option.active) {
                const note = 'Option directe inactive : données volontairement exclues du devis.';
                ctx.fields.consume(`${p}.label`, 'pricing', note);
                ctx.fields.consume(`${p}.quantite`, 'pricing', note);
                ctx.fields.consume(`${p}.unite`, 'pricing', note);
                ctx.fields.consume(`${p}.scope`, 'pricing', note);
                if (option.prixVenteUnitaireHtCents !== undefined) {
                    ctx.fields.consume(`${p}.prixVenteUnitaireHtCents`, 'pricing', note);
                }
                if (option.ouvrageId !== undefined)
                    ctx.fields.consume(`${p}.ouvrageId`, 'pricing', note);
                return;
            }
            if (option.prixVenteUnitaireHtCents === undefined)
                return;
            ctx.fields.consume(`${p}.label`, 'pricing');
            ctx.fields.consume(`${p}.quantite`, 'pricing');
            ctx.fields.consume(`${p}.unite`, 'pricing');
            ctx.fields.consume(`${p}.prixVenteUnitaireHtCents`, 'pricing');
            ctx.fields.consume(`${p}.scope`, 'pricing');
            if (option.ouvrageId !== undefined)
                ctx.fields.consume(`${p}.ouvrageId`, 'pricing');
            const targetLabel = option.scope === 'ouvrage' && option.ouvrageId
                ? getDirectOptionTargetLabel(input, option.ouvrageId)
                : undefined;
            directSales.push({
                id: `sale:direct-option:${option.id}`,
                label: targetLabel ? `${option.label} — ${targetLabel}` : option.label,
                quantity: option.quantite,
                unit: option.unite,
                unitSaleHtCents: option.prixVenteUnitaireHtCents,
                source: 'direct_price',
                inputRefs: [
                    `${p}.quantite`,
                    `${p}.prixVenteUnitaireHtCents`,
                    `${p}.scope`,
                    ...(option.ouvrageId !== undefined ? [`${p}.ouvrageId`] : []),
                ],
            });
        });
        input.optionsChantier.articlesLibres.forEach((freeArticle, index) => {
            const p = `optionsChantier.articlesLibres[${index}]`;
            ctx.fields.consume(`${p}.label`, 'pricing');
            ctx.fields.consume(`${p}.quantite`, 'pricing');
            ctx.fields.consume(`${p}.unite`, 'pricing');
            if (freeArticle.catalogueArticleId !== undefined) {
                ctx.fields.consume(`${p}.catalogueArticleId`, 'pricing');
            }
            if (freeArticle.coutAchatUnitaireHtCents !== undefined) {
                ctx.fields.consume(`${p}.coutAchatUnitaireHtCents`, 'pricing');
            }
            if (freeArticle.prixVenteUnitaireHtCents !== undefined) {
                ctx.fields.consume(`${p}.prixVenteUnitaireHtCents`, 'pricing');
            }
            const article = freeArticle.catalogueArticleId
                ? (0, catalogueUtils_js_2.findArticle)(catalogue, freeArticle.catalogueArticleId)
                : undefined;
            const syntheticCandidate = freeArticle.coutAchatUnitaireHtCents !== undefined
                ? [{
                        articleId: freeArticle.catalogueArticleId ?? `manual-free:${freeArticle.id}`,
                        packageQuantity: 1,
                        packagePriceHtCents: freeArticle.coutAchatUnitaireHtCents,
                        purchaseUnit: 'unit',
                    }]
                : [];
            if (article || syntheticCandidate.length > 0) {
                needs.push({
                    id: `need:free:${freeArticle.id}`,
                    label: freeArticle.label,
                    quantity: freeArticle.quantite,
                    unit: toTechnicalUnit(freeArticle.unite),
                    lossPct: 0,
                    ...(article ? { articleCatalogueId: article.id } : {}),
                    packageCandidates: article ? (0, catalogueUtils_js_2.getPackageCandidates)([article]) : syntheticCandidate,
                    inputRefs: [`${p}.quantite`, `${p}.unite`],
                    internalOnly: freeArticle.prixVenteUnitaireHtCents !== undefined,
                });
            }
            if (freeArticle.prixVenteUnitaireHtCents !== undefined) {
                directSales.push({
                    id: `sale:free:${freeArticle.id}`,
                    label: freeArticle.label,
                    quantity: freeArticle.quantite,
                    unit: freeArticle.unite,
                    unitSaleHtCents: freeArticle.prixVenteUnitaireHtCents,
                    source: 'direct_price',
                    inputRefs: [`${p}.quantite`, `${p}.prixVenteUnitaireHtCents`],
                });
            }
        });
        return { needs, directSales };
    };
    exports.calculateDirectOptions = calculateDirectOptions;
    const toTechnicalUnit = (unit) => {
        if (unit === 'm2' || unit === 'ml' || unit === 'kg' || unit === 'unit')
            return unit;
        return 'unit';
    };
    const getDirectOptionTargetLabel = (input, ouvrageId) => {
        const wall = (0, modelUtils_js_2.getWallsWithPaths)(input).find(({ wall }) => wall.id === ouvrageId)?.wall;
        if (wall)
            return wall.label;
        const piece = input.pieces.find((item) => item.plafond?.id === ouvrageId);
        return piece ? `plafond ${piece.nom}` : undefined;
    };
});
define("core/engines/finishEngine", ["require", "exports", "core/catalogueUtils", "core/errors", "core/modelUtils", "core/money"], function (require, exports, catalogueUtils_js_3, errors_js_4, modelUtils_js_3, money_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateFinishNeeds = void 0;
    const calculateFinishNeeds = (input, geometry, catalogue, config, horizontalJointMlByFaceKey, ctx) => {
        const needs = [];
        const directSales = [];
        const bandCandidates = (0, catalogueUtils_js_3.getPackageCandidates)(catalogue.articles.filter((article) => article.family === 'band'));
        const compoundCandidates = (0, catalogueUtils_js_3.getPackageCandidates)(catalogue.articles.filter((article) => article.family === 'compound'));
        const wallScrewCandidates = (0, catalogueUtils_js_3.getPackageCandidates)(catalogue.articles.filter((article) => article.family === 'screw' && article.metadata?.usage === 'wall'));
        (0, modelUtils_js_3.getWallsWithPaths)(input).forEach(({ wall, path }) => {
            if (!wall.actif)
                return;
            const wallGeometry = geometry.walls.find((item) => item.wallId === wall.id);
            if (!wallGeometry)
                return;
            wall.parements.forEach((parement, index) => {
                if (!parement.actif)
                    return;
                const p = `${path}.parements[${index}]`;
                const face = wallGeometry.faces.find((item) => item.face === parement.face);
                if (!face)
                    return;
                ctx.fields.consume(`${p}.finition.niveau`, 'finish');
                ctx.fields.consume(`${p}.finition.impression`, 'finish');
                if (parement.finition.internalPlanningMinutesOverride !== undefined) {
                    ctx.fields.consume(`${p}.finition.internalPlanningMinutesOverride`, 'finish');
                }
                const screwRate = config.finish.firstLayerScrewsWallUnitM2.value +
                    (parement.nombrePeaux === 2 ? config.finish.secondLayerScrewsUnitM2.value : 0);
                const screwQuantity = face.netM2 * screwRate * (1 + config.finish.screwLossPct.value / 100);
                needs.push({
                    id: `need:wall:screw:${wall.id}:${parement.face}`,
                    label: `Vis parement — ${wall.label} face ${parement.face}`,
                    quantity: (0, money_js_2.roundQuantity)(screwQuantity),
                    unit: 'unit',
                    lossPct: config.finish.screwLossPct.value,
                    packageCandidates: wallScrewCandidates,
                    inputRefs: [`${p}.nombrePeaux`],
                    metadata: { screwRateUnitM2: screwRate, theoreticalQuantityBeforeLoss: (0, money_js_2.roundQuantity)(face.netM2 * screwRate) },
                });
                if (parement.finition.niveau === 'aucune')
                    return;
                const horizontalJointMl = horizontalJointMlByFaceKey[`${wall.id}:${parement.face}`] ?? 0;
                const bandMl = face.netM2 * config.finish.wallBandMlM2.value + horizontalJointMl;
                let compoundKg = face.netM2 * config.finish.wallCompoundKgM2.value;
                if (horizontalJointMl > 0) {
                    if (config.finish.horizontalJointCompoundKgPerMl) {
                        compoundKg += horizontalJointMl * config.finish.horizontalJointCompoundKgPerMl.value;
                    }
                    else {
                        ctx.warn((0, errors_js_4.alert)('PLQ-V2-016', 'Consommation d’enduit pour joints horizontaux non validée', 'La longueur supplémentaire de bande est calculée, mais le complément d’enduit par mètre linéaire doit être validé par Guillaume.', 'blocking', [`${path}.hauteurM`, `${p}.finition.niveau`], { horizontalJointMl }));
                    }
                }
                needs.push({
                    id: `need:finish:band:${wall.id}:${parement.face}`,
                    label: `Bandes internes — ${wall.label} face ${parement.face}`,
                    quantity: (0, money_js_2.roundQuantity)(bandMl),
                    unit: 'ml',
                    lossPct: 0,
                    packageCandidates: bandCandidates,
                    inputRefs: [`${p}.finition.niveau`, `${path}.hauteurM`],
                    internalOnly: true,
                });
                needs.push({
                    id: `need:finish:compound:${wall.id}:${parement.face}`,
                    label: `Enduit interne — ${wall.label} face ${parement.face}`,
                    quantity: (0, money_js_2.roundQuantity)(compoundKg),
                    unit: 'kg',
                    lossPct: 0,
                    packageCandidates: compoundCandidates,
                    inputRefs: [`${p}.finition.niveau`],
                    internalOnly: true,
                });
                directSales.push({
                    id: `sale:finish:${wall.id}:${parement.face}`,
                    label: `${finishLabel(parement.finition.niveau)} — ${wall.label} face ${parement.face}`,
                    quantity: face.netM2,
                    unit: 'm2',
                    unitSaleHtCents: config.finish.finishSaleCentsPerM2[parement.finition.niveau].value,
                    source: 'finish_package',
                    inputRefs: [`${p}.finition.niveau`],
                });
                if (parement.finition.impression) {
                    directSales.push({
                        id: `sale:finish:impression:${wall.id}:${parement.face}`,
                        label: `Impression — ${wall.label} face ${parement.face}`,
                        quantity: face.netM2,
                        unit: 'm2',
                        unitSaleHtCents: config.finish.impressionSaleCentsPerM2.value,
                        source: 'finish_package',
                        inputRefs: [`${p}.finition.impression`],
                    });
                }
            });
        });
        input.pieces.forEach((piece, pieceIndex) => {
            const ceiling = piece.plafond;
            if (!ceiling?.actif)
                return;
            const p = `pieces[${pieceIndex}].plafond`;
            const ceilingGeometry = geometry.ceilings.find((item) => item.pieceId === piece.id);
            if (!ceilingGeometry)
                return;
            ctx.fields.consume(`${p}.finition.niveau`, 'finish');
            ctx.fields.consume(`${p}.finition.impression`, 'finish');
            if (ceiling.finition.internalPlanningMinutesOverride !== undefined) {
                ctx.fields.consume(`${p}.finition.internalPlanningMinutesOverride`, 'finish');
            }
            if (ceiling.finition.niveau === 'aucune')
                return;
            const surface = ceilingGeometry.surfaceM2;
            needs.push({
                id: `need:ceiling:band:${piece.id}`,
                label: `Bandes internes plafond — ${piece.nom}`,
                quantity: (0, money_js_2.roundQuantity)(surface * config.finish.ceilingBandMlM2.value),
                unit: 'ml',
                lossPct: 0,
                packageCandidates: bandCandidates,
                inputRefs: [`${p}.finition.niveau`],
                internalOnly: true,
            });
            needs.push({
                id: `need:ceiling:compound:${piece.id}`,
                label: `Enduit interne plafond — ${piece.nom}`,
                quantity: (0, money_js_2.roundQuantity)(surface * config.finish.ceilingCompoundKgM2.value),
                unit: 'kg',
                lossPct: 0,
                packageCandidates: compoundCandidates,
                inputRefs: [`${p}.finition.niveau`],
                internalOnly: true,
            });
            directSales.push({
                id: `sale:ceiling:finish:${piece.id}`,
                label: `${finishLabel(ceiling.finition.niveau)} plafond — ${piece.nom}`,
                quantity: surface,
                unit: 'm2',
                unitSaleHtCents: config.finish.finishSaleCentsPerM2[ceiling.finition.niveau].value,
                source: 'finish_package',
                inputRefs: [`${p}.finition.niveau`],
            });
            if (ceiling.finition.impression) {
                directSales.push({
                    id: `sale:ceiling:impression:${piece.id}`,
                    label: `Impression plafond — ${piece.nom}`,
                    quantity: surface,
                    unit: 'm2',
                    unitSaleHtCents: config.finish.impressionSaleCentsPerM2.value,
                    source: 'finish_package',
                    inputRefs: [`${p}.finition.impression`],
                });
            }
        });
        return { needs, directSales };
    };
    exports.calculateFinishNeeds = calculateFinishNeeds;
    const finishLabel = (level) => {
        switch (level) {
            case 'bandes':
                return 'Bandes uniquement';
            case 'pret_a_peindre':
                return 'Prêt à peindre courant';
            case 'soignee':
                return 'Finition soignée';
            default:
                return 'Aucune finition';
        }
    };
});
define("core/engines/framingEngine", ["require", "exports", "core/catalogueUtils", "core/errors", "core/modelUtils", "core/money"], function (require, exports, catalogueUtils_js_4, errors_js_5, modelUtils_js_4, money_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateFramingNeeds = void 0;
    const calculateFramingNeeds = (input, geometry, catalogue, config, ctx) => {
        const needs = [];
        const lossPct = config.frame.lossPct.value;
        (0, modelUtils_js_4.getWallsWithPaths)(input).forEach(({ wall, path }) => {
            if (!wall.actif)
                return;
            const wallGeometry = geometry.walls.find((item) => item.wallId === wall.id);
            if (!wallGeometry)
                return;
            ctx.fields.consume(`${path}.ossature.systeme`, 'framing');
            ctx.fields.consume(`${path}.ossature.largeurProfilMm`, 'framing');
            ctx.fields.consume(`${path}.ossature.entraxeMm`, 'framing');
            ctx.fields.consume(`${path}.ossature.montantsDoubles`, 'framing');
            if (wall.ossature.systeme === 'optima') {
                calculateOptimaNeeds(wall, path, wallGeometry.netOneSideM2, catalogue, config, lossPct, ctx, needs);
                return;
            }
            warnIfFramingChoiceDiffersFromValidatedSuggestion(wall, path, ctx);
            const spacingM = wall.ossature.entraxeMm / 1000;
            const baseRailMl = 2 * wall.longueurM;
            let openingStudMl = 0;
            let horizontalProfileMl = 0;
            wall.ouvertures.forEach((opening, openingIndex) => {
                const p = `${path}.ouvertures[${openingIndex}]`;
                ctx.fields.consume(`${p}.ossaturePeripherique`, 'framing');
                if (!opening.ossaturePeripherique)
                    return;
                ctx.fields.consume(`${p}.largeurM`, 'framing');
                ctx.fields.consume(`${p}.quantite`, 'framing');
                openingStudMl += 4 * wall.hauteurM * opening.quantite;
                horizontalProfileMl += 2 * opening.largeurM * opening.quantite;
            });
            const positions = Math.ceil(wall.longueurM / spacingM) + 1;
            const factor = wall.ossature.montantsDoubles ? 2 : 1;
            const baseStudCount = positions * factor;
            const baseStudMl = baseStudCount * wall.hauteurM;
            const railMl = (baseRailMl + horizontalProfileMl) * (1 + lossPct / 100);
            const studMl = (baseStudMl + openingStudMl) * (1 + lossPct / 100);
            const rails = catalogue.articles.filter((article) => article.family === 'rail' &&
                article.profileWidthMm === wall.ossature.largeurProfilMm);
            const studs = catalogue.articles.filter((article) => article.family === 'stud' &&
                article.profileWidthMm === wall.ossature.largeurProfilMm);
            needs.push({
                id: `need:rail:${wall.id}`,
                label: `Rails R${wall.ossature.largeurProfilMm} — ${wall.label}`,
                quantity: (0, money_js_3.roundQuantity)(railMl),
                unit: 'ml',
                lossPct,
                packageCandidates: (0, catalogueUtils_js_4.getPackageCandidates)(rails),
                inputRefs: [
                    `${path}.longueurM`,
                    `${path}.ossature.largeurProfilMm`,
                    ...wall.ouvertures.flatMap((_, index) => [
                        `${path}.ouvertures[${index}].largeurM`,
                        `${path}.ouvertures[${index}].quantite`,
                        `${path}.ouvertures[${index}].ossaturePeripherique`,
                    ]),
                ],
                metadata: {
                    baseRailMl: (0, money_js_3.roundQuantity)(baseRailMl),
                    horizontalProfileMl: (0, money_js_3.roundQuantity)(horizontalProfileMl),
                },
            });
            needs.push({
                id: `need:stud:${wall.id}`,
                label: `Montants M${wall.ossature.largeurProfilMm} — ${wall.label}`,
                quantity: (0, money_js_3.roundQuantity)(studMl),
                unit: 'ml',
                lossPct,
                packageCandidates: (0, catalogueUtils_js_4.getPackageCandidates)(studs),
                inputRefs: [
                    `${path}.longueurM`,
                    `${path}.hauteurM`,
                    `${path}.ossature.entraxeMm`,
                    `${path}.ossature.montantsDoubles`,
                    ...wall.ouvertures.flatMap((_, index) => [
                        `${path}.ouvertures[${index}].quantite`,
                        `${path}.ouvertures[${index}].ossaturePeripherique`,
                    ]),
                ],
                metadata: {
                    positions,
                    baseStudCount,
                    baseStudMl: (0, money_js_3.roundQuantity)(baseStudMl),
                    openingStudMl: (0, money_js_3.roundQuantity)(openingStudMl),
                },
            });
            ctx.trace({
                engine: 'framing',
                inputRefs: [`${path}.longueurM`, `${path}.ossature.entraxeMm`, `${path}.ossature.montantsDoubles`],
                formula: 'nbPositions = ceil(longueur / entraxe) + 1 ; montantsMl = positions × facteurDouble × hauteur',
                rawResult: baseStudMl + openingStudMl,
                roundedResult: (0, money_js_3.roundQuantity)(studMl),
                unit: 'ml',
                source: 'guillaume_rule',
                warnings: [],
            });
        });
        return needs;
    };
    exports.calculateFramingNeeds = calculateFramingNeeds;
    const calculateOptimaNeeds = (wall, path, surfaceM2, catalogue, config, lossPct, ctx, needs) => {
        const automaticRows = Math.max(1, Math.ceil(wall.hauteurM / config.optima.supportVerticalSpacingM.value));
        const rows = wall.ossature.nombreRangeesAppuis ?? automaticRows;
        ctx.fields.consume(`${path}.ossature.nombreRangeesAppuis`, 'framing');
        if (wall.ossature.nombreAppuisParM2 !== undefined) {
            ctx.fields.consume(`${path}.ossature.nombreAppuisParM2`, 'framing', 'Ancien champ interprété comme nombre de rangées d’appuis.');
        }
        if (rows !== automaticRows) {
            ctx.warn((0, errors_js_5.alert)('PLQ-V2-W005', 'Nombre de rangées d’appuis Optima modifié', `La proposition automatique est de ${automaticRows} rangée(s) pour ${wall.hauteurM.toFixed(2)} m, selon un appui tous les 1,35 m. La valeur artisan ${rows} est conservée et tracée.`, 'warning', [`${path}.hauteurM`, `${path}.ossature.nombreRangeesAppuis`]));
        }
        const factor = 1 + lossPct / 100;
        addOptimaNeed(needs, catalogue, `need:optima:furring:${wall.id}`, `Fourrures F530 Optima — ${wall.label}`, surfaceM2 * config.optima.furringMlM2.value * factor, 'ml', lossPct, [`${path}.ossature.systeme`, `${path}.hauteurM`], (article) => article.family === 'furring' &&
            (article.metadata?.optimaKind === 'furring' || article.metadata?.usage === 'optima'), { ratePerM2: config.optima.furringMlM2.value, rows });
        addOptimaNeed(needs, catalogue, `need:optima:clip-track:${wall.id}`, `Lisses Clip Optima — ${wall.label}`, surfaceM2 * config.optima.clipTrackMlM2.value * factor, 'ml', lossPct, [`${path}.ossature.systeme`, `${path}.hauteurM`], (article) => article.family === 'optima' && article.metadata?.optimaKind === 'clip_track', { ratePerM2: config.optima.clipTrackMlM2.value, rows });
        addOptimaNeed(needs, catalogue, `need:optima:support:${wall.id}`, `Appuis Optima — ${wall.label}`, surfaceM2 * config.optima.supportUnitM2.value * factor, 'unit', lossPct, [`${path}.ossature.nombreRangeesAppuis`], (article) => article.family === 'optima' && article.metadata?.optimaKind === 'support', { ratePerM2: config.optima.supportUnitM2.value, rows });
        addOptimaNeed(needs, catalogue, `need:optima:key:${wall.id}`, `Clés Optima — ${wall.label}`, surfaceM2 * config.optima.keyUnitM2.value * factor, 'unit', lossPct, [`${path}.ossature.nombreRangeesAppuis`], (article) => article.family === 'optima' && article.metadata?.optimaKind === 'key', { ratePerM2: config.optima.keyUnitM2.value, rows });
        addOptimaNeed(needs, catalogue, `need:optima:fixing:${wall.id}`, `Fixations d’appuis Optima — ${wall.label}`, surfaceM2 * config.optima.fixingUnitM2PerRow.value * rows * factor, 'unit', lossPct, [`${path}.ossature.nombreRangeesAppuis`], (article) => article.family === 'optima' && article.metadata?.optimaKind === 'fixing', { ratePerM2PerRow: config.optima.fixingUnitM2PerRow.value, rows });
        ctx.trace({
            engine: 'framing',
            inputRefs: [`${path}.hauteurM`, `${path}.ossature.nombreRangeesAppuis`],
            formula: 'rangéesAppuis = ceil(hauteur / 1,35), modifiable ; consommations Optima = surface × taux validé × perte ossature',
            rawResult: automaticRows,
            roundedResult: rows,
            unit: 'unit',
            source: rows === automaticRows ? 'guillaume_rule' : 'manual_override',
            warnings: [
                'Les quantités sont calculées ; la valorisation exige les prix réels des articles Optima dans le catalogue.',
            ],
        });
    };
    const addOptimaNeed = (needs, catalogue, id, label, quantity, unit, lossPct, inputRefs, predicate, metadata) => {
        const articles = catalogue.articles.filter(predicate);
        needs.push({
            id,
            label,
            quantity: (0, money_js_3.roundQuantity)(quantity),
            unit,
            lossPct,
            packageCandidates: (0, catalogueUtils_js_4.getPackageCandidates)(articles),
            inputRefs,
            metadata,
        });
    };
    const warnIfFramingChoiceDiffersFromValidatedSuggestion = (wall, path, ctx) => {
        let suggested;
        if (wall.hauteurM <= 2.5)
            suggested = { width: 48, spacing: 600, doubled: false };
        else if (wall.hauteurM <= 2.8)
            suggested = { width: 48, spacing: 400, doubled: false };
        else if (wall.hauteurM <= 3.05)
            suggested = { width: 48, spacing: 600, doubled: true };
        else if (wall.hauteurM <= 3.45)
            suggested = { width: 48, spacing: 400, doubled: true };
        if (!suggested)
            return;
        const differs = wall.ossature.largeurProfilMm !== suggested.width ||
            wall.ossature.entraxeMm !== suggested.spacing ||
            wall.ossature.montantsDoubles !== suggested.doubled;
        if (!differs)
            return;
        ctx.warn((0, errors_js_5.alert)('PLQ-V2-W002', 'Choix d’ossature différent de la proposition liée à la hauteur', `Choix artisan conservé et tracé. Proposition indicative : M${suggested.width}, entraxe ${suggested.spacing} mm, montants ${suggested.doubled ? 'doublés' : 'simples'}.`, 'warning', [
            `${path}.hauteurM`,
            `${path}.ossature.largeurProfilMm`,
            `${path}.ossature.entraxeMm`,
            `${path}.ossature.montantsDoubles`,
        ]));
    };
});
define("core/engines/isolationEngine", ["require", "exports", "core/catalogueUtils", "core/errors", "core/modelUtils", "core/money"], function (require, exports, catalogueUtils_js_5, errors_js_6, modelUtils_js_5, money_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateIsolationNeeds = void 0;
    const calculateIsolationNeeds = (input, geometry, catalogue, config, ctx) => {
        const needs = [];
        const directSales = [];
        (0, modelUtils_js_5.getWallsWithPaths)(input).forEach(({ wall, path }) => {
            if (!wall.actif || !wall.isolation)
                return;
            const geometryWall = geometry.walls.find((item) => item.wallId === wall.id);
            if (!geometryWall)
                return;
            processIsolation(wall.isolation, `${path}.isolation`, geometryWall.netOneSideM2, `mur:${wall.id}`, wall.label, wall.typeParoi === 'doublage', catalogue, config, ctx, needs, directSales);
        });
        input.pieces.forEach((piece, pieceIndex) => {
            const ceiling = piece.plafond;
            if (!ceiling?.actif || !ceiling.isolation)
                return;
            const ceilingGeometry = geometry.ceilings.find((item) => item.pieceId === piece.id);
            if (!ceilingGeometry)
                return;
            processIsolation(ceiling.isolation, `pieces[${pieceIndex}].plafond.isolation`, ceilingGeometry.surfaceM2, `ceiling:${piece.id}`, `plafond ${piece.nom}`, false, catalogue, config, ctx, needs, directSales);
        });
        return { needs, directSales };
    };
    exports.calculateIsolationNeeds = calculateIsolationNeeds;
    const processIsolation = (isolation, path, surfaceM2, key, label, allowValidatedMembranes, catalogue, config, ctx, needs, directSales) => {
        ctx.fields.consume(`${path}.active`, 'isolation');
        ctx.fields.consume(`${path}.pareVapeur`, 'isolation');
        ctx.fields.consume(`${path}.freinVapeur`, 'isolation');
        ctx.fields.consume(`${path}.poseCroisee`, 'isolation');
        if (!isolation.active) {
            isolation.couches.forEach((layer, index) => {
                const p = `${path}.couches[${index}]`;
                ctx.fields.consume(`${p}.id`, 'isolation', 'Isolation inactive.');
                ctx.fields.consume(`${p}.articleCatalogueId`, 'isolation', 'Isolation inactive.');
                ctx.fields.consume(`${p}.epaisseurMm`, 'isolation', 'Isolation inactive.');
                ctx.fields.consume(`${p}.semiRigide`, 'isolation', 'Isolation inactive.');
                if (layer.prixAchatM2OverrideCents !== undefined) {
                    ctx.fields.consume(`${p}.prixAchatM2OverrideCents`, 'isolation', 'Isolation inactive.');
                }
            });
            return;
        }
        const layerLosses = [];
        isolation.couches.forEach((layer, index) => {
            const p = `${path}.couches[${index}]`;
            ctx.fields.consume(`${p}.id`, 'isolation');
            ctx.fields.consume(`${p}.articleCatalogueId`, 'isolation');
            ctx.fields.consume(`${p}.epaisseurMm`, 'isolation');
            ctx.fields.consume(`${p}.semiRigide`, 'isolation');
            if (layer.prixAchatM2OverrideCents !== undefined) {
                ctx.fields.consume(`${p}.prixAchatM2OverrideCents`, 'isolation');
            }
            const article = (0, catalogueUtils_js_5.findArticle)(catalogue, layer.articleCatalogueId);
            if (!article) {
                ctx.warn((0, errors_js_6.alert)('PLQ-V2-006', 'Article isolant introuvable', `L’article d’isolation ${layer.articleCatalogueId} est introuvable dans le catalogue.`, 'blocking', [`${p}.articleCatalogueId`]));
                return;
            }
            const isBlown = article.metadata?.insulationKind === 'blown';
            const lossPct = isBlown ? config.insulation.blownLossPct.value : config.insulation.lossPct.value;
            layerLosses.push(lossPct);
            const quantity = surfaceM2 * (1 + lossPct / 100);
            const materialCoefficient = layer.semiRigide
                ? config.insulation.semiRigidMaterialCoefficient.value
                : 1;
            const candidates = (0, catalogueUtils_js_5.getPackageCandidates)([article]).map((candidate) => ({
                ...candidate,
                packagePriceHtCents: Math.round(candidate.packagePriceHtCents * materialCoefficient),
            }));
            if (layer.prixAchatM2OverrideCents !== undefined && article.packageQuantity > 0) {
                candidates.splice(0, candidates.length, {
                    articleId: article.id,
                    packageQuantity: article.packageQuantity,
                    packagePriceHtCents: Math.round(layer.prixAchatM2OverrideCents * article.packageQuantity * materialCoefficient),
                    purchaseUnit: article.purchaseUnit,
                });
            }
            needs.push({
                id: `need:isolation:${key}:layer:${index}`,
                label: `${article.label} — ${label} — couche ${index + 1}${layer.semiRigide ? ' — semi-rigide' : ''}`,
                quantity: (0, money_js_4.roundQuantity)(quantity),
                unit: 'm2',
                lossPct,
                articleCatalogueId: article.id,
                packageCandidates: candidates,
                inputRefs: [
                    `${p}.id`,
                    `${p}.articleCatalogueId`,
                    `${p}.epaisseurMm`,
                    `${p}.semiRigide`,
                    ...(layer.prixAchatM2OverrideCents !== undefined ? [`${p}.prixAchatM2OverrideCents`] : []),
                ],
                energyEligible: true,
                metadata: {
                    thicknessMm: layer.epaisseurMm,
                    baseSurfaceM2: surfaceM2,
                    lossPct,
                    insulationKind: isBlown ? 'blown' : 'panel_roll',
                    semiRigid: layer.semiRigide === true,
                    materialCoefficient,
                    ...(typeof article.metadata?.usage === 'string' ? { usage: article.metadata.usage } : {}),
                    ...(typeof article.metadata?.rApprox === 'number' ? { rApprox: article.metadata.rApprox } : {}),
                },
            });
        });
        if (isolation.couches.length === 2) {
            const crossedCoefficient = isolation.poseCroisee
                ? config.insulation.crossedInstallationLaborCoefficient.value
                : 1;
            directSales.push({
                id: `sale:isolation-second-layer:${key}`,
                label: `Plus-value pose isolation deux couches${isolation.poseCroisee ? ' croisées' : ''} — ${label}`,
                quantity: surfaceM2,
                unit: 'm2',
                unitSaleHtCents: Math.round(config.insulation.secondLayerLaborSaleCentsPerM2.value * crossedCoefficient),
                source: 'direct_price',
                inputRefs: [
                    ...isolation.couches.map((_, index) => `${path}.couches[${index}].articleCatalogueId`),
                    `${path}.poseCroisee`,
                ],
                energyEligible: true,
            });
        }
        if (allowValidatedMembranes && isolation.pareVapeur) {
            directSales.push({
                id: `sale:pare-vapeur:${key}`,
                label: `Pare-vapeur — ${label}`,
                quantity: surfaceM2,
                unit: 'm2',
                unitSaleHtCents: config.insulation.pareVapeurSaleCentsPerM2.value,
                source: 'direct_price',
                inputRefs: [`${path}.pareVapeur`],
                energyEligible: true,
            });
        }
        if (allowValidatedMembranes && isolation.freinVapeur) {
            directSales.push({
                id: `sale:frein-vapeur:${key}`,
                label: `Membrane hygrovariable / frein-vapeur — ${label}`,
                quantity: surfaceM2,
                unit: 'm2',
                unitSaleHtCents: config.insulation.freinVapeurSaleCentsPerM2.value,
                source: 'direct_price',
                inputRefs: [`${path}.freinVapeur`],
                energyEligible: true,
            });
        }
        const distinctLosses = [...new Set(layerLosses)];
        ctx.trace({
            engine: 'isolation',
            inputRefs: [
                `${path}.active`,
                `${path}.poseCroisee`,
                ...isolation.couches.flatMap((_, index) => [
                    `${path}.couches[${index}].articleCatalogueId`,
                    `${path}.couches[${index}].semiRigide`,
                ]),
            ],
            formula: 'quantitéCouche = surfaceOuvrage × (1 + perteFamille) ; soufflé 3 %, panneaux/rouleaux 10 %',
            rawResult: surfaceM2,
            roundedResult: (0, money_js_4.roundQuantity)(surfaceM2),
            unit: 'm2',
            source: 'guillaume_rule',
            warnings: [
                `Pertes appliquées : ${distinctLosses.join(' / ')} %.`,
                'Le R de l’abaque est informatif et ne pilote pas automatiquement le choix.',
                'Pour une cloison, la surface d’isolation est comptée une fois dans la cavité, pas une fois par parement.',
            ],
        });
    };
});
define("core/engines/laborEngine", ["require", "exports", "core/modelUtils", "core/money"], function (require, exports, modelUtils_js_6, money_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateLabor = void 0;
    const calculateLabor = (input, geometry, company, ctx) => {
        const lines = [];
        const config = company.plaquisteConfig;
        const hourlyRate = input.overrides.tauxHoraireCents ?? company.hourlyRateCents ?? 0;
        const complexity = config.labor.complexityCoefficient[input.optionsChantier.complexite].value;
        ctx.fields.consume('optionsChantier.complexite', 'labor');
        if (input.overrides.tauxHoraireCents !== undefined) {
            ctx.fields.consume('overrides.tauxHoraireCents', 'labor');
        }
        (0, modelUtils_js_6.getWallsWithPaths)(input).forEach(({ wall, path }) => {
            if (!wall.actif)
                return;
            const wallGeometry = geometry.walls.find((item) => item.wallId === wall.id);
            if (!wallGeometry)
                return;
            let baseHoursPerM2 = 0;
            if (wall.typeParoi === 'cloison') {
                baseHoursPerM2 = config.labor.cloisonSimpleHoursM2.value;
            }
            else if (wall.ossature.systeme === 'optima') {
                baseHoursPerM2 = config.labor.doublageOptimaHoursM2.value;
            }
            else if (wall.isolation?.active) {
                baseHoursPerM2 = config.labor.doublageClassiqueAvecIsolantHoursM2.value;
            }
            else {
                baseHoursPerM2 = config.labor.doublageClassiqueSansIsolantHoursM2.value;
            }
            ctx.fields.consume(`${path}.typeParoi`, 'labor');
            ctx.fields.consume(`${path}.ossature.systeme`, 'labor');
            if (wall.isolation)
                ctx.fields.consume(`${path}.isolation.active`, 'labor');
            const framingLaborCoefficient = wall.ossature.montantsDoubles
                ? config.labor.doubledStudLaborCoefficient.value
                : 1;
            ctx.fields.consume(`${path}.ossature.montantsDoubles`, 'labor');
            const baseHours = wallGeometry.netOneSideM2 * baseHoursPerM2 * framingLaborCoefficient;
            const secondSkinSurface = wallGeometry.faces
                .filter((face) => face.skins === 2)
                .reduce((sum, face) => sum + face.netM2, 0);
            const secondSkinHours = secondSkinSurface * config.labor.secondSkinExtraHoursM2.value;
            const hasSemiRigidIsolation = wall.isolation?.active === true && wall.isolation.couches.some((layer) => layer.semiRigide === true);
            if (wall.isolation?.active) {
                ctx.fields.consume(`${path}.isolation.poseCroisee`, 'labor');
                wall.isolation.couches.forEach((_, index) => {
                    ctx.fields.consume(`${path}.isolation.couches[${index}].semiRigide`, 'labor');
                });
            }
            const semiRigidLaborCoefficient = hasSemiRigidIsolation
                ? config.insulation.semiRigidLaborCoefficient.value
                : 1;
            const hours = (baseHours + secondSkinHours) * complexity * semiRigidLaborCoefficient;
            lines.push({
                id: `labor:wall:${wall.id}`,
                label: `Pose ${wall.typeParoi} — ${wall.label}`,
                hours: (0, money_js_5.roundQuantity)(hours),
                hourlyRateCents: hourlyRate,
                billable: true,
                saleHtCents: (0, money_js_5.multiplyCents)(hourlyRate, hours),
                inputRefs: [
                    `${path}.typeParoi`,
                    `${path}.ossature.systeme`,
                    `${path}.ossature.montantsDoubles`,
                    'optionsChantier.complexite',
                    ...wall.parements.map((_, index) => `${path}.parements[${index}].nombrePeaux`),
                ],
            });
            wall.parements.forEach((parement, index) => {
                const override = parement.finition.internalPlanningMinutesOverride;
                if (override === undefined)
                    return;
                const p = `${path}.parements[${index}].finition.internalPlanningMinutesOverride`;
                ctx.fields.consume(p, 'labor');
                lines.push({
                    id: `labor:finish-planning:${wall.id}:${parement.face}`,
                    label: `Planning interne finition — ${wall.label} face ${parement.face}`,
                    hours: (0, money_js_5.roundQuantity)(override / 60),
                    hourlyRateCents: hourlyRate,
                    billable: false,
                    saleHtCents: 0,
                    inputRefs: [p],
                });
            });
            ctx.trace({
                engine: 'labor',
                inputRefs: [`${path}.typeParoi`, `${path}.ossature.montantsDoubles`, 'optionsChantier.complexite'],
                formula: 'heures = (surfaceOuvrage × tempsBase × coefficientMontantsDoublés + surfaceDoublePeau × 0,05) × coefficientComplexité × coefficientSemiRigide',
                rawResult: hours,
                roundedResult: (0, money_js_5.roundQuantity)(hours),
                unit: 'h',
                source: 'guillaume_rule',
                warnings: hasSemiRigidIsolation
                    ? ['Coefficient semi-rigide ×1,20 appliqué aux heures de main-d’œuvre de l’ouvrage, conformément à la validation Guillaume.']
                    : [],
            });
        });
        input.pieces.forEach((piece, pieceIndex) => {
            const ceiling = piece.plafond;
            if (!ceiling?.actif)
                return;
            const ceilingGeometry = geometry.ceilings.find((item) => item.pieceId === piece.id);
            if (!ceilingGeometry)
                return;
            const p = `pieces[${pieceIndex}].plafond`;
            const baseHours = ceilingGeometry.surfaceM2 * config.labor.plafondDroitHoursM2.value;
            const secondSkinHours = ceiling.nombrePeaux === 2
                ? ceilingGeometry.surfaceM2 * config.labor.secondSkinExtraHoursM2.value
                : 0;
            const hasSemiRigidIsolation = ceiling.isolation?.active === true && ceiling.isolation.couches.some((layer) => layer.semiRigide === true);
            if (ceiling.isolation?.active) {
                ctx.fields.consume(`${p}.isolation.poseCroisee`, 'labor');
                ceiling.isolation.couches.forEach((_, index) => {
                    ctx.fields.consume(`${p}.isolation.couches[${index}].semiRigide`, 'labor');
                });
            }
            const semiRigidLaborCoefficient = hasSemiRigidIsolation
                ? config.insulation.semiRigidLaborCoefficient.value
                : 1;
            const hours = (baseHours + secondSkinHours) * complexity * semiRigidLaborCoefficient;
            ctx.fields.consume(`${p}.nombrePeaux`, 'labor');
            lines.push({
                id: `labor:ceiling:${piece.id}`,
                label: `Pose plafond — ${piece.nom}`,
                hours: (0, money_js_5.roundQuantity)(hours),
                hourlyRateCents: hourlyRate,
                billable: true,
                saleHtCents: (0, money_js_5.multiplyCents)(hourlyRate, hours),
                inputRefs: [`${p}.nombrePeaux`, 'optionsChantier.complexite'],
            });
            if (ceiling.finition.internalPlanningMinutesOverride !== undefined) {
                const planningPath = `${p}.finition.internalPlanningMinutesOverride`;
                ctx.fields.consume(planningPath, 'labor');
                lines.push({
                    id: `labor:ceiling-finish-planning:${piece.id}`,
                    label: `Planning interne finition plafond — ${piece.nom}`,
                    hours: (0, money_js_5.roundQuantity)(ceiling.finition.internalPlanningMinutesOverride / 60),
                    hourlyRateCents: hourlyRate,
                    billable: false,
                    saleHtCents: 0,
                    inputRefs: [planningPath],
                });
            }
        });
        return lines;
    };
    exports.calculateLabor = calculateLabor;
});
define("core/engines/orderEngine", ["require", "exports", "core/errors", "core/money"], function (require, exports, errors_js_7, money_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chooseCheapestPackages = exports.resolveOrders = void 0;
    const resolveOrders = (input, needs, stock, ctx) => {
        const orders = [];
        needs.forEach((need) => {
            const overrideByNeedId = input.overrides.quantitesMateriaux?.[need.id];
            const requiredQuantity = overrideByNeedId ?? need.quantity;
            if (overrideByNeedId !== undefined) {
                ctx.fields.consume(`overrides.quantitesMateriaux.${need.id}`, 'order');
            }
            if (need.packageCandidates.length === 0) {
                ctx.warn((0, errors_js_7.alert)('PLQ-V2-007', 'Conditionnement ou prix catalogue absent', `Impossible d’optimiser « ${need.label} » sans conditionnement tarifé.`, 'blocking_order', need.inputRefs, { needId: need.id }));
                return;
            }
            const optimized = (0, exports.chooseCheapestPackages)(requiredQuantity, need.packageCandidates);
            if (!optimized) {
                ctx.warn((0, errors_js_7.alert)('PLQ-V2-007', 'Aucune combinaison de conditionnement valide', `Aucune combinaison tarifée ne couvre le besoin « ${need.label} ».`, 'blocking_order', need.inputRefs, { needId: need.id, requiredQuantity }));
                return;
            }
            let totalStockUsed = 0;
            const toOrderPackages = [];
            optimized.packages.forEach((selection) => {
                const stockAvailable = stock.technicalQuantityByArticleId[selection.articleId] ?? 0;
                const selectedQuantity = selection.packageCount * selection.packageQuantity;
                const stockUsed = Math.min(stockAvailable, selectedQuantity);
                totalStockUsed += stockUsed;
                const remainingQuantity = Math.max(0, selectedQuantity - stockUsed);
                const packagesToOrder = Math.ceil(remainingQuantity / selection.packageQuantity);
                if (packagesToOrder > 0) {
                    toOrderPackages.push({ ...selection, packageCount: packagesToOrder });
                }
            });
            orders.push({
                needId: need.id,
                label: need.label,
                packages: optimized.packages,
                requiredQuantity: (0, money_js_6.roundQuantity)(requiredQuantity),
                purchasedQuantity: (0, money_js_6.roundQuantity)(optimized.purchasedQuantity),
                surplus: (0, money_js_6.roundQuantity)(optimized.purchasedQuantity - requiredQuantity),
                purchaseCostHtCents: optimized.costCents,
                stockUsedQuantity: (0, money_js_6.roundQuantity)(totalStockUsed),
                toOrderPackages,
                internalOnly: need.internalOnly ?? false,
            });
            ctx.trace({
                engine: 'order',
                inputRefs: need.inputRefs,
                formula: 'choix = coût minimal ; puis surplus minimal ; puis nombre de colis minimal',
                rawResult: optimized.purchasedQuantity,
                roundedResult: (0, money_js_6.roundQuantity)(optimized.purchasedQuantity),
                unit: need.unit,
                source: 'catalogue',
                warnings: [],
            });
        });
        return orders;
    };
    exports.resolveOrders = resolveOrders;
    const chooseCheapestPackages = (required, candidates) => {
        if (!Number.isFinite(required) || required <= 0) {
            return { packages: [], purchasedQuantity: 0, costCents: 0 };
        }
        const valid = candidates.filter((candidate) => Number.isFinite(candidate.packageQuantity) &&
            candidate.packageQuantity > 0 &&
            Number.isInteger(candidate.packagePriceHtCents) &&
            candidate.packagePriceHtCents >= 0);
        if (valid.length === 0)
            return undefined;
        const scale = 1000;
        const requiredInt = Math.ceil(required * scale - Number.EPSILON);
        const candidateInts = valid.map((candidate) => ({
            candidate,
            quantityInt: Math.max(1, Math.round(candidate.packageQuantity * scale)),
        }));
        const maxPackageInt = Math.max(...candidateInts.map((item) => item.quantityInt));
        const maxTarget = requiredInt + maxPackageInt;
        const states = new Array(maxTarget + 1);
        states[0] = { cost: 0, packageCount: 0, counts: valid.map(() => 0) };
        for (let quantity = 0; quantity <= maxTarget; quantity += 1) {
            const state = states[quantity];
            if (!state)
                continue;
            candidateInts.forEach(({ candidate, quantityInt }, index) => {
                const nextQuantity = Math.min(maxTarget, quantity + quantityInt);
                const nextCost = state.cost + candidate.packagePriceHtCents;
                const nextPackageCount = state.packageCount + 1;
                const existing = states[nextQuantity];
                if (!existing ||
                    nextCost < existing.cost ||
                    (nextCost === existing.cost && nextPackageCount < existing.packageCount)) {
                    const counts = [...state.counts];
                    counts[index] = (counts[index] ?? 0) + 1;
                    states[nextQuantity] = { cost: nextCost, packageCount: nextPackageCount, counts };
                }
            });
        }
        let bestQuantity = -1;
        let bestState;
        for (let quantity = requiredInt; quantity <= maxTarget; quantity += 1) {
            const state = states[quantity];
            if (!state)
                continue;
            if (!bestState ||
                state.cost < bestState.cost ||
                (state.cost === bestState.cost && quantity < bestQuantity) ||
                (state.cost === bestState.cost && quantity === bestQuantity && state.packageCount < bestState.packageCount)) {
                bestState = state;
                bestQuantity = quantity;
            }
        }
        if (!bestState)
            return undefined;
        const packages = [];
        bestState.counts.forEach((count, index) => {
            if (!count)
                return;
            const candidate = valid[index];
            if (!candidate)
                return;
            packages.push({
                articleId: candidate.articleId,
                packageCount: count,
                packageQuantity: candidate.packageQuantity,
                packagePriceHtCents: candidate.packagePriceHtCents,
            });
        });
        const purchasedQuantity = packages.reduce((sum, selection) => sum + selection.packageCount * selection.packageQuantity, 0);
        return {
            packages,
            purchasedQuantity: (0, money_js_6.roundQuantity)(purchasedQuantity),
            costCents: bestState.cost,
        };
    };
    exports.chooseCheapestPackages = chooseCheapestPackages;
});
define("core/engines/plateEngine", ["require", "exports", "core/errors", "core/modelUtils", "core/money", "core/catalogueUtils"], function (require, exports, errors_js_8, modelUtils_js_7, money_js_7, catalogueUtils_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculatePlateNeeds = void 0;
    const calculatePlateNeeds = (input, geometry, catalogue, config, ctx) => {
        const needs = [];
        const horizontalJointMlByFaceKey = {};
        const walls = (0, modelUtils_js_7.getWallsWithPaths)(input);
        const lossPct = input.overrides.pertePlaquesMurPct ??
            input.overrides.pertePlaquesPct ??
            config.plate.lossPct.value;
        if (input.overrides.pertePlaquesMurPct !== undefined) {
            ctx.fields.consume('overrides.pertePlaquesMurPct', 'plate');
        }
        if (input.overrides.pertePlaquesPct !== undefined) {
            ctx.fields.consume('overrides.pertePlaquesPct', 'plate', 'Ancien override global appliqué aux murs.');
        }
        walls.forEach(({ wall, path }) => {
            if (!wall.actif)
                return;
            const wallGeometry = geometry.walls.find((item) => item.wallId === wall.id);
            if (!wallGeometry)
                return;
            wall.parements.forEach((parement, faceIndex) => {
                if (!parement.actif)
                    return;
                const faceGeometry = wallGeometry.faces.find((face) => face.face === parement.face);
                if (!faceGeometry)
                    return;
                const p = `${path}.parements[${faceIndex}]`;
                ctx.fields.consume(`${p}.typePlaque`, 'plate');
                ctx.fields.consume(`${p}.nombrePeaux`, 'plate');
                const selected = selectPlate(catalogue, parement.typePlaque, wall.hauteurM, wall.longueurM, config.plate.widthM.value);
                if (!selected) {
                    ctx.warn((0, errors_js_8.alert)('PLQ-V2-006', 'Plaque catalogue introuvable', `Aucun format catalogue compatible avec ${parement.typePlaque} n’a été trouvé.`, 'blocking', [`${p}.typePlaque`, `${path}.hauteurM`]));
                    return;
                }
                const plateArea = (selected.article.widthM ?? 0) * (selected.article.heightM ?? 0);
                if (plateArea <= 0) {
                    ctx.warn((0, errors_js_8.alert)('PLQ-V2-006', 'Dimensions de plaque catalogue invalides', `L’article ${selected.article.label} ne possède pas de dimensions commerciales exploitables.`, 'blocking', [`${p}.typePlaque`]));
                    return;
                }
                const quantityOverride = input.overrides.quantitesMateriaux?.[`plate:${wall.id}:${parement.face}`];
                if (selected.verticalSegments > 1 && faceGeometry.openingsM2 > 0 && quantityOverride === undefined) {
                    ctx.warn((0, errors_js_8.alert)('PLQ-V2-032', 'Mur segmenté avec ouverture sans calepinage ni quantité manuelle', 'La hauteur impose plusieurs rangées de plaques et le mur comporte une ouverture. Renseignez une quantité manuelle motivée : aucun calepinage 2D ne sera inventé.', 'blocking', [`${path}.hauteurM`, ...wall.ouvertures.map((_, index) => `${path}.ouvertures[${index}].id`)]));
                }
                const theoreticalCount = selected.verticalSegments > 1
                    ? calculateSegmentedPlateCount(faceGeometry.netM2, wall.hauteurM, selected.article.widthM ?? config.plate.widthM.value, selected.verticalSegments, parement.nombrePeaux)
                    : faceGeometry.claddingM2 / plateArea;
                const countAfterExplicitLoss = theoreticalCount * (1 + lossPct / 100);
                const finalCount = Math.ceil(countAfterExplicitLoss);
                const usedCount = quantityOverride ?? finalCount;
                if (quantityOverride !== undefined) {
                    ctx.fields.consume(`overrides.quantitesMateriaux.plate:${wall.id}:${parement.face}`, 'plate');
                }
                const candidates = (0, catalogueUtils_js_6.getPackageCandidates)([selected.article]);
                needs.push({
                    id: `need:plate:${wall.id}:${parement.face}`,
                    label: `${selected.article.label} — ${wall.label} face ${parement.face}`,
                    quantity: usedCount,
                    unit: 'unit',
                    lossPct,
                    articleCatalogueId: selected.article.id,
                    packageCandidates: candidates,
                    inputRefs: [
                        `${path}.hauteurM`,
                        `${p}.typePlaque`,
                        `${p}.nombrePeaux`,
                        ...(input.overrides.pertePlaquesPct !== undefined ? ['overrides.pertePlaquesPct'] : []),
                    ],
                    metadata: {
                        plateAreaM2: (0, money_js_7.roundQuantity)(plateArea),
                        theoreticalCount: (0, money_js_7.roundQuantity)(theoreticalCount),
                        commercialHeightM: selected.article.heightM ?? 0,
                        verticalSegments: selected.verticalSegments,
                        purchasedSurfaceM2: (0, money_js_7.roundQuantity)(usedCount * plateArea),
                        typeSurchargeIncluded: selected.article.purchasePricingIncludesTypeSurcharge ?? false,
                        plateType: parement.typePlaque,
                    },
                });
                horizontalJointMlByFaceKey[`${wall.id}:${parement.face}`] = (0, money_js_7.roundQuantity)(selected.horizontalJointMl * parement.nombrePeaux);
                ctx.trace({
                    engine: 'plate',
                    inputRefs: [`${path}.hauteurM`, `${p}.typePlaque`, `${p}.nombrePeaux`],
                    formula: selected.verticalSegments > 1
                        ? 'nbPlaques = ceil(surfaceNetteFace / hauteurMur / largeurPlaque) × segmentsVerticaux × nombrePeaux, puis perte explicite'
                        : 'nbPlaques = ceil((surfaceNetteFace × nombrePeaux / surfacePlaqueCommerciale) × (1 + perteExplicite))',
                    rawResult: countAfterExplicitLoss,
                    roundedResult: usedCount,
                    unit: 'plate',
                    source: quantityOverride !== undefined ? 'manual_override' : 'catalogue',
                    warnings: [
                        'Estimation par surface : aucun calepinage 2D ni réemploi automatique des chutes.',
                        ...(selected.horizontalJointMl > 0 ? ['Hauteur supérieure au plus grand format : joints horizontaux présents.'] : []),
                    ],
                });
            });
        });
        return { needs, horizontalJointMlByFaceKey };
    };
    exports.calculatePlateNeeds = calculatePlateNeeds;
    const selectPlate = (catalogue, typePlaque, wallHeightM, wallLengthM, widthM) => {
        const available = catalogue.articles
            .filter((article) => article.family === 'plate')
            .filter((article) => article.plateType === typePlaque)
            .filter((article) => article.widthM === widthM)
            .filter((article) => article.heightM !== undefined)
            .sort((a, b) => (a.heightM ?? 0) - (b.heightM ?? 0));
        if (available.length === 0)
            return undefined;
        const direct = available.find((article) => (article.heightM ?? 0) >= wallHeightM);
        if (direct)
            return { article: direct, horizontalJointMl: 0, verticalSegments: 1 };
        const largest = available.at(-1);
        if (!largest?.heightM)
            return undefined;
        const segments = Math.ceil(wallHeightM / largest.heightM);
        return {
            article: largest,
            horizontalJointMl: segments > 1 ? wallLengthM * (segments - 1) : 0,
            verticalSegments: segments,
        };
    };
    const calculateSegmentedPlateCount = (netFaceM2, wallHeightM, plateWidthM, verticalSegments, skins) => {
        if (wallHeightM <= 0 || plateWidthM <= 0)
            return 0;
        // Estimation transparente sans calepinage 2D : la surface nette est convertie en
        // largeur équivalente, puis chaque colonne nécessite tous les segments verticaux.
        const equivalentNetWidthM = netFaceM2 / wallHeightM;
        const columns = Math.ceil(equivalentNetWidthM / plateWidthM);
        return columns * verticalSegments * skins;
    };
});
define("core/engines/pricingEngine", ["require", "exports", "core/money"], function (require, exports, money_js_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildSaleLines = void 0;
    const buildSaleLines = (input, needs, orders, labor, directSales, company, ctx) => {
        const lines = [];
        const pricing = input.overrides.materialPricing ?? company.materialPricing;
        if (!pricing)
            return lines;
        if (input.overrides.materialPricing !== undefined) {
            ctx.fields.consume('overrides.materialPricing.mode', 'pricing');
            ctx.fields.consume('overrides.materialPricing.value', 'pricing');
        }
        orders.forEach((order) => {
            if (order.internalOnly)
                return;
            const need = needs.find((item) => item.id === order.needId);
            let purchaseCost = order.purchaseCostHtCents;
            const surcharge = calculatePlateSurchargeCents(need, order, company);
            purchaseCost += surcharge;
            const totalSale = (0, money_js_8.applyMaterialPricing)(purchaseCost, pricing);
            const lineId = `sale:material:${order.needId}`;
            const overriddenUnit = input.overrides.prixVenteLignesCents?.[lineId];
            if (overriddenUnit !== undefined) {
                ctx.fields.consume(`overrides.prixVenteLignesCents.${lineId}`, 'pricing');
            }
            lines.push({
                id: lineId,
                source: 'material_margin',
                label: order.label,
                quantity: 1,
                unit: 'forfait_materiaux',
                unitSaleHtCents: overriddenUnit ?? totalSale,
                totalHtCents: overriddenUnit ?? totalSale,
                vatRate: 20,
                includedExactlyOnce: true,
                inputRefs: need?.inputRefs ?? [],
                ...(need?.energyEligible === true ? { energyEligible: true } : {}),
            });
            ctx.trace({
                engine: 'pricing',
                inputRefs: need?.inputRefs ?? [],
                formula: pricing.mode === 'markup_pct'
                    ? 'venteMatériau = coûtAchat × (1 + marge/100)'
                    : 'venteMatériau = coûtAchat × coefficient',
                rawResult: totalSale,
                roundedResult: totalSale,
                unit: 'centime EUR',
                source: overriddenUnit !== undefined ? 'manual_override' : 'company_settings',
                warnings: surcharge > 0 ? [`Plus-value type de plaque ajoutée au coût d’achat : ${surcharge} centimes.`] : [],
            });
        });
        labor.filter((line) => line.billable).forEach((laborLine) => {
            const lineId = `sale:${laborLine.id}`;
            const override = input.overrides.prixVenteLignesCents?.[lineId];
            if (override !== undefined)
                ctx.fields.consume(`overrides.prixVenteLignesCents.${lineId}`, 'pricing');
            const total = override ?? laborLine.saleHtCents;
            lines.push({
                id: lineId,
                source: 'labor',
                label: laborLine.label,
                quantity: laborLine.hours,
                unit: 'h',
                unitSaleHtCents: laborLine.hours > 0 ? (0, money_js_8.roundCents)(total / laborLine.hours) : 0,
                totalHtCents: total,
                vatRate: 20,
                includedExactlyOnce: true,
                inputRefs: laborLine.inputRefs,
            });
        });
        directSales.forEach((seed) => {
            const override = input.overrides.prixVenteLignesCents?.[seed.id];
            if (override !== undefined)
                ctx.fields.consume(`overrides.prixVenteLignesCents.${seed.id}`, 'pricing');
            const unitPrice = override ?? seed.unitSaleHtCents;
            lines.push({
                id: seed.id,
                source: seed.source,
                label: seed.label,
                quantity: seed.quantity,
                unit: seed.unit,
                unitSaleHtCents: unitPrice,
                totalHtCents: (0, money_js_8.multiplyCents)(unitPrice, seed.quantity),
                vatRate: 20,
                includedExactlyOnce: true,
                inputRefs: seed.inputRefs,
                ...(seed.energyEligible !== undefined ? { energyEligible: seed.energyEligible } : {}),
            });
        });
        const duplicateIds = lines
            .map((line) => line.id)
            .filter((id, index, all) => all.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            throw new Error(`SaleLine dupliquée : ${[...new Set(duplicateIds)].join(', ')}`);
        }
        return lines;
    };
    exports.buildSaleLines = buildSaleLines;
    const calculatePlateSurchargeCents = (need, order, company) => {
        if (!need?.metadata)
            return 0;
        if (need.metadata.typeSurchargeIncluded === true)
            return 0;
        const plateType = need.metadata.plateType;
        const purchasedSurfaceM2 = need.metadata.purchasedSurfaceM2;
        if (typeof plateType !== 'string' || typeof purchasedSurfaceM2 !== 'number')
            return 0;
        const rule = company.plaquisteConfig.plate.surchargePurchaseCentsPerM2[plateType];
        if (!rule)
            return 0;
        return (0, money_js_8.roundCents)(rule.value * purchasedSurfaceM2);
    };
});
define("core/engines/surfaceEngine", ["require", "exports", "core/modelUtils", "core/money"], function (require, exports, modelUtils_js_8, money_js_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculateGeometry = void 0;
    const calculateGeometry = (input, ctx) => {
        const walls = [];
        const ceilings = [];
        (0, modelUtils_js_8.getWallsWithPaths)(input).forEach(({ wall, path, pieceId }) => {
            ctx.fields.consume(`${path}.actif`, 'surface');
            if (!wall.actif)
                return;
            ctx.fields.consume(`${path}.longueurM`, 'surface');
            ctx.fields.consume(`${path}.hauteurM`, 'surface');
            ctx.fields.consume(`${path}.typeParoi`, 'surface');
            ctx.fields.consume(`${path}.label`, 'surface');
            const gross = wall.longueurM * wall.hauteurM;
            const openings = wall.ouvertures.reduce((sum, opening, index) => {
                const p = `${path}.ouvertures[${index}]`;
                ctx.fields.consume(`${p}.largeurM`, 'surface');
                ctx.fields.consume(`${p}.hauteurM`, 'surface');
                ctx.fields.consume(`${p}.quantite`, 'surface');
                return sum + opening.largeurM * opening.hauteurM * opening.quantite;
            }, 0);
            const net = Math.max(0, gross - openings);
            const faces = wall.parements
                .map((face, index) => ({ face, index }))
                .filter(({ face }) => face.actif)
                .map(({ face, index }) => {
                const p = `${path}.parements[${index}]`;
                ctx.fields.consume(`${p}.face`, 'surface');
                ctx.fields.consume(`${p}.actif`, 'surface');
                ctx.fields.consume(`${p}.nombrePeaux`, 'surface');
                const geometry = {
                    wallId: wall.id,
                    ...(pieceId ? { pieceId } : {}),
                    face: face.face,
                    grossM2: (0, money_js_9.roundQuantity)(gross),
                    openingsM2: (0, money_js_9.roundQuantity)(openings),
                    netM2: (0, money_js_9.roundQuantity)(net),
                    skins: face.nombrePeaux,
                    claddingM2: (0, money_js_9.roundQuantity)(net * face.nombrePeaux),
                };
                ctx.trace({
                    engine: 'surface',
                    inputRefs: [`${path}.longueurM`, `${path}.hauteurM`, ...wall.ouvertures.flatMap((_, i) => [
                            `${path}.ouvertures[${i}].largeurM`,
                            `${path}.ouvertures[${i}].hauteurM`,
                            `${path}.ouvertures[${i}].quantite`,
                        ])],
                    formula: 'surfaceNetteFace = max(0, longueur × hauteur - somme(ouvertures))',
                    rawResult: net,
                    roundedResult: geometry.netM2,
                    unit: 'm2',
                    source: 'guillaume_rule',
                    warnings: [],
                });
                return geometry;
            });
            walls.push({
                wallId: wall.id,
                ...(pieceId ? { pieceId } : {}),
                label: wall.label,
                typeParoi: wall.typeParoi,
                lengthM: wall.longueurM,
                heightM: wall.hauteurM,
                grossOneSideM2: (0, money_js_9.roundQuantity)(gross),
                openingsM2: (0, money_js_9.roundQuantity)(openings),
                netOneSideM2: (0, money_js_9.roundQuantity)(net),
                faces,
            });
        });
        input.pieces.forEach((piece, pieceIndex) => {
            const ceiling = piece.plafond;
            if (!ceiling?.actif)
                return;
            const p = `pieces[${pieceIndex}].plafond`;
            ctx.fields.consume(`${p}.actif`, 'surface');
            ctx.fields.consume(`${p}.type`, 'surface');
            ctx.fields.consume(`${p}.calculDepuisPiece`, 'surface');
            ctx.fields.consume(`${p}.nombrePeaux`, 'surface');
            let surface = 0;
            if (ceiling.calculDepuisPiece && ceiling.type === 'droit') {
                ctx.fields.consume(`pieces[${pieceIndex}].longueurM`, 'surface');
                ctx.fields.consume(`pieces[${pieceIndex}].largeurM`, 'surface');
                surface = piece.longueurM * piece.largeurM;
            }
            else {
                ctx.fields.consume(`${p}.surfaceSaisieM2`, 'surface');
                surface = ceiling.surfaceSaisieM2 ?? 0;
            }
            ceilings.push({
                pieceId: piece.id,
                type: ceiling.type,
                surfaceM2: (0, money_js_9.roundQuantity)(surface),
                skins: ceiling.nombrePeaux,
            });
            ctx.trace({
                engine: 'surface',
                inputRefs: ceiling.calculDepuisPiece && ceiling.type === 'droit'
                    ? [`pieces[${pieceIndex}].longueurM`, `pieces[${pieceIndex}].largeurM`]
                    : [`${p}.surfaceSaisieM2`],
                formula: ceiling.calculDepuisPiece && ceiling.type === 'droit'
                    ? 'surfacePlafondDroit = longueurPièce × largeurPièce'
                    : 'surfaceRampantOuPlafond = surface saisie par l’artisan',
                rawResult: surface,
                roundedResult: (0, money_js_9.roundQuantity)(surface),
                unit: 'm2',
                source: 'user',
                warnings: ceiling.type === 'droit' ? [] : ['Rampant : estimation simplifiée par plus-value.'],
            });
        });
        return {
            walls,
            ceilings,
            totalNetFaceM2: (0, money_js_9.roundQuantity)(walls.flatMap((wall) => wall.faces).reduce((sum, face) => sum + face.netM2, 0)),
            totalPlateM2: (0, money_js_9.roundQuantity)(walls.flatMap((wall) => wall.faces).reduce((sum, face) => sum + face.claddingM2, 0)),
            totalCeilingM2: (0, money_js_9.roundQuantity)(ceilings.reduce((sum, ceiling) => sum + ceiling.surfaceM2, 0)),
        };
    };
    exports.calculateGeometry = calculateGeometry;
});
define("core/engines/vatEngine", ["require", "exports", "core/money"], function (require, exports, money_js_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.totalizeExactlyOnce = exports.assignVat = void 0;
    const assignVat = async (input, saleLines, policy, ctx) => {
        const result = [];
        ctx.fields.consume('contexte.usageBatiment', 'vat');
        ctx.fields.consume('contexte.logementAcheveDepuisPlusDe2Ans', 'vat');
        ctx.fields.consume('contexte.renovationEnergetique', 'vat');
        ctx.fields.consume('contexte.tvaMode', 'vat');
        ctx.fields.consume('contexte.eligibiliteConfirmee', 'vat');
        if (input.contexte.tauxManuel !== undefined)
            ctx.fields.consume('contexte.tauxManuel', 'vat');
        for (const line of saleLines) {
            const override = input.overrides.tauxTvaLignes?.[line.id];
            let rate;
            if (override !== undefined) {
                rate = override;
                ctx.fields.consume(`overrides.tauxTvaLignes.${line.id}`, 'vat');
            }
            else if (input.contexte.tvaMode === 'manuel') {
                if (input.contexte.tauxManuel === undefined) {
                    throw new Error('Mode TVA manuel sans taux explicite.');
                }
                rate = input.contexte.tauxManuel;
            }
            else {
                rate = await policy.suggestRate(input.contexte, line);
            }
            result.push({ ...line, vatRate: rate });
            ctx.trace({
                engine: 'vat',
                inputRefs: [
                    'contexte.usageBatiment',
                    'contexte.logementAcheveDepuisPlusDe2Ans',
                    'contexte.renovationEnergetique',
                    'contexte.tvaMode',
                    'contexte.eligibiliteConfirmee',
                ],
                formula: `TVA par ligne selon politique ${policy.version}`,
                rawResult: rate,
                roundedResult: rate,
                unit: '%',
                source: override !== undefined ? 'manual_override' : 'system',
                warnings: [],
            });
        }
        return result;
    };
    exports.assignVat = assignVat;
    const totalizeExactlyOnce = (saleLines) => {
        const ids = new Set();
        for (const line of saleLines) {
            if (ids.has(line.id))
                throw new Error(`Double comptage détecté : ${line.id}`);
            ids.add(line.id);
            if (line.includedExactlyOnce !== true)
                throw new Error(`Ligne non marquée includedExactlyOnce : ${line.id}`);
        }
        const totalHtCents = saleLines.reduce((sum, line) => sum + line.totalHtCents, 0);
        const byRateCents = {};
        saleLines.forEach((line) => {
            const vat = (0, money_js_10.roundCents)((line.totalHtCents * line.vatRate) / 100);
            const key = String(line.vatRate);
            byRateCents[key] = (byRateCents[key] ?? 0) + vat;
        });
        const totalVatCents = Object.values(byRateCents).reduce((sum, value) => sum + value, 0);
        return {
            vat: { byRateCents, totalVatCents },
            totals: {
                totalHtCents,
                totalVatCents,
                totalTtcCents: totalHtCents + totalVatCents,
            },
        };
    };
    exports.totalizeExactlyOnce = totalizeExactlyOnce;
});
define("core/calculatePlaquiste", ["require", "exports", "core/context", "core/errors", "core/fieldTags", "core/normalize", "core/validate", "core/engines/ceilingEngine", "core/engines/directOptionsEngine", "core/engines/finishEngine", "core/engines/framingEngine", "core/engines/isolationEngine", "core/engines/laborEngine", "core/engines/orderEngine", "core/engines/plateEngine", "core/engines/pricingEngine", "core/engines/surfaceEngine", "core/engines/vatEngine"], function (require, exports, context_js_1, errors_js_9, fieldTags_js_1, normalize_js_1, validate_js_1, ceilingEngine_js_1, directOptionsEngine_js_1, finishEngine_js_1, framingEngine_js_1, isolationEngine_js_1, laborEngine_js_1, orderEngine_js_1, plateEngine_js_1, pricingEngine_js_1, surfaceEngine_js_1, vatEngine_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.calculatePlaquisteV2 = exports.PLAQUISTE_ENGINE_VERSION = void 0;
    exports.PLAQUISTE_ENGINE_VERSION = 'plaquiste-v2.1.0';
    const calculatePlaquisteV2 = async (rawInput, dependencies) => {
        const input = (0, normalize_js_1.normalizePlaquiste)(rawInput);
        const ctx = (0, context_js_1.createCalculationContext)();
        (0, fieldTags_js_1.registerPlaquisteInputFields)(input, ctx);
        const validation = (0, validate_js_1.validatePlaquisteInput)(input, dependencies.catalogue, dependencies.company, ctx);
        throwIfBlocking(validation);
        const geometry = (0, surfaceEngine_js_1.calculateGeometry)(input, ctx);
        const plate = (0, plateEngine_js_1.calculatePlateNeeds)(input, geometry, dependencies.catalogue, dependencies.company.plaquisteConfig, ctx);
        const framingNeeds = (0, framingEngine_js_1.calculateFramingNeeds)(input, geometry, dependencies.catalogue, dependencies.company.plaquisteConfig, ctx);
        const ceiling = (0, ceilingEngine_js_1.calculateCeilingNeeds)(input, geometry, dependencies.catalogue, dependencies.company.plaquisteConfig, ctx);
        const isolation = (0, isolationEngine_js_1.calculateIsolationNeeds)(input, geometry, dependencies.catalogue, dependencies.company.plaquisteConfig, ctx);
        const finish = (0, finishEngine_js_1.calculateFinishNeeds)(input, geometry, dependencies.catalogue, dependencies.company.plaquisteConfig, plate.horizontalJointMlByFaceKey, ctx);
        const directOptions = (0, directOptionsEngine_js_1.calculateDirectOptions)(input, geometry, dependencies.catalogue, dependencies.company.plaquisteConfig, ctx);
        mergeContextAlerts(validation, ctx.getWarnings());
        throwIfBlocking(validation);
        const needs = [
            ...plate.needs,
            ...framingNeeds,
            ...ceiling.needs,
            ...isolation.needs,
            ...finish.needs,
            ...directOptions.needs,
        ];
        const orders = (0, orderEngine_js_1.resolveOrders)(input, needs, dependencies.stock, ctx);
        mergeContextAlerts(validation, ctx.getWarnings());
        throwIfBlocking(validation);
        const labor = (0, laborEngine_js_1.calculateLabor)(input, geometry, dependencies.company, ctx);
        const directSales = [
            ...ceiling.directSales,
            ...isolation.directSales,
            ...finish.directSales,
            ...directOptions.directSales,
        ];
        const preVatSale = (0, pricingEngine_js_1.buildSaleLines)(input, needs, orders, labor, directSales, dependencies.company, ctx);
        const sale = await (0, vatEngine_js_1.assignVat)(input, preVatSale, dependencies.vatPolicy, ctx);
        const { vat, totals } = (0, vatEngine_js_1.totalizeExactlyOnce)(sale);
        const unused = ctx.fields.getUnusedArtisanFields();
        if (unused.length > 0) {
            unused.forEach((field) => {
                validation.blocking.push({
                    code: 'PLQ-V2-009',
                    condition: 'Donnée saisie non consommée par le moteur',
                    message: `La donnée « ${field.path} » n’est reliée à aucun calcul, commande, prix, temps, alerte ou justification.`,
                    level: 'blocking',
                    fieldRefs: [field.path],
                    details: { tag: field.tag, value: field.value },
                });
            });
            throwIfBlocking(validation);
        }
        const stockLines = orders.map((order) => ({
            needId: order.needId,
            requiredQuantity: order.requiredQuantity,
            stockUsedQuantity: order.stockUsedQuantity,
            toOrderQuantity: order.toOrderPackages.reduce((sum, item) => sum + item.packageCount * item.packageQuantity, 0),
        }));
        return {
            engineVersion: exports.PLAQUISTE_ENGINE_VERSION,
            input,
            validation,
            geometry,
            needs,
            orders,
            labor,
            sale,
            vat,
            totals,
            stock: {
                disponible: orders.every((order) => order.toOrderPackages.length === 0),
                lines: stockLines,
            },
            trace: ctx.getTrace(),
            fieldAudit: ctx.fields.getAudit(),
        };
    };
    exports.calculatePlaquisteV2 = calculatePlaquisteV2;
    const mergeContextAlerts = (validation, alerts) => {
        alerts.forEach((item) => {
            const alreadyPresent = [...validation.blocking, ...validation.warnings].some((existing) => existing.code === item.code &&
                existing.message === item.message &&
                existing.fieldRefs.join('|') === item.fieldRefs.join('|'));
            if (alreadyPresent)
                return;
            if (['blocking', 'blocking_order', 'blocking_quote'].includes(item.level)) {
                validation.blocking.push(item);
            }
            else {
                validation.warnings.push(item);
            }
        });
    };
    const throwIfBlocking = (validation) => {
        if (validation.blocking.length > 0)
            throw new errors_js_9.PlaquisteValidationError(validation);
    };
});
define("core/index", ["require", "exports", "core/types", "core/config", "core/errors", "core/calculatePlaquiste", "core/engines/orderEngine"], function (require, exports, types_js_1, config_js_1, errors_js_10, calculatePlaquiste_js_1, orderEngine_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(types_js_1, exports);
    __exportStar(config_js_1, exports);
    __exportStar(errors_js_10, exports);
    __exportStar(calculatePlaquiste_js_1, exports);
    __exportStar(orderEngine_js_2, exports);
});
define("connectors/interfaces", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("connectors/runtime", ["require", "exports", "core/calculatePlaquiste", "core/errors"], function (require, exports, calculatePlaquiste_js_2, errors_js_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlaquisteModuleRuntime = void 0;
    class PlaquisteModuleRuntime {
        connectors;
        constructor(connectors) {
            this.connectors = connectors;
        }
        async calculate(input) {
            const identity = await this.connectors.identity.getCurrentIdentity();
            const enabled = await this.connectors.featureFlag.isEnabled('plaquiste_v2', identity.companyId);
            if (!enabled) {
                throw new Error('Le feature flag plaquiste_v2 est désactivé pour cette entreprise.');
            }
            const [catalogue, company] = await Promise.all([
                this.connectors.catalogue.getPlaquisteSnapshot(identity.companyId),
                this.connectors.companySettings.getPlaquistePricingSettings(identity.companyId),
            ]);
            const stock = await this.connectors.stock.getStockSnapshot(identity.companyId, catalogue);
            try {
                const result = await (0, calculatePlaquiste_js_2.calculatePlaquisteV2)(input, {
                    catalogue,
                    company,
                    stock,
                    vatPolicy: this.connectors.vatPolicy,
                });
                await this.connectors.alert.report(identity.companyId, input.id, [...result.validation.blocking, ...result.validation.warnings]);
                return result;
            }
            catch (error) {
                if (error instanceof errors_js_11.PlaquisteValidationError) {
                    await this.connectors.alert.report(identity.companyId, input.id, [...error.validation.blocking, ...error.validation.warnings]);
                }
                throw error;
            }
        }
        async calculateAndPersist(input) {
            const identity = await this.connectors.identity.getCurrentIdentity();
            await this.connectors.persistence.saveDraft(identity.companyId, identity.userId, input);
            const result = await this.calculate(input);
            await this.connectors.persistence.saveResult(identity.companyId, identity.userId, result);
            return result;
        }
        async exportToSpeedArti(result) {
            const identity = await this.connectors.identity.getCurrentIdentity();
            await Promise.all([
                this.connectors.salesDocument.exportSaleLines(identity.companyId, result.input.id, result.sale),
                this.connectors.order.exportOrderLines(identity.companyId, result.input.id, result.orders),
            ]);
        }
    }
    exports.PlaquisteModuleRuntime = PlaquisteModuleRuntime;
});
define("connectors/speedarti/connectorErrors", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiConnectorError = void 0;
    class SpeedArtiConnectorError extends Error {
        code;
        connector;
        details;
        constructor(code, connector, message, details) {
            super(message);
            this.code = code;
            this.connector = connector;
            this.details = details;
            this.name = 'SpeedArtiConnectorError';
        }
    }
    exports.SpeedArtiConnectorError = SpeedArtiConnectorError;
});
define("connectors/speedarti/contracts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("connectors/speedarti/guards", ["require", "exports", "connectors/speedarti/connectorErrors"], function (require, exports, connectorErrors_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.requireVatRate = exports.requireFeatureFlag = exports.requirePlaquisteInputOrNull = exports.requireStockSnapshot = exports.requireCompanySettings = exports.requireCatalogueSnapshot = exports.requireIdentity = void 0;
    const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
    const fail = (code, connector, message, details) => {
        throw new connectorErrors_js_1.SpeedArtiConnectorError(code, connector, message, details);
    };
    const requireIdentity = (value) => {
        if (!isRecord(value))
            fail('PLQ-CONNECTOR-IDENTITY', 'identity', 'Identité SpeedArti absente ou invalide.');
        const record = value;
        const companyId = record.companyId;
        const userId = record.userId;
        if (typeof companyId !== 'string' || companyId.trim() === '' || typeof userId !== 'string' || userId.trim() === '') {
            fail('PLQ-CONNECTOR-IDENTITY', 'identity', 'La société et l’utilisateur connectés sont obligatoires.');
        }
        return { companyId: companyId, userId: userId };
    };
    exports.requireIdentity = requireIdentity;
    const requireCatalogueSnapshot = (value) => {
        if (!isRecord(value) || typeof value.version !== 'string' || !Array.isArray(value.articles)) {
            fail('PLQ-CONNECTOR-CATALOGUE', 'catalogue', 'Le catalogue Plaquiste doit contenir une version et une liste d’articles.');
        }
        const record = value;
        const rawArticles = record.articles;
        const articles = rawArticles.map((article, index) => requireCatalogueArticle(article, index));
        const duplicateIds = articles.map((article) => article.id).filter((id, index, all) => all.indexOf(id) !== index);
        if (duplicateIds.length) {
            fail('PLQ-CONNECTOR-CATALOGUE', 'catalogue', 'Des identifiants catalogue sont dupliqués.', { duplicateIds: [...new Set(duplicateIds)] });
        }
        return { version: record.version, articles };
    };
    exports.requireCatalogueSnapshot = requireCatalogueSnapshot;
    const requireCatalogueArticle = (value, index) => {
        if (!isRecord(value))
            fail('PLQ-CONNECTOR-CATALOGUE', 'catalogue', `Article catalogue ${index} invalide.`);
        const record = value;
        const mandatoryStrings = ['id', 'stableCode', 'label', 'family', 'technicalUnit', 'purchaseUnit'];
        mandatoryStrings.forEach((field) => {
            if (typeof record[field] !== 'string' || String(record[field]).trim() === '') {
                fail('PLQ-CONNECTOR-CATALOGUE', 'catalogue', `Champ ${field} absent sur l’article ${index}.`, { index, field });
            }
        });
        if (typeof record.packageQuantity !== 'number' || !Number.isFinite(record.packageQuantity) || record.packageQuantity <= 0) {
            fail('PLQ-CONNECTOR-CATALOGUE', 'catalogue', `Conditionnement invalide sur l’article ${index}.`, { index });
        }
        return record;
    };
    const requireCompanySettings = (value) => {
        if (!isRecord(value) || !isRecord(value.plaquisteConfig)) {
            fail('PLQ-CONNECTOR-SETTINGS', 'companySettings', 'La configuration métier Plaquiste est absente.');
        }
        const record = value;
        if (record.hourlyRateCents !== undefined && (typeof record.hourlyRateCents !== 'number' || record.hourlyRateCents < 0)) {
            fail('PLQ-CONNECTOR-SETTINGS', 'companySettings', 'Le taux horaire entreprise est invalide.');
        }
        if (record.materialPricing !== undefined && !isRecord(record.materialPricing)) {
            fail('PLQ-CONNECTOR-SETTINGS', 'companySettings', 'La méthode de valorisation matière est invalide.');
        }
        return record;
    };
    exports.requireCompanySettings = requireCompanySettings;
    const requireStockSnapshot = (value) => {
        if (!isRecord(value) || !isRecord(value.technicalQuantityByArticleId)) {
            fail('PLQ-CONNECTOR-STOCK', 'stock', 'Le stock Plaquiste doit être indexé par identifiant article.');
        }
        const record = value;
        Object.entries(record.technicalQuantityByArticleId).forEach(([articleId, quantity]) => {
            if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 0) {
                fail('PLQ-CONNECTOR-STOCK', 'stock', 'Une quantité de stock est invalide.', { articleId, quantity });
            }
        });
        return record;
    };
    exports.requireStockSnapshot = requireStockSnapshot;
    const requirePlaquisteInputOrNull = (value) => {
        if (value === null)
            return null;
        if (!isRecord(value) || value.schemaVersion !== 2) {
            fail('PLQ-CONNECTOR-PERSISTENCE', 'persistence', 'Le calcul chargé n’est pas un schéma Plaquiste V2.');
        }
        return value;
    };
    exports.requirePlaquisteInputOrNull = requirePlaquisteInputOrNull;
    const requireFeatureFlag = (value) => {
        if (typeof value !== 'boolean') {
            fail('PLQ-CONNECTOR-FEATURE-FLAG', 'featureFlag', 'Le feature flag plaquiste_v2 doit être un booléen explicite.');
        }
        return value;
    };
    exports.requireFeatureFlag = requireFeatureFlag;
    const requireVatRate = (value) => {
        if (value !== 5.5 && value !== 10 && value !== 20) {
            fail('PLQ-CONNECTOR-VAT', 'vatPolicy', 'Le connecteur TVA a renvoyé un taux non autorisé.', { value });
        }
        return value;
    };
    exports.requireVatRate = requireVatRate;
});
define("connectors/speedarti/adapters/alertAdapter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiAlertAdapter = void 0;
    class SpeedArtiAlertAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        report(companyId, calculationId, alerts) {
            return this.gateway.writePlaquisteAlerts(companyId, calculationId, alerts);
        }
    }
    exports.SpeedArtiAlertAdapter = SpeedArtiAlertAdapter;
});
define("connectors/speedarti/adapters/catalogueAdapter", ["require", "exports", "connectors/speedarti/guards"], function (require, exports, guards_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiCatalogueAdapter = void 0;
    class SpeedArtiCatalogueAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        async getPlaquisteSnapshot(companyId) {
            return (0, guards_js_1.requireCatalogueSnapshot)(await this.gateway.readPlaquisteCatalogue(companyId));
        }
    }
    exports.SpeedArtiCatalogueAdapter = SpeedArtiCatalogueAdapter;
});
define("connectors/speedarti/adapters/companySettingsAdapter", ["require", "exports", "connectors/speedarti/guards"], function (require, exports, guards_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiCompanySettingsAdapter = void 0;
    class SpeedArtiCompanySettingsAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        async getPlaquistePricingSettings(companyId) {
            return (0, guards_js_2.requireCompanySettings)(await this.gateway.readPlaquisteCompanySettings(companyId));
        }
    }
    exports.SpeedArtiCompanySettingsAdapter = SpeedArtiCompanySettingsAdapter;
});
define("connectors/speedarti/adapters/featureFlagAdapter", ["require", "exports", "connectors/speedarti/guards"], function (require, exports, guards_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiFeatureFlagAdapter = void 0;
    class SpeedArtiFeatureFlagAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        async isEnabled(flag, companyId) {
            return (0, guards_js_3.requireFeatureFlag)(await this.gateway.readFeatureFlag(flag, companyId));
        }
    }
    exports.SpeedArtiFeatureFlagAdapter = SpeedArtiFeatureFlagAdapter;
});
define("connectors/speedarti/adapters/identityAdapter", ["require", "exports", "connectors/speedarti/guards"], function (require, exports, guards_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiIdentityAdapter = void 0;
    class SpeedArtiIdentityAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        async getCurrentIdentity() {
            return (0, guards_js_4.requireIdentity)(await this.gateway.readCurrentIdentity());
        }
    }
    exports.SpeedArtiIdentityAdapter = SpeedArtiIdentityAdapter;
});
define("connectors/speedarti/adapters/navigationAdapter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiNavigationAdapter = void 0;
    class SpeedArtiNavigationAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        openCalculation(calculationId) {
            return this.gateway.openPlaquisteCalculation(calculationId);
        }
        openSalesDocument(documentId) {
            return this.gateway.openSalesDocument(documentId);
        }
        openCatalogueArticle(articleId) {
            return this.gateway.openCatalogueArticle(articleId);
        }
    }
    exports.SpeedArtiNavigationAdapter = SpeedArtiNavigationAdapter;
});
define("connectors/speedarti/adapters/orderAdapter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiOrderAdapter = void 0;
    class SpeedArtiOrderAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        exportOrderLines(companyId, calculationId, orders) {
            return this.gateway.writePlaquisteOrderLines(companyId, calculationId, orders);
        }
    }
    exports.SpeedArtiOrderAdapter = SpeedArtiOrderAdapter;
});
define("connectors/speedarti/adapters/persistenceAdapter", ["require", "exports", "connectors/speedarti/guards"], function (require, exports, guards_js_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiPersistenceAdapter = void 0;
    class SpeedArtiPersistenceAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        saveDraft(companyId, userId, input) {
            return this.gateway.writePlaquisteDraft(companyId, userId, input);
        }
        saveResult(companyId, userId, result) {
            return this.gateway.writePlaquisteResult(companyId, userId, result);
        }
        async loadCalculation(companyId, calculationId) {
            return (0, guards_js_5.requirePlaquisteInputOrNull)(await this.gateway.readPlaquisteCalculation(companyId, calculationId));
        }
    }
    exports.SpeedArtiPersistenceAdapter = SpeedArtiPersistenceAdapter;
});
define("connectors/speedarti/adapters/salesDocumentAdapter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiSalesDocumentAdapter = void 0;
    class SpeedArtiSalesDocumentAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        exportSaleLines(companyId, calculationId, lines) {
            return this.gateway.writePlaquisteSaleLines(companyId, calculationId, lines);
        }
    }
    exports.SpeedArtiSalesDocumentAdapter = SpeedArtiSalesDocumentAdapter;
});
define("connectors/speedarti/adapters/stockAdapter", ["require", "exports", "connectors/speedarti/guards"], function (require, exports, guards_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiStockAdapter = void 0;
    class SpeedArtiStockAdapter {
        gateway;
        constructor(gateway) {
            this.gateway = gateway;
        }
        async getStockSnapshot(companyId, catalogue) {
            return (0, guards_js_6.requireStockSnapshot)(await this.gateway.readPlaquisteStock(companyId, catalogue));
        }
    }
    exports.SpeedArtiStockAdapter = SpeedArtiStockAdapter;
});
define("connectors/speedarti/adapters/vatPolicyAdapter", ["require", "exports", "connectors/speedarti/guards"], function (require, exports, guards_js_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpeedArtiVatPolicyAdapter = void 0;
    class SpeedArtiVatPolicyAdapter {
        gateway;
        version;
        constructor(gateway) {
            this.gateway = gateway;
            this.version = gateway.version;
        }
        async suggestRate(context, line) {
            return (0, guards_js_7.requireVatRate)(await this.gateway.suggestPlaquisteVatRate(context, line));
        }
    }
    exports.SpeedArtiVatPolicyAdapter = SpeedArtiVatPolicyAdapter;
});
define("connectors/speedarti/createSpeedArtiConnectors", ["require", "exports", "connectors/speedarti/adapters/alertAdapter", "connectors/speedarti/adapters/catalogueAdapter", "connectors/speedarti/adapters/companySettingsAdapter", "connectors/speedarti/adapters/featureFlagAdapter", "connectors/speedarti/adapters/identityAdapter", "connectors/speedarti/adapters/navigationAdapter", "connectors/speedarti/adapters/orderAdapter", "connectors/speedarti/adapters/persistenceAdapter", "connectors/speedarti/adapters/salesDocumentAdapter", "connectors/speedarti/adapters/stockAdapter", "connectors/speedarti/adapters/vatPolicyAdapter"], function (require, exports, alertAdapter_js_1, catalogueAdapter_js_1, companySettingsAdapter_js_1, featureFlagAdapter_js_1, identityAdapter_js_1, navigationAdapter_js_1, orderAdapter_js_1, persistenceAdapter_js_1, salesDocumentAdapter_js_1, stockAdapter_js_1, vatPolicyAdapter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSpeedArtiConnectors = void 0;
    /**
     * Fabrique finale à utiliser dans le dépôt SpeedArti.
     * Elle ne contient aucune URL, table Supabase, clé ou valeur par défaut.
     */
    const createSpeedArtiConnectors = (gateways) => ({
        identity: new identityAdapter_js_1.SpeedArtiIdentityAdapter(gateways.identity),
        catalogue: new catalogueAdapter_js_1.SpeedArtiCatalogueAdapter(gateways.catalogue),
        companySettings: new companySettingsAdapter_js_1.SpeedArtiCompanySettingsAdapter(gateways.companySettings),
        persistence: new persistenceAdapter_js_1.SpeedArtiPersistenceAdapter(gateways.persistence),
        salesDocument: new salesDocumentAdapter_js_1.SpeedArtiSalesDocumentAdapter(gateways.sales),
        stock: new stockAdapter_js_1.SpeedArtiStockAdapter(gateways.stock),
        order: new orderAdapter_js_1.SpeedArtiOrderAdapter(gateways.order),
        featureFlag: new featureFlagAdapter_js_1.SpeedArtiFeatureFlagAdapter(gateways.featureFlag),
        alert: new alertAdapter_js_1.SpeedArtiAlertAdapter(gateways.alert),
        vatPolicy: new vatPolicyAdapter_js_1.SpeedArtiVatPolicyAdapter(gateways.vat),
        ...(gateways.navigation ? { navigation: new navigationAdapter_js_1.SpeedArtiNavigationAdapter(gateways.navigation) } : {}),
    });
    exports.createSpeedArtiConnectors = createSpeedArtiConnectors;
});
define("connectors/speedarti/legacyMappers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapSaleLinesToSpeedArtiDraft = exports.mapLegacyToV2 = exports.canOpenAsPlaquisteV2 = void 0;
    const canOpenAsPlaquisteV2 = (payload) => payload.schemaVersion === 2;
    exports.canOpenAsPlaquisteV2 = canOpenAsPlaquisteV2;
    const mapLegacyToV2 = (_payload) => {
        throw new Error('Migration automatique interdite. Utiliser « Recréer en V2 » et ressaisir les murs/pièces.');
    };
    exports.mapLegacyToV2 = mapLegacyToV2;
    const mapSaleLinesToSpeedArtiDraft = (lines) => lines.map((line) => ({
        id: line.id,
        libelle: line.label,
        quantite: line.quantity,
        unite: line.unit,
        prix_unitaire_ht_centimes: line.unitSaleHtCents,
        total_ht_centimes: line.totalHtCents,
        taux_tva: line.vatRate,
    }));
    exports.mapSaleLinesToSpeedArtiDraft = mapSaleLinesToSpeedArtiDraft;
});
define("connectors/speedarti/index", ["require", "exports", "connectors/speedarti/connectorErrors", "connectors/speedarti/contracts", "connectors/speedarti/guards", "connectors/speedarti/createSpeedArtiConnectors", "connectors/speedarti/legacyMappers", "connectors/speedarti/adapters/alertAdapter", "connectors/speedarti/adapters/catalogueAdapter", "connectors/speedarti/adapters/companySettingsAdapter", "connectors/speedarti/adapters/featureFlagAdapter", "connectors/speedarti/adapters/identityAdapter", "connectors/speedarti/adapters/navigationAdapter", "connectors/speedarti/adapters/orderAdapter", "connectors/speedarti/adapters/persistenceAdapter", "connectors/speedarti/adapters/salesDocumentAdapter", "connectors/speedarti/adapters/stockAdapter", "connectors/speedarti/adapters/vatPolicyAdapter"], function (require, exports, connectorErrors_js_2, contracts_js_1, guards_js_8, createSpeedArtiConnectors_js_1, legacyMappers_js_1, alertAdapter_js_2, catalogueAdapter_js_2, companySettingsAdapter_js_2, featureFlagAdapter_js_2, identityAdapter_js_2, navigationAdapter_js_2, orderAdapter_js_2, persistenceAdapter_js_2, salesDocumentAdapter_js_2, stockAdapter_js_2, vatPolicyAdapter_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(connectorErrors_js_2, exports);
    __exportStar(contracts_js_1, exports);
    __exportStar(guards_js_8, exports);
    __exportStar(createSpeedArtiConnectors_js_1, exports);
    __exportStar(legacyMappers_js_1, exports);
    __exportStar(alertAdapter_js_2, exports);
    __exportStar(catalogueAdapter_js_2, exports);
    __exportStar(companySettingsAdapter_js_2, exports);
    __exportStar(featureFlagAdapter_js_2, exports);
    __exportStar(identityAdapter_js_2, exports);
    __exportStar(navigationAdapter_js_2, exports);
    __exportStar(orderAdapter_js_2, exports);
    __exportStar(persistenceAdapter_js_2, exports);
    __exportStar(salesDocumentAdapter_js_2, exports);
    __exportStar(stockAdapter_js_2, exports);
    __exportStar(vatPolicyAdapter_js_2, exports);
});
define("connectors/index", ["require", "exports", "connectors/interfaces", "connectors/runtime", "connectors/speedarti/index"], function (require, exports, interfaces_js_1, runtime_js_1, index_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(interfaces_js_1, exports);
    __exportStar(runtime_js_1, exports);
    __exportStar(index_js_1, exports);
});
define("connectors/mocks/mockCatalogue", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockCatalogueConnector = void 0;
    /**
     * Données de démonstration uniquement.
     * Les prix repris de l'annexe d'audit ne doivent pas être utilisés en production.
     */
    const articles = [
        plate('plate-ba13-250', 'BA13 1200 × 2500', 'BA13_STANDARD', 2.5, 890, true),
        plate('plate-ba13-260', 'BA13 1200 × 2600', 'BA13_STANDARD', 2.6, 940),
        plate('plate-ba13-280', 'BA13 1200 × 2800', 'BA13_STANDARD', 2.8, 1020),
        plate('plate-ba13-300', 'BA13 1200 × 3000', 'BA13_STANDARD', 3.0, 1090),
        profile('rail-r48-300', 'Rail R48 — 3,00 m', 'rail', 48, 3, 320),
        profile('rail-r70-300', 'Rail R70 — 3,00 m', 'rail', 70, 3, 390),
        profile('rail-r90-300', 'Rail R90 — 3,00 m', 'rail', 90, 3, 480),
        profile('rail-r100-300', 'Rail R100 — 3,00 m', 'rail', 100, 3, 530),
        profile('stud-m48-300', 'Montant M48 — 3,00 m', 'stud', 48, 3, 490),
        profile('stud-m70-300', 'Montant M70 — 3,00 m', 'stud', 70, 3, 620),
        profile('stud-m90-300', 'Montant M90 — 3,00 m', 'stud', 90, 3, 790),
        profile('stud-m100-300', 'Montant M100 — 3,00 m', 'stud', 100, 3, 870),
        {
            id: 'furring-f530-300',
            stableCode: 'F530-300',
            label: 'Fourrure F530 — 3,00 m',
            family: 'furring',
            technicalUnit: 'ml',
            purchaseUnit: 'bar',
            packageQuantity: 3,
            purchasePriceHtCents: 460,
            lengthM: 3,
            metadata: { optimaKind: 'furring', usage: 'optima' },
        },
        {
            id: 'furring-f530-530',
            stableCode: 'F530-530',
            label: 'Fourrure F530 — 5,30 m',
            family: 'furring',
            technicalUnit: 'ml',
            purchaseUnit: 'bar',
            packageQuantity: 5.3,
            purchasePriceHtCents: 820,
            lengthM: 5.3,
            metadata: { optimaKind: 'furring', usage: 'optima' },
        },
        {
            id: 'angle-cr2-300',
            stableCode: 'CR2-300',
            label: 'Cornière CR2 — 3,00 m',
            family: 'angle',
            technicalUnit: 'ml',
            purchaseUnit: 'bar',
            packageQuantity: 3,
            purchasePriceHtCents: 230,
            lengthM: 3,
        },
        {
            id: 'optima-clip-track-235', stableCode: 'OPTIMA-LISSE-CLIP-235', label: 'Lisse Clip Optima — 2,35 m',
            family: 'optima', technicalUnit: 'ml', purchaseUnit: 'bar', packageQuantity: 2.35,
            purchasePriceHtCents: 280, lengthM: 2.35, metadata: { optimaKind: 'clip_track', usage: 'optima' },
        },
        {
            id: 'optima-support', stableCode: 'OPTIMA-APPUI', label: 'Appui Optima — prix catalogue requis',
            family: 'optima', technicalUnit: 'unit', purchaseUnit: 'unit', packageQuantity: 1,
            metadata: { optimaKind: 'support', usage: 'optima' },
        },
        {
            id: 'optima-key', stableCode: 'OPTIMA-CLE', label: 'Clé Optima — prix catalogue requis',
            family: 'optima', technicalUnit: 'unit', purchaseUnit: 'unit', packageQuantity: 1,
            metadata: { optimaKind: 'key', usage: 'optima' },
        },
        {
            id: 'optima-fixing', stableCode: 'OPTIMA-FIXATION', label: 'Fixation appui Optima — prix catalogue requis',
            family: 'optima', technicalUnit: 'unit', purchaseUnit: 'unit', packageQuantity: 1,
            metadata: { optimaKind: 'fixing', usage: 'optima' },
        },
        hanger('hanger-90', 'Suspente courte 90 mm', 45, false),
        hanger('hanger-120', 'Suspente 120 mm', 55, true),
        hanger('hanger-180', 'Suspente 180 mm', 70, false),
        hanger('hanger-240', 'Suspente 240 mm', 85, false),
        hanger('hanger-300', 'Suspente 300 mm', 105, false),
        {
            id: 'screw-wall-25-500',
            stableCode: 'TTPC25-500-WALL',
            label: 'Vis TTPC 25 — boîte de 500',
            family: 'screw',
            technicalUnit: 'unit',
            purchaseUnit: 'box',
            packageQuantity: 500,
            purchasePriceHtCents: 580,
            metadata: { usage: 'wall' },
        },
        {
            id: 'screw-ceiling-25-500',
            stableCode: 'TTPC25-500-CEILING',
            label: 'Vis TTPC 25 plafond — boîte de 500',
            family: 'screw',
            technicalUnit: 'unit',
            purchaseUnit: 'box',
            packageQuantity: 500,
            purchasePriceHtCents: 580,
            metadata: { usage: 'ceiling' },
        },
        insulation('ldv-45', 'Laine de verre 45 mm', 'Minéral', 'Laine de verre', 45, 328, 'Cloison', 'panel_roll', undefined),
        insulation('ldr-45', 'Laine de roche 45 mm', 'Minéral', 'Laine de roche', 45, 492, 'Cloison coupe-feu/phonique', 'panel_roll', undefined),
        insulation('fdb-45', 'Fibre de bois 45 mm', 'Naturel', 'Fibre de bois', 45, 656, 'Cloison', 'panel_roll', undefined),
        insulation('ldv-70', 'Laine de verre 70 mm', 'Minéral', 'Laine de verre', 70, 410, 'Doublage', 'panel_roll', undefined),
        insulation('ldr-70', 'Laine de roche 70 mm', 'Minéral', 'Laine de roche', 70, 574, 'Doublage', 'panel_roll', undefined),
        insulation('fdb-70', 'Fibre de bois 70 mm', 'Naturel', 'Fibre de bois', 70, 820, 'Doublage', 'panel_roll', undefined),
        insulation('ldv-90', 'Laine de verre 90 mm', 'Minéral', 'Laine de verre', 90, 492, 'Cloison R90', 'panel_roll', undefined),
        insulation('ldr-90', 'Laine de roche 90 mm', 'Minéral', 'Laine de roche', 90, 656, 'Phonique', 'panel_roll', undefined),
        insulation('fdb-90', 'Fibre de bois 90 mm', 'Naturel', 'Fibre de bois', 90, 984, 'Phonique', 'panel_roll', undefined),
        insulation('ldv-100', 'Laine de verre 100 mm', 'Minéral', 'Laine de verre', 100, 574, 'ITI', 'panel_roll', undefined),
        insulation('ldr-100', 'Laine de roche 100 mm', 'Minéral', 'Laine de roche', 100, 738, 'ITI', 'panel_roll', undefined),
        insulation('fdb-100', 'Fibre de bois 100 mm', 'Naturel', 'Fibre de bois', 100, 1148, 'ITI', 'panel_roll', undefined),
        insulation('ldv-120', 'Laine de verre 120 mm', 'Minéral', 'Laine de verre', 120, 656, 'Combles', 'panel_roll', undefined),
        insulation('ldr-120', 'Laine de roche 120 mm', 'Minéral', 'Laine de roche', 120, 820, 'Combles', 'panel_roll', undefined),
        insulation('fdb-120', 'Fibre de bois 120 mm', 'Naturel', 'Fibre de bois', 120, 1312, 'Combles', 'panel_roll', undefined),
        insulation('ldv-140', 'Laine de verre 140 mm', 'Minéral', 'Laine de verre', 140, 738, 'Combles', 'panel_roll', undefined),
        insulation('ldr-140', 'Laine de roche 140 mm', 'Minéral', 'Laine de roche', 140, 902, 'Combles', 'panel_roll', undefined),
        insulation('fdb-140', 'Fibre de bois 140 mm', 'Naturel', 'Fibre de bois', 140, 1476, 'Combles', 'panel_roll', undefined),
        insulation('ldv-160', 'Laine de verre 160 mm', 'Minéral', 'Laine de verre', 160, 820, 'Combles', 'panel_roll', undefined),
        insulation('ldr-160', 'Laine de roche 160 mm', 'Minéral', 'Laine de roche', 160, 984, 'Combles', 'panel_roll', undefined),
        insulation('fdb-160', 'Fibre de bois 160 mm', 'Naturel', 'Fibre de bois', 160, 1640, 'Combles', 'panel_roll', undefined),
        insulation('pse-blanc-80', 'PSE blanc 80 mm', 'Synthétique', 'PSE blanc', 80, 738, 'ITE', 'panel_roll', undefined),
        insulation('pse-graphite-100', 'PSE graphité 100 mm', 'Synthétique', 'PSE graphité', 100, 1066, 'ITE', 'panel_roll', undefined),
        insulation('xps-80', 'XPS 80 mm', 'Synthétique', 'XPS', 80, 1312, 'Soubassement', 'panel_roll', undefined),
        insulation('pur-pir-80', 'PUR/PIR 80 mm', 'Synthétique', 'PUR/PIR', 80, 1804, 'Toiture terrasse', 'panel_roll', undefined),
        insulation('ouate-100', 'Ouate de cellulose 100 mm', 'Naturel', 'Ouate cellulose', 100, 902, 'Combles', 'panel_roll', undefined),
        insulation('chanvre-100', 'Chanvre 100 mm', 'Naturel', 'Chanvre', 100, 1230, 'ITI', 'panel_roll', undefined),
        insulation('lin-100', 'Lin 100 mm', 'Naturel', 'Lin', 100, 1312, 'ITI', 'panel_roll', undefined),
        insulation('liege-40', 'Liège expansé 40 mm', 'Naturel', 'Liège expansé', 40, 1968, 'ITE/sol', 'panel_roll', undefined),
        insulation('combles-souffle-ldv-200', 'Laine de verre soufflée 200 mm', 'Minéral', 'Laine de verre', 200, 800, 'Combles soufflés', 'blown', 5.0),
        insulation('combles-souffle-ldv-300', 'Laine de verre soufflée 300 mm', 'Minéral', 'Laine de verre', 300, 1100, 'Combles soufflés', 'blown', 7.5),
        insulation('combles-souffle-ldv-400', 'Laine de verre soufflée 400 mm', 'Minéral', 'Laine de verre', 400, 1400, 'Combles soufflés', 'blown', 10.0),
        insulation('combles-souffle-ldr-200', 'Laine de roche soufflée 200 mm', 'Minéral', 'Laine de roche', 200, 1000, 'Combles soufflés', 'blown', 5.4),
        insulation('combles-souffle-ldr-300', 'Laine de roche soufflée 300 mm', 'Minéral', 'Laine de roche', 300, 1300, 'Combles soufflés', 'blown', 8.1),
        insulation('combles-souffle-ouate-300', 'Ouate de cellulose soufflée 300 mm', 'Naturel', 'Ouate cellulose', 300, 1500, 'Combles soufflés', 'blown', 7.5),
        insulation('combles-souffle-ouate-400', 'Ouate de cellulose soufflée 400 mm', 'Naturel', 'Ouate cellulose', 400, 1900, 'Combles soufflés', 'blown', 10.0),
        insulation('combles-rouleau-ldv-200', 'Laine de verre rouleau 200 mm', 'Minéral', 'Laine de verre', 200, 900, 'Combles rouleaux', 'panel_roll', 5.0),
        insulation('combles-rouleau-ldv-240', 'Laine de verre rouleau 240 mm', 'Minéral', 'Laine de verre', 240, 1100, 'Combles rouleaux', 'panel_roll', 6.0),
        insulation('combles-rouleau-ldv-300', 'Laine de verre rouleau 300 mm', 'Minéral', 'Laine de verre', 300, 1400, 'Combles rouleaux', 'panel_roll', 7.5),
        insulation('combles-rouleau-ldr-200', 'Laine de roche rouleau 200 mm', 'Minéral', 'Laine de roche', 200, 1200, 'Combles rouleaux', 'panel_roll', 5.4),
        insulation('combles-rouleau-ldr-300', 'Laine de roche rouleau 300 mm', 'Minéral', 'Laine de roche', 300, 1600, 'Combles rouleaux', 'panel_roll', 8.1),
        insulation('combles-rouleau-fdb-200', 'Fibre de bois rouleau 200 mm', 'Naturel', 'Fibre de bois', 200, 2200, 'Combles rouleaux', 'panel_roll', 5.2),
        insulation('combles-rouleau-fdb-240', 'Fibre de bois rouleau 240 mm', 'Naturel', 'Fibre de bois', 240, 2500, 'Combles rouleaux', 'panel_roll', 6.3),
    ];
    class MockCatalogueConnector {
        async getPlaquisteSnapshot(_companyId) {
            return { version: 'mock-catalogue-abaque-v2-2026-08-05', articles: [...articles] };
        }
    }
    exports.MockCatalogueConnector = MockCatalogueConnector;
    function plate(id, label, plateType, heightM, priceCents, defaultForCeiling = false) {
        return {
            id,
            stableCode: id.toUpperCase(),
            label,
            family: 'plate',
            technicalUnit: 'unit',
            purchaseUnit: 'plate',
            packageQuantity: 1,
            purchasePriceHtCents: priceCents,
            plateType,
            widthM: 1.2,
            heightM,
            purchasePricingIncludesTypeSurcharge: true,
            metadata: { defaultForCeiling },
        };
    }
    function profile(id, label, family, widthMm, lengthM, priceCents) {
        return {
            id,
            stableCode: id.toUpperCase(),
            label,
            family,
            technicalUnit: 'ml',
            purchaseUnit: 'bar',
            packageQuantity: lengthM,
            purchasePriceHtCents: priceCents,
            profileWidthMm: widthMm,
            lengthM,
        };
    }
    function hanger(id, label, priceCents, defaultForCeiling) {
        return {
            id,
            stableCode: id.toUpperCase(),
            label,
            family: 'hanger',
            technicalUnit: 'unit',
            purchaseUnit: 'unit',
            packageQuantity: 1,
            purchasePriceHtCents: priceCents,
            metadata: { defaultForCeiling },
        };
    }
    function insulation(id, label, familyName, insulationType, thicknessMm, purchasePriceHtCents, usage, insulationKind, rApprox) {
        return {
            id,
            stableCode: `ABAQUE-V2-${id.toUpperCase()}`,
            label,
            family: 'insulation',
            technicalUnit: 'm2',
            purchaseUnit: 'pack',
            packageQuantity: 1,
            purchasePriceHtCents,
            metadata: {
                source: 'Abaque_isolants_generiques_maison_v2',
                familyName,
                insulationType,
                thicknessMm,
                usage,
                insulationKind,
                ...(rApprox !== undefined ? { rApprox } : {}),
                artisanEditable: true,
                priceNature: 'purchase_cost_to_margin',
            },
        };
    }
});
define("connectors/mocks/mockCompanySettings", ["require", "exports", "core/config"], function (require, exports, config_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockCompanySettingsConnector = void 0;
    class MockCompanySettingsConnector {
        settings;
        constructor(settings = {
            hourlyRateCents: 4500,
            materialPricing: { mode: 'markup_pct', value: 30 },
            plaquisteConfig: config_js_2.DEFAULT_PLAQUISTE_CONFIG,
        }) {
            this.settings = settings;
        }
        async getPlaquistePricingSettings(_companyId) {
            return this.settings;
        }
    }
    exports.MockCompanySettingsConnector = MockCompanySettingsConnector;
});
define("connectors/mocks/mockVatPolicy", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockVatPolicy = void 0;
    class MockVatPolicy {
        version = 'mock-policy-based-on-notice-2026-07-31';
        async suggestRate(context, line) {
            if (context.usageBatiment !== 'habitation' || context.logementAcheveDepuisPlusDe2Ans !== true) {
                return 20;
            }
            if (line.energyEligible === true && context.renovationEnergetique)
                return 5.5;
            return 10;
        }
    }
    exports.MockVatPolicy = MockVatPolicy;
});
define("connectors/mocks/memoryConnectors", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MemoryAlertConnector = exports.EnabledFeatureFlagConnector = exports.StaticIdentityConnector = exports.EmptyStockConnector = exports.MemoryOrderConnector = exports.MemorySalesDocumentConnector = exports.MemoryPersistenceConnector = void 0;
    class MemoryPersistenceConnector {
        drafts = new Map();
        results = new Map();
        async saveDraft(companyId, _userId, input) {
            this.drafts.set(`${companyId}:${input.id}`, structuredClone(input));
        }
        async saveResult(companyId, _userId, result) {
            this.results.set(`${companyId}:${result.input.id}`, structuredClone(result));
        }
        async loadCalculation(companyId, calculationId) {
            return this.drafts.get(`${companyId}:${calculationId}`) ?? null;
        }
    }
    exports.MemoryPersistenceConnector = MemoryPersistenceConnector;
    class MemorySalesDocumentConnector {
        exports = new Map();
        async exportSaleLines(companyId, calculationId, lines) {
            this.exports.set(`${companyId}:${calculationId}`, structuredClone(lines));
        }
    }
    exports.MemorySalesDocumentConnector = MemorySalesDocumentConnector;
    class MemoryOrderConnector {
        exports = new Map();
        async exportOrderLines(companyId, calculationId, orders) {
            this.exports.set(`${companyId}:${calculationId}`, structuredClone(orders));
        }
    }
    exports.MemoryOrderConnector = MemoryOrderConnector;
    class EmptyStockConnector {
        async getStockSnapshot(_companyId, _catalogue) {
            return { technicalQuantityByArticleId: {} };
        }
    }
    exports.EmptyStockConnector = EmptyStockConnector;
    class StaticIdentityConnector {
        async getCurrentIdentity() {
            return { companyId: 'company-demo', userId: 'user-demo' };
        }
    }
    exports.StaticIdentityConnector = StaticIdentityConnector;
    class EnabledFeatureFlagConnector {
        async isEnabled(_flag, _companyId) {
            return true;
        }
    }
    exports.EnabledFeatureFlagConnector = EnabledFeatureFlagConnector;
    class MemoryAlertConnector {
        alerts = new Map();
        async report(companyId, calculationId, alerts) {
            this.alerts.set(`${companyId}:${calculationId}`, structuredClone(alerts));
        }
    }
    exports.MemoryAlertConnector = MemoryAlertConnector;
});
define("connectors/mocks/createMockConnectors", ["require", "exports", "connectors/mocks/mockCatalogue", "connectors/mocks/mockCompanySettings", "connectors/mocks/mockVatPolicy", "connectors/mocks/memoryConnectors"], function (require, exports, mockCatalogue_js_1, mockCompanySettings_js_1, mockVatPolicy_js_1, memoryConnectors_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMockConnectors = void 0;
    const createMockConnectors = () => ({
        catalogue: new mockCatalogue_js_1.MockCatalogueConnector(),
        companySettings: new mockCompanySettings_js_1.MockCompanySettingsConnector(),
        persistence: new memoryConnectors_js_1.MemoryPersistenceConnector(),
        salesDocument: new memoryConnectors_js_1.MemorySalesDocumentConnector(),
        stock: new memoryConnectors_js_1.EmptyStockConnector(),
        order: new memoryConnectors_js_1.MemoryOrderConnector(),
        identity: new memoryConnectors_js_1.StaticIdentityConnector(),
        featureFlag: new memoryConnectors_js_1.EnabledFeatureFlagConnector(),
        alert: new memoryConnectors_js_1.MemoryAlertConnector(),
        vatPolicy: new mockVatPolicy_js_1.MockVatPolicy(),
    });
    exports.createMockConnectors = createMockConnectors;
});
define("connectors/mocks/index", ["require", "exports", "connectors/mocks/createMockConnectors", "connectors/mocks/mockCatalogue", "connectors/mocks/mockCompanySettings", "connectors/mocks/mockVatPolicy", "connectors/mocks/memoryConnectors"], function (require, exports, createMockConnectors_js_1, mockCatalogue_js_2, mockCompanySettings_js_2, mockVatPolicy_js_2, memoryConnectors_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(createMockConnectors_js_1, exports);
    __exportStar(mockCatalogue_js_2, exports);
    __exportStar(mockCompanySettings_js_2, exports);
    __exportStar(mockVatPolicy_js_2, exports);
    __exportStar(memoryConnectors_js_2, exports);
});
define("index", ["require", "exports", "core/index", "connectors/index", "connectors/mocks/index"], function (require, exports, index_js_2, index_js_3, index_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(index_js_2, exports);
    __exportStar(index_js_3, exports);
    __exportStar(index_js_4, exports);
});
(function (global) {
  'use strict';
  const runtime = global.__plaquisteAmdLoad('connectors/runtime');
  const mocks = global.__plaquisteAmdLoad('connectors/mocks/createMockConnectors');
  global.PlaquisteModuleRuntime = runtime.PlaquisteModuleRuntime;
  global.createMockConnectors = mocks.createMockConnectors;
})(globalThis);
