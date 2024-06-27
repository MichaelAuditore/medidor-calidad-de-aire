let allMarkers = {};

function createMap(elementId, latlng) {

    let map = L.map(elementId, {
        gestureHandling: true,
    }).setView(latlng, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '© .aqi href="https://www.openstreetmap.org/copyright">OpenStreetMap<.aqi> contributors',
        }).addTo(map);

    const marker = L.marker(latlng).addTo(map);
    // Add a popup to the marker
    marker.bindPopup("<b>Hello!</b><br>You are here").openPopup();


    setTimeout(function () {
        map.on("moveend", async () => {
            let bounds = map.getBounds();
            bounds =
                bounds.getNorth() +
                "," +
                bounds.getWest() +
                "," +
                bounds.getSouth() +
                "," +
                bounds.getEast();

            populateMarkers(map, bounds);
        });
    }, 1000);

    return map;
}

async function populateMarkers(map) {
    const mapBounds = map.getBounds();

    // Format the bounds in the required format
    const formattedBounds = `${mapBounds.getWest()},${mapBounds.getSouth()},${mapBounds.getEast()},${mapBounds.getNorth()}`;


    fetch("/bounds?latlng=" + formattedBounds)
        .then((x) => x.json())
        .then((stations) => {
            console.log(stations)
            stations?.data?.forEach((station) => {
                if (station.aqi > 0) {

                    if (allMarkers[station.idx])
                        map.removeLayer(allMarkers[station.idx]);

                    let iw = 83,
                        ih = 107;
                    let icon = L.icon({
                        iconUrl: "https://waqi.info/mapicon/" + station.aqi + ".30.png",
                        iconSize: [iw / 2, ih / 2],
                        iconAnchor: [iw / 4, ih / 2 - 5],
                    });


                    let marker = L.marker([station.geo[0], station.geo[1]], {
                        zIndexOffset: station.aqi,
                        title: station.name,
                        icon: icon,
                    }).addTo(map);

                    marker.on("click", () => {
                        let popup = L.popup()
                            .setLatLng([station.geo[0], station.geo[1]])
                            .setContent(station.name)
                            .openOn(map);

                        const info = getMarkerPopup(station);
                        popup.setContent(info);

                        getDetailAQI(station.idx, station.aqi);
                    });

                    allMarkers[station.idx] = marker;
                }
            });

            return stations.data.map(
                (station) => new L.LatLng(station.geo[0], station.geo[1])
            );
        })
        .catch((e) => {
            console.error(e);
        });
}

function populateAndFitMarkers(map, bounds) {
    removeMarkers(map);
    if (bounds.split(",").length == 2) {
        let [lat, lng] = bounds.split(",");
        lat = parseFloat(lat);
        lng = parseFloat(lng);
        bounds = `${lat - 0.5},${lng - 0.5},${lat + 0.5},${lng + 0.5}`;
    }
    populateMarkers(map, bounds).then(() => {
        hideLoader();
    });
    return map;
}

function removeMarkers(map) {
    Object.values(allMarkers).forEach((marker) => map.removeLayer(marker));
    allMarkers = {};
}

function getMarkerPopup(marker) {
    console.log("marker", marker);
    let info =
        marker?.name +
        ": AQI " +
        marker?.aqi +
        " updated on " +
        new Date(marker?.utime).toLocaleTimeString() +
        "<br>";

    if (marker?.name) {
        info += "<b>Location</b>: ";
        info += "<small>" + marker?.name + "</small><br>";
    }

    info += "<b>Pollutants</b>: ";
    info += "<u>" + "pm25" + "</u>:" + marker?.aqi + " ";
    info += "<br>";

    return info;
}

function getDetailAQI(stationId, AQI) {
    const detail = document.getElementById("station-details");
    detail.innerHTML = "";
    detail.style.display = "none";

    showLoader();
    return fetch("/aqi_info?id=" + stationId)
        .then((x) => x.json())
        .then((data) => {
            const detailStation = data.data;
            const chartInformation = detailStation?.["pm25"];
            const stationName = data?.loiq?.display_name;

            const canvas = createChart(chartInformation);
            const title = document.createElement("h3");
            title.innerHTML = stationName;
            const subtitle = document.createElement("h5");
            subtitle.innerHTML = "Current Air Quality Index: " + AQI;

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = 'Close';
            closeBtn.classList.add("closeBtn");

            closeBtn.addEventListener('click', function () {
                detail.style.display = 'none';
            });


            if (detailStation && stationName) {
                detail.appendChild(closeBtn);
                detail.appendChild(title);
                detail.appendChild(subtitle);
                detail.appendChild(canvas);
                detail.style.display = "flex";
            }
            hideLoader();
        })
        .catch(error => { console.error(error), hideLoader(); });
}