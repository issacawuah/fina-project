// Passengers Page - Display all passenger information and statistics

// Same key as apply.js so data is shared
const STORAGE_KEY = 'transitSafeGhana_passengers';

// Get all passengers from localStorage
function getPassengers() {
    try {
        // Support both keys so old data still shows
        const data = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('passengers');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading passengers:', error);
        return [];
    }
}

// Calculate statistics
function calculateStats(passengers) {
    const stats = {
        total: passengers.length,
        routes: new Set(),
        alertsSubscribed: 0,
        todayApplications: 0,
        routeCounts: {}
    };

    const today = new Date().toDateString();

    passengers.forEach(passenger => {
        // Count routes
        if (passenger.origin && passenger.destination) {
            const route = `${passenger.origin} → ${passenger.destination}`;
            stats.routes.add(route);
            
            if (!stats.routeCounts[route]) {
                stats.routeCounts[route] = 0;
            }
            stats.routeCounts[route]++;
        }

        // Count SMS alerts
        if (passenger.alerts) {
            stats.alertsSubscribed++;
        }

        // Count today's applications
        if (passenger.submittedAt) {
            const submittedDate = new Date(passenger.submittedAt).toDateString();
            if (submittedDate === today) {
                stats.todayApplications++;
            }
        }
    });

    stats.routes = Array.from(stats.routes);
    return stats;
}

// Render statistics
function renderStats(stats) {
    document.getElementById('total-passengers').textContent = stats.total;
    document.getElementById('total-routes').textContent = stats.routes.length;
    document.getElementById('alerts-subscribed').textContent = stats.alertsSubscribed;
    document.getElementById('today-applications').textContent = stats.todayApplications;

    // Render route statistics
    const routeStatsGrid = document.getElementById('route-stats');
    routeStatsGrid.innerHTML = '';

    if (Object.keys(stats.routeCounts).length === 0) {
        routeStatsGrid.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No route data available</p>';
        return;
    }

    Object.entries(stats.routeCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([route, count]) => {
            const routeCard = document.createElement('div');
            routeCard.className = 'route-stat-card';
            routeCard.innerHTML = `
                <div class="route-stat-route">${escapeHtml(route)}</div>
                <div class="route-stat-count">${count} passenger${count !== 1 ? 's' : ''}</div>
            `;
            routeStatsGrid.appendChild(routeCard);
        });
}

// Render passengers table
function renderPassengers(passengers, searchTerm = '', statusFilter = '', routeFilter = '') {
    const tbody = document.getElementById('passengers-tbody');
    
    if (passengers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="no-data">No passenger data found. <a href="apply.html">Apply for a trip</a> to get started.</td></tr>';
        return;
    }

    // Filter passengers
    let filtered = passengers.filter(p => {
        const matchesSearch = !searchTerm || 
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone?.includes(searchTerm) ||
            `${p.origin} → ${p.destination}`.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !statusFilter || p.status === statusFilter;
        const matchesRoute = !routeFilter || `${p.origin} → ${p.destination}` === routeFilter;
        
        return matchesSearch && matchesStatus && matchesRoute;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="no-data">No passengers match your filters.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map((passenger, index) => {
        const route = `${passenger.origin || 'N/A'} → ${passenger.destination || 'N/A'}`;
        const date = passenger.date ? new Date(passenger.date).toLocaleDateString() : 'N/A';
        const submittedDate = passenger.submittedAt ? new Date(passenger.submittedAt).toLocaleString() : 'N/A';
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(passenger.name || 'N/A')}</strong></td>
                <td>${escapeHtml(passenger.phone || 'N/A')}</td>
                <td>${escapeHtml(passenger.email || 'N/A')}</td>
                <td>${escapeHtml(route)}</td>
                <td>${escapeHtml(date)}</td>
                <td>${escapeHtml(passenger.time || 'Any')}</td>
                <td>${passenger.alerts ? '✅ Yes' : '❌ No'}</td>
                <td><span class="status-badge status-${passenger.status?.toLowerCase() || 'pending'}">${escapeHtml(passenger.status || 'Pending')}</span></td>
                <td>${escapeHtml(submittedDate)}</td>
            </tr>
        `;
    }).join('');
}

// Populate route filter dropdown
function populateRouteFilter(passengers) {
    const routeFilter = document.getElementById('filter-route');
    const routes = new Set();
    
    passengers.forEach(p => {
        if (p.origin && p.destination) {
            routes.add(`${p.origin} → ${p.destination}`);
        }
    });

    // Clear existing options except "All Routes"
    routeFilter.innerHTML = '<option value="">All Routes</option>';
    
    Array.from(routes).sort().forEach(route => {
        const option = document.createElement('option');
        option.value = route;
        option.textContent = route;
        routeFilter.appendChild(option);
    });
}

// Export to JSON
function exportToJSON() {
    const passengers = getPassengers();
    const dataStr = JSON.stringify(passengers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passengers_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all passenger data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('passengers');
        location.reload();
    }
}

// Escape HTML
function escapeHtml(text) {
    if (text == null) return 'N/A';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const passengers = getPassengers();
    const stats = calculateStats(passengers);

    // Render statistics
    renderStats(stats);
    
    // Populate route filter
    populateRouteFilter(passengers);
    
    // Render passengers table
    renderPassengers(passengers);

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            const statusFilter = document.getElementById('filter-status')?.value || '';
            const routeFilter = document.getElementById('filter-route')?.value || '';
            renderPassengers(passengers, searchTerm, statusFilter, routeFilter);
        });
    }

    // Filter functionality
    const statusFilter = document.getElementById('filter-status');
    const routeFilter = document.getElementById('filter-route');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            const searchTerm = searchInput?.value || '';
            const routeFilterValue = routeFilter?.value || '';
            renderPassengers(passengers, searchTerm, statusFilter.value, routeFilterValue);
        });
    }

    if (routeFilter) {
        routeFilter.addEventListener('change', () => {
            const searchTerm = searchInput?.value || '';
            const statusFilterValue = statusFilter?.value || '';
            renderPassengers(passengers, searchTerm, statusFilterValue, routeFilter.value);
        });
    }

    // Clear filters
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (routeFilter) routeFilter.value = '';
            renderPassengers(passengers);
        });
    }

    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToJSON);
    }

    // Clear all button
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllData);
    }
});
