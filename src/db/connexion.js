import knex from "knex";

import configurations from "../../knexfile.js";

const environnement = process.env.NODE_ENV ?? "development";
const configuration = configurations[environnement];

if (!configuration) {
  throw new Error(`Configuration Knex inconnue : ${environnement}`);
}

const db = knex(configuration);

export default db;
