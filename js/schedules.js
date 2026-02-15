/**

* Schedules Page - Display bus schedules with weather information

*/
 
import { loadSchedules, weatherAPI } from './api.js';

import { config } from './config.js';
 
let allSchedules = [];

let cityWeather = {};
 
/**

* Render schedule cards with weather info

*/

function renderSchedules(schedules) {

    const container = document.getElementById('schedules-container');

    if (!container) return;
 
    container.innerHTML = '';
 
    if (schedules.length === 0) {

        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No schedules found matching your criteria.</p>';

        return;

    }
 
    schedules.forEach(schedule => {

        const card = document.createElement('div');

        card.className = 'schedule-card';

        // Get weather for destination city

        const destinationWeather = cityWeather[schedule.destination];

        const weatherDisplay = destinationWeather && !destinationWeather.error ? `
<div class="schedule-weather">
<img src="https:${destinationWeather.icon}" alt="${destinationWeather.condition}" style="width: 30px; height: 30px;">
<span>${destinationWeather.temp_c}°C in ${schedule.destination}</span>
</div>

        ` : '';

        card.innerHTML = `
<div class="schedule-header">
<div class="schedule-route">${escapeHtml(schedule.origin)} → ${escapeHtml(schedule.destination)}</div>
<div class="schedule-fare">${escapeHtml(schedule.fare.toString())} ${escapeHtml(schedule.currency)}</div>
</div>

            ${weatherDisplay}
<div class="schedule-details">
<div class="schedule-detail">
<strong>Operator:</strong> ${escapeHtml(schedule.operator)}
</div>
<div class="schedule-detail">
<strong>Departure:</strong> ${escapeHtml(schedule.departureTime)}
</div>
<div class="schedule-detail">
<strong>Arrival:</strong> ${escapeHtml(schedule.arrivalTime)}
</div>
<div class="schedule-detail">
<strong>Duration:</strong> ${escapeHtml(schedule.duration)}
</div>

                ${schedule.stops && schedule.stops.length > 0 ? `
<div class="schedule-detail">
<strong>Stops:</strong> ${escapeHtml(schedule.stops.join(', '))}
</div>

                ` : ''}
<div class="schedule-detail">
<strong>Bus Type:</strong> ${escapeHtml(schedule.busType || 'Standard')}
</div>
<div class="schedule-detail">
<strong>Seats Available:</strong> ${escapeHtml(schedule.seatsAvailable ? schedule.seatsAvailable.toString() : 'N/A')}
</div>
</div>

        `;

        container.appendChild(card);

    });

}
 
/**

* Filter schedules based on origin and destination

*/

function filterSchedules() {

    const originFilter = document.getElementById('filter-origin')?.value || '';

    const destinationFilter = document.getElementById('filter-destination')?.value || '';
 
    let filtered = allSchedules;
 
    if (originFilter) {

        filtered = filtered.filter(s => s.origin === originFilter);

    }
 
    if (destinationFilter) {

        filtered = filtered.filter(s => s.destination === destinationFilter);

    }
 
    renderSchedules(filtered);

}
 
/**

* Escape HTML to prevent XSS attacks

*/

function escapeHtml(text) {

    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;

}
 
/**

* Load weather data for all Ghana cities

*/

async function loadWeatherData() {

    try {

        const cities = config.ghanaCities;

        const weatherData = await weatherAPI.getMultipleCitiesWeather(cities);

        // Store weather data by city name

        weatherData.forEach(weather => {

            cityWeather[weather.location] = weather;

        });

        // Display weather cards at the top

        displayWeatherCards(weatherData);

    } catch (error) {

        console.error('Error loading weather data:', error);

        // Continue without weather data

    }

}
 
/**

* Display weather cards for Ghana cities

*/

function displayWeatherCards(weatherData) {

    const container = document.getElementById('schedules-container');

    if (!container) return;
 
    const weatherSection = document.createElement('div');

    weatherSection.className = 'weather-section';

    weatherSection.innerHTML = '<h2 style="color: var(--primary-color); margin-bottom: 1rem;">Current Weather in Ghana</h2>';

    const weatherGrid = document.createElement('div');

    weatherGrid.className = 'weather-grid';

    weatherGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;';

    weatherData.forEach(weather => {

        if (weather.error) return; // Skip cities with errors

        const weatherCard = document.createElement('div');

        weatherCard.className = 'weather-card';

        weatherCard.style.cssText = 'background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;';

        weatherCard.innerHTML = `
<h3 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">${escapeHtml(weather.location)}</h3>
<img src="https:${weather.icon}" alt="${weather.condition}" style="width: 64px; height: 64px;">
<p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0; color: var(--text-dark);">${weather.temp_c}°C</p>
<p style="margin: 0; color: var(--text-light);">${escapeHtml(weather.condition)}</p>
<p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: var(--text-light);">Feels like ${weather.feelslike_c}°C</p>

        `;

        weatherGrid.appendChild(weatherCard);

    });

    weatherSection.appendChild(weatherGrid);

    container.insertBefore(weatherSection, container.firstChild);

}
 
/**

* Initialize the schedules page

*/

document.addEventListener('DOMContentLoaded', async () => {

    const container = document.getElementById('schedules-container');

    const loadingEl = document.getElementById('loading');

    const filterForm = document.getElementById('filter-form');
 
    if (!container) return;
 
    try {

        // Load weather data first (don't wait for it)

        loadWeatherData();
 
        // Load schedules

        allSchedules = await loadSchedules();

        if (loadingEl) loadingEl.style.display = 'none';

        // Render all schedules initially

        renderSchedules(allSchedules);
 
        // Set up filter form

        if (filterForm) {

            filterForm.addEventListener('submit', (e) => {

                e.preventDefault();

                filterSchedules();

            });
 
            // Also filter on change

            const originSelect = document.getElementById('filter-origin');

            const destSelect = document.getElementById('filter-destination');

            if (originSelect) {

                originSelect.addEventListener('change', filterSchedules);

            }

            if (destSelect) {

                destSelect.addEventListener('change', filterSchedules);

            }

        }

    } catch (error) {

        if (loadingEl) loadingEl.style.display = 'none';

        container.innerHTML = `<p style="text-align: center; padding: 2rem; color: #E65100;">Error loading schedules: ${escapeHtml(error.message)}</p>`;

        console.error('Error loading schedules:', error);

    }

});
 