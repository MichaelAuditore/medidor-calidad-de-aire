def generate_aqi_tile_urls(city):
    base_url = "https://tiles.aqicn.org/tiles/{}/{}/{}/{}.png"
    aqi_types = {
        "usepa-pm25": {"name": "PM2.5", "parameter": "pm25", "value": "usepa-pm25"},
    }

    post_types = {
        "usepa-pm10": {"name": "PM10", "parameter": "pm10", "value": "usepa-pm10"},
        "usepa-o3": {"name": "Ozone", "parameter": "o3", "value": "usepa-o3"},
        "usepa-no2": {"name": "Nitrogen Dioxide", "parameter": "no2", "value": "usepa-no2"},
        "usepa-so2": {"name": "Sulfur Dioxide", "parameter": "so2", "value": "usepa-so2"},
        "usepa-co": {"name": "Carbon Monoxide", "parameter": "co", "value": "usepa-co"}
    }
    
            
    urls = {}
    for aqi_type, aqi_value in aqi_types.items():
        url = base_url.format(aqi_value["value"], '{z}', '{x}', '{y}')
        urls[aqi_type] = {
            "WAQI_URL": url,
            "WAQI_ATTR": "Air Quality Tiles &copy; <a href='http://waqi.info'>waqi.info</a>",
            "name": aqi_value["name"]
        }
 
    response = {
        'city': city,
        'urls': urls
    }
    return response