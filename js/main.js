import { config } from './config.js';

// City addresses
const cityAddresses = {
  Accra: "Accra, Ghana",
  Kumasi: "Kumasi, Ghana",
  Sunyani: "Sunyani, Ghana",
  Tamale: "Tamale, Ghana"
};

let map;
let directionsRenderer;

// 1️⃣ Initialize map (called by Google Maps API)
window.initMap = function() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 7.9465, lng: -1.0232 }, // center of Ghana
        zoom: 7
    });
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
};

// 2️⃣ Load Google Maps dynamically
async function loadGoogleMaps() {
    if (window.google && window.google.maps) return;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);

        // Resolve when map is initialized
        const checkMap = () => {
            if (map && directionsRenderer) {
                resolve();
            } else {
                setTimeout(checkMap, 100);
            }
        };
        checkMap();
    });
}

// 3️⃣ Show route
async function showRoute(origin, destination) {
    if (!origin || !destination || origin === destination) return;

    await loadGoogleMaps();

    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
        origin: cityAddresses[origin],
        destination: cityAddresses[destination],
        travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const route = result.routes[0].legs[0];
            document.getElementById('route-info').innerHTML = `
                <p><strong>Distance:</strong> ${route.distance.text}</p>
                <p><strong>Duration:</strong> ${route.duration.text}</p>
                <p><strong>From:</strong> ${route.start_address}</p>
                <p><strong>To:</strong> ${route.end_address}</p>
            `;
        } else {
            document.getElementById('route-info').innerHTML = `<p style="color:red">Could not find route.</p>`;
        }
    });
}

// 4️⃣ Update map when origin/destination changes
document.addEventListener('DOMContentLoaded', () => {
    // Existing footer code
    const yearElement = document.getElementById('current-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');

    if (!originSelect || !destinationSelect) return;

    const updateMap = () => {
        const origin = originSelect.value;
        const destination = destinationSelect.value;
        showRoute(origin, destination);
    };

    originSelect.addEventListener('change', updateMap);
    destinationSelect.addEventListener('change', updateMap);
});
