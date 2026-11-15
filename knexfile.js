import "dotenv/config";

import path from "node:path";
import { fileURLToPath } from "node:url";

const racineProjet = path.dirname(fileURLToPath(import.meta.url));

function cheminBaseDeDonnees() {
  const cheminConfigure = process.env.DATABASE_FILE ?? "./data/carnet.sqlite3";
  return path.resolve(racineProjet, cheminConfigure);
}

const configurationSQLite = {
  client: "sqlite3",
  connection: {
    filename: cheminBaseDeDonnees(),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(racineProjet, "migrations"),
  },
  pool: {
    afterCreate(connexion, terminer) {
      connexion.run("PRAGMA foreign_keys = ON", terminer);
    },
  },
};

export default {
  development: configurationSQLite,
  test: {
    ...configurationSQLite,
    connection: {
      filename: ":memory:",
    },
  },
  production: configurationSQLite,
};
