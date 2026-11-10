import { Router } from "express";

const router = Router();

// IMPORTANT : /nouveau doit être déclaré AVANT /:id
// GET /pays/nouveau : formulaire d'ajout
router.get("/nouveau", (req, res) => {
  // TODO: rendre le formulaire (liste de pays via REST Countries)
  res.send("Formulaire d'ajout");
});

// POST /pays : valide et crée le pays
router.post("/", (req, res) => {
  // TODO: valider req.body, refuser les doublons de code_cca3, insérer avec Knex
  // En cas d'erreur : re-rendre le formulaire avec les erreurs et les valeurs saisies
  res.status(201).send("Pays créé");
});

// GET /pays/:id : fiche du pays, enrichie par REST Countries
router.get("/:id", async (req, res, next) => {
  try {
    // TODO: lire le pays dans la base (404 s'il n'existe pas)
    // TODO: fetch REST Countries avec AbortSignal.timeout(5000) dans un try/catch interne,
    //       et afficher la fiche avec les données locales + un avertissement si l'API échoue
    res.send(`Fiche du pays ${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

// GET /pays/:id/modifier : formulaire pré-rempli
router.get("/:id/modifier", (req, res) => {
  // TODO: lire le pays et rendre le formulaire pré-rempli
  res.send(`Formulaire de modification du pays ${req.params.id}`);
});

// POST /pays/:id : valide et met à jour
router.post("/:id", (req, res) => {
  // TODO: valider req.body, mettre à jour avec Knex, rediriger vers la fiche
  res.send(`Pays ${req.params.id} modifié`);
});

// POST /pays/:id/supprimer : supprime
router.post("/:id/supprimer", (req, res) => {
  // TODO: supprimer avec Knex, rediriger vers /
  res.redirect("/");
});

export default router;