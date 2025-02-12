# My Weather App
Because all of the weather websites try to be everything to everybody, I suspect that they are useless to most. I longed for a clean interface that showed me some forecast basics: temperature, conditions, and precip change. I longed to check the weather without having to close a dozen pop-up ads. 

So I built [the Weather App that I wanted](https://mmontesanonyc.github.io/Weather-App/). If you like it and use it (which, frankly, would make me chuffed beyond belief), then [feel free to Venmo me a few bucks](https://venmo.com/code?user_id=2293559168335872144&created=1739136186) - it's cheaper than subscribing to any of the Weather Company's add-free services.

This uses:
- Browser geocoding (or a ZIP Code query: for now, it only works in the USA)
- The weatherapi.com weather api
- Basic Bootstrap and JavaScript
- Vega-Lite for charts

## Assumptions
This currently works by looking up your ZIP Code, so it only works in the USA.

For the daily forecast drop-downs, the page checks to see if there is a higher daily chance of rain or snow. It shows a chart of the one with the higher chance, and text of the one with a lower chance.

## Future Modifications
I'm considering using the [weather.gov API](https://weather-gov.github.io/api/general-faqs), or the [Open-Meteo API](https://open-meteo.com/en/docs#current=is_day&hourly=temperature_2m,precipitation_probability,precipitation,cloud_cover), instead of the current one.

I'll likely continue to revise the display and functionality. Right now, I'm thinking about:
- Revising the day-header bar-charts to bias them toward the left if it's cold, and toward the right if they're not - while also making the color dependent on temps. 
- Revising the geolocator so that it doesn't rely on a ZIP Code query. This is mostly about revising how I hit the weather API - using lat/long instead of ZIP. This will let people outside the USA use this. I may need to incorporate a Leaflet Geocoder for this. 
- Considering adding a location cookie so it'll remember you. 

If you seriously like this and would like me to develop it further, feel free to file an issue with any ideas, suggestions, or desires.
