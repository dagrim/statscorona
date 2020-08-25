var chartCtrl = angular.module('chartCtrl', ['leaflet-directive', 'chart.js']);

chartCtrl.controller("chartCtrl", function($scope, $rootScope, $http) {

    const nbrBeds = {"Autriche":5.45,"Belgique":5,"Canada":1.96,"République tchèque":4.11,"Danemark":2.54,"Finlande":2.8,"France":3.09,"Allemagne":6.02,"Grèce":3.6,"Hongrie":4.27,"Islande":2.51,"Irlande":2.77,"Italie":2.62,"Japon":7.79,"Corée du Sud":7.14,"Luxembourg":3.77,"Mexique":1.38,"Pays-Bas":2.92,"Nouvelle-Zélande":2.69,"Norvège":3.2,"Pologne":4.85,"Portugal":3.25,"Slovaquie":4.91,"Espagne":2.43,"Suède":2.04,"Suisse":3.56,"Turquie":2.78,"Royaume-Uni":2.11,"Chili":1.99,"Estonie":3.45,"Israël":2.2,"Slovénie":4.2,"Lettonie":3.3,"Lituanie":5.47};
    const overseaRegionCodes = ["01", "02", "03", "04", "06"];
    const hideItalyData = "Masquer les données d'Italie en trop";

    const twoScalesDSOverride = [{ type: 'bar', order: -1, yAxisID: 'y-axis-1' }, { type: 'line', yAxisID: 'y-axis-2', borderWidth: 3 }];
    const twoScalesColors = ['#45b7cd', '#ff6384', '#ff8e72', '#7f482d'];
    const twoScalesOptions = { yAxes: [ { id: 'y-axis-1', type: 'linear', display: true, position: 'left' }, { id: 'y-axis-2', type: 'linear', display: true, position: 'right' } ]};

    const keyNbrColors = [{borderColor: '#f74c31', backgroundColor: 'rgba(0, 0, 0, 0)'}, {borderColor: '#f78207', backgroundColor: 'rgba(0, 0, 0, 0)'}, {borderColor: '#5d7092', backgroundColor: 'rgba(0, 0, 0, 0)'}, {borderColor: '#28b7a3', backgroundColor: 'rgba(0, 0, 0, 0)'}];

    // ---------------------------- Charts ----------------------------
    let roundToPercent = function(i) {return Math.round(i * 10000) / 100}
    
    let skyBlue = {borderColor: '#45b7cd', backgroundColor: 'rgba(0, 0, 0, 0)'};
    let red = {borderColor: 'red', backgroundColor: 'rgba(0, 0, 0, 0)'};
    let orange = {borderColor: '#ff8e72', backgroundColor: 'rgba(0, 0, 0, 0)'};
    let green = {borderColor: '#2eb9a6', backgroundColor: 'rgba(0, 0, 0, 0)'};
    let gray = {borderColor: '#5d7092', backgroundColor: 'rgba(0, 0, 0, 0)'};
    
    let setFranceCharts = function(data) {
        let confirmed = data["confirmed"];
        let dead = data["death"];
        let severe = data["severe"];
        let cure = data["cure"];

        let esms = data["ESMS"];
        let esmsdeath = data["ESMSDeath"];
        
        let newConfirmed = [30];
        for (let i = 1; i < confirmed.length; i++) {
            newConfirmed.push(confirmed[i] - confirmed[i-1]);
        }

        let newDead = [0];
        for (let i = 1; i < dead.length; i++) {
            newDead.push(dead[i] - dead[i-1]);
        }
        
        let newSevere = [0];
        for (let i = 1; i < severe.length; i++) {
            newSevere.push(severe[i] - severe[i-1]);
        }

        let newCure = [0];
        for (let i = 1; i < cure.length; i++) {
            newCure.push(cure[i] - cure[i-1]);
        }

        let letality = [];
        for (let i = 0; i < confirmed.length; i++) {
            letality.push(roundToPercent(dead[i] / confirmed[i]));
        }

        let active = [];
        for (let i = 0; i < confirmed.length; i++) {
            active.push(confirmed[i] - dead[i] - cure[i]);
        }
        
        // France chart Tab
        $scope.franceChartUpdateTime = data["updateTime"];

        // History chart
        $scope.hisChartLabels = data.dates;
        $scope.hisChartSeries = ["Confirmés", 'Réanimations', 'Décès', 'Guéris', 'Cas actifs'];
        $scope.hisChartData = [confirmed, severe, dead, cure, active];
        keyNbrColors.push({borderColor: '#007bff', backgroundColor: 'rgba(0, 0, 0, 0)'});
        $scope.hisChartColors = keyNbrColors;
        $scope.hisChartOptions = $scope.chartOptions;
        //$scope.mergeObj($scope.chartOptions, {title: {display: true, text: "(*) 28 Mars : capacités des lits montées à 10,000"}});

        // ESMS history
        $scope.esmsHisChartLabels = data["addDates"];
        $scope.esmsHisChartSeries = ["Confirmés ESMS", 'Décès'];
        $scope.esmsHisChartData = [esms, esmsdeath];
        $scope.esmsHisChartColors = keyNbrColors;
        $scope.esmsHisChartOptions = $scope.chartOptions;

        // Letality chart
        $scope.letChartLabels = data.dates;
        $scope.letChartSeries = ["Confirmés", 'Décès', 'Létalité'];
        $scope.letChartData = [confirmed, dead, letality];
        $scope.letChartColors = [skyBlue, orange, red];

        $scope.letChartOptions = $scope.mergeObj($scope.chartOptions, {scales: twoScalesOptions });
        $scope.letChartDSOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        
        // New cases chart
        $scope.newCaseChartLabels = data.dates;
        $scope.newCaseChartSeries = ['Nouveaux confirmés', 'Nouveaux réanimation (*)', 'Nouveaux décès', 'Nouveaux guéris'];
        $scope.newCaseChartOptions = $scope.mergeObj($scope.chartOptions, { title: {display: true, text: "(*) Variation des lits occupés"} });
        $scope.newCaseChartData = [newConfirmed, newSevere, newDead, newCure];
        $scope.newCaseChartColors = [skyBlue, orange, red, green];
    }

    let fillRegionTotalData = function(regionData) {
        // daily new cases
        let regionLabels = [], hospitalised = [], death = [], severe = [], cure = [];
        for (let i = 0; i < regionData.length; i++) {
            let region = regionData[i];
            regionLabels.push(region.name);
            hospitalised.push(region.hospitalised);
            death.push(region.death);
            severe.push(region.severe);
            cure.push(region.cure);
        }

        $scope.regionTotalChartLabels = regionLabels;
        $scope.regionTotalChartData = [hospitalised, severe, death, cure];
    }
    
    let setRegionChart = function(currentStats) {
        let regionData = [];
        $scope.regionData = regionData;
        $scope.dateStatPerRegion = currentStats["11"].date;
        let omHospitalised = 0, omDeath = 0, omSevere = 0, omCure = 0;
        for (regionIdx in currentStats) {
            if (overseaRegionCodes.indexOf(regionIdx) < 0) {
                regionData.push(currentStats[regionIdx]);
            }
            else {
                omHospitalised += currentStats[regionIdx].hospitalised;
                omDeath += currentStats[regionIdx].death;
                omSevere += currentStats[regionIdx].severe;
                omCure += currentStats[regionIdx].cure;
                //let percentage = roundTo10Thousand(omTotalCase / omTotalPop);
            }
        }
        regionData.push({"name": "Outre-mer", "hospitalised": omHospitalised, "death": omDeath, "severe": omSevere, "cure": omCure});

        // daily new cases
        regionData.sort(function(a, b) {return b.hospitalised - a.hospitalised});
        $scope.regionTotalDisplay = "NBR";
        fillRegionTotalData(regionData);
        $scope.regionTotalChartSeries = ['Hospitalisés', 'Réanimation', 'Décès', 'Guéris'];
        //$scope.regionTotalDSOverride = twoScalesDSOverride;
        $scope.regionTotalChartColors = keyNbrColors;
        $scope.regionTotalChartOptions = $scope.chartOptions;
    }

    $scope.setItalyChart = function() {
        let maxDiff = 20;
        if ($scope.dateDiff < 0) $scope.dateDiff = 0;
        if ($scope.dateDiff > maxDiff || $scope.dateDiff === undefined) $scope.dateDiff = maxDiff;
        let variation = $scope.dateDiff ? $scope.dateDiff : 0;
        
        let italyDates = $scope.italyData["dates"];
        let italyConfirmed = $scope.italyData["confirmed"];
        let italyDeath = $scope.italyData["death"];
        let franceConfirmed = $scope.franceData["confirmed"];
        let franceDeath = $scope.franceData["death"];
        
        if (variation < 8) {
            let diff = 8-variation;
            italyDates = italyDates.slice(diff);
            italyConfirmed = italyConfirmed.slice(diff);
            italyDeath = italyDeath.slice(diff);
        } else if (variation > 8) {
            franceConfirmed = franceConfirmed.slice(variation - 8);
            franceDeath = franceDeath.slice(variation - 8);
        }

        if ($scope.italyFull) {
            $scope.updateItalyLabel = "Afficher toutes les données d'Italie";
            $scope.compareChartData = [italyConfirmed.slice(0, italyConfirmed.length-variation), franceConfirmed, italyDeath.slice(0, italyConfirmed.length-variation), franceDeath];
            $scope.compareChartLabels = italyDates.slice(0, italyDates.length-variation);
        } else {
            $scope.updateItalyLabel = hideItalyData;
            $scope.compareChartData = [italyConfirmed, franceConfirmed, italyDeath, franceDeath];
            $scope.compareChartLabels = italyDates;
        }

        let titleDateDiff = variation!=0 ? ', avec dégalage de '+$scope.dateDiff+' jours' : '';

        $scope.compareChartSeries = ['Italie, confirmés', 'France, confirmés', 'Italie, décès', 'France, décès'];
        let title={display: true, text: "Italie vs France" + titleDateDiff}
        $scope.compareChartOptions = $scope.mergeObj($scope.chartOptions, { title: title });
        $scope.compareChartColors = [skyBlue, orange, "#3890bc", red];
    }

    setCompareCharts = function(data) {
        $scope.franceData = data["France"];
        $scope.italyData = data["Italie"];
        $scope.italyFull = true;
        $scope.dateDiff = 11;
        $scope.$watch("dateDiff", function() {$scope.setItalyChart();});
    }

    $scope.worldLetDisplayBeds = function() {
        let countryList = $scope.countryList;
        $scope.worldLetDisplay = 'BED';

        let countryNames = [];
        let letalityList = [];
        let bedsData = [];
        for (let i = 0; i < countryList.length; i++) {
            let country = countryList[i];
            if (country.nbrBeds > 0) {
                countryNames.push(country.name);
                letalityList.push(country.letality);
                bedsData.push(country.nbrBeds);
            }
        }

        $scope.worldLetChartLabels = countryNames;
        $scope.worldLetChartSeries = ['Lits soins intensifs', 'Létalité'];
        $scope.worldLetChartData = [bedsData, letalityList];
        let title={display: true, text: 'Lits soins intensifs pour 1000 habitants (2017)'}
        $scope.worldLetChartOptions = $scope.mergeObj($scope.chartOptions, {title: title, scales: twoScalesOptions });
        $scope.worldLetChartColors = ['#34ba96', '#ff6384'];
    }
    
    $scope.worldLetDisplayConfirmed = function() {
        let countryList = $scope.countryList;
        $scope.worldLetDisplay = 'CNF';

        let countryNames = [];
        let letalityList = [];
        let confirmedList = [];

        for (let i = 0; i < countryList.length; i++) {
            let country = countryList[i];
            countryNames.push(country.name);
            letalityList.push(country.letality);
            confirmedList.push(country.confirmed);
        }

        $scope.worldLetChartLabels = countryNames;
        $scope.worldLetChartSeries = ["Confirmés", 'Létalité'];
        $scope.worldLetChartData = [confirmedList, letalityList];
        let title={display: true, text: '15 pays avec le plus de cas confirmés'}
        $scope.worldLetChartOptions = $scope.mergeObj($scope.chartOptions, { title: title, scales: twoScalesOptions });
        $scope.worldLetChartColors = twoScalesColors;
    }

    let getCountryObj = function(countryName, confirmed, death) {
        let country = {name: countryName, confirmed: confirmed, death: death};
        country.letality = roundToPercent(country.death / country.confirmed);
        if (nbrBeds[countryName]) country.nbrBeds = nbrBeds[countryName];
        return country;
    }
    
    let setWorldTotalChart = function(inputData) {
        let worldData = inputData["World"], franceData = inputData["France"], italyData = inputData["Italie"];
        let countryList = [];
        $scope.countryList = countryList;

        let countriesData = worldData["countries"];
        for (countryName in countriesData) {
            if (countriesData[countryName]) {
                countryList.push( getCountryObj(countryName, countriesData[countryName].c, countriesData[countryName].d) );
            }
        }
        let frConfirmed = franceData["confirmed"], frDeath = franceData["death"];
        countryList.push( getCountryObj('France', frConfirmed[frConfirmed.length-1], frDeath[frDeath.length-1]) );

        let itConfirmed = italyData["confirmed"], itDeath = italyData["death"];
        countryList.push( getCountryObj('Italie', itConfirmed[itConfirmed.length-1], itDeath[itDeath.length-1]) );

        countryList.sort(function(a, b) {return b.letality - a.letality});

        $scope.worldLetDisplayConfirmed();
        $scope.worldLetDSOverride = twoScalesDSOverride;
    }

    let getLast = function(array) {
        return current = array[array.length - 1];
    }

    let getNbrs = function(array) {
        let current = getLast(array);
        let previous = array[array.length - 2];
        let newNbr = current - previous
        return [current, newNbr, previous];
    }

    let getAverages = function(array, days) {
        let sum = 0;
        for (let i = array.length - days; i < array.length; i++) sum += (array[i] - array[i-1]);
        return Math.round(sum / days);
    }

    let getNbrStringWithSign = function(nbr) {return nbr>=0 ? '+' + nbr : nbr;}
    let setSummary = function(hisData) {
        let franceData = hisData["France"];
        let franceConfirmed = getNbrs(franceData["confirmed"]);
        let franceDeath = getNbrs(franceData["death"]);
        let franceSevere = getNbrs(franceData["severe"]);
        let franceCure = getNbrs(franceData["cure"]);
        $scope.franceTotalConfirmed = franceConfirmed[0];
        $scope.franceNewConfirmed = getNbrStringWithSign(franceConfirmed[1]);

        $scope.franceTotalDeath = franceDeath[0];
        $scope.franceNewDeath = getNbrStringWithSign(franceDeath[1]);

        $scope.franceTotalSevere = franceSevere[0];
        $scope.franceNewSevere = getNbrStringWithSign(franceSevere[1]);
        
        $scope.franceTotalCure = franceCure[0];
        $scope.franceNewCure = getNbrStringWithSign(franceCure[1]);

        $scope.franceTotalActive = $scope.franceTotalConfirmed - $scope.franceTotalDeath - $scope.franceTotalCure;
        $scope.franceNewActive = getNbrStringWithSign($scope.franceNewConfirmed - $scope.franceNewDeath - $scope.franceNewCure);

        $scope.franceLetality = roundToPercent($scope.franceTotalDeath / $scope.franceTotalConfirmed);
        $scope.franceLetalityDiff = getNbrStringWithSign( roundToPercent($scope.franceTotalDeath / $scope.franceTotalConfirmed - franceDeath[2] / franceConfirmed [2]) );
        $scope.franceAvgDays = 7;
        
        
        let franceTotalHosp = getNbrs(franceData["tHosp"]);
        let franceCurrentHosp = getNbrs(franceData["cHosp"]);
        $scope.franceTotalHosp = franceTotalHosp[0];
        $scope.franceTotalNewHosp = getNbrStringWithSign(franceTotalHosp[1]);

        $scope.franceCurrentHosp = franceCurrentHosp[0];
        $scope.franceCurrentNewHosp = getNbrStringWithSign(franceCurrentHosp[1]);

        $scope.franceTotalESMS = getLast(franceData["ESMS"]);
        $scope.franceTotalESMSDeath = getLast(franceData["ESMSDeath"]);

        // Italy
        let italyData = hisData["Italie"];
        let italyConfirmed = getNbrs(italyData["confirmed"]);
        let italyDeath = getNbrs(italyData["death"]);
        let italyCure = getNbrs(italyData["cure"]);

        $scope.italyTotalConfirmed = italyConfirmed[0];
        $scope.italyTotalDeath = italyDeath[0];
        $scope.italyTotalCure = italyCure[0];
        $scope.italyLetality = roundToPercent($scope.italyTotalDeath / $scope.italyTotalConfirmed);

        $scope.italyNewConfirmed = getNbrStringWithSign(italyConfirmed[1]);
        $scope.italyNewDeath = getNbrStringWithSign(italyDeath[1]);
        $scope.italyNewCure = getNbrStringWithSign(italyCure[1]);
        $scope.italyLetalityDiff = getNbrStringWithSign( roundToPercent($scope.italyTotalDeath / $scope.italyTotalConfirmed - italyDeath[2] / italyConfirmed [2]) );

        $scope.italyAvgNewCases7Days = getAverages(italyData["confirmed"], 7);
        $scope.italyAvgNewDeath7Days = getAverages(italyData["death"], 7);
        $scope.italyAvgCure7Days = getAverages(italyData["cure"], 7);

        // World
        let worldData = hisData["World"]["total"];
        let worldConfirmed = getNbrs(worldData["confirmed"]);
        let worldDeath = getNbrs(worldData["death"]);
        let worldCure = getNbrs(worldData["cure"]);
        $scope.worldTotalConfirmed = worldConfirmed[0];
        $scope.worldTotalDeath = worldDeath[0];
        $scope.worldTotalCure = worldCure[0];
        $scope.worldLetality = roundToPercent($scope.worldTotalDeath / $scope.worldTotalConfirmed);
        $scope.worldNewConfirmed = getNbrStringWithSign(worldConfirmed[1]);
        $scope.worldNewDeath = getNbrStringWithSign(worldDeath[1]);
        $scope.worldNewCure = getNbrStringWithSign(worldCure[1]);
        $scope.worldLetalityDiff = getNbrStringWithSign( roundToPercent($scope.worldTotalDeath / $scope.worldTotalConfirmed - worldDeath[2] / worldConfirmed [2]) );
    }


    if (!$scope.jsonLoaded) {
        $scope.jsonLoaded = true;
        $http.get("stats/ressources/json/Historique.json").then(function(hisResp) {
            setSummary(hisResp.data)
            setFranceCharts(hisResp.data["France"]);
            setWorldTotalChart(hisResp.data);
            setCompareCharts(hisResp.data);

            $scope.$watch('franceAvgDays', function() {
                if ($scope.franceAvgDays) {
                    $scope.franceAvgConfirmed = getAverages($scope.franceData["confirmed"], $scope.franceAvgDays);
                    $scope.franceAvgDeath = getAverages($scope.franceData["death"], $scope.franceAvgDays);
                    $scope.franceAvgSevere = getAverages($scope.franceData["severe"], $scope.franceAvgDays);
                    $scope.franceAvgLetality = roundToPercent($scope.franceAvgDeath / $scope.franceAvgConfirmed);
                }
            });
        }, function(e) {});

        $http.get("stats/ressources/json/StatPerRegion.json").then(function(statResp) {
            setRegionChart(statResp.data);
            $rootScope.$broadcast('statsLoaded', statResp.data);
        }, function(e) {});
    }

});