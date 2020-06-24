
function createMap(earthquakeLayer, faultLineLayer) {

  //   // Create the tile layer that will be the background of our map
  var outdoor = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {   
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox/outdoors-v11",
      accessToken: API_KEY
  });

  var light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {   
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox/light-v10",
      accessToken: API_KEY
  });

  var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {   
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

    // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": light,
    "Outdoor": outdoor,
    "Satellite": satellite
  };

  // Create an overlayMaps object to hold the different data layers
  var overlayMaps = {
    "Earthquakes": earthquakeLayer, 
    "Fault Lines": faultLineLayer
  };

  // Creating map object
  var myMap = L.map("map", {
    center: [40, -120],
    zoom: 6,
    layers: [light, earthquakeLayer],
    collapse: true
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);


  // Set up the legend
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend');
    var mags = [0,1,3,5,7];
    var labels = [];

    for (var i = 0; i < mags.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
          mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
    }

    return div;
  }
  // Adding legend to the map 
  legend.addTo(myMap);

};

//Create function to return color based on magnitude of the earthquake
function getColor(m) {
  return m > 7 ? '#bd0026' :
         m > 5 ? '#f03b20' :
         m > 3 ? '#fd8d3c' :
         m > 1 ? '#fecc5c' :
                '#ffffb2';
};

//Create function to generate earthquake layer
function earthquakeMarkers(response) {
  //  Create variable to store earthquake data
  var earthquake = response.features;

  // Initialize an array to hold eqarthquakes circles
  var earthquakeMarkers = [];

  // Loop through data
  for (var i = 0; i < earthquake.length; i++) {

    // Set the data location property to a variable
    var location = earthquake[i].geometry.coordinates;

    // Set variable for marker info
    var property = earthquake[i].properties
    var mag = property.mag;
    var place = property.place
    var time = property.time;

    //convert time from Epoch to datetime
    var date = new Date(0);
    date.setUTCSeconds(time/1000);

    // Check for location property
    if (location) {
      earthquakeMarkers.push(L.circle([location[1], location[0]], {
                              fillOpacity: 0.75,
                              stroke: false,
                              color: getColor(mag),
                              radius: mag*10000
                            }).bindPopup("<h3>Earthquake time:</h3>" + date + 
                              "<br><h3>Location:</h3>" + place + 
                              "<br><h3>Magnitude:</h3>" + mag));
    };
  };

  // Create a layer group and return it
  var earthquakeLayer = L.layerGroup(earthquakeMarkers);
  
  return earthquakeLayer;

};

function faultLines(response) {
  
  // Initialize an array to hold fault lines
  var faultLines = [];

  //  Create variable to store plates data
  var plates = response.features;

  // Loop through data
  for (var i = 0; i < plates.length; i++) {

    var myStyle = {
      "color": "orange",
      "opacity": 0.65
    };
  
    faultLines.push(L.geoJSON(plates[i], {style: myStyle}).bindPopup("<h3>Plate Name:</h3>" + plates[i].properties.PlateName));

  };

  // Create a layer group and return it
  var faultLineLayer = L.layerGroup(faultLines);

  return faultLineLayer;

};


// Store query url for "all earthquakes in past 7 days"
query_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Store query url for tectonic plates
query_url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";


// Grab the data with d3
d3.json(query_url, function(response) {

  var earthquakeLayer = earthquakeMarkers(response);

  d3.json(query_url2, function(response2) {

    var faultLineLayer = faultLines(response2);

    createMap(earthquakeLayer, faultLineLayer);

  });

});

  