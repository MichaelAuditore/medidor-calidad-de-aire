function getLocation() {
    if (navigator.geolocation) {
        showLoader();
        navigator.geolocation.getCurrentPosition(showPosition, showError, { enableHighAccuracy: true });
    } else {
        hideLoader();
        document.body.innerHTML = "<p>Geolocation is necessary to do this app works</p>"
        alert("Geolocation is not supported by this browser.");
    }
}

async function showPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    let data = await getAirQualityByCurrentPosition(latitude, longitude);
    drawResultMarkers(data, latitude, longitude);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// Call getLocation when the page loads
window.onload = getLocation;

// Toggle visibility of navigation menu when hamburger icon is clicked
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    burger.classList.toggle('active');
});
