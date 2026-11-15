import { Router } from "express";
import db from "../db/connexion.js";

const router = Router();

// GET /statistiques : statistiques du carnet
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

    return res.render("statistiques", {
      titre: "Statistiques du carnet",
      resume,
      regions,
    });
  } catch (erreur) {
    return next(erreur);
  }
});

export default router;
