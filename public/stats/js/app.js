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
