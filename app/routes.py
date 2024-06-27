# routes.py

from flask import jsonify, request, render_template
import requests

from app import app, decorators
from app.config import WAQI_API_KEY, WAQI_API_URL, CERT_PATH, OPENCAGE_API_URL, AIRNET_API_URL, MAPQ_WAQI_URL

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/feedByLocation', methods=['GET'])
def get_feed_by_location():
    url = f'{WAQI_API_URL}/feed/here/?token={WAQI_API_KEY}'

    try:
        response = requests.get(url, verify=False)
        response = response.json()

        city = response["rxs"]["obs"][0]["msg"]["city"]

        response_return = {
            'city': city,
            'id': get_city_id_by_geo(city['geo'][0], city['geo'][1])
        }

        if response is not None:
            return jsonify(response_return), 200
        else:
            return jsonify({'error': 'No data found.'}), 204
    except Exception as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500
 
@app.route("/aqi_info", methods=["GET"])
def get_aqi_info():
    aqi_id = request.args.get('id')
    aqi_id = ''.join(char for char in aqi_id if char.isdigit())
    url = f'{AIRNET_API_URL}/airnet/feed/hourly/{aqi_id}'

    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        data = response.json()

        return jsonify(data), 200
    except Exception as e:
        print("Request failed:", e)
        return jsonify({'error': f'Request failed: {str(e)}'}), 500

def get_token(stationId):
    url = f'https://api2.waqi.info/api/token/{stationId}'

    response = requests.post(url, verify=False)
    data = response.json()

    return data['rxs']['obs'][0]['msg']['token']
    
@app.route('/bounds', methods=['GET'])
def get_bounds():
    latlng = request.args.get('latlng')
    
    url = f'{MAPQ_WAQI_URL}/mapq2/bounds'

    payload = {
        'bounds': latlng,
        'inc': 'placeholders',
        'viewer': 'webgl'
    }

    headers = {
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(url, params=payload, headers=headers, verify=False)
        data = response.json()

        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500

@app.route('/current_location', methods=['GET'])
def get_current_location():
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')
    if not latitude or not longitude:
        return jsonify({'error': 'Latitude and longitude are required parameters.'}), 400
    
    response, status_code = current_location(latitude, longitude)
    response['id'] = get_city_id_by_geo(latitude, longitude)
    return jsonify(response), status_code
    
@app.route('/air_quality', methods=['GET'])
def air_quality():
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')
    if not latitude or not longitude:
        return jsonify({'error': 'Latitude and longitude are required parameters.'}), 400

    response, status_code = current_location(latitude, longitude)

    if status_code == 200:
        city = response['city']
        try:
            data = decorators.generate_aqi_tile_urls(city)
            if 'city' in data and 'urls' in data:
                return jsonify(data), 200
            else:
                return jsonify({'error': 'No data found.'}), 204
        except Exception as e:
            return jsonify({'error': f'Request failed: {str(e)}'}), 500
    else:
        return response, status_code
    
def current_location(latitude, longitude):
    url = f"{OPENCAGE_API_URL}&q={latitude}+{longitude}&pretty=1"
    
    try:
        response = requests.get(url, verify=False)
        data = response.json()

        if 'results' in data and len(data['results']) > 0:
            country = data['results'][0]['components']['country']
            cityName = data['results'][0]['components']['city']
            bounds = data['results'][0]['bounds']
            return {"country": country, "city": cityName, "bounds": bounds}, 200
        else:
            return {'error': 'No data found'}, 204
    except Exception as e:
        return {'error': f'Request to OpenCage API failed: {str(e)}'}, 500


def get_city_id_by_geo(lat, lng):
    url = f'https://api.waqi.info/feed/geo:{lat};{lng}/?token={WAQI_API_KEY}'

    try:
        response = requests.get(url, verify=False)
        data = response.json()

        return data['data']['idx']

    except Exception as e:
        return ""