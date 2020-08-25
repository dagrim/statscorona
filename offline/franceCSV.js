// Dependencies
const XLSX = require('xlsx');
const fs = require('fs');
const rp = require('request-promise');
const https = require('https');


// Functions
let emptyObj = {'0':0,'A':0,'B':0,'C':0,'D':0,'E':0};
let regionNames = {'1':'Guadeloupe','2':'Martinique','3':'Guyane','4':'La Réunion','6':'Mayotte','11':'Île-de-France','24':'Centre-Val de Loire','27':'Bourgogne-Franche-Comté','28':'Normandie','32':'Hauts-de-France','44':'Grand Est','52':'Pays de la Loire','53':'Bretagne','75':'Nouvelle-Aquitaine','76':'Occitanie','84':'Auvergne-Rhône-Alpes','93':'Provence-Alpes-Côte d\'Azur','94':'Corse'};

let groupByRegionAndAge = (jsonData) => {
  return jsonData.reduce(function (acc, obj) {
    let nbrConfirmed = obj['nbre_pass_corona'];
    if (nbrConfirmed > 0) {
      let ageIndex = obj['sursaud_cl_age_corona'];
      let regionName = regionNames[obj['reg']];
      if (regionName) {
        // Total Nbr
        if (!acc['France entier']) acc['France entier'] = {...emptyObj};
        acc['France entier'][ageIndex] += nbrConfirmed;

        // Regional Nbr
        let regionData = acc[regionName] ? acc[regionName] : {...emptyObj};
        if (!regionData[ageIndex]) regionData[ageIndex] = 0;
        regionData[ageIndex] += nbrConfirmed;
        
        acc[regionName] = regionData;
      }
    }
    return acc;
  }, {});
}





const url = 'https://www.data.gouv.fr/fr/datasets/donnees-des-urgences-hospitalieres-et-de-sos-medecins-relatives-a-lepidemie-de-covid-19/';
rp(url).then(function(html){
  //Read from data gouv the csv link \\
  let regexString = '(https[:\\/a-z0-9\\-\\.]+(sursaud-covid19-quotidien-2020-[0-9][0-9]-[0-9][0-9]-[0-9hH]+-region.csv))';
  let regexp = new RegExp(regexString);
  let result = regexp.exec(html);
  if (result && result[1] && result[2]) {
    let fileURL = result[1];
    let fileName = result[2];
    let filePath = "offline/sourceFiles/"+fileName;

    const file = fs.createWriteStream(filePath);
    const request = https.get(fileURL, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(() => {
          console.log(filePath + " has been saved.")
          const workbook = XLSX.readFile(filePath, {cellDates:true});
          const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

          const regionalCasesPerAge = groupByRegionAndAge(jsonData);

          fs.writeFile("public/stats/ressources/json/regionalCasesPerAge.json", JSON.stringify(regionalCasesPerAge), 'utf8', function (err) {
              if (err) {
                  console.log("An error occured while writing JSON Object to File.");
                  return console.log(err);
              }
              console.log("JSON file has been saved: public/stats/ressources/json/regionalCasesPerAge.json");
          });
        });  // close() is async, call cb after close completes.
      });
    });
  } else {
    console.error("Can't find region CSV from regex");
  }
})
.catch(function(err){
  console.error(err)
});











/*

const workbook = XLSX.readFile('offline/sourceFiles/sursaud-covid19-quotidien-2020-04-13-19h00-region.csv', {cellDates:true});
const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
*/

// Opens App Routes
module.exports = function(app) {
};
