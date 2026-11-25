//pour que la navbar soit belle sur téléphone
const burger = document.querySelector(".navbar-burger");
const menu = document.querySelector("#menu-principal");
 
function afficherMenu(ouvert) {
  // Accessibilité : l’état annoncé par le lecteur d’écran suit l’état du menu.
  burger.classList.toggle("is-active", ouvert);
  menu.classList.toggle("is-active", ouvert);
  burger.setAttribute("aria-expanded", String(ouvert));
  burger.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
}

afficherMenu(false);
burger.hidden = false;

burger.addEventListener("click", () => {
  afficherMenu(burger.getAttribute("aria-expanded") === "false");
});

// Accessibilité : Échap ferme le menu mobile et ramène le focus sur son bouton.
burger.closest("nav").addEventListener("keydown", (evenement) => {
  if (
    evenement.key === "Escape" &&
    burger.getAttribute("aria-expanded") === "true" &&
    burger.getClientRects().length > 0
  ) {
    afficherMenu(false);
    burger.focus();
  }
});
