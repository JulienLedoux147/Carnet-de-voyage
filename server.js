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

// Vues HTML générées par Express avec EJS.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // pour formulaires HTML
// Le dossier frontend contient uniquement les fichiers statiques (CSS et JavaScript).
// index: false garantit que GET / passe bien par la route du carnet.
app.use(express.static(path.join(__dirname, "frontend"), { index: false }));

// Routes
app.use("/", indexRoutes);
app.use("/pays", paysRoutes);
app.use("/statistiques", statsRoutes);

//404
app.use((req, res) => {
  res.status(404).render("erreur", {
    titre: "Page introuvable",
    message: "La page demandée n’existe pas.",
  });
});

// gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("erreur", {
    titre: "Erreur interne",
    message: "Une erreur inattendue est survenue.",
  });
});

export default app; // c'est main qui va lancer le serveur
