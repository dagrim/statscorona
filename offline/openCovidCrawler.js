const rp = require('request-promise');
const fs = require('fs');

const options = {
    uri: 'https://raw.githubusercontent.com/opencovid19-fr/data/master/dist/chiffres-cles.json',
    json: true
};

let currentDate = new Date();
let day = ("0" + currentDate.getDate()).slice(-2);
let month =("0" + (currentDate.getMonth() + 1)).slice(-2)
let dateStrToday = day + '/' + month;
let opencovidUpdated = false;

rp(options).then(function(data) {
    console.log("Json file loaded");
    var statPerArea = lastDateStatPerArea(data);
    var lastStatPerDepartment = lastStatFilter(statPerArea, "DEP");
    var lastStatPerRegion = lastStatFilter(statPerArea, "REG");
    
    fs.writeFile("offline/sourceFiles/tmpStatPerDepartment.json", JSON.stringify(lastStatPerDepartment), 'utf8', function (err) {
        if (err) {
            console.log("An error occure while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("offline/sourceFiles/tmpStatPerDepartment.json has been saved.");
    });

    fs.writeFile("offline/sourceFiles/tmpStatPerRegion.json", JSON.stringify(lastStatPerRegion), 'utf8', function (err) {
        if (err) {
            console.log("An error occure while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("offline/sourceFiles/tmpStatPerRegion.json has been saved.");
    });

    fs.writeFile("public/stats/ressources/json/StatPerRegion.json", JSON.stringify(lastStatPerRegion), 'utf8', function (err) {
        if (err) {
            console.log("An error occure while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("public/stats/ressources/json/StatPerRegion.json has been saved.");
    });

    fs.writeFile("public/stats/ressources/json/historyPerRegion.json", JSON.stringify(getHistory(data, "REG")), 'utf8', function (err) {
        if (err) {
            console.log("An error occure while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("public/stats/ressources/json/historyPerRegion.json has been saved.");
    });
    
    fs.writeFile("public/stats/ressources/json/historyPerDepartment.json", JSON.stringify(getHistory(data, "DEP")), 'utf8', function (err) {
        if (err) {
            console.log("An error occure while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("public/stats/ressources/json/historyPerDepartment.json has been saved.");
    });

    {
        var franceDataOC = getHistory(data, "FRA")["undefined"];
        fs.readFile('public/stats/ressources/json/Historique.json', 'utf8', function(err, statsFile) {
            let history = JSON.parse(statsFile);
            let franceData = history["France"];

            // remove 30 first values to start at 1st april
            franceDataOC.dates.splice(0,30);
            franceDataOC.confirmed.splice(0,30);
            franceDataOC.d.splice(0,30);
            franceDataOC.h.splice(0,30);
            franceDataOC.s.splice(0,30);
            franceDataOC.c.splice(0,30);

            franceData["dates"] = franceDataOC.dates;
            franceData["confirmed"] = franceDataOC.confirmed;
            franceData["death"] = franceDataOC.d;
            franceData["cHosp"] = franceDataOC.h;
            franceData["severe"] = franceDataOC.s;
            franceData["cure"] = franceDataOC.c;

            var curDateStr = new Date().toISOString().
                                replace(/T/, ' ').      // replace T with a space
                                replace(/\..+/, '');     // delete the dot and everything after
            franceData["updateTime"] = curDateStr;

            // franceData["tHosp"].push("-");
            // franceData["ESMS"].push(38107);
            // franceData["ESMSDeath"].push(14209);
            // franceData["ESMSDeathInHos"].push(3828);
            // franceData["addDates"].push(strDate);

            fs.writeFile("public/stats/ressources/json/HistoriqueNew.json", JSON.stringify(history), 'utf8', function (err) {
                console.log("public/stats/ressources/json/HistoriqueNew.json has been saved.");
            });
        });
    }
});

let getDateStr = dateInput => {
    let date = new Date(dateInput);
    let dateStr = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2);
    if (!opencovidUpdated && dateStrToday == dateStr) {
        opencovidUpdated = true;
        console.info(">>>> opencovid updated <<<<");
    }
    return dateStr
}
let pushData = (dataArray, data) => {
    if (!data || data == "null") {
        let lastNbr = dataArray[dataArray.length-1];
        if (lastNbr > 0) dataArray.push(lastNbr);
        else dataArray.push(0);
    } else {
        dataArray.push(data);
    }
}
let pushLastData = (dataArray) => { dataArray.length ? dataArray.push(dataArray[dataArray.length-1]) : dataArray.push(0); }
function getHistory(data, prefix) {
    // Stats per dept
    let historyPerArea = groupByArea(data);
    let stats = {mapping:[]};
    Object.keys(historyPerArea).forEach (code => {
        if (code.startsWith(prefix)) {
            let dates = [], hospitalised = [], death = [], severe = [], cure = [], confirmed = [];
            let currentDate = new Date("2020-03-01");
            historyPerArea[code].total.forEach(dailyStat => {
            
                let dateObj = new Date(dailyStat.date);
                // only take dates older than current
                if (dateObj > currentDate) {
                    // Initialize and add first valid date
                    if (dates.length == 0) {
                        if (dailyStat.hospitalised > 0 || dailyStat.death > 0 || dailyStat.severe > 0 || dailyStat.cure > 0 || dailyStat.confirmed > 0) {
                            currentDate = dateObj;
                            dates.push(getDateStr(dateObj));
                            pushData(hospitalised, dailyStat.hospitalised);
                            pushData(death, dailyStat.death);
                            pushData(severe, dailyStat.severe);
                            pushData(cure, dailyStat.cure);
                            pushData(confirmed, dailyStat.confirmed);
                        }
                    } else {
                        // add missing dates
                        while (dateObj - currentDate > 86400000) {
                            currentDate.setDate(currentDate.getDate() + 1);
                            dates.push(getDateStr(currentDate));
                            pushLastData(hospitalised);
                            pushLastData(death);
                            pushLastData(severe);
                            pushLastData(cure);
                            pushLastData(confirmed);
                        }

                        currentDate = dateObj;
                        dates.push(getDateStr(dateObj));
                        pushData(hospitalised, dailyStat.hospitalised);
                        pushData(death, dailyStat.death);
                        pushData(severe, dailyStat.severe);
                        pushData(cure, dailyStat.cure);
                        pushData(confirmed, dailyStat.confirmed);
                    }
                }
            })

            // fill dates object of the json with longest dates array
            //if (dates.length > stats["dates"].length) stats["dates"] = dates;

            let areaCode = code.split('-')[1], areaName = historyPerArea[code].name;
            stats["mapping"].push({code: areaCode, name: areaName})
            stats[areaCode] = {name : areaName, h:hospitalised, d: death, s: severe, c: cure, confirmed: confirmed, dates: dates};
            
        }
    });
    return stats;
}

function lastStatFilter(lastDateStatPerArea, prefix) {
    var result = {};
    Object.keys(lastDateStatPerArea).filter(code => code.startsWith(prefix)).forEach (areaCode => {
        result[areaCode.split('-')[1]] = lastDateStatPerArea[areaCode];
    });
    return result;
}

function lastDateStatPerArea(data) {
    var historyPerArea = groupByArea(data);
    var stat = {};
    Object.keys(historyPerArea).forEach (code => {
        var areaName = historyPerArea[code].name;
        stat[code] = lastDateStat(historyPerArea[code]);
        stat[code].name = areaName;
    });
    return stat;
}

function groupByArea(data) {
    return data.reduce(function(acc, current) {
        if (!acc[current.code]) {
            acc[current.code] = { name: current.nom,
                                  total: [ { date: current.date,
                                             confirmed: current.casConfirmes,
                                             hospitalised: current.hospitalises,
                                             death: current.deces + current.decesEhpad,
                                             severe: current.reanimation,
                                             cure: current.gueris
                                            }]
                                };
        } else {
            acc[current.code].total.push( { date: current.date,
                                            confirmed: current.casConfirmes,
                                            hospitalised: current.hospitalises,
                                            death: current.deces + current.decesEhpad,
                                            severe: current.reanimation,
                                            cure: current.gueris
                                            });
              };
        return acc;
    }, {});
}

function lastDateStat(area) {
    var lastStat = area.total[0];
    var lastDate = new Date(area.total[0].date);
    area.total.forEach(dayStat => {
        var newDate = new Date(dayStat.date);
        if ( newDate > lastDate) {
            lastStat = dayStat;
            lastDate = newDate;
        }
    });
    return lastStat;
}

// Opens App Routes
module.exports = function(app) {
};
