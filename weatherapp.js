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
            const zipCode = data.results[0]?.components?.postcode || "Zip code not found";
            console.log(`Your zip code is: ${zipCode}`);
            fetchWeatherData(zipCode)
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
    api = 'https://api.weatherapi.com/v1/forecast.json?key=b8ed8f57e3fa4e4ca0c140623250902&q=' + x + '&days=3&aqi=yes&alerts=no'

    fetch (api)
        .then(response => {return response.json()})
        .then(data => {
        apiData = data
        console.log('***Loading weather data:')
        console.log(apiData)
        printTodaySummary(apiData)
        printRangeHeaders(apiData)
        drawHourlyValues(apiData)
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

    // Change of precip
    document.getElementById('rainChancePrint').innerText = x.forecast.forecastday[0].day.daily_chance_of_rain + '%'
    document.getElementById('snowChancePrint').innerText = x.forecast.forecastday[0].day.daily_chance_of_snow + '%'

    // Low, High
    // document.getElementById('lowPrint').innerText = x.forecast.forecastday[0].day.mintemp_f
    // document.getElementById('highPrint').innerText = x.forecast.forecastday[0].day.maxtemp_f

    // PRINT TODAY'S DROPDOWN HEADER - TEMP RANGE

}

function printRangeHeaders(x) {
    document.getElementById('day2').innerText = getDayOfWeek(x.forecast.forecastday[1].date)
    document.getElementById('day3').innerText = getDayOfWeek(x.forecast.forecastday[2].date)

    // LOWS AND HIGHS FOR NEXT 3 DAYS
    var todayLow    = x.forecast.forecastday[0].day.mintemp_f
    var todayHigh   = x.forecast.forecastday[0].day.maxtemp_f
    var tomorrowLow = x.forecast.forecastday[1].day.mintemp_f
    var tomorrowHigh= x.forecast.forecastday[1].day.maxtemp_f
    var day3Low = x.forecast.forecastday[2].day.mintemp_f
    var day3High= x.forecast.forecastday[2].day.maxtemp_f

    // GET RANGE, MIN, AND MAX
    var tempRange = [];
    tempRange.push(todayLow,todayHigh,tomorrowLow,tomorrowHigh,day3Low,day3High)
    var min = Math.min(...tempRange)
    var max = Math.max(...tempRange)
    var rangeValue = max-min

    // SIZE EACH OVAL'S WIDTH AND LEFT MARGIN
    document.getElementById('todayOval').style.width = (100 * (todayHigh - todayLow) / rangeValue) + '%'
    document.getElementById('todayOval').style.marginLeft = (100 * (todayLow - min)/rangeValue) + '%'

    document.getElementById('tomorrowOval').style.width = (100 * (tomorrowHigh - tomorrowLow) / rangeValue) + '%'
    document.getElementById('tomorrowOval').style.marginLeft = (100 * (tomorrowLow - min)/rangeValue) + '%'

    document.getElementById('day3Oval').style.width = (100 * ( day3High - day3Low) / rangeValue) + '%'
    document.getElementById('day3Oval').style.marginLeft = (100 * (day3Low - min)/rangeValue) + '%'

    // PRINT DAILY VALUES
    drawDailyValues('today',todayLow,todayHigh)
    drawDailyValues('tomorrow',tomorrowLow,tomorrowHigh)
    drawDailyValues('day3',day3Low,day3High)

}

function drawDailyValues(day,low,high) {
    const lowID = day + 'Low'
    const highID = day + 'High'
    document.getElementById(lowID).innerText = low
    document.getElementById(highID).innerText = high
}

function drawHourlyValues(x) {
    // Clear tables from any previous readout
    document.getElementById('todayTableBody').innerHTML = ''
    document.getElementById('tomorrowTableBody').innerHTML = ''
    document.getElementById('day3TableBody').innerHTML = ''

    const epochSeconds = Math.floor(Date.now() / 1000);

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
                let cell1 = document.createElement('td')
                    cell1.innerHTML = cloudPct + '%'
                let cell2 = document.createElement('td')
                    cell2.innerHTML = precipChance + '%'
                let cell3 = document.createElement('td')
                    cell3.classList.add('border-left')

                let tempDiv = document.createElement('div')
                    tempDiv.innerHTML = parseInt(temp)
                    tempDiv.classList.add('tempfill')
                cell3.appendChild(tempDiv)

                // Manage temperature styling

                // Get all temps for this day
                if (temp > dailyMax) {
                    dailyMax = temp;  // Update max if the new value is higher
                }
                if (temp < dailyMin) {
                    dailyMin = temp;  // Update min if the new value is lower
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

        // get all things in day+TableBody that have a classlist tempFill
        var tableID = '#' + day + 'TableBody'
        const tempfillElements = document.querySelectorAll(`${tableID} .tempfill`);

        tempfillElements.forEach(element => {
            var temp = parseFloat(element.innerText); // Ensure we get a number
            var mr = 100 - (temp / dailyMax) * 100;   // Correct margin calculation
            element.style.setProperty('margin-right', mr + '%', 'important');
        });
        

        // for each, the margin-right should be 100 - (innerHTML / dailyMax)

    }
}

function getDayOfWeek(dateString) {
    // Parse the date manually to prevent timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day)); // Ensure UTC

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

