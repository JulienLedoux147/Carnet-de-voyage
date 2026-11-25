import { Router } from "express";
import db from "../db/connexion.js";
import {
  listerPaysDisponibles,
  obtenirPaysParCode,
} from "../services/restCountries.js";
import {
  normaliserSaisiePays,
  validerSaisiePays,
} from "../validation/pays.js";

const router = Router();

async function contexteApi() {
  try {
    return {
      // appelle listerPaysDisponibles() dans services/restCountries.js
      paysDisponibles: await listerPaysDisponibles(),
      avertissementApi: null,
    };
  } catch (erreur) {
    return {
      paysDisponibles: [],
      avertissementApi:
        "REST Countries est temporairement indisponible. Vous pouvez saisir le pays manuellement.",
    };
  }
}

async function afficherFormulaire(res, {
  titre = "Ajouter un pays",
  mode = "ajouter",
  pays = {},
  erreurs = [],
  avertissementApi = null,
  statutHttp = 200,
} = {}) {
  const api =
    mode === "ajouter"
      // appelle conextApi()
      ? await contexteApi()
      : { paysDisponibles: [], avertissementApi: null };

  //revoi formulaire.ejs au navigateur
  return res.status(statutHttp).render("formulaire", {
    titre,
    mode,
    pays,
    erreurs,
    paysDisponibles: api.paysDisponibles,
    avertissementApi: avertissementApi ?? api.avertissementApi,
  });
}

// IMPORTANT : /nouveau doit être déclaré AVANT /:id
// GET /pays/nouveau : formulaire d'ajout
router.get("/nouveau", async (req, res, next) => {
  try {
    return await afficherFormulaire(res);
  } catch (erreur) {
    return next(erreur);
  }
});

// POST /pays : valide et crée le pays
router.post("/", async (req, res, next) => {
  const saisie = normaliserSaisiePays(req.body);
  const erreurs = validerSaisiePays(saisie);
  let avertissementApi = null;

  try {
    if (/^[A-Z]{3}$/.test(saisie.code_cca3)) {
      const paysExistant = await db("pays")
        .whereRaw("UPPER(code_cca3) = ?", [saisie.code_cca3])
        .first();

      if (paysExistant) {
        erreurs.push({ champ: "code_cca3", message: "Ce pays se trouve déjà dans le carnet." });
      }
    }

    let donneesOfficielles = null;

    if (erreurs.length === 0) {
      try {
        donneesOfficielles = await obtenirPaysParCode(saisie.code_cca3);
      } catch (erreurApi) {
        avertissementApi =
          "REST Countries n’a pas répondu. Le pays sera enregistré avec les données saisies manuellement.";
      }
    }

    const nom = donneesOfficielles?.nom ?? saisie.nom;

    if (erreurs.length === 0 && !nom) {
      erreurs.push({
        champ: "nom",
        message: "Le nom du pays est obligatoire lorsque REST Countries est indisponible.",
      });
    }

    if (erreurs.length > 0) {
      return await afficherFormulaire(res, {
        pays: saisie,
        erreurs,
        avertissementApi,
        statutHttp: 400,
      });
    }

    // inserer le pay dans la db
    const [id] = await db("pays").insert({
      code_cca3: donneesOfficielles?.code_cca3 ?? saisie.code_cca3,
      nom,
      region: donneesOfficielles?.region ?? null,
      capitale: donneesOfficielles?.capitale ?? null,
      population: donneesOfficielles?.population ?? 0,
      drapeau_url: donneesOfficielles?.drapeau_url ?? null,
      api_mis_a_jour_le: donneesOfficielles ? db.fn.now() : null,
      statut: saisie.statut,
      date_visite: saisie.date_visite || null,
      note: saisie.note ? Number(saisie.note) : null,
      commentaire: saisie.commentaire || null,
    });

    return res.redirect(303, `/pays/${id}?ajoute=1`);
  } catch (erreur) {
    if (erreur.code === "SQLITE_CONSTRAINT") {
      return await afficherFormulaire(res, {
        pays: saisie,
        erreurs: [{ champ: "code_cca3", message: "Ce pays se trouve déjà dans le carnet." }],
        avertissementApi,
        statutHttp: 400,
      });
    }

    return next(erreur);
  }
});

// GET /pays/:id : fiche du pays, enrichie par REST Countries
router.get("/:id", async (req, res, next) => {
  try {
    let pays = await db("pays").where({ id: req.params.id }).first();

    if (!pays) {
      return res.status(404).render("erreur", {
        titre: "Pays introuvable",
        message: "Ce pays n’existe pas dans le carnet.",
      });
    }

    let avertissementApi = null;

    try {
      const donneesOfficielles = await obtenirPaysParCode(pays.code_cca3);

      await db("pays").where({ id: pays.id }).update({
        nom: donneesOfficielles.nom,
        region: donneesOfficielles.region,
        capitale: donneesOfficielles.capitale,
        population: donneesOfficielles.population,
        drapeau_url: donneesOfficielles.drapeau_url,
        api_mis_a_jour_le: db.fn.now(),
      });

      pays = { ...pays, ...donneesOfficielles };
    } catch (erreurApi) {
      avertissementApi =
        "REST Countries est indisponible. Les dernières données enregistrées sont affichées.";
    }

    //res.render(vue, données) --> pour le ejs
    //renvoi le ejs au navigateur
    return res.render("fiche", {
      titre: pays.nom,
      pays,
      avertissementApi,
      messageSucces: req.query.ajoute
        ? "Le pays a été ajouté au carnet."
        : req.query.modifie
          ? "Les informations du pays ont été modifiées."
          : null,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /pays/:id/modifier : formulaire pré-rempli
router.get("/:id/modifier", async (req, res, next) => {
  try {
    const pays = await db("pays").where({ id: req.params.id }).first();

    if (!pays) {
      return res.status(404).render("erreur", {
        titre: "Pays introuvable",
        message: "Ce pays n’existe pas dans le carnet.",
      });
    }

    return afficherFormulaire(res, {
      titre: `Modifier ${pays.nom}`,
      mode: "modifier",
      pays,
      erreurs: [],
    });
  } catch (erreur) {
    return next(erreur);
  }
});

// POST /pays/:id : valide et met à jour
router.post("/:id", async (req, res, next) => {
  try {
    const paysExistant = await db("pays").where({ id: req.params.id }).first();

    if (!paysExistant) {
      return res.status(404).render("erreur", {
        titre: "Pays introuvable",
        message: "Ce pays n’existe pas dans le carnet.",
      });
    }

    const saisie = normaliserSaisiePays({
      ...req.body,
      code_cca3: paysExistant.code_cca3,
      nom: paysExistant.nom,
    });
    const erreurs = validerSaisiePays(saisie);

    if (erreurs.length > 0) {
      return afficherFormulaire(res, {
        titre: `Modifier ${paysExistant.nom}`,
        mode: "modifier",
        pays: { ...paysExistant, ...saisie },
        erreurs,
        statutHttp: 400,
      });
    }

    await db("pays").where({ id: paysExistant.id }).update({
      statut: saisie.statut,
      date_visite: saisie.date_visite || null,
      note: saisie.note ? Number(saisie.note) : null,
      commentaire: saisie.commentaire || null,
      updated_at: db.fn.now(),
    });

    return res.redirect(303, `/pays/${paysExistant.id}?modifie=1`);
  } catch (erreur) {
    return next(erreur);
  }
});

// POST /pays/:id/supprimer : supprime
router.post("/:id/supprimer", async (req, res, next) => {
  try {
    const nombreSupprime = await db("pays").where({ id: req.params.id }).delete();

    if (nombreSupprime === 0) {
      return res.status(404).render("erreur", {
        titre: "Pays introuvable",
        message: "Ce pays n’existe pas dans le carnet.",
      });
    }

    return res.redirect(303, "/?supprime=1");
  } catch (erreur) {
    return next(erreur);
  }
});

export default router;
