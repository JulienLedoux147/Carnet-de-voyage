const formulaireSuppression = document.querySelector(".delete-country-form");

formulaireSuppression?.addEventListener("submit", (evenement) => {
  const nom = formulaireSuppression.dataset.countryName ?? "ce pays";
  const confirme = window.confirm(
    `Supprimer ${nom} du carnet? Cette action est irréversible.`,
  );

  if (!confirme) {
    evenement.preventDefault();
  }
});
