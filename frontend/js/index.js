// récupérer fonctionnalité du navigateur
const Reconnaissance =
  window.SpeechRecognition ?? window.webkitSpeechRecognition;

//récupérer élements de la pages
const champ = document.querySelector("#q");
const bouton = document.querySelector("#bouton-micro");
const etat = document.querySelector("#etat-micro");
const formulaire = champ?.closest("form");

// EventListener --> click : si le navigateur ne support pas la reconnaissance vocal on afficher un message d'erreur
// sinon on écoute
if (champ && bouton && etat && formulaire) {
  if (!Reconnaissance) {
    // Navigateur sans reconnaissance vocale : le bouton explique pourquoi il ne fait rien.
    bouton.addEventListener("click", () => {
      etat.textContent =
        "La reconnaissance vocale n'est pas disponible dans ce navigateur. Essayez Chrome, Edge ou Safari.";
    });
  } else {
    const reconnaissance = new Reconnaissance();
    reconnaissance.lang = "fr-CA";
    reconnaissance.interimResults = false;
    reconnaissance.maxAlternatives = 1;
    reconnaissance.continuous = false;

    let enEcoute = false;

    const MESSAGES_ERREUR = {
      "not-allowed": "Accès au microphone refusé. Autorisez-le dans le navigateur.",
      "service-not-allowed": "La reconnaissance vocale n'est pas autorisée ici.",
      "no-speech": "Aucune voix détectée. Réessayez.",
      "audio-capture": "Aucun microphone détecté.",
      network: "Connexion requise pour la reconnaissance vocale.",
    };

    bouton.addEventListener("click", () => {
      if (enEcoute) {
        reconnaissance.stop();
        return;
      }
      reconnaissance.start();
    });

    reconnaissance.addEventListener("start", () => {
      enEcoute = true;
      bouton.classList.add("is-danger");
      bouton.setAttribute("aria-pressed", "true");
      etat.textContent = "Écoute… dites le nom d'un pays.";
    });


    // les événements 'result' 'error' 'end' sont déclenchés par le navigateur, pas par le code.
    reconnaissance.addEventListener("result", (evenement) => {
      const texte = evenement.results[0][0].transcript
        .trim()
        .replace(/[.!?,]+$/, "");

      if (!texte) return;

      champ.value = texte;
      etat.textContent = `Recherche : « ${texte} »`;
      formulaire.requestSubmit();
    });

    reconnaissance.addEventListener("error", (evenement) => {
      etat.textContent =
        MESSAGES_ERREUR[evenement.error] ?? "La reconnaissance vocale a échoué.";
    });

    reconnaissance.addEventListener("end", () => {
      enEcoute = false;
      bouton.classList.remove("is-danger");
      bouton.setAttribute("aria-pressed", "false");
    });
  }
}