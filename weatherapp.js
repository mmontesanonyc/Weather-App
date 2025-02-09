// ESTABLISH GLOBAL VARIABLES
var apiData;

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
    })
}

fetchWeatherData(11226)

// fetchWeatherData()

function printTodaySummary(x) {
    // Show results containers
    document.querySelectorAll(".resultsContainer").forEach(element => {
        element.classList.add("show");
    });

    document.getElementById('cityPrint').innerText = x.location.name
    document.getElementById('statePrint').innerText = x.location.region

    // current: apiData.current.temp_f

    // Current
    document.getElementById('currentTempPrint').innerText = x.current.temp_f
    document.getElementById('textPrint').innerText = x.current.condition.text

    // Icon
    document.getElementById('iconPrint').src = x.current.condition.icon
    // x.current.condition.icon

    // Change of precip
    document.getElementById('rainChancePrint').innerText = x.forecast.forecastday[0].day.daily_chance_of_rain
    document.getElementById('snowChancePrint').innerText = x.forecast.forecastday[0].day.daily_chance_of_snow

    // Low, High
    document.getElementById('lowPrint').innerText = x.forecast.forecastday[0].day.mintemp_f
    document.getElementById('highPrint').innerText = x.forecast.forecastday[0].day.maxtemp_f



    /*
        current: apiData.current.temp_f
        iconurl: apiData.current.condition.icon

        low
        high

        rain
        snow

    */


}