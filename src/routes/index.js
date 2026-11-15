import { Router } from "express";
import db from "../db/connexion.js";

const router = Router();

// GET / : carnet (liste, recherche ?q=, filtre ?statut=visite|a_visiter)
router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const statutDemande = String(req.query.statut ?? "");
    const statutsValides = ["visite", "a_visiter"];
    const statut = statutsValides.includes(statutDemande) ? statutDemande : "";

    const requete = db("pays")
      .select(
        "id",
        "code_cca3",
        "nom",
        "region",
        "capitale",
        "population",
        "drapeau_url",
        "statut",
        "date_visite",
        "note",
      )
      .orderBy("nom", "asc");

    if (q) {
      requete.where((constructeur) => {
        constructeur
          .where("nom", "like", `%${q}%`)
          .orWhere("code_cca3", "like", `%${q}%`);
      });
    }

    if (statut) {
      requete.where("statut", statut);
    }

    const pays = await requete;

    res.render("index", {
      titre: "Mon carnet de voyage",
      pays,
      filtres: { q, statut },
      messageSucces: req.query.supprime
        ? "Le pays a été supprimé du carnet."
        : null,
    });
  } catch (erreur) {
    next(erreur);
  }
});

export default router;
