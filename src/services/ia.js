const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELE_PAR_DEFAUT = "gemini-flash-lite-latest";

function configurationIA() {
  const cle = process.env.API_KEY;

  if (!cle) {
    throw new Error("La clé API_KEY n’est pas configurée.");
  }

  return { cle, modele: process.env.MODEL ?? MODELE_PAR_DEFAUT };
}

/*
Reçoit les pays visités ([{ nom, region, note, commentaire }]) et la liste de
tous les pays déjà dans le carnet, puis demande à l'IA des destinations.
Retourne un tableau [{ pays, raison }].
*/
export async function obtenirRecommandations(paysVisites, paysDansCarnet) {
  const { cle, modele } = configurationIA();
 
  const lignes = paysVisites.map(
    (p) =>
      `- ${p.nom} (${p.region ?? "région inconnue"}) : ${p.note ?? "pas de note"}/5` +
      (p.commentaire ? ` — « ${p.commentaire} »` : ""),
  );
 
  const prompt = `Voici les pays que j'ai visités avec ma note sur 5 :
${lignes.join("\n")}
 
Recommande-moi 5 nouvelles destinations selon mes goûts. N'inclus AUCUN de ces pays, déjà dans mon carnet : ${paysDansCarnet.join(", ")}.
 
Réponds uniquement avec un tableau JSON, sans texte autour, de la forme :
[{"pays": "Nom du pays", "raison": "Une ou deux phrases en français qui expliquent le choix selon mes notes."}]`;
 
  const requete = () =>
    fetch(`${API_URL}/${modele}:generateContent`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": cle,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "Tu es un conseiller de voyage. Tu réponds toujours en français et uniquement en JSON valide.",
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(60000),
    });
 
  // 503 = modèle surchargé, 429 = trop de requêtes : on réessaie un peu plus tard.
  const MAX_ESSAIS = 4;
  let reponse;
 
  for (let essai = 1; essai <= MAX_ESSAIS; essai++) {
    reponse = await requete();
 
    if (reponse.ok || ![429, 503].includes(reponse.status) || essai === MAX_ESSAIS) {
      break;
    }
 
    await new Promise((resolve) => setTimeout(resolve, essai * 2000));
  }

  if (!reponse.ok) {
    throw new Error(`L’API d’IA a répondu avec le statut ${reponse.status}.`);
  }

  const resultat = await reponse.json();
  const texte = resultat?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Au cas où le modèle entoure le JSON de ```json ... ```
  const json = texte.match(/\[[\s\S]*\]/)?.[0];
  const recommandations = JSON.parse(json ?? "null");

  if (!Array.isArray(recommandations)) {
    throw new Error("La réponse de l’IA est invalide.");
  }

  return recommandations
    .filter((r) => r?.pays && r?.raison)
    .map((r) => ({ pays: String(r.pays), raison: String(r.raison) }));
}