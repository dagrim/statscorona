// Dependencies
const fs = require('fs');

const rp = require('request-promise');
const url = 'https://www.santepubliquefrance.fr/maladies-et-traumatismes/maladies-et-infections-respiratoires/infection-a-coronavirus/articles/infection-au-nouveau-coronavirus-sars-cov-2-covid-19-france-et-monde'

rp(url).then(function(html){
  let regionMappings = [ {name: "Île-de-France", code: 11, html: "Ile-de-France" }, {name: "Centre-Val de Loire", code: 24 }, {name: "Bourgogne Franche comté", code: 27, html: "Bourgogne-Franche-Comt&eacute;" }, {name: "Normandie", code: 28}, {name: "Hauts de France", code: 32, html: "Hauts-de-France" }, {name: "Grand Est", code: 44, html: "" }, {name: "Pays de la Loire", code: 52, html: "" }, {name: "Bretagne", code: 53, html: "" }, {name: "Nouvelle-Aquitaine", code: 75, html: "" }, {name: "Occitanie", code: 76, html: "" }, {name: "Auvergne-Rhône-Alpes", code: 84, html: "Auvergne-Rh&ocirc;ne-Alpes" }, {name: "Provence-Alpes-Côte d'Azur", code: 93, html: "Provence-Alpes-C&ocirc;te d&rsquo;Azur" }, {name: "Corse", code: 94, html: "" }, {name: "Guadeloupe", code: "others", html: "" }, {name: "Saint-Barthélémy", code: "others", html: "Saint-Barth&eacute;l&eacute;my" }, {name: "Saint-Martin", code: "others", html: "" }, {name: "Guyane", code: "others", html: "" }, {name: "Martinique", code: "others", html: "" }, {name: "Mayotte", code: "others", html: "" }, {name: "La Réunion", code: "others", html: "La R&eacute;union" } ]
  let outcomes = {};
  let others = {};
  regionMappings.forEach(r => {
    let htmlName = r.html ? r.html : r.name;
    let regexString = '<tr><td style="width:380px;">'+htmlName+'<\/td><td style="width:350px;">([0-9 ]+)<\/td><\/tr>'
    let regexp = new RegExp(regexString);
    let result = regexp.exec(html);
    
    if (result) {
      let value = parseInt(result[1].replace(/ /g, ''));

      if (r.code === "others") others[r.name] = value;
      else outcomes[r.code] = {name: r.name, confirmed: value};
    } else {
      console.log("error with:" + r.name)
    }
  })
  outcomes.others = others;
    
  fs.readFile('public/stats/ressources/json/Stats.json', 'utf8', function(err, statsFile) {
    let previousStats = JSON.parse(statsFile);
    let statsJson = {"updateTime": "25 Mars, 19H45", "states": outcomes, "J-1":previousStats["states"]}
    
    fs.writeFile("offline/sourceFiles/tmpStats.json", JSON.stringify(statsJson), 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
      console.log("offline/sourceFiles/tmpStats.json has been saved.");
    });
  });
})
.catch(function(err){
  console.log(err)
});

// Opens App Routes
module.exports = function(app) {
};
