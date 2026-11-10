import { Router } from "express";

const router = Router();

// GET /statistiques : statistiques du carnet
router.get("/", (req, res) => {
  // TODO: avec Knex, calculer par exemple :
  //  - nombre de pays visités / à visiter
  //  - répartition par région
  //  - population totale des pays visités
  //  - note moyenne
  res.send("Statistiques du carnet");
});

export default router;