// API Module - Handles external API calls

import { config } from './config.js';

/**
 * Load schedules data from JSON file
 */
export async function loadSchedules() {
    try {
        const response = await fetch('data/schedules.json');
        if (!response.ok) {
            throw new Error(`Failed to load schedules: ${response.status}`);
        }
        const data = await response.json();
        return data.routes || [];
    } catch (error) {
        console.error('Error loading schedules:', error);
        throw error;
    }
}

/**
 * Get Google Maps Directions between two cities
 */
export async function getDirections(origin, destination) {
    const apiKey = config.googleMapsApiKey;
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        throw new Error('Google Maps API key not configured. Please add your API key in js/config.js');
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status !== 'OK') {
            throw new Error(data.error_message || `Directions API error: ${data.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching directions:', error);
        throw error;
    }
}

/**
 * Send SMS alert via Twilio/BulkSMSGH
 * This calls a serverless function that handles the actual SMS sending
 */
export async function sendSMSAlert(phone, route, message) {
    const apiUrl = config.alertsApiUrl;
    
    if (!apiUrl || apiUrl.includes('your-function')) {
        // Fallback: show success message even if API not configured (for demo)
        return {
            success: true,
            message: 'Alert subscription received. SMS service will be configured in production.'
        };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phone,
                route: route,
                message: message
            })
        });

        const data = await response.json();
        return {
            success: response.ok,
            message: data.message || 'Alert sent successfully'
        };
    } catch (error) {
        console.error('Error sending SMS:', error);
        return {
            success: false,
            message: 'Failed to send alert. Please try again later.'
        };
    }
}

/**
 * City name to address mapping for Google Maps
 */
export const cityAddresses = {
    'Accra': 'Accra, Ghana',
    'Kumasi': 'Kumasi, Ghana',
    'Sunyani': 'Sunyani, Ghana',
    'Tamale': 'Tamale, Ghana'
};
