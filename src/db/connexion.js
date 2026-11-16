import knex from "knex";

import configurations from "../../knexfile.js";

const environnement = process.env.NODE_ENV ?? "development";
const configuration = configurations[environnement];

//si la config ne marche pas avec l'environnement
if (!configuration) {
  throw new Error(`Configuration Knex inconnue : ${environnement}`);
}

//crée la db avec la config dans crée la const "configuration" a partir de la méthode de knexfile.js
const db = knex(configuration);

export default db;
