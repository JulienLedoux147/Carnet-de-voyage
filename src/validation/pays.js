export function normaliserSaisiePays(body = {}) {
  return {
    code_cca3: String(body.code_cca3 ?? "").trim().toUpperCase(),
    nom: String(body.nom ?? "").trim(),
    statut: String(body.statut ?? ""),
    date_visite: String(body.date_visite ?? "").trim(),
    note: String(body.note ?? "").trim(),
    commentaire: String(body.commentaire ?? "").trim(),
  };
}


/*
remplit un tableau erreurs (code de 3 lettres, statut valide, date réelle, note entière de 1 à 5, longueurs maximales).
*/

export function validerSaisiePays(pays) {
  const erreurs = [];

  if (!/^[A-Z]{3}$/.test(pays.code_cca3)) {
    erreurs.push("Le code CCA3 doit contenir exactement trois lettres.");
  }

  if (pays.nom.length > 255) {
    erreurs.push("Le nom du pays ne peut pas dépasser 255 caractères.");
  }

  if (!["visite", "a_visiter"].includes(pays.statut)) {
    erreurs.push("Choisissez si le pays est visité ou à visiter.");
  }

  if (pays.date_visite) {
    const correspondance = pays.date_visite.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const date = correspondance
      ? new Date(
          Date.UTC(
            Number(correspondance[1]),
            Number(correspondance[2]) - 1,
            Number(correspondance[3]),
          ),
        )
      : null;

    const dateValide =
      date &&
      date.getUTCFullYear() === Number(correspondance[1]) &&
      date.getUTCMonth() === Number(correspondance[2]) - 1 &&
      date.getUTCDate() === Number(correspondance[3]);

    if (!dateValide) {
      erreurs.push("La date de visite est invalide.");
    }
  }

  if (pays.note) {
    const note = Number(pays.note);
    if (!Number.isInteger(note) || note < 1 || note > 5) {
      erreurs.push("La note doit être un nombre entier entre 1 et 5.");
    }
  }

  if (pays.commentaire.length > 2000) {
    erreurs.push("Le commentaire ne peut pas dépasser 2000 caractères.");
  }

  return erreurs;
}
