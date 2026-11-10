import express from "express";

//pour __dirname
import path from "node:path";
import { fileURLToPath } from "node:url";

//Routes
import indexRoutes from "./src/routes/index.js";
import paysRoutes from "./src/routes/pays.js";
import statsRoutes from "./src/routes/statistiques.js";

//Utilise le dossier relativement a app.js
//au lieu d'utiliser le dossier depuis lequel est exécuté la commande node
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // pour formulaires HTML
//indique à Express que le dossier frontend contient les fichiers statiques accessibles aux visiteurs.
app.use(express.static(path.join(__dirname, "frontend")));

// Routes
app.use("/", indexRoutes);
app.use("/pays", paysRoutes);
app.use("/statistiques", statsRoutes);

//404
app.use((req, res) => {
  res.status(404).send("Page introuvable");
});

// gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Erreur interne du serveur");
});

export default app; // c'est main qui va lancer le serveur