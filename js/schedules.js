// Schedules Page - Display bus schedules dynamically

import { loadSchedules } from './api.js';

let allSchedules = [];

// Render schedule cards
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
        
        card.innerHTML = `
            <div class="schedule-header">
                <div class="schedule-route">${escapeHtml(schedule.origin)} → ${escapeHtml(schedule.destination)}</div>
                <div class="schedule-fare">${escapeHtml(schedule.fare)} ${escapeHtml(schedule.currency)}</div>
            </div>
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
                    <strong>Seats Available:</strong> ${escapeHtml(schedule.seatsAvailable || 'N/A')}
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Filter schedules
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('schedules-container');
    const loadingEl = document.getElementById('loading');
    const filterForm = document.getElementById('filter-form');

    if (!container) return;

    try {
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
        container.innerHTML = `<p style="text-align: center; padding: 2rem; color: #E65100;">Error loading schedules: ${error.message}</p>`;
        console.error('Error loading schedules:', error);
    }
});
