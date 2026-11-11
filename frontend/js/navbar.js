//pour que la navbar soit belle sur téléphone
const burger = document.querySelector(".navbar-burger");
const menu = document.querySelector("#menu-principal");
 
burger.addEventListener("click", () => {
  const ouvert = burger.classList.toggle("is-active");
  menu.classList.toggle("is-active", ouvert);
  burger.setAttribute("aria-expanded", String(ouvert));
  burger.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
});
