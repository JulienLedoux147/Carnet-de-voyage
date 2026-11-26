import { Router } from "express";
import db from "../db/connexion.js";
import { obtenirRecommandations } from "../services/ia.js";

const router = Router();

// GET /statistiques : statistiques du carnet
//données brutes directement prisent de la db
router.get("/", async (req, res, next) => {
  try {
    const resumeBrut = await db("pays")
      .select(
        db.raw("COUNT(*) AS total"),
        db.raw(
          "SUM(CASE WHEN statut = 'visite' THEN 1 ELSE 0 END) AS visites",
        ),
        db.raw(
          "SUM(CASE WHEN statut = 'a_visiter' THEN 1 ELSE 0 END) AS a_visiter",
        ),
        db.raw(
          "SUM(CASE WHEN statut = 'visite' THEN population ELSE 0 END) AS population_visitee",
        ),
        db.raw(
          "AVG(CASE WHEN statut = 'visite' THEN note ELSE NULL END) AS note_moyenne",
        ),
      )
      .first();

    const regionsBrutes = await db("pays")
      .select(
        db.raw(
          "COALESCE(NULLIF(region, ''), 'Non disponible') AS region",
        ),
      )
      .count({ nombre: "id" })
      .groupByRaw("COALESCE(NULLIF(region, ''), 'Non disponible')")
      .orderBy("nombre", "desc")
      .orderBy("region", "asc");

    //données brutes stockés dans les clefs individuels d'un dictionnaire.
    const resume = {
      total: Number(resumeBrut.total ?? 0),
      visites: Number(resumeBrut.visites ?? 0),
      aVisiter: Number(resumeBrut.a_visiter ?? 0),
      populationVisitee: Number(resumeBrut.population_visitee ?? 0),
      noteMoyenne:
        resumeBrut.note_moyenne === null
          ? null
          : Number(resumeBrut.note_moyenne),
    };

    const regions = regionsBrutes.map((region) => ({
      nom: region.region,
      nombre: Number(region.nombre),
      pourcentage:
        resume.total === 0
          ? 0
          : Math.round((Number(region.nombre) / resume.total) * 100),
    }));

    //res.render(vue, données) --> pour le ejs
    //renvoi le ejs au navigateur
    return res.render("statistiques", {
      titre: "Statistiques du carnet",
      resume,
      regions,
    });
  } catch (erreur) {
    return next(erreur);
  }
});

// POST /statistiques/recommandations : recommandations de l'IA (appelée par statistiques.js)
// Les données viennent de la db (jamais du navigateur) et la clé API reste côté serveur.
router.post("/recommandations", async (req, res) => {
  try {
    const tousLesPays = await db("pays").select("nom", "region", "statut", "note", "commentaire");
    const visites = tousLesPays.filter((p) => p.statut === "visite");
 
    if (visites.length === 0) {
      return res.status(400).json({
        erreur: "Marquez au moins un pays comme visité pour obtenir des recommandations.",
      });
    }
 
    const recommandations = await obtenirRecommandations(
      visites,
      tousLesPays.map((p) => p.nom),
    );
 
    return res.json({ recommandations });
  } catch (erreur) {
    console.error(erreur);
    return res.status(502).json({
      erreur: "Impossible d’obtenir les recommandations pour le moment.",
    });
  }
});

export default router;
