// ESTABLISH GLOBAL VARIABLES
var apiData;

// USE BROWSER GEOCODER TO GET ZIP
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchZipCode, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

// Function to handle successful location retrieval
function fetchZipCode(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // OpenCage Geocoding API endpoint (Replace YOUR_API_KEY with your key)
    const apiKey = '6e21ba74db3a4838a528707bd39bc7a4'; 
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Get the zip code from the response
            console.log('***GETTING LOCATION FROM BROWSER')
            const zipCode = data.results[0]?.components?.postcode || "Zip code not found";
            console.log(`Your zip code is: ${zipCode}`);
            
            fetchWeatherData(zipCode) 
            // printStaticData(apiReturn)
        })
        .catch(error => {
            console.log("Error fetching zip code.");
        });
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

// EVENT LISTENER ON ZIP SUBMISSION FORM
document.addEventListener("DOMContentLoaded", function () {
    const input = document.querySelector(".form-control");
    const button = document.querySelector(".btn");

    function handleSubmit() {
        const value = input.value.trim();
        console.log("Entered value:", value);
        
        if (/^\d{5}$/.test(value)) {
            console.log("Valid 5-digit ZIP Code.");
            fetchWeatherData(value)
        } else {
            console.log("Invalid ZIP Code. Please enter a 5-digit number.");
        }
    }

    button.addEventListener("click", handleSubmit);
    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
        }
    });
});

// INITIALIZE API FETCH
function fetchWeatherData(x) {
    api = 'https://api.weatherapi.com/v1/forecast.json?key=b8ed8f57e3fa4e4ca0c140623250902&q=' + x + '&days=7&aqi=yes&alerts=no'
    fetch (api)
        .then(response => {return response.json()})
        .then(data => {
        apiData = data
        console.log('***LOADING WEATHER DATA')
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
    document.getElementById('currentTempPrint').innerText = x.current.temp_f
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
    console.log('***DRAWING TABLE SHELLS');

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
        var low = x.forecast.forecastday[i].day.mintemp_f
        var high = x.forecast.forecastday[i].day.maxtemp_f
        // And push to array
        sevenDayTemps.push(low,high)
    }

    // GET RANGE, MIN, AND MAX
    var sevenDayMin = Math.min(...sevenDayTemps)
    var sevenDayMax = Math.max(...sevenDayTemps) 
    var sevenDayRange = [sevenDayMin, sevenDayMax]


    // LOOP THROUGH DAYS, CREATE LITTLE CHART
    for (let j = 0; j < x.forecast.forecastday.length; j++) {
        var todayLow = x.forecast.forecastday[j].day.mintemp_f
        var todayHigh = x.forecast.forecastday[j].day.maxtemp_f

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

        console.log(j, dataObject)

        // send dataObject to dayRangeChart
        drawDayRangeChart(j,dataObject,sevenDayRange)

    }

}


function drawDayRangeChart(day,data,range) {

    var destination = '#day'+day+'Dot'
    console.log(destination)
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
              "text": {"field": "temp", "type": "quantitative", "format": ".1f"},
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
        

        var maxtemp = x.forecast.forecastday[i].day.maxtemp_f + 3
        var mintemp = x.forecast.forecastday[i].day.mintemp_f - 3

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
                temp_f: hour.temp_f,
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
        "title": {"text": secondLabel, "align": "left", "dy": 10},
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
          "axisY": {"tickCount": 3, "domain": true, "tickColor": "lightgray"},
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
                  "axis": {"labelExpr": "datum.value + '°F'", "orient": "left"},
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






function drawHourlyValues(x) {
    // Clear tables from any previous readout
    document.getElementById('todayTableBody').innerHTML = ''
    document.getElementById('tomorrowTableBody').innerHTML = ''
    document.getElementById('day3TableBody').innerHTML = ''

    const epochSeconds = Math.floor(Date.now() / 1000);

    var threeDayMin = -Infinity
    var threeDayMax = Infinity

    // loop through forecast days 0-2
    for (let i = 0; i < x.forecast.forecastday.length; i ++) {    
        var dailyMax = -Infinity
        var dailyMin = Infinity
        var day;
        // loop through each day's forecast hours
        for (let j = 0; j < x.forecast.forecastday[i].hour.length; j++) {

            // console.log(x.forecast.forecastday[i].hour[j].time_epoch)
            if (x.forecast.forecastday[i].hour[j].time_epoch > epochSeconds) {
                // here's where we do hourly stuff
                const hour       = formatHourFromEpoch(x.forecast.forecastday[i].hour[j].time_epoch)
                const temp       = x.forecast.forecastday[i].hour[j].temp_f;
                const cloudPct   = x.forecast.forecastday[i].hour[j].cloud
                const rainChance = x.forecast.forecastday[i].hour[j].chance_of_rain
                const snowChance =x.forecast.forecastday[i].hour[j].chance_of_snow
                let precipChance = Math.max(rainChance, snowChance);

                // get the tableBody

                if (i === 0) {
                    day = 'today'
                } else if (i === 1) {
                    day = 'tomorrow'
                } else {
                    day = 'day3'
                }
                const element = day + 'TableBody'
                const table = document.getElementById(element)

                // Make row for each hour
                let row = document.createElement('tr')
                let cell0 = document.createElement('td')
                    cell0.innerHTML = hour
                    cell0.classList.add('font-weight-bold')
                    cell0.classList.add('border-right')
                    cell0.classList.add('align-right')
                    cell0.classList.add('pr-1')
                let cell1 = document.createElement('td')
                    cell1.innerHTML = cloudPct + '%'
                    cell1.classList.add('pl-1')
                    cell1.classList.add('cloud')
                    cell1.style.opacity = cloudPct/100 < .2 ? .2 : cloudPct/100
                let cell2 = document.createElement('td')
                    cell2.innerHTML = precipChance + '%'
                    cell2.classList.add('precipitation')
                    cell2.style.opacity = precipChance/100 < .2 ? .2 : precipChance/100

                let cell3 = document.createElement('td')
                    cell3.classList.add('border-left')

                    let tempcell = document.createElement('div')
                    tempcell.classList.add('tempcell')
                    let temprect = document.createElement('div')
                    temprect.classList.add('rectangle')
                    tempcell.appendChild(temprect)

                    let tempdot = document.createElement('div')
                        tempdot.classList.add('circle')
                        tempdot.innerHTML = temp.toFixed(1)
                        tempcell.appendChild(tempdot)

                cell3.appendChild(tempcell)

                // Manage temperature styling

                // Get all temps for this day
                if (temp > dailyMax) {
                    dailyMax = temp;  // Update max if the new value is higher
                }
                if (temp < dailyMin) {
                    dailyMin = temp;  // Update min if the new value is lower
                }

                if (temp > threeDayMax) {
                    threeDayMax = temp;  // Update max if the new value is higher
                }
                if (temp < threeDayMin) {
                    threeDayMin = temp;  // Update min if the new value is lower
                }

                // Dump it all into the table
                row.appendChild(cell0)
                row.appendChild(cell1)
                row.appendChild(cell2)
                row.appendChild(cell3)
                table.appendChild(row)
                table.classList.add('fs-sm')
                
            } else {}
        }

        // Setting different visual ranges for cold, moderate, and hot weather
        dailyRange = (dailyMax - dailyMin)
        var threeDayRange = threeDayMax - threeDayMin


        // Select all temperature cells
        var tableID = '#' + day + 'TableBody'
        const tempCells = document.querySelectorAll(`${tableID} .tempcell`);

        // Loop through, get circles and rectangles, and set rect width based on circle value
        tempCells.forEach(cell => {
            const circle = cell.querySelector('.circle'); 
            const rectangle = cell.querySelector('.rectangle'); 

            if (circle && rectangle) {
                let value = parseFloat(circle.innerText) || 0; 
                let widthPercentage = 100 * (value - dailyMin) / (dailyRange)
                rectangle.style.width = `${widthPercentage}%`; 
            }
        });
    }
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

function formatHourFromEpoch(epoch) {
    // Ensure epoch is in milliseconds
    if (epoch < 10000000000) {
        epoch *= 1000; // Convert seconds to milliseconds
    }

    const date = new Date(epoch);
    let hours = date.getHours();
    const suffix = hours >= 12 ? 'pm' : 'am';

    // Convert 24-hour time to 12-hour format
    hours = hours % 12 || 12;

    return `${hours}${suffix}`;
}


function capitalizeFirstLetter(str) {
    if (!str) return str; // Handle empty string
    return str.charAt(0).toUpperCase() + str.slice(1);
}
