const API_URL = "https://api.anthropic.com/v1/messages";
const MODELE_PAR_DEFAUT = "claude-haiku-5-5";

function configurationIA() {
  const cle = process.env.ANTHROPIC_API_KEY;

  if (!cle) {
    throw new Error("La clé ANTHROPIC_API_KEY n’est pas configurée.");
  }

  return { cle, modele: process.env.ANTHROPIC_MODEL ?? MODELE_PAR_DEFAUT };
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

  const reponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": cle,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modele,
      max_tokens: 1000,
      system:
        "Tu es un conseiller de voyage. Tu réponds toujours en français et uniquement en JSON valide.",
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!reponse.ok) {
    throw new Error(`L’API d’IA a répondu avec le statut ${reponse.status}.`);
  }

  const resultat = await reponse.json();
  const texte = resultat?.content?.find((bloc) => bloc.type === "text")?.text ?? "";

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