# My Weather App
Because all of the weather websites try to be everything to everybody, I suspect that they are useless to most. I longed for a clean interface that showed me some forecast basics: temperature, conditions, and precip chance. I longed to check the weather without having to close a dozen pop-up ads. 

So I built [the Weather App that I wanted](www.niceweather.app). If you like it and use it (which, frankly, would make me chuffed beyond belief), then [feel free to Venmo me a few bucks](https://venmo.com/code?user_id=2293559168335872144&created=1739136186) - it's cheaper than subscribing to any of the Weather Company's add-free services.

This uses:
- Browser-based geolocation, [Leaflet](https://leafletjs.com/) map, and [Nominatim](https://nominatim.org/) geocoding/geolocation
- The [WeatherAPI](www.weatherapi.com).com weather api
- [Bootstrap](https://getbootstrap.com/docs/4.1/getting-started/introduction/) for layout and JavaScript for most functionality
- [Vega-Lite](https://vega.github.io/vega-lite/) for charts

## Future Modifications
I'm considering using the [weather.gov API](https://weather-gov.github.io/api/general-faqs), or the [Open-Meteo API](https://open-meteo.com/en/docs#current=is_day&hourly=temperature_2m,precipitation_probability,precipitation,cloud_cover), instead of the current one.

I'll likely continue to revise the display and functionality. Right now, I'm thinking about:
- Further refining the daily forecast visualizations
- Adding tooltips to the items only indicated by icon
- Creating some temperature-specific colors for the daily forecast headers

If you seriously like this and would like me to develop it further, feel free to file an issue with any ideas, suggestions, or desires.
