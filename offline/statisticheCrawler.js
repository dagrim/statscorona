// Dependencies
const fs = require('fs');

const rp = require('request-promise');
const url = 'https://statistichecoronavirus.it'

let getInt = str => {return parseInt(str.replace(/\./g, ''))}

let currentDate = new Date();
let day = ("0" + currentDate.getDate()).slice(-2);
let month =("0" + (currentDate.getMonth() + 1)).slice(-2)
let strDate = day + '/' + month;
let strDateFileName = day + '-' + month;

rp(url).then(function(html){
  let countryMappings = [{name:"Chine",html:"Cina"},{name:"États-unis",html:"Stati uniti"},{name:"France",html:"Francia"},{name:"Italie",html:"Italia"},{name:"Espagne",html:"Spagna"},{name:"Allemagne",html:"Germania"},{name:"Iran",html:"Iran"},{name:"Royaume-Uni",html:"Regno unito"},{name:"Suisse",html:"Svizzera"},{name:"Pays-Bas",html:"Olanda"},{name:"Belgique",html:"Belgio"},{name:"Brésil",html:"Brasile"},{name:"Turquie",html:"Turchia"},{name:"Autriche",html:"Austria"},{name:"Canada",html:"Canada"}];
  let countryOutput = {};

  countryMappings.forEach(r => {
    let htmlName = r.html;
      
    // [first part, confirmed, active, death]
    let regexString = '>'+htmlName+'<\/a><\/td>\n +<td class="[a-zA-Z0-9 ]+">([0-9\.]+)<\/td>\n +<td class="[a-zA-Z0-9 ]+">([0-9\.]+)<\/td>\n +<td class="[a-zA-Z0-9 ]+">([0-9\.]+)<\/td>\n +<td class="[a-zA-Z0-9 ]+">([0-9\.%]+)<\/td>\n +<td class="[a-zA-Z0-9 ]+">([0-9\.%]+)<\/td>';
    let regexp = new RegExp(regexString, 'i');
    let result = regexp.exec(html);
    
    if (result) {
      let valueConfirmed = getInt(result[1]);
      let valueDeath = getInt(result[3]);
      let valueCure = getInt(result[4]);
      
      if (!valueConfirmed || !valueDeath || !valueCure) console.error("missing value for " + r.name + ": " + valueConfirmed + ", " + valueDeath + ", " + valueCure);

      countryOutput[r.name] = {c: valueConfirmed, d: valueDeath, cure:valueCure};
    } else {
      console.error("error with:" + r.name)
    }
  })

  // world data
  let worldConfirmedRegex = new RegExp('<span class="[a-z ]+">Contagiati nel mondo<\/span>\n.+<span class="[a-z ]+">([0-9\.]+)<\/span>\n.+\n.+\n.+\n.+<span class="[a-z ]+">Casi attivi nel mondo<\/span>\n.+<span class="[a-z ]+">([0-9\.]+)<\/span>\n.+\n.+\n.+\n.+<span class="[a-z ]+">Morti nel mondo<\/span>\n.+<span class="[a-z ]+">([0-9\.]+)<\/span>\n.+\n.+\n.+\n.+<span class="[a-z ]+">Guariti nel mondo<\/span>\n.+<span class="[a-z ]+">([0-9\.]+)<\/span>')
  let worldExtracted = worldConfirmedRegex.exec(html);
  let worldConfirmed = getInt(worldExtracted[1]);
  let worldDeath = getInt(worldExtracted[3]);
  let worldCure = getInt(worldExtracted[4]);

  fs.readFile('public/stats/ressources/json/Historique.json', 'utf8', function(err, statsFile) {
    let history = JSON.parse(statsFile);

    fs.writeFile("public/stats/ressources/json/Previous/Historique"+strDateFileName+"save.json", JSON.stringify(history), 'utf8', function (err) {
      if (err) {
          console.error("An error occured while writing JSON Object to File.");
          return console.error(err);
      }
      console.log("public/stats/ressources/json/Historique"+strDateFileName+".json has been saved.");

      let franceData = history["France"];
      let franceRead = countryOutput["France"];
      franceData["dates"].push(strDate);
      franceData["confirmed"].push(173838);
      franceData["death"].push(30138);
      franceData["cHosp"].push(6796);
      franceData["severe"].push(481);
      franceData["cure"].push(78809);//https://geodes.santepubliquefrance.fr/#c=indicator&f=0&i=covid_hospit_clage10.rad&s=2020-07-16&t=a01&view=map1
      franceData["tHosp"].push("-");
      franceData["ESMS"].push(38107);
      franceData["ESMSDeath"].push(14209);
      franceData["ESMSDeathInHos"].push(3828);
      
      franceData["addDates"].push(strDate);
      
      let italyData = history["Italie"];
      let italyRead = countryOutput["Italie"];
      italyData.dates.push(strDate);
      italyData["confirmed"].push(italyRead.c);
      italyData["death"].push(italyRead.d);
      italyData["cure"].push(italyRead.cure);

      let total = history.World.total;
      total.dates.push(strDate);
      total.confirmed.push(worldConfirmed);
      total.death.push(worldDeath);
      total.cure.push(worldCure);

      let countries = history.World.countries;

      Object.keys(countries).forEach(countryName => {
        if (!countryOutput[countryName]) console.error(countryName + " not found!");
        else countries[countryName] = countryOutput[countryName];
      });

      fs.writeFile("public/stats/ressources/json/HistoriqueNew.json", JSON.stringify(history), 'utf8', function (err) {
        if (err) {
            console.error("An error occured while writing JSON Object to File.");
            return console.error(err);
        }
        console.log("public/stats/ressources/json/HistoriqueNew.json has been saved.");
      });
    });
  });
})
.catch(function(err){
  console.log(err)
});

// Opens App Routes
module.exports = function(app) {
};
