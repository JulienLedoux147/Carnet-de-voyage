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
```
Pour lancer l'app:
```powershell
node main.js
```
ou
```powershell
npm run dev
```
Ouvrez ensuite `http://localhost:3000`.

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
