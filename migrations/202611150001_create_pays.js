export async function up(knex) {
  await knex.schema.createTable("pays", (table) => {
    table.increments("id").primary();

    // Clé utilisée pour obtenir les données officielles de REST Countries.
    table.string("code_cca3", 3).notNullable().unique();

    // Copie locale minimale des données officielles pour fonctionner sans l’API.
    table.string("nom").notNullable();
    table.string("region");
    table.string("capitale");
    table.bigInteger("population").notNullable().defaultTo(0);
    table.string("drapeau_url");
    table.timestamp("api_mis_a_jour_le");

    // Données propres au carnet de voyage.
    table
      .enu("statut", ["visite", "a_visiter"], {
        useNative: false,
        enumName: "statut_pays",
      })
      .notNullable()
      .defaultTo("a_visiter");
    table.date("date_visite");
    table.integer("note");
    table.text("commentaire");

    table.timestamps(true, true);

    table.check("?? BETWEEN 1 AND 5 OR ?? IS NULL", ["note", "note"]);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("pays");
}
