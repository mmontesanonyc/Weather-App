function drawChart(day,data,width) {

    var contWidth = width * .95                  // width of container
    var skinnies = 20                           // width of skinny columns
    var leftover = contWidth - (2 * skinnies)   // remaining
    var widers = leftover / 2                   // half of remaining for wide columns

    var visSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
          "values": data
        },
        "config": {
          "title": {"anchor": "start", "fontSize": 10},
          "axisY": {"tickCount": 4, "domain": true, "tickColor": "lightgray"},
          "axisX": {"grid": false, "tickCount": 2, "domain": true},
          "view": {"stroke": null},
          "background": "transparent"
        },
        "hconcat": [
          {
            "width": widers,
            "height": 400,
            "title": "Cloud cover",
            "mark": {
              "type": "area",
              "interpolate": "basis",
              "color": {
                "x1": 0,
                "y1": 1,
                "x2": 1,
                "y2": 1,
                "gradient": "linear",
                "stops": [
                  {"offset": 0, "color": "white"},
                  {"offset": 1, "color": "darkgray"}
                ]
              }
            },
            "encoding": {
              "y": {
                "field": "time",
                "type": "temporal",
                "title": "",
                "sort": "descending",
                "axis": {"format": "%I%p"}
              },
              "x": {
                "field": "cloud",
                "type": "quantitative",
                "title": "",
                "scale": {"domain": [0, 100]},
                "axis": {
                  "format": ".0f",
                  "labelExpr": "datum.value === 0 ? '' : datum.value + '%'",
                  "orient": "bottom"
                }
              }
            }
          },
          {
            "width": skinnies,
            "height": 400,
            "title": {"text": "Rain", "dx": 0, "dy": 430, "align": "left"},
            "mark": {
              "type": "text",
              "align": "center",
              "baseline": "middle",
              "fontSize": 8
            },
            "encoding": {
              "y": {
                "field": "time",
                "type": "temporal",
                "title": "",
                "sort": "descending",
                "axis": null
              },
              "text": {
                "field": "chance_of_rain",
                "type": "quantitative",
                "condition": {
                  "test": "datum.chance_of_rain !== null",
                  "value": {"expr": "datum.chance_of_rain + '%'"}
                }
              },
              "opacity": {
                "field": "chance_of_rain",
                "type": "quantitative",
                "scale": {"domain": [0, 100]},
                "legend": null
              }
            }
          },
          {
            "width": skinnies,
            "height": 400,
            "title": {"text": "Snow", "dy": 430, "align": "left"},
            "mark": {
              "type": "text",
              "align": "center",
              "baseline": "middle",
              "fontSize": 8
            },
            "encoding": {
              "y": {
                "field": "time",
                "type": "temporal",
                "title": "",
                "sort": "descending",
                "axis": false
              },
              "text": {
                "field": "chance_of_snow",
                "type": "quantitative",
                "condition": {
                  "test": "datum.chance_of_snow !== null",
                  "value": {"expr": "datum.chance_of_snow + '%'"}
                }
              },
              "opacity": {
                "field": "chance_of_snow",
                "type": "quantitative",
                "scale": {"domain": [0, 100]},
                "legend": false
              }
            }
          },
          {
            "width": widers,
            "height": 400,
            "title": {"text": "Temp", "dy": -1},
            "mark": {"type": "point", "size": 150, "filled": true},
            "encoding": {
              "y": {
                "field": "time",
                "type": "temporal",
                "sort": "descending",
                "title": "",
                "axis": {"reverse": true, "labelExpr": "", "domain": false}
              },
              "x": {
                "field": "temp_f",
                "type": "quantitative",
                "title": "",
                "axis": {"labelExpr": "datum.value + '°F'", "orient": "bottom"}
              },
              "color": {"value": "coral"}
            }
          }
        ]
      }
    
    var destination = `#day${day}vis`
    vegaEmbed(destination,visSpec, {actions: false})
}