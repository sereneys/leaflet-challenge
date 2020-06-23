// Creating map object
var myMap = L.map("map", {
    center: [40, -120],
    zoom: 6
  });

// Adding tile layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {   
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
}).addTo(myMap);

// Store query url for "all earthquakes in past 7 days"
query_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//Create function to return color based on magnitude of the earthquake
function getColor(m) {
  return m > 7 ? '#bd0026' :
         m > 5 ? '#f03b20' :
         m > 3 ? '#fd8d3c' :
         m > 1 ? '#fecc5c' :
                '#ffffb2';

};

// Grab the data with d3
d3.json(query_url, function(response) {

    //  Create variable to store earthquake data
    var earthquake = response.features;

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

        L.circle([location[1], location[0]], {
            fillOpacity: 0.75,
            stroke: false,
            color: getColor(mag),
            radius: mag*10000
        }).bindPopup("<h3>Earthquake time:</h3>" + date + 
                "<br><h3>Location:</h3>" + place + 
                "<br><h3>Magnitude:</h3>" + mag).addTo(myMap);
  
      }
    }
  
  });

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