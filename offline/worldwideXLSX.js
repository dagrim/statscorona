
// Dependencies
const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('offline/sourceFiles/COVID-19-geographic-disbtribution-worldwide.xlsx', {cellDates:true});
const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
const newCasesPerCountry = groupNewCasesByCountry(xlData);
fs.writeFile("public/stats/ressources/json/newCasesPerCountry.json", JSON.stringify(newCasesPerCountry), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});

const worldTotalPerDate = groupWorldTotalByDate(xlData);
fs.writeFile("public/stats/ressources/json/worldTotalPerDate.json", JSON.stringify(worldTotalPerDate), 'utf8', function (err) {
  if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
  }

  console.log("JSON file has been saved.");
});

const totalByCountry = groupTotalByCountry(newCasesPerCountry);
fs.writeFile("public/stats/ressources/json/totalByCountry.json", JSON.stringify(totalByCountry), 'utf8', function (err) {
  if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
  }

  console.log("JSON file has been saved.");
});

function groupNewCasesByCountry(tableauObjets){
    return tableauObjets.reduce(function (acc, obj) {
      var country = obj['Countries and territories'];
      if(!acc[country]){
        acc[country] = {};
      };
      // acc[country].eu = obj.EU;
      acc[country].geo = obj.GeoId;
      
      var date = obj.DateRep.toLocaleDateString();
      // console.log(date);
      acc[country][date] = {"c": obj.Cases, "d": obj.Deaths};
    //   if(!acc[country].new){
    //     acc[country].new = [];
    //   };
    //   var dateNumber = {"date": date, "c": obj.NewConfCases, "d": obj.NewDeaths};
    //   acc[country].new.push(dateNumber);
      return acc;
    }, {});
  }

  function groupTotalByCountry(tableauObjets){
    var acc = {};
    let sortableAcc = [];
    for (let countryName in tableauObjets) {
      let country = tableauObjets[countryName];
      let sumConfirmed = 0;
      let sumDeath = 0;
      for (let dateKey in country) {
        if (dateKey != "geo") {
          sumConfirmed += country[dateKey]["c"];
          sumDeath += country[dateKey]["d"];
        }
      }
      // Only the top confirmed countries
      if (sumConfirmed > 800) sortableAcc.push({name: countryName, confirmed: sumConfirmed, death: sumDeath})
    }

    sortableAcc.sort((a, b) => b.confirmed - a.confirmed);

    sortableAcc.forEach(country => {
      acc[country.name] = {c: country.confirmed, d: country.death}
    })
    
    return acc;
  }

  function groupWorldTotalByDate(tableauObjets){
    var dates = getDates(new Date(2019,11,31), new Date());
    var acc = {};                                                                                                         
    dates.forEach(function(date) {
      acc[date.toLocaleDateString()] = tableauObjets.reduce(function(sum, obj) {
        if (obj.DateRep.getTime() === date.getTime()) {
          sum.c = sum.c + obj.Cases;
          sum.d = sum.d + obj.Deaths;
        }
        return sum;
      }, {"c": 0, "d": 0});
    });
    return acc;
  }

// Returns an array of dates between the two dates
function getDates(startDate, endDate) {
  var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
};

// Opens App Routes
module.exports = function(app) {
};
