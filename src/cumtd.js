var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function locationSuccess(pos) {
  // Construct URL
  var url =  "https://developer.cumtd.com/api/v2.2/json/GetStopsByLatLon?key=9a1fc4aa940a4e5384a8950cc476b5e0&lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude;
  // Send request to the OpenWeatherMap
  xhrRequest(url, 'GET',
    function(responseText) {
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);
      
      // Temperature in Kelvin requires adjustment
      var stop_id = json.stops[0].stop_id;
      console.log("Stop ID is " + stop_id);
   
      // Conditions
      var stop_name = json.stops[0].stop_name;
      console.log("Stop name is " + stop_name);
      
      //var arrival_times, trip_headsign;
      var url2 = "https://developer.cumtd.com/api/v2.2/json/GetStopTimesByStop?key=9a1fc4aa940a4e5384a8950cc476b5e0&stop_id=" + stop_id;
  
      // Send request to the OpenWeatherMap
      xhrRequest(url2, 'GET',
        function(responseText) {
          // responseText contains a JSON object with weather info
          var json2 = JSON.parse(responseText);
      
          // Temperature in Kelvin requires adjustment
          var arrival_times = json2.stop_times[0].arrival_time;
          console.log("Arrival Time is " + arrival_times);
   
          // Conditions
          var trip_headsign = json2.stop_times[0].trip.trip_headsign;
          console.log("Trip Headsign is " + trip_headsign);
          
          // Assemble dictionary using our keys
          var dictionary = {
            "KEY_STOPID": stop_id,
            "KEY_STOPNAME": stop_name,
            "KEY_ARRIVAL": arrival_times,
            "KEY_SIGN": trip_headsign
          };
          
          // Send to Pebble
          Pebble.sendAppMessage(dictionary,
            function(e) {
              console.log("Stops info sent to Pebble successfully!");
            },
            function(e) {
              console.log("Error sending stops info to Pebble!");
            }
          );
        });
      
      //console.log(arrival_times);
      
      
    }
  );
}

function locationError(err) {
  console.log("Error requesting location!");
}
/*
function stopSuccess(stop_id) {
  var url2 = "https://developer.cumtd.com/api/v2.2/json/GetStopTimesByStop?key=9a1fc4aa940a4e5384a8950cc476b5e0&stop_id=" + stop_id;
  
  // Send request to the OpenWeatherMap
  xhrRequest(url2, 'GET',
    function(responseText) {
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);
      
      // Temperature in Kelvin requires adjustment
      var arrival_times = json.stop_times[0].arrival_time;
      console.log("Arrival Time is " + arrival_times);
   
      // Conditions
      var trip_headsign = json.stop_times[0].trip.trip_headsign;
      console.log("Trip Headsign is " + trip_headsign);
      
      return arrival_times + trip_headsign;
    }
  );
}
*/
function getStop() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready',
  function(e) {
    console.log("PebbleKit JS ready!");
    
    // Get initial weather
    getStop();
    //stopSuccess("UNIPRRE");
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log("AppMessage received!");
    getStop();
    //stopSuccess("UNIPRRE");
  }
);