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