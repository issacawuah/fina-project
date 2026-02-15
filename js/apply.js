/**
 * Apply Page - Trip Application Form with Map and Weather Integration
 */

import { cityAddresses, sendSMSAlert, getCityCoordinates, weatherAPI } from './api.js';

const STORAGE_KEY = 'transitSafeGhana_passengers';
const MAX_PASSENGERS_PER_SLOT = 5;

/**
 * Get existing passengers from localStorage
 */
function getStoredPassengers() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Count passengers booked for a specific route, date, and time slot
 */
function getBookedCountForSlot(origin, destination, date, time) {
    const passengers = getStoredPassengers();
    return passengers.filter((p) => {
        const sameRoute = p.origin === origin && p.destination === destination;
        const sameDate = p.date === date;
        const sameTime = (p.time || '') === (time || '');
        return sameRoute && sameDate && sameTime;
    }).length;
}

/**
 * Check if time slot is full
 */
function isTimeSlotFull(origin, destination, date, time) {
    if (!time) return false; // "Any time" is not checked for capacity
    const booked = getBookedCountForSlot(origin, destination, date, time);
    return booked >= MAX_PASSENGERS_PER_SLOT;
}

/**
 * Show route on map using Leaflet (free, no API key needed!)
 * Leaflet is loaded from CDN in the HTML
 */
async function showRoute(origin, destination) {
    const mapElement = document.getElementById('map');
    const placeholder = document.querySelector('.map-placeholder');
    const routeInfo = document.getElementById('route-info');
    
    if (!mapElement) return;

    try {
        // Get coordinates
        const originCoords = getCityCoordinates(origin);
        const destCoords = getCityCoordinates(destination);

        // Initialize map if not already done
        if (!window.transitMap) {
            // Check if Leaflet is loaded
            if (typeof L === 'undefined') {
                // Load Leaflet dynamically
                await loadLeaflet();
            }

            window.transitMap = L.map('map').setView([originCoords.lat, originCoords.lng], 7);
            
            // Add OpenStreetMap tiles (free, no API key needed!)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(window.transitMap);
        }

        // Clear existing markers and lines
        if (window.transitMarkers) {
            window.transitMarkers.forEach(marker => marker.remove());
        }
        if (window.transitLine) {
            window.transitLine.remove();
        }

        // Add markers
        const originMarker = L.marker([originCoords.lat, originCoords.lng])
            .bindPopup(`<b>${origin}</b><br>Origin`)
            .addTo(window.transitMap);
        
        const destMarker = L.marker([destCoords.lat, destCoords.lng])
            .bindPopup(`<b>${destination}</b><br>Destination`)
            .addTo(window.transitMap);

        // Draw line between cities
        const line = L.polyline([
            [originCoords.lat, originCoords.lng],
            [destCoords.lat, destCoords.lng]
        ], { color: '#0B6623', weight: 3 }).addTo(window.transitMap);

        // Store references
        window.transitMarkers = [originMarker, destMarker];
        window.transitLine = line;

        // Fit map to show both markers
        const bounds = L.latLngBounds([
            [originCoords.lat, originCoords.lng],
            [destCoords.lat, destCoords.lng]
        ]);
        window.transitMap.fitBounds(bounds, { padding: [50, 50] });

        // Show map
        mapElement.classList.add('active');
        if (placeholder) placeholder.style.display = 'none';

        // Calculate approximate distance
        const distance = calculateDistance(
            originCoords.lat, originCoords.lng,
            destCoords.lat, destCoords.lng
        );

        // Display route information
        if (routeInfo) {
            routeInfo.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div>
                        <strong>From:</strong> ${origin}
                    </div>
                    <div>
                        <strong>To:</strong> ${destination}
                    </div>
                    <div>
                        <strong>Approximate Distance:</strong> ${distance.toFixed(0)} km
                    </div>
                </div>
            `;
        }

        // Load weather for destination
        loadDestinationWeather(destination);

    } catch (error) {
        console.error('Error showing route:', error);
        if (routeInfo) {
            routeInfo.innerHTML = `<p style="color: #E65100;">Could not display route. ${error.message}</p>`;
        }
    }
}

/**
 * Load Leaflet library dynamically
 */
function loadLeaflet() {
    return new Promise((resolve, reject) => {
        // Add CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);

        // Add JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Load and display weather for destination city
 */
async function loadDestinationWeather(city) {
    const routeInfo = document.getElementById('route-info');
    if (!routeInfo) return;

    try {
        const weather = await weatherAPI.getCurrentWeather(city);
        
        const weatherHTML = `
            <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-light); border-radius: 8px;">
                <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">Weather in ${city}</h4>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="https:${weather.icon}" alt="${weather.condition}" style="width: 50px; height: 50px;">
                    <div>
                        <p style="margin: 0; font-size: 1.5rem; font-weight: bold;">${weather.temp_c}°C</p>
                        <p style="margin: 0; color: var(--text-light);">${weather.condition}</p>
                        <p style="margin: 0; font-size: 0.875rem; color: var(--text-light);">Feels like ${weather.feelslike_c}°C</p>
                    </div>
                </div>
            </div>
        `;
        
        routeInfo.innerHTML += weatherHTML;
    } catch (error) {
        console.error('Error loading weather:', error);
        // Don't show error, just skip weather display
    }
}

/**
 * Handle form submission
 */
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
                const routeInfoEl = document.getElementById('route-info');
                if (routeInfoEl) routeInfoEl.innerHTML = '';
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
                // Check if time slot is full
                if (data.time) {
                    const full = isTimeSlotFull(data.origin, data.destination, data.date, data.time);
                    if (full) {
                        const timeLabel = {
                            morning: 'Morning (6:00 AM - 12:00 PM)',
                            afternoon: 'Afternoon (12:00 PM - 6:00 PM)',
                            evening: 'Evening (6:00 PM - 10:00 PM)'
                        }[data.time] || data.time;
                        alert(`This time slot is full.\n\n"${timeLabel}" for ${data.origin} → ${data.destination} on ${data.date} has reached the maximum number of passengers (${MAX_PASSENGERS_PER_SLOT}).\n\nPlease choose another time or another date.`);
                        return;
                    }
                }

                // Save passenger data to localStorage
                const passengerData = {
                    ...data,
                    id: Date.now().toString(),
                    submittedAt: new Date().toISOString(),
                    status: 'Pending'
                };
                const existingPassengers = getStoredPassengers();
                existingPassengers.push(passengerData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPassengers));

                // If alerts are enabled, send SMS (non-blocking)
                if (data.alerts && data.phone) {
                    const route = `${data.origin} to ${data.destination}`;
                    const message = `Thank you for applying! Your trip from ${route} is being processed.`;
                    sendSMSAlert(data.phone, route, message).catch(() => {});
                }

                // Show success message
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