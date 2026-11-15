import "dotenv/config";

import { obtenirPaysParCode } from "../src/services/restCountries.js";

if (!process.env.REST_COUNTRIES_API_KEY) {
  console.error(
    "REST_COUNTRIES_API_KEY est absente. Ajoutez-la dans le fichier .env.",
  );
  process.exit(1);
}

try {
  const pays = await obtenirPaysParCode("CAN");
  console.log(
    `Connexion REST Countries réussie : ${pays.nom} (${pays.code_cca3}).`,
  );
} catch (erreur) {
  console.error(`Échec de la connexion REST Countries : ${erreur.message}`);
  process.exit(1);
}
