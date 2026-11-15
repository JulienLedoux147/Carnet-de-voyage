# Carnet de voyage

TP 1 du cours 420-3D2-MA Applications Web 1, groupe 00001.

Cette application permet de conserver les pays visités ou à visiter. Les
informations officielles d'un pays sont obtenues auprès de REST Countries et
conservées dans SQLite afin que le carnet reste utilisable si l'API ne répond
pas.

## Fonctionnalités

- afficher, rechercher et filtrer les pays du carnet;
- ajouter un pays avec validation des données;
- enrichir sa fiche avec les données de REST Countries;
- modifier le statut, la date, la note et le commentaire;
- supprimer un pays après confirmation;
- afficher les statistiques du carnet;
- continuer à utiliser les données locales lorsque l'API est indisponible.

## Technologies

- Node.js et Express 5;
- SQLite et Knex;
- EJS pour le rendu HTML côté serveur;
- Bulma 1.0 et CSS personnalisé;
- API REST Countries v5 avec `fetch` et `async/await`.

## Prérequis

- Node.js 20 ou une version plus récente;
- npm;
- une clé REST Countries pour obtenir les données officielles.

## Installation

À partir de la racine du projet :

```powershell
npm install
Copy-Item .env.example .env
npm run db:migrate
npm run dev
```

Ouvrez ensuite `http://localhost:3000`.

## Variables d'environnement

Le fichier `.env` est local et ne doit jamais être ajouté à Git.

| Variable | Utilité | Valeur par défaut |
| --- | --- | --- |
| `PORT` | Port du serveur Express | `3000` |
| `NODE_ENV` | Environnement d'exécution | `development` |
| `DATABASE_FILE` | Chemin de la base SQLite | `./data/carnet.sqlite3` |
| `REST_COUNTRIES_API_URL` | Adresse de REST Countries | API v5 officielle |
| `REST_COUNTRIES_API_KEY` | Clé d'authentification | Aucune |

## Configuration de REST Countries

1. Créez un compte sur [REST Countries](https://restcountries.com/).
2. Obtenez une clé API.
3. Ouvrez `.env` et ajoutez la clé sans guillemets :

```text
REST_COUNTRIES_API_KEY=votre_cle
```

4. Vérifiez la connexion :

```powershell
npm run api:check
```

La commande doit confirmer la récupération du Canada. Sans clé, avec une clé
invalide ou pendant une panne, le formulaire passe en saisie manuelle et les
fiches affichent les dernières données enregistrées dans SQLite.

## Base de données

La base locale est créée dans `data/carnet.sqlite3`. Ce fichier est ignoré par
Git. La migration crée la table `pays`, qui contient notamment :

- le code CCA3 unique;
- le nom, la région, la capitale, la population et le drapeau;
- le statut `visite` ou `a_visiter`;
- la date de visite, la note et le commentaire;
- la date de la dernière mise à jour provenant de l'API.

Commandes Knex :

```powershell
npm run db:status
npm run db:migrate
npm run db:rollback
```

## Scripts npm

| Commande | Description |
| --- | --- |
| `npm run dev` | Lance le serveur avec rechargement automatique |
| `npm start` | Lance le serveur normalement |
| `npm run db:migrate` | Applique les migrations Knex |
| `npm run db:rollback` | Annule la dernière migration |
| `npm run db:status` | Affiche l'état des migrations |
| `npm run api:check` | Vérifie la clé et la connexion REST Countries |

## Organisation du projet

```text
frontend/          CSS et JavaScript exécutés dans le navigateur
migrations/        Création et évolution du schéma SQLite
scripts/           Commandes de vérification manuelles
src/db/            Connexion Knex
src/routes/        Routes Express
src/services/      Communication avec REST Countries
src/validation/    Validation des données du carnet
views/             Pages EJS et composants partagés
knexfile.js        Configuration de Knex
main.js            Démarrage et arrêt du serveur
server.js          Configuration de l'application Express
```

## Trajet d'une requête

Pour `GET /pays/:id`, Express sélectionne la route correspondante. La route lit
d'abord le pays avec Knex, tente ensuite de rafraîchir ses données auprès de
REST Countries, puis transmet le résultat à `views/fiche.ejs`. Si l'appel
externe échoue, la route transmet les données SQLite avec un avertissement.

## Répartition du travail

À compléter par l'équipe avant la remise :

| Membre | Responsabilités principales |
| --- | --- |
| Membre 1 | À compléter |
| Membre 2 | À compléter |
| Membre 3, si applicable | À compléter |

## Options d'approfondissement

Chaque membre doit déclarer deux options différentes, dont au moins une option
avancée.

| Membre | Option 1 | Option 2 |
| --- | --- | --- |
| Membre 1 | À compléter | À compléter |
| Membre 2 | À compléter | À compléter |
| Membre 3, si applicable | À compléter | À compléter |

## Remise

L'archive finale doit contenir le code, ce README, les journaux d'utilisation
de l'IA, les fiches d'apprentissage et le support de présentation. Elle ne doit
contenir ni `node_modules`, ni `.env`, ni la base SQLite locale.
