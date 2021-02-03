/*
define 
*/



var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
});


var myMap = L.map("myMap", {
    center: [
        37.6, 14.0
    ],
    zoom: 2.9
});

satellitemap.addTo(myMap);

var earthquakes = new L.LayerGroup();
var tectonicplates = new L.LayerGroup();

var baseMaps = {
    "Satellite Map": satellitemap
};

var overlayMaps = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": earthquakes

};

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);
console.log("control layers added to the map");


var UrlPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(UrlPlates, function (plateData) {
    L.geoJson(plateData, {
        color: "orange",
        weight: 3
    })
        .addTo(tectonicplates);

    tectonicplates.addTo(myMap);
});

var UrlEarthquake = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(UrlEarthquake, function (data) {
    function styleInformation(feature) {
        return {
            opacity: 1,
            fillOpacity: 0.6,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "white",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4.5;
    }

    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#b35806";
            case depth > 70:
                return "#f1a340";
            case depth > 50:
                return "#fee0b6";
            case depth > 30:
                return "#d8daeb";
            case depth > 10:
                return "#998ec3";
            default:
                return "#542788";
        }
    }

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },


        style: styleInformation,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Location: "
                + feature.properties.place

            );
        }


    })

        .addTo(earthquakes);

    earthquakes.addTo(myMap);

    var legend_depth = L.control({
        position: "bottomleft"
    });
    legend_depth.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var grades = [0, 10, 30, 50, 70, 90];
        var colors = [
            "#542788",
            "#998ec3",
            "#d8daeb",
            "#fee0b6",
            "#f1a340",
            "#b35806"

        ];
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += [
                "Depth: " +
                "<i style='background: " + colors[i] + "'></i>"
                + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "km" + "<br>" : "+" + "km")];

        }
        return div;
      

    };
    legend_depth.addTo(myMap);



});
