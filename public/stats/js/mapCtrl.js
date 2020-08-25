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