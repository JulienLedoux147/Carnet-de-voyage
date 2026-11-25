const bouton = document.querySelector("#bouton-IA");
const zone = document.querySelector("#recommandations-IA");
 
// 1. Listener sur le bouton
bouton?.addEventListener("click", async () => {
  bouton.classList.add("is-loading");
  bouton.disabled = true;
  zone.replaceChildren(creerParagraphe("Recherche de destinations…", "has-text-grey"));
 
  try {
    // 2-3. Le serveur lit les pays visités et leurs notes dans la db, puis appelle l'IA

    //convertir la reponse de /statistiques/recommandations en json
    const reponse = await fetch("/statistiques/recommandations", { method: "POST" });
    const donnees = await reponse.json();
 
    if (!reponse.ok) {
      throw new Error(donnees.erreur ?? "Erreur inattendue.");
    }
 
    // 4. Remplace le contenu du div par la réponse de l'IA
    afficherRecommandations(donnees.recommandations);
  } catch (erreur) {
    zone.replaceChildren(creerParagraphe(erreur.message, "has-text-danger"));
  } finally {
    bouton.classList.remove("is-loading");
    bouton.disabled = false;
  }
});
 
function creerParagraphe(texte, classe) {
  const p = document.createElement("p");
  p.className = classe;
  p.textContent = texte;
  return p;
}
 
function afficherRecommandations(recommandations) {
  if (recommandations.length === 0) {
    zone.replaceChildren(creerParagraphe("Aucune recommandation reçue.", "has-text-grey"));
    return;
  }
 
  const cartes = recommandations.map(({ pays, raison }) => {
    const carte = document.createElement("article");
    carte.className = "box";
 
    const titre = document.createElement("h3");
    titre.className = "title is-5 mb-2";
    titre.textContent = pays; // textContent : pas d'injection HTML possible
 
    const texte = document.createElement("p");
    texte.textContent = raison;
 
    carte.append(titre, texte);
    return carte;
  });
 
  zone.replaceChildren(...cartes);
}
 