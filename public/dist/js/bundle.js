var FAQCtrl = angular.module('FAQCtrl', []);

FAQCtrl.controller("FAQCtrl", function($scope, $http) {

});
// Declares the initial angular module "meanMapApp". Module grabs other controllers and services.
var app = angular.module('statsApp', ["ngRoute", 'mainCtrl', 'mapCtrl', 'chartCtrl', 'regionChartCtrl', 'FAQCtrl', 'leaflet-directive', 'chart.js', '720kb.socialshare'])
    // Configures Angular routing -- showing the relevant view and controller when needed.
    .config(function($routeProvider){

        $routeProvider.when("/", {
            templateUrl : "stats/partials/emptyForm.html",
        }).when("/FAQ", {
            templateUrl : "stats/partials/FAQForm.html",
            controller: 'FAQCtrl'
        }).otherwise({redirectTo:'/'})
    });

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
var mainCtrl = angular.module('mainCtrl', []);

mainCtrl.controller("mainCtrl", function ($scope, $http) {
    $scope.visits = 0;
    $http({
        method: 'GET',
        url: '/visits'
    }).then(function successCallback(response) {
        $scope.visits = response.data.visits;
    });

    $scope.addFav = function () {
        if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
            window.sidebar.addPanel(document.title, window.location.href, '');
        } else if (window.external && ('AddFavorite' in window.external)) { // IE Favorite
            window.external.AddFavorite(location.href, document.title);
        } else if (window.opera && window.print) { // Opera Hotlist
            this.title = document.title;
            return true;
        } else { // webkit - safari/chrome
            alert('Appuyer ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D pour ajouter dans votre favoris :)');
        }
    }

    // general chart options
    let percTooltip = {
        callbacks: {
            label: function (tooltipItem, data) {
                let datasetIdx = [tooltipItem['datasetIndex']];
                let label = data["datasets"][datasetIdx].label;

                return (label === 'Létalité' || label === 'Nouveaux / total de la région') ?
                    label + ' : ' + data['datasets'][datasetIdx]['data'][tooltipItem['index']] + '%' :
                    label + ' : ' + data['datasets'][datasetIdx]['data'][tooltipItem['index']];
            }
        }
    };

    const optionLegend = { display: true, position: 'top', labels: { fontSize: 12, boxWidth: 12 } };
    const elementStyles = { point: { radius: 4, borderWidth: 3, hitRadius: 10 } };
    const limitXAxesTickScale = { xAxes: [{ ticks: { maxTicksLimit: screen.width / 30 } }] };
    $scope.doughnutChartOptions = { legend: optionLegend, elements: elementStyles, maintainAspectRatio: false, tooltips: percTooltip };
    $scope.chartOptions = { legend: optionLegend, elements: elementStyles, maintainAspectRatio: false, tooltips: percTooltip, scales: limitXAxesTickScale };

    $scope.mergeObj = function (firstObj, secondObj) {
        let objCopy = {};
        let key;
        for (key in firstObj) objCopy[key] = firstObj[key];
        for (key in secondObj) objCopy[key] = secondObj[key];
        return objCopy;
    }

    if (screen.width < 800) {
        $scope.chartOptions.elements.point = { radius: 2, borderWidth: 2, hitRadius: 6 }
    } else if (screen.width < 1200) {
        $scope.chartOptions.elements.point = { radius: 3, borderWidth: 3, hitRadius: 8 }
    }
    
    window.addEventListener("resize", function(){
        if ($scope.chartOptions.scales.xAxes[0].ticks.maxTicksLimit != screen.width / 25)
            $scope.chartOptions.scales.xAxes[0].ticks.maxTicksLimit = screen.width / 25

        if (screen.width < 800) {
            $scope.chartOptions.elements.point = { radius: 2, borderWidth: 2, hitRadius: 6 }
        } else if (screen.width < 1200) {
            $scope.chartOptions.elements.point = { radius: 3, borderWidth: 3, hitRadius: 8 }
        }
    });

});
var mapCtrl = angular.module('mapCtrl', ['leaflet-directive', 'chart.js']);

mapCtrl.controller("mapCtrl", function($scope, $http, leafletData) {

    const overseaRegionCodes = ["01", "02", "03", "04", "06"];
    const mapColors = [ '#FDEBCF', '#E9A188', '#D56355', '#BB3937', '#772526' ];
    const mapLabelsNbr = [ '1-499',   '500-999',  '1000-1999', '2000-4999', '>5000' ];
    const mapLabelsPerc = [ '<1.5‱',   '<2.5‱',  '<5‱', '<8‱', '>=8‱' ];
    const population = { "Île-de-France":12278210, "Centre-Val de Loire":2559073, "Bourgogne-Franche-Comté":2783039, "Normandie":3303500, "Hauts-de-France":5962662, "Grand Est":5511747, "Pays de la Loire":3801797, "Bretagne":3340379, "Nouvelle-Aquitaine":5999982, "Occitanie":5924858, "Auvergne-Rhône-Alpes":8032377, "Provence-Alpes-Côte d'Azur":5055651, "Corse":344679, "Guadeloupe":376879, "Saint-Barthélémy":7122, "Saint-Martin":35746, "Guyane":290691, "Martinique":358749, "Mayotte":279471, "La Réunion":859959 }
    const roundTo10Thousand = function(i) {return Math.round(i * 1000000) / 100};

    angular.extend($scope, {
        center: {
            lat: 46.35717,
            lng: 2.34293,
            zoom: 5
        },
        legend: {
            colors: mapColors,
            labels: mapLabelsNbr,
            position: 'bottomleft'
        },
        defaults: {
            scrollWheelZoom: false,
            attributionControl: true,
            tileLayerOptions: {
                attribution: '© statcorona.com'
            },
        }
    });

    // ---------------------------- Map ----------------------------
    let getTooltipDescStr = function(hosp, severe, death, cure) {
        return "En hospitalisation : " + hosp + "<br/>Réanimation : " + severe + "<br/>Décès : " + death + "<br/>Guéris : " + cure;
    }
    let getPercStr = function(nbr, population) {
        return roundTo10Thousand(nbr / population) + " ‱";
    }
    let getTooltipStr = function(region, type) {
        let regionName = "<b class='toolTipHeader'><u>" + region.name + "</u></b><br/>";
        if (type == "number") {
            return regionName + getTooltipDescStr(region.hospitalised, region.severe, region.death, region.cure);
        } else {
            let pop = population[region.name];
            return regionName + getTooltipDescStr(region.percHosp + " ‱", getPercStr(region.severe, pop), getPercStr(region.death, pop), getPercStr(region.cure, pop));
        }
    }
    let cleanStyle = function(leafletPayload) {
        if ($scope.prevClicked !== {} && $scope.prevClicked.layer) {
            $scope.prevClicked.layer.setStyle( style($scope.prevClicked.feature) );
        }
        $scope.selectedRegion = {};
        if (leafletPayload) leafletPayload.leafletObject.unbindTooltip();
    }
    // Scope functions
    $scope.$on("leafletDirectiveGeoJson.map.mouseover", function(ev, leafletPayload) {
        cleanStyle(leafletPayload)
        mouseover(leafletPayload.leafletObject.feature, leafletPayload.leafletEvent);
        leafletPayload.leafletObject.bindTooltip(getTooltipStr($scope.selectedRegion, $scope.mapDisplay), {className: 'mapTooltip'}).openTooltip();
    });
    
    $scope.$on("leafletDirectiveGeoJson.map.mouseout", function(ev, leafletPayload) {
        $scope.selectedRegion = {}
        leafletPayload.leafletObject.unbindTooltip();
    });

    $scope.$on("leafletDirectiveGeoJson.map.click", function(ev, leafletPayload) {
        cleanStyle(leafletPayload)
        click(leafletPayload.leafletObject.feature, leafletPayload.leafletEvent);
        leafletPayload.leafletObject.bindTooltip(getTooltipStr($scope.selectedRegion, $scope.mapDisplay), {className: 'mapTooltip'}).openTooltip();
    });

    $scope.$on("leafletDirectiveMap.map.preclick", function(ev, leafletPayload) {
        cleanStyle()
    });

    let mouseoverStyle = {weight: 2, color: '#666', fillColor: 'white'};
    
    let click = function(feature, leafletEvent) {
        let layer = leafletEvent.target;
        $scope.prevClicked = {layer: layer, feature: feature};
        layer.setStyle(mouseoverStyle);
        layer.bringToFront();
        $scope.selectedRegion = $scope.currentStats[feature.properties.code];
    }

    // block functions
    let mouseover = function(feature, leafletEvent) {
        var layer = leafletEvent.target;
        layer.setStyle(mouseoverStyle);
        layer.bringToFront();
        $scope.selectedRegion = $scope.currentStats[feature.properties.code];
    }

    let fillcolor = function(f) {
        if ($scope.mapDisplay == "number") {
            if (!f || !f.properties) return "white";
            let nbr = $scope.currentStats[f.properties.code].hospitalised;

            if (nbr == 0)  return "white";
            if (nbr < 500) return mapColors[0];
            if (nbr < 1000) return mapColors[1];
            if (nbr < 2000) return mapColors[2];
            if (nbr < 5000) return mapColors[3];
            return mapColors[4]
        } else {
            let perc = $scope.currentStats[f.properties.code].percHosp;
            
            if (perc == 0)  return "white";
            if (perc < 1.5) return mapColors[0];
            if (perc < 2.5) return mapColors[1];
            if (perc < 5) return mapColors[2];
            if (perc < 8) return mapColors[3];
            return mapColors[4]
        }
    }

    let style = function(feature) {
        return {
            fillColor: fillcolor(feature),
            weight: 1.5,
            opacity: 0.5,
            color: 'gray',
            dashArray: '1',
            fillOpacity: 1
        };
    }
    
    let getLegendHTML = function(index) {
        let color = mapColors[index];
        let text = $scope.mapDisplay == "number" ? mapLabelsNbr[index] : mapLabelsPerc[index];
        return '<div class="outline"><i style="background:'+color+'"></i></div><div class="info-label">'+text+'</div>'
    }

    let refreshGeoJsonLayers = function() {
        leafletData.getMap().then(function(map) {
            $('.legend.leaflet-control').remove();
            var legend = L.control({ position: "bottomleft" });
            legend.onAdd = function(map) {
                var div = L.DomUtil.create("div", "legend");
                div.innerHTML += "<div class='outline'><u>Hospitalisés</u></div>";
                for (let i = 0; i<mapColors.length; i++) div.innerHTML += getLegendHTML(i);
                return div;
            };
            legend.addTo(map);

            map.eachLayer(function(layer) {
                if( layer && layer.feature ) {
                    layer.setStyle( style(layer.feature) )
                }
            });
        });
    }
    $scope.mapBtnClicked = function(type) {
        $scope.mapDisplay = type;
        refreshGeoJsonLayers();
    }

    // Map Init
    $scope.selectedRegion = {}
    $scope.totalConfirmed = 0;
    $scope.prevClicked = {}
    $scope.mapDisplay = "number";

    // stats.json loaded from chart Ctrl
    // make sure mapCtrl is called before chart Ctrl, so the event is registered
    $scope.$on('statsLoaded', function(event, currentStats) {
        refreshGeoJsonLayers();

        $scope.franceMapUpdateTime = currentStats["11"].date;
        $scope.currentStats = currentStats;
        
        let totalHospitalised = 0, omHospitalised = 0, omDeath = 0, omSevere = 0, omCure = 0;
        for (regionIdx in currentStats) {
            if (overseaRegionCodes.indexOf(regionIdx) < 0) {
                let hospitalised = currentStats[regionIdx].hospitalised;
                totalHospitalised += hospitalised;
                currentStats[regionIdx]["percHosp"] = roundTo10Thousand(hospitalised / population[currentStats[regionIdx].name]);
            }
            else {
                omHospitalised += currentStats[regionIdx].hospitalised;
                omDeath += currentStats[regionIdx].death;
                omSevere += currentStats[regionIdx].severe;
                omCure += currentStats[regionIdx].cure;
            }
        }
        // OM total population = 2208617
        $scope.totalHospitalised = totalHospitalised + omHospitalised;
        $scope.outreMer = {"name": "Outre-mer", "hospitalised": omHospitalised, "death": omDeath, "severe": omSevere, "cure": omCure, "percHosp": roundTo10Thousand(omHospitalised / 2208617)};

        // France total population = 67106571
        $scope.totalPerc = roundTo10Thousand($scope.totalHospitalised / 67106571);

        $http.get("stats/ressources/geojson/Region.min.geojson").then(function(regResp) {
            $scope.geojsonData = regResp.data;
            angular.extend($scope, {
                geojson: {
                    data: $scope.geojsonData,
                    style: style,
                    resetStyleOnMouseout: true
                }
            });
        }, function(e) {});
    });

});
var regionChartCtrl = angular.module('regionChartCtrl', ['leaflet-directive', 'chart.js']);

regionChartCtrl.controller("regionChartCtrl", function($scope, $http) {
    const keyNbrColors = [{borderColor: '#f74c31', backgroundColor: 'rgba(0, 0, 0, 0)'}, {borderColor: '#f78207', backgroundColor: 'rgba(0, 0, 0, 0)'}, {borderColor: '#5d7092', backgroundColor: 'rgba(0, 0, 0, 0)'}, {borderColor: '#28b7a3', backgroundColor: 'rgba(0, 0, 0, 0)'}];

    let roundToPercent = function(i) {return Math.round(i * 10000) / 100}

    // Region history
    $scope.setRegionHistoryChart = function() {
        let regionCode = $scope.regionsHistorySelectData.selected;
        let data = $scope.regHistoryData[regionCode];
        
        $scope.regHistoryChartData = [data["h"], data["s"], data["d"], data["c"]];
        $scope.regHistoryChartSeries = ['Hospitalisés', 'Réanimation', 'Décès', 'Guéris'];
        $scope.regHistoryChartLabels = data.dates;
        $scope.regHistoryChartColors = keyNbrColors;
    }

    $scope.loadRegionHistory = function() {
        if (!$scope.regHistoryData) {
            $http.get("stats/ressources/json/historyPerRegion.json").then(function(regHisResp) {
                $scope.regHistoryData = regHisResp.data;
                $scope.regionsHistorySelectData = {
                    selected: '93',
                    regions: $scope.regHistoryData.mapping
                }
                $scope.setRegionHistoryChart();
            }, function(e) {});
        }
    }

    // Dept history
    $scope.setDepartmentHistoryChart = function() {
        let deptCode = $scope.deptHistorySelectData.selected.code;
        let data = $scope.deptHistoryData[deptCode];
        $scope.deptHistoryChartData = [data["h"], data["s"], data["d"], data["c"]];
        $scope.deptHistoryChartSeries = ['Hospitalisés', 'Réanimation', 'Décès', 'Guéris'];
        $scope.deptHistoryChartLabels = data.dates;
        $scope.deptHistoryChartColors = keyNbrColors;
    }

    $scope.loadDepartmentHistory = function() {
        if (!$scope.deptHistoryData) {
            $http.get("stats/ressources/json/historyPerDepartment.json").then(function(deptHisResp) {
                $scope.deptHistoryData = deptHisResp.data;
                $scope.deptHistorySelectData = {
                    selected: {code: '06', name: 'Alpes-Maritimes'},
                    depts: $scope.deptHistoryData.mapping
                }
                $scope.setDepartmentHistoryChart();
            }, function(e) {});
        }
    }

    $scope.completeDept=function(input){
        let output=[], mapping = $scope.deptHistoryData.mapping;
        
        for (let i=0; i<mapping.length; i++) {
            let dept = mapping[i];
            if ((dept.code && dept.code.toLowerCase().indexOf(input.toLowerCase())>=0) ||
                    (dept.name && dept.name.toLowerCase().indexOf(input.toLowerCase())>=0)) {
                output.push(dept);
            }
        }
        output.sort(function(a, b) {return parseInt(a.code) - parseInt(b.code)});
        $scope.filteredDepts=output.slice(0,9);
    }
    
    $scope.fillTextbox=function(input){
        $scope.deptHistorySelectData.selected = input;
        $scope.setDepartmentHistoryChart();
        $scope.selectedDeptDisplayValue = input.code + " - " + input.name;
        $scope.filteredDepts=null;
    }

    document.onkeydown = function(evt) {
        evt = evt || window.event;
        switch (evt.keyCode) {
            case 38:
                document.activeElement.previousElementSibling.focus();
                break;
            case 40:
                document.activeElement.nextElementSibling.focus();
                break;
        }
    };

    // Region per age
    $scope.regionsAgeSelectData = {
        selected: 'France entier',
        regions: [{name:'France entier'},{name:'Guadeloupe'},{name:'Guyane'},{name:'La Réunion'},{name:'Mayotte'},{name:'Île-de-France'},{name:'Centre-Val de Loire'},{name:'Bourgogne-Franche-Comté'},{name:'Normandie'},{name:'Hauts-de-France'},{name:'Grand Est'},{name:'Pays de la Loire'},{name:'Bretagne'},{name:'Nouvelle-Aquitaine'},{name:'Occitanie'},{name:'Auvergne-Rhône-Alpes'},{name:'Provence-Alpes-Côte d\'Azur'},{name:'Corse'}]
    }

    let agePerc = function(category, region) {return roundToPercent(region[category] / region['0'])}
    $scope.setRegionPerAgeChart = function() {
        let regionPerAgeData = $scope.regionPerAgeData;
        let region = regionPerAgeData[$scope.regionsAgeSelectData.selected];
        
        $scope.regionPerAgeChartData = [agePerc('A', region), agePerc('B', region), agePerc('C', region), agePerc('D', region), agePerc('E', region)];
        $scope.regionPerAgeChartLabels = ['<15','15-44','45-64','65-74','>75'];
        let title={display: true, text: "Cas confirmé par tranches d'age (%)"}
        let tooltipsAge = {
            callbacks: {
              label: function(tooltipItem, data) {
                return data['labels'][tooltipItem['index']] + ' ans : ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
              }
            }};

        $scope.regionPerAgeChartOptions = $scope.mergeObj($scope.doughnutChartOptions, {title: title, tooltips: tooltipsAge});
    }

    $scope.loadRegionAge = function () {
        if (!$scope.regionPerAgeData ) {
            $http.get("stats/ressources/json/regionalCasesPerAge.json").then(function(regionPerAgeResp) {
                $scope.regionPerAgeData = regionPerAgeResp.data;
                $scope.setRegionPerAgeChart();
            }, function(e) {});
        }
    }
});