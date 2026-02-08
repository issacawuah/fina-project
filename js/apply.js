// Apply Page - Trip Application Form and Google Maps Integration

import { cityAddresses, sendSMSAlert } from './api.js';

const STORAGE_KEY = 'transitSafeGhana_passengers';
/** Max passengers per route + date + time slot; when full, client is prompted */
const MAX_PASSENGERS_PER_SLOT = 5;

let mapInstance = null;
let directionsRenderer = null;

/** Get existing passengers from localStorage */
function getStoredPassengers() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/** Count how many passengers are already booked for this route + date + time slot */
function getBookedCountForSlot(origin, destination, date, time) {
    const passengers = getStoredPassengers();
    return passengers.filter((p) => {
        const sameRoute = p.origin === origin && p.destination === destination;
        const sameDate = p.date === date;
        const sameTime = (p.time || '') === (time || '');
        return sameRoute && sameDate && sameTime;
    }).length;
}

/** Return true if the selected time slot is full (client should be prompted) */
function isTimeSlotFull(origin, destination, date, time) {
    if (!time) return false; // "Any time" is not checked for capacity
    const booked = getBookedCountForSlot(origin, destination, date, time);
    return booked >= MAX_PASSENGERS_PER_SLOT;
}

// Initialize Google Maps
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement || !window.google) return;

    mapInstance = new google.maps.Map(mapElement, {
        center: { lat: 7.9465, lng: -1.0232 }, // Center of Ghana
        zoom: 7
    });

    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(mapInstance);
}

// Load Google Maps script
async function loadGoogleMaps() {
    if (window.google && window.google.maps) {
        return;
    }
    const apiKey = await getApiKey();
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        window.initGoogleMaps = () => {
            delete window.initGoogleMaps;
            initMap();
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });
}

async function getApiKey() {
    // Dynamic import to get config
    try {
        const module = await import('./config.js');
        return module.config.googleMapsApiKey || '';
    } catch {
        return '';
    }
}

// Show route on map
async function showRoute(origin, destination) {
    const mapElement = document.getElementById('map');
    const placeholder = document.querySelector('.map-placeholder');
    const routeInfo = document.getElementById('route-info');
    
    if (!mapElement) return;

    try {
        // Load Google Maps if not loaded
        if (!window.google || !window.google.maps) {
            await loadGoogleMaps();
        }

        const originAddr = cityAddresses[origin] || origin;
        const destAddr = cityAddresses[destination] || destination;

        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route({
            origin: originAddr,
            destination: destAddr,
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === 'OK' && directionsRenderer) {
                directionsRenderer.setDirections(result);
                mapElement.classList.add('active');
                if (placeholder) placeholder.style.display = 'none';

                // Display route information
                const route = result.routes[0].legs[0];
                if (routeInfo) {
                    routeInfo.innerHTML = `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div>
                                <strong>Distance:</strong> ${route.distance.text}
                            </div>
                            <div>
                                <strong>Duration:</strong> ${route.duration.text}
                            </div>
                            <div>
                                <strong>From:</strong> ${route.start_address}
                            </div>
                            <div>
                                <strong>To:</strong> ${route.end_address}
                            </div>
                        </div>
                    `;
                }
            } else {
                if (routeInfo) {
                    routeInfo.innerHTML = `<p style="color: #E65100;">Could not find route. Please check your selections.</p>`;
                }
            }
        });
    } catch (error) {
        console.error('Error showing route:', error);
        if (routeInfo) {
            routeInfo.innerHTML = `<p style="color: #E65100;">${error.message}</p>`;
        }
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('trip-form');
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');

    // Update map when origin/destination changes
    if (originSelect && destinationSelect) {
        const updateMap = () => {
            const origin = originSelect.value;
            const destination = destinationSelect.value;
            
            if (origin && destination && origin !== destination) {
                showRoute(origin, destination);
            } else {
                const mapElement = document.getElementById('map');
                const placeholder = document.querySelector('.map-placeholder');
                if (mapElement) mapElement.classList.remove('active');
                if (placeholder) placeholder.style.display = 'block';
                document.getElementById('route-info').innerHTML = '';
            }
        };

        originSelect.addEventListener('change', updateMap);
        destinationSelect.addEventListener('change', updateMap);
    }

    // Handle form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                origin: formData.get('origin'),
                destination: formData.get('destination'),
                date: formData.get('date'),
                time: formData.get('time'),
                alerts: formData.get('alerts') === 'on',
                notes: formData.get('notes')
            };

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            try {
                // 0. If a specific time is selected, check if that slot is full
                if (data.time) {
                    const full = isTimeSlotFull(data.origin, data.destination, data.date, data.time);
                    if (full) {
                        const timeLabel = { morning: 'Morning (6:00 AM - 12:00 PM)', afternoon: 'Afternoon (12:00 PM - 6:00 PM)', evening: 'Evening (6:00 PM - 10:00 PM)' }[data.time] || data.time;
                        alert(`This time slot is full.\n\n"${timeLabel}" for ${data.origin} → ${data.destination} on ${data.date} has reached the maximum number of passengers (${MAX_PASSENGERS_PER_SLOT}).\n\nPlease choose another time or another date.`);
                        return;
                    }
                }

                // 1. Save passenger data to localStorage
                const passengerData = {
                    ...data,
                    id: Date.now().toString(),
                    submittedAt: new Date().toISOString(),
                    status: 'Pending'
                };
                const existingPassengers = getStoredPassengers();
                existingPassengers.push(passengerData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPassengers));

                // 2. If alerts are enabled, send SMS (don't block save)
                if (data.alerts && data.phone) {
                    const route = `${data.origin} to ${data.destination}`;
                    const message = `Thank you for applying! Your trip from ${route} is being processed.`;
                    sendSMSAlert(data.phone, route, message).catch(() => {});
                }

                // 3. Show success and redirect option
                alert(`Thank you, ${data.name}! Your application has been saved.\n\nFrom: ${data.origin} → To: ${data.destination}\n\nGo to the Passengers page to see all applications.`);
                
                // Reset form
                form.reset();
                const routeInfoEl = document.getElementById('route-info');
                if (routeInfoEl) routeInfoEl.innerHTML = '';
                const mapElement = document.getElementById('map');
                const placeholder = document.querySelector('.map-placeholder');
                if (mapElement) mapElement.classList.remove('active');
                if (placeholder) placeholder.style.display = 'block';

            } catch (error) {
                alert('There was an error saving your application. Please try again.\n\n' + (error.message || ''));
                console.error('Form submission error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});
