// Function to fetch air quality data
async function getAirQualityByCurrentPosition(latitude, longitude) {
    // Construct the URL with latitude and longitude parameters
    const url = `/air_quality?latitude=${latitude}&longitude=${longitude}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => data)
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function drawResultMarkers(data, lat, lng) {
    Object.keys(data.urls).forEach((key) => {
        const { name } = data?.urls[key]
        const mapId = `map${key}`;

        renderMap(mapId, [lat, lng]);

        let h3Title = document.getElementById("title" + key);
        h3Title.innerHTML = data.city + " (" + name + ")";
        h3Title.classList.add("not-empty");
    });
}

async function renderMap(mapId, latlng) {
    let cityData = await fetch("/feedByLocation")
        .then((x) => x.json())
        .then((x) => ({ bounds: x.city.geo.join(","), name: x.city.name }));

    let map = createMap(mapId, latlng);

    populateAndFitMarkers(map, cityData.bounds);

    map.setView(latlng, 15);
}