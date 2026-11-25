const champCode = document.querySelector("#code_cca3");
const champNom = document.querySelector("#nom");
// Accessibilité : après une erreur, place le focus sur le titre du résumé.
document.querySelector("#titre-erreurs")?.focus();

// Si #code_cca3 est un <select>, remplit automatiquement #nom avec le data-nom de l’option choisie
if (champCode instanceof HTMLSelectElement && champNom) {
  const remplirNom = () => {
    const option = champCode.selectedOptions[0];
    const nom = option?.dataset.nom;

    if (nom) {
      champNom.value = nom;
    }
  };

  champCode.addEventListener("change", remplirNom);

  if (!champNom.value) {
    remplirNom();
  }
}

// Si c’est un <input>, force les majuscules pendant la frappe.
if (champCode instanceof HTMLInputElement) {
  champCode.addEventListener("input", () => {
    champCode.value = champCode.value.toUpperCase();
  });
}
