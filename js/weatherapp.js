// ESTABLISH GLOBAL VARIABLES
var apiData;
var setLat;
var setLong;

// FORM SUBMIT: GEOCODE
document.getElementById("geocode-form").addEventListener("submit", function(event) {
  event.preventDefault();

  var address = document.getElementById("address-input").value;
  if (!address) return;

  // Use Nominatim API directly
  var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  fetch(url)
      .then(response => response.json())
      .then(data => {
          if (data.length > 0) {
              var lat = data[0].lat;
              var lon = data[0].lon;
              console.log("Coordinates:", lat, lon);

              // Move the map and add a marker
              var latlng = [lat, lon];
              leafletMap.setView(latlng, 14);
              L.marker(latlng).addTo(leafletMap).bindPopup(data[0].display_name).openPopup();

              // Display result
              console.log(`Coordinates: ${lat}, ${lon}`);

              // send Lat and Long to data retrieval
              setLat = lat
              setLong = lon
              fetchWeatherData(setLat,setLong)

          } else {
              alert("Location not found!");
          }
      })
      .catch(error => console.error("Geocoding error:", error));
});


// INITIALIZE LEAFLET MAP FOR GEOCODING
const leafletMap = L.map('map').setView([40.654361,-73.966668],11);

// Add  tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 15,
  minZoom: 11
}).addTo(leafletMap);


// USE BROWSER GEOCODER TO GET ZIP
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchLoc, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

// Function to handle successful location retrieval
function fetchLoc(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setLat = latitude
    setLong = longitude

    fetchWeatherData(latitude,longitude)

    var latlng = [latitude, longitude];
    leafletMap.setView(latlng, 14);
    L.marker(latlng).addTo(leafletMap)
      // .bindPopup(data[0].display_name)
      // .openPopup();

    leafletMap.setView([latitude,longitude], 14);

}

// Function to handle error in getting location
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}

// Get the location when the page loads
getLocation();


// INITIALIZE API FETCH
function fetchWeatherData(x,y) {
  api = 'https://api.weatherapi.com/v1/forecast.json?key=b8ed8f57e3fa4e4ca0c140623250902&q=' + x + ',' + y + '&days=7&aqi=yes&alerts=no'
  fetch (api)
      .then(response => {return response.json()})
      .then(data => {
        apiData = data
        console.log('****LOADING WEATHER DATA')
        console.log(apiData)
        printTodaySummary(apiData)
        drawTableShells(apiData)
        ingestHourlyData(apiData)
  })
}

function printTodaySummary(x) {
    // Show results containers
    document.querySelectorAll(".resultsContainer").forEach(element => {
        element.classList.remove("resultsContainer");
    });

    document.getElementById('cityPrint').innerText = x.location.name
    document.getElementById('statePrint').innerText = x.location.region

    // Current
    document.getElementById('currentTempPrint').innerText = setUnits(x.current.temp_f)
    document.getElementById('textPrint').innerText = x.current.condition.text

    // Icon
    document.getElementById('iconPrint2').src = x.current.condition.icon

    // AQI
    document.getElementById('aqiPrint').innerHTML = x.current.air_quality["us-epa-index"]

    // Change of precip
    document.getElementById('rainChancePrint').innerText = x.forecast.forecastday[0].day.daily_chance_of_rain + '%'
    document.getElementById('snowChancePrint').innerText = x.forecast.forecastday[0].day.daily_chance_of_snow + '%'

    // Low, High
    // document.getElementById('lowPrint').innerText = x.forecast.forecastday[0].day.mintemp_f
    // document.getElementById('highPrint').innerText = x.forecast.forecastday[0].day.maxtemp_f

    // PRINT TODAY'S DROPDOWN HEADER - TEMP RANGE

}

function drawTableShells(x) {
    console.log('****DRAWING TABLE SHELLS');

    var holder = document.getElementById('forecastHolder');
    holder.innerHTML = ''; // Clear previous content

    for (let i = 0; i < x.forecast.forecastday.length; i++) {
        let rowId = `day${i}Row`;
        let collapseId = `day${i}Collapse`;

        let rowHTML = `
            <!-- DAY ${i} HEADER -->
            <div class="col-12">
                <div class="row py-2 dayHeader no-gutters" id="${rowId}" data-target="${collapseId}">
                    <div class="col-3">
                        <span class="d-block"> 
                            <img src="sampleimage.png" id="day${i}Icon" alt="icon" style="width: 30px; height: 30px; vertical-align: middle;">
                            <span class="font-weight-bold" id="day${i}">Today</span>
                        </span>
                        <p class="fs-xs" id="day${i}Condition">Condition</p>
                    </div>
                    <div class="col-9">
                            <div class="dotVis" id="day${i}Dot"></div>
                    </div>
                </div>
            </div>
        `;

        let collapseHTML = `
            <!-- DAY ${i} COLLAPSE -->
            <div class="col-12 px-2">
                <div class="dayContent sr-only mb-4" id="${collapseId}">
                    <div class="vis-container">
                        <div class="vis pr-3" id="day${i}vis">Vis goes here</div>
                    </div>
                </div>
            </div>
        `;

        // Append new elements correctly
        holder.insertAdjacentHTML('beforeend', rowHTML);
        holder.insertAdjacentHTML('beforeend', collapseHTML);
    }

    // ADD EVENT LISTENERS TO HEADER ROWS FOR MANUAL SHOW/HIDE/ANIMATE
    const headerRows = document.querySelectorAll('.dayHeader');

    headerRows.forEach(row => {
        const targetId = row.dataset.target;
    
        row.addEventListener('click', () => {
            const targetRow = document.getElementById(targetId);
            if (!targetRow) return;
    
            // If the target row is already visible, animate hiding it
            if (targetRow.classList.contains('visible')) {
                targetRow.classList.remove('visible');
    
                // Wait for animation to complete, then add sr-only
                setTimeout(() => {
                    targetRow.classList.add('sr-only');
                }, 300); // Matches CSS transition duration
                return;
            }
    
            // Hide all other rows before opening a new one
            document.querySelectorAll('.dayContent').forEach(chart => {
                if (chart !== targetRow) {
                    chart.classList.remove('visible');
                    setTimeout(() => {
                        chart.classList.add('sr-only');
                    }, 300);
                }
            });
    
            // Show the clicked row
            targetRow.classList.remove('sr-only');
            setTimeout(() => {
                targetRow.classList.add('visible');
            }, 10); // Small delay to allow browser to register the class change
        });
    });
    
    

    printRangeHeaders(x)
}


function printRangeHeaders(x) {
    // GET RANGE, MIN, AND MAX
    var sevenDayTemps = [];

    // Loop through days
    for (let i = 0; i < x.forecast.forecastday.length; i++) {
        // Print day headers
        document.getElementById(`day${i}Icon`).src = x.forecast.forecastday[i].day.condition.icon
        document.getElementById(`day${i}Condition`).innerText = x.forecast.forecastday[i].day.condition.text
        if ( i > 0) {
            document.getElementById(`day${i}`).innerText = getDayOfWeek(x.forecast.forecastday[i].date)
        }
        // Get daily highs and lows
        var low = setUnits(x.forecast.forecastday[i].day.mintemp_f)
        var high = setUnits(x.forecast.forecastday[i].day.maxtemp_f)
        // And push to array
        sevenDayTemps.push(low,high)
    }

    // GET RANGE, MIN, AND MAX
    var sevenDayMin = Math.min(...sevenDayTemps)
    var sevenDayMax = Math.max(...sevenDayTemps) 
    var sevenDayRange = [sevenDayMin, sevenDayMax]


    // LOOP THROUGH DAYS, CREATE LITTLE CHART
    for (let j = 0; j < x.forecast.forecastday.length; j++) {
        var todayLow = setUnits(x.forecast.forecastday[j].day.mintemp_f)
        var todayHigh = setUnits(x.forecast.forecastday[j].day.maxtemp_f)

        // create data json

        let dataObject = []

        dataObject[0] = {
            end: "Low",
            temp: todayLow,
            day: `day${j}`
        }

        dataObject[1] = {
            end: "High",
            temp: todayHigh,
            day: `day${j}`
        }

        // console.log(j, dataObject)

        // send dataObject to dayRangeChart
        drawDayRangeChart(j,dataObject,sevenDayRange)

    }

}


function drawDayRangeChart(day,data,range) {

    var destination = '#day'+day+'Dot'
    // console.log(destination)
    //console.log(document.getElementById(destination))

    var spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Ranged dot plot",
        "config": {
          "background": "transparent",
          "view": {
            "stroke": null
          }
        },
        "width": "container",
        "height": 50,
        "data": {
          "values": data
        },
        "encoding": {
          "x": {
            "field": "temp",
            "type": "quantitative",
            "title": "",
            "scale": {"domain": range},
            "axis": {"grid": false, "domain": false, "labels": false, "ticks": false}
          },
          "y": {
            "field": "day",
            "type": "nominal",
            "title": "",
            "axis": {
              "offset": 5,
              "ticks": false,
              "minExtent": 70,
              "domain": false,
              "labels": false
            },
            "scale": {"padding": 5}
          }
        },
        "layer": [
          {
            "mark": "line",
            "encoding": {
              "detail": {"field": "day", "type": "nominal"},
              "color": {"value": "lightgray"},
              "strokeWidth": {"value": 20}
            }
          },
          {
            "mark": {"type": "point", "filled": true},
            "encoding": {
              "x": {"field": "temp", "type": "quantitative"},
              "color": {
                "field": "end",
                "type": "nominal",
                "scale": {"domain": ["Low", "High"], "range": ["#e6959c", "#911a24"]},
                "legend": null
              },
              "size": {"value": 750},
              "opacity": {"value": 1}
            }
          },
          {
            "mark": {
              "type": "text",
              "dx": 0,
              "align": "center",
              "fontSize": 10,
              "fontWeight": "bold"
            },
            "encoding": {
              "x": {"field": "temp", "type": "quantitative"},
              "text": {"field": "temp", "type": "quantitative", "format": ".0f"},
              "color": {"value": "white"}
            }
          }
        ]
      }


    vegaEmbed(destination,spec, {actions: false})
}


function ingestHourlyData(x) {
    console.log('***ASSEMBLING HOURLY DATA')

    // Loop through days
    for (let i = 0; i < x.forecast.forecastday.length; i ++) {
        var dayData = [];

        var dayChanceRain = x.forecast.forecastday[i].day.daily_chance_of_rain
        var dayChanceSnow = x.forecast.forecastday[i].day.daily_chance_of_snow
        

        var maxtemp = setUnits(x.forecast.forecastday[i].day.maxtemp_f + 3)
        var mintemp = setUnits(x.forecast.forecastday[i].day.mintemp_f - 3)

        var precip;

        if (dayChanceSnow > dayChanceRain || (dayChanceSnow > 0 && x.forecast.forecastday[i].day.maxtemp_f < 32)) {
            precip = 'snow'
        }  else {
            precip = 'rain'
        }

        // console.log(i, dayChanceRain, dayChanceSnow, x.forecast.forecastday[i].day.maxtemp_f)
        // console.log(i, precip)


        domain = [mintemp,maxtemp]

        

        // Loop through hours, extract values and put into data object
        for (let j = 0; j < x.forecast.forecastday[i].hour.length; j++) {
            let hour = x.forecast.forecastday[i].hour[j]
            let dayObject = {
                time: hour.time,
                time_epoch: hour.time_epoch,
                temp_f: setUnits(hour.temp_f),
                cloud: hour.cloud,
                precip_in: hour.precip_in,
                chance_of_rain: hour.chance_of_rain,
                chance_of_snow: hour.chance_of_snow,
                pm2_5: hour.air_quality.pm2_5
            }

            dayData.push(dayObject);

        }

        // Width test, for some charting approaches
        var element = document.getElementById('day0vis');
        if (element) {
            var width = element.offsetWidth;
        }

        // SEND DAY DATA TO CHARTING FUNCTION
        drawChart(i,dayData,precip,domain)

    }
}

function drawChart(day,data,precip,domain) {
    var mainPrecip      = precip
    var secondPrecip;
    if (precip === 'rain') {
        secondPrecip = 'snow'
    } else {
        secondPrecip = 'rain'
    }

    var mainVariable = 'chance_of_'+precip
    var secondVariable = 'chance_of_'+secondPrecip

    var mainLabel = capitalizeFirstLetter(mainPrecip)
    var secondLabel = capitalizeFirstLetter(secondPrecip)

    var unitPrint = (units === 1) ? '°F' : '°C'

    var mainDisplay =  {
        "width": "container",
        "height": 90,
        "title": mainLabel,
        "mark": {
          "type": "area",
          "interpolate": "basis",
          "color": {
            "x1": 1,
            "y1": 1,
            "x2": 1,
            "y2": 0,
            "gradient": "linear",
            "stops": [
              {"offset": 0, "color": "white"},
              {"offset": 1, "color": "lightblue"}
            ]
          }
        },
        "encoding": {
          "x": {
            "field": "time",
            "type": "temporal",
            "title": "",
            "axis": {"format": "%I%p"},
            "scale": {"padding": 20}
          },
          "y": {
            "field": mainVariable,
            "type": "quantitative",
            "title": "",
            "scale": {"domain": [0, 100]},
            "axis": {
              "format": ".0f",
              "labelExpr": "datum.value === 0 ? '' : datum.value + '%'",
              "orient": "left"
            }
          }
        }
      }

      var secondDisplay = {
        "width": "container",
        "height": 30,
        "title": {"text": secondLabel, "align": "left", "dx": -32, "dy": 10},
        "mark": {
          "type": "text",
          "align": "center",
          "baseline": "middle",
          "fontSize": 6
        },
        "encoding": {
          "x": {"field": "time", "type": "temporal", "title": "", "axis": null,"scale": {"padding": 20}},
          "text": {
            "field": secondVariable,
            "type": "quantitative",
            "format": ".0f",
            "condition": {
              "test": `datum.${secondVariable} !== null`,
              "value": {"expr": `datum.${secondVariable} + '%'`}
            }
          },
          "opacity": {
            "field": secondVariable,
            "type": "quantitative",
            "scale": {"domain": [0, 100]},
            "legend": false
          }
        }
      }

    var visSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
          "values": data
        },
        "config": {
          "title": {"anchor": "start", "fontSize": 10},
          "axisY": {"tickCount": 3, "domain": false, "tickColor": "lightgray"},
          "axisX": {"grid": false, "tickCount": 4, "domain": true},
          "view": {"stroke": null},
          "background": "transparent"
        },
        "vconcat": [
            {
              "width": "container",
              "height": 90,
              "title": {"text": "Temperature", "align": "left"},
              "mark": {"type": "point", "size": 150, "filled": true},
              "encoding": {
                "x": {
                  "field": "time",
                  "type": "temporal",
                  "title": "",
                  "axis": {
                    "format": "%I%p"
                  },
                  "scale": {"padding": 20}
                },
                "y": {
                  "field": "temp_f",
                  "type": "quantitative",
                  "title": "",
                  "axis": {"labelExpr": `datum.value + '${unitPrint}'`, "orient": "left"},
                  "scale": {
                    "domain": domain
                  }
                },
                "color": {"value": "coral"}
              }
            },
            mainDisplay,
            secondDisplay,
            {
              "width": "container",
              "height": 90,
              "title": "Cloud cover",
              "mark": {
                "type": "area",
                "interpolate": "basis",
                "color": {
                  "x1": 1,
                  "y1": 1,
                  "x2": 1,
                  "y2": 0,
                  "gradient": "linear",
                  "stops": [
                    {"offset": 0, "color": "white"},
                    {"offset": 1, "color": "darkgray"}
                  ]
                }
              },
              "encoding": {
                "x": {
                  "field": "time",
                  "type": "temporal",
                  "title": "",
                  "axis": {"format": "%I%p"},
                  "scale": {"padding": 20}
                },
                "y": {
                  "field": "cloud",
                  "type": "quantitative",
                  "title": "",
                  "scale": {"domain": [0, 100]},
                  "axis": {
                    "format": ".0f",
                    "labelExpr": "datum.value === 0 ? '' : datum.value + '%'",
                    "orient": "left"
                  }
                }
              }
            }
          ],
          "spacing": 25
      }
    
    var destination = `#day${day}vis`
    vegaEmbed(destination,visSpec, {actions: false})
}

function getDayOfWeek(dateString) {
    // Parse the date manually to prevent timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day)); // Ensure UTC

    let dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

    if (dayName === 'Monday') {
        return 'Mon'
    } else if (dayName === 'Tuesday') {
        return 'Tues'
    } else if (dayName === 'Wednesday') {
        return 'Weds'
    } else if (dayName === 'Thursday') {
        return 'Thurs'
    } else if (dayName === 'Friday') {
        return 'Fri'
    } else if (dayName === 'Saturday') {
        return 'Sat'
    } else if (dayName === 'Sunday') {
        return 'Sun'
    }

    // Get the full day name
    return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });


}

function capitalizeFirstLetter(str) {
    if (!str) return str; // Handle empty string
    return str.charAt(0).toUpperCase() + str.slice(1);
}


var units = 1 // 1 = F, 0 = C
function changeUnits(x) {
  units = x 
  // Remove 'active' class from all unit buttons
  document.querySelectorAll('.unitBtn').forEach(btn => btn.classList.remove('active'));

  // Add 'active' class to the clicked button
  if (x === 0) {
    document.getElementById('cbtn').classList.add('active');
    console.log('****UNITS SET: Celsius')
  } else {
    document.getElementById('fbtn').classList.add('active');
    console.log('****UNITS SET: Fahrenheit')
  }

  // THEN, RE-PRINT INFORMATION WITH MULTIPLICATION APPLIES
  fetchWeatherData(setLat,setLong)

}

// SET UNITS RUNS ON ALL NUMERIC ASSIGNMENTS; IT'LL KEEP AS F IF F IS SELECTED AS UNITS, OR CONVERT TO C
function setUnits(x) {
  if (units === 1) {
    return x
  } else if (units === 0) {
    let convert = 5 * (x - 32)/9
    return convert.toFixed(1)
  }
}

console.log('****UNITS SET: Fahrenheit')