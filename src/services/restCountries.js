const API_URL_PAR_DEFAUT = "https://api.restcountries.com/countries/v5";
const DUREE_CACHE = 60 * 60 * 1000;

let cacheListe = null;
let cacheExpireLe = 0;

function configurationApi() {
  const url = process.env.REST_COUNTRIES_API_URL ?? API_URL_PAR_DEFAUT;
  const cle = process.env.REST_COUNTRIES_API_KEY;

  if (!cle) {
    throw new Error(
      "La clé REST Countries n’est pas configurée. La saisie manuelle reste disponible.",
    );
  }

  return { url, cle };
}

async function appelerApi(chemin = "", parametres = {}) {
  const { url, cle } = configurationApi();
  const adresse = new URL(`${url}${chemin}`);

  for (const [nom, valeur] of Object.entries(parametres)) {
    adresse.searchParams.set(nom, String(valeur));
  }

  const reponse = await fetch(adresse, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${cle}`,
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!reponse.ok) {
    throw new Error(`REST Countries a répondu avec le statut ${reponse.status}.`);
  }

  const resultat = await reponse.json();

  if (!resultat?.data?.objects) {
    throw new Error("La réponse de REST Countries est invalide.");
  }

  return resultat.data;
}

function nomCapitale(capitales = []) {
  const capitalePrincipale = capitales.find(
    (capitale) => capitale?.attributes?.primary,
  );

  return capitalePrincipale?.name ?? capitales[0]?.name ?? null;
}

function normaliserPays(pays) {
  return {
    code_cca3: pays?.codes?.alpha_3 ?? "",
    nom: pays?.names?.common ?? "",
    region: pays?.region ?? null,
    capitale: nomCapitale(pays?.capitals),
    population: Number.isFinite(pays?.population) ? pays.population : 0,
    drapeau_url: pays?.flag?.url_svg ?? pays?.flag?.url_png ?? null,
  };
}

export async function listerPaysDisponibles() {
  if (cacheListe && Date.now() < cacheExpireLe) {
    return cacheListe;
  }

  const pays = [];
  let offset = 0;
  let autresPages = true;

  while (autresPages) {
    const donnees = await appelerApi("", {
      limit: 100,
      offset,
      response_fields: "names.common,codes.alpha_3",
    });

    pays.push(...donnees.objects.map(normaliserPays));
    autresPages = Boolean(donnees.meta?.more);
    offset += donnees.meta?.count ?? donnees.objects.length;

    if (donnees.objects.length === 0) {
      break;
    }
  }

  cacheListe = pays
    .filter((pays) => pays.code_cca3 && pays.nom)
    .sort((premier, second) => premier.nom.localeCompare(second.nom, "fr"));
  cacheExpireLe = Date.now() + DUREE_CACHE;

  return cacheListe;
}

export async function obtenirPaysParCode(code) {
  const donnees = await appelerApi(
    `/codes.alpha_3/${encodeURIComponent(code.toUpperCase())}`,
    {
      response_fields:
        "names.common,codes.alpha_3,capitals,region,population,flag.url_svg,flag.url_png",
    },
  );

  const pays = donnees.objects[0];

  if (!pays) {
    throw new Error("Le pays demandé n’existe pas dans REST Countries.");
  }

  return normaliserPays(pays);
}
