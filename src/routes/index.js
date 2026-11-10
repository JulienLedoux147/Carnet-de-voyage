import { Router } from "express";
 
const router = Router();
 
// GET / : carnet (liste, recherche ?q=, filtre ?statut=visite|a_visiter)
router.get("/", (req, res) => {
  const { q = "", statut = "" } = req.query;
  // TODO: récupérer les pays avec Knex (filtrés par q et statut) et rendre la vue
  res.send(`Carnet - recherche: "${q}" - statut: "${statut}"`);
});
 
export default router;
