
# Installation in local
1. Install latest node.js https://nodejs.org/en/
2. Install latest git https://git-scm.com/
3. Clone the repository
4. Go to the repository, run command
    ```
    1. npm install
    2. npm start
    3. *Port http 80 is used by default. In case of Linux / Mac, run following command instead* : **sudo npm start**
    ```
5. Open http://localhost

# Code structure
Server side: server.js and app folder.
Client side: public folder

# Updating data
```
nodejs offline/processer.js
```
produces a new file `public/stats/ressources/json/HistoriqueNew.json`, that must be renamed to `public/stats/ressources/json/Historique.json`

Changed vs original : for France, the only data source is now OpenCovid19-fr : https://github.com/opencovid19-fr/data


# Previous Data sources
## Historique
https://data.oecd.org/fr/
https://www.ecdc.europa.eu/en/publications-data/download-todays-data-geographic-distribution-covid-19-cases-worldwide
https://actupenit.com/2020/03/06/coronavirus-point-sur-la-situation-en-direct/

## Global
https://www.ars.sante.fr/
https://www.santepubliquefrance.fr/maladies-et-traumatismes/maladies-et-infections-respiratoires/infection-a-coronavirus/articles/infection-au-nouveau-coronavirus-sars-cov-2-covid-19-france-et-monde

## Régions métropolitaines :
### Île-de-France
https://www.iledefrance.ars.sante.fr/coronavirus-covid-19-points-de-situation

### Centre-Val de Loire
https://www.centre-val-de-loire.ars.sante.fr/coronavirus-covid-19-point-de-situation-1

### Bourgogne-Franche-Comté
https://www.bourgogne-franche-comte.ars.sante.fr/

### Normandie
https://www.normandie.ars.sante.fr/informations-coronavirus-covid-19

### Hauts-de-France
https://www.hauts-de-france.ars.sante.fr/coronavirus-actualites

### Grand Est
https://www.grand-est.ars.sante.fr/coronavirus-actualite-et-conduite-tenir-7

### Pays de la Loire
https://www.pays-de-la-loire.ars.sante.fr/coronavirus-actualite-et-conduite-tenir-0

### Bretagne
https://www.bretagne.ars.sante.fr/coronavirus-bulletin-quotidien-en-bretagne

### Nouvelle-Aquitaine
https://www.nouvelle-aquitaine.ars.sante.fr/

### Occitanie
https://www.occitanie.ars.sante.fr/coronavirus-des-mesures-sanitaires-renforcees-lezignan-corbieres-et-quillan-pour-freiner-la

### Auvergne-Rhône-Alpes
https://www.auvergne-rhone-alpes.ars.sante.fr/liste-communiques-presse

### Provence-Alpes-Côte d'Azur
https://www.paca.ars.sante.fr/liste-communiques-presse

### Corse
https://www.corse.ars.sante.fr/coronavirus-covid-19-informations-utiles 

## Les régions de l'Outre-mer :
### Guadeloupe
https://www.guadeloupe.ars.sante.fr/coronavirus-informations-et-recommandations-0

### Martinique
https://www.martinique.ars.sante.fr/

### Guyane
https://www.guyane.ars.sante.fr/

### La Réunion
https://www.lareunion.ars.sante.fr/coronavirus-actualite-et-conduite-tenir-5

### Mayotte
https://www.mayotte.ars.sante.fr/coronavirus-point-de-situation-et-conduite-tenir