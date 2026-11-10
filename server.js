import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import indexRoutes from "./src/routes/index.js";
import paysRoutes from "./src/routes/pays.js";
import statsRoutes from "./src/routes/statistiques.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // pour formulaires HTML
app.use(express.static(path.join(__dirname, "public")));

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