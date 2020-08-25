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