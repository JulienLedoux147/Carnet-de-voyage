import app from "./server.js";
import db from "./src/db/connexion.js";

const PORT = process.env.PORT || 3000;

async function demarrer() {
  try {
    await db.raw("SELECT 1");

    const serveur = app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });

    async function arreter(signal) {
      console.log(`Arrêt du serveur (${signal})`);
      serveur.close(async () => {
        await db.destroy();
        process.exit(0);
      });
    }

    process.on("SIGINT", () => arreter("SIGINT"));
    process.on("SIGTERM", () => arreter("SIGTERM"));
  } catch (erreur) {
    console.error("Impossible de se connecter à la base de données.", erreur);
    await db.destroy();
    process.exit(1);
  }
}

demarrer();
