/**

* API Module - Central API management

* This module initializes and exports API instances

*/
 
import { config } from './config.js';

import { WeatherAPI } from './weatherAPI.js';

import { CountriesAPI } from './countriesAPI.js';
 
/**

* Initialize Weather API

*/

export const weatherAPI = new WeatherAPI(config.weatherApiKey);
 
/**

* Initialize Countries API (no key needed)

*/

export const countriesAPI = new CountriesAPI();
 
/**

* City name to full address mapping

*/

export const cityAddresses = {

    'Accra': 'Accra, Ghana',

    'Kumasi': 'Kumasi, Ghana',

    'Sunyani': 'Sunyani, Ghana',

    'Tamale': 'Tamale, Ghana'

};
 
/**

* Get coordinates for a city

* @param {string} cityName - Name of the city

* @returns {Object} Coordinates {lat, lng}

*/

export function getCityCoordinates(cityName) {

    return config.cityCoordinates[cityName] || { lat: 7.9465, lng: -1.0232 }; // Default to center of Ghana

}
 
/**

* Mock bus schedules data (local data, not from external API)

* This represents the bus company's schedule information

* In a real app, this would come from your own database/backend

*/

export const localBusSchedules = [

    {

        id: "acc-kum-001",

        origin: "Accra",

        destination: "Kumasi",

        operator: "VIP Jeoun",

        departureTime: "06:00",

        arrivalTime: "10:30",

        fare: 85,

        currency: "GHS",

        stops: ["Nsawam", "Nkawkaw"],

        duration: "4h 30m",

        status: "active",

        busType: "AC Coach",

        seatsAvailable: 15

    },

    {

        id: "acc-kum-002",

        origin: "Accra",

        destination: "Kumasi",

        operator: "STC",

        departureTime: "08:00",

        arrivalTime: "12:45",

        fare: 90,

        currency: "GHS",

        stops: ["Nsawam", "Nkawkaw", "Mampong"],

        duration: "4h 45m",

        status: "active",

        busType: "Luxury",

        seatsAvailable: 8

    },

    {

        id: "kum-acc-001",

        origin: "Kumasi",

        destination: "Accra",

        operator: "VIP Jeoun",

        departureTime: "05:30",

        arrivalTime: "10:00",

        fare: 85,

        currency: "GHS",

        stops: ["Nkawkaw", "Nsawam"],

        duration: "4h 30m",

        status: "active",

        busType: "AC Coach",

        seatsAvailable: 22

    },

    {

        id: "acc-tam-001",

        origin: "Accra",

        destination: "Tamale",

        operator: "STC",

        departureTime: "06:00",

        arrivalTime: "14:00",

        fare: 120,

        currency: "GHS",

        stops: ["Kumasi", "Sunyani", "Techiman"],

        duration: "8h",

        status: "active",

        busType: "Luxury",

        seatsAvailable: 12

    },

    {

        id: "acc-sun-001",

        origin: "Accra",

        destination: "Sunyani",

        operator: "Metro Mass",

        departureTime: "07:00",

        arrivalTime: "12:00",

        fare: 55,

        currency: "GHS",

        stops: ["Nsawam", "Nkawkaw", "Kumasi"],

        duration: "5h",

        status: "active",

        busType: "Standard",

        seatsAvailable: 30

    },

    {

        id: "sun-kum-001",

        origin: "Sunyani",

        destination: "Kumasi",

        operator: "Metro Mass",

        departureTime: "06:30",

        arrivalTime: "09:30",

        fare: 35,

        currency: "GHS",

        stops: ["Techiman"],

        duration: "3h",

        status: "active",

        busType: "Standard",

        seatsAvailable: 25

    },

    {

        id: "tam-kum-001",

        origin: "Tamale",

        destination: "Kumasi",

        operator: "STC",

        departureTime: "05:00",

        arrivalTime: "12:30",

        fare: 95,

        currency: "GHS",

        stops: ["Techiman", "Sunyani"],

        duration: "7h 30m",

        status: "active",

        busType: "Luxury",

        seatsAvailable: 5

    },

    {

        id: "kum-tam-001",

        origin: "Kumasi",

        destination: "Tamale",

        operator: "VIP Jeoun",

        departureTime: "07:00",

        arrivalTime: "14:30",

        fare: 100,

        currency: "GHS",

        stops: ["Sunyani", "Techiman"],

        duration: "7h 30m",

        status: "active",

        busType: "AC Coach",

        seatsAvailable: 18

    }

];
 
/**

* Get all bus schedules

* @returns {Promise<Array>} Array of bus schedules

*/

export async function loadSchedules() {

    // Return local schedules immediately

    // In production, this would fetch from your backend

    return Promise.resolve(localBusSchedules);

}
 
/**

* Send SMS alert (placeholder - would need backend implementation)

* @param {string} phone - Phone number

* @param {string} route - Route information

* @param {string} message - Message to send

* @returns {Promise<Object>} Result

*/

export async function sendSMSAlert(phone, route, message) {

   
    console.log('SMS Alert (Demo Mode):', { phone, route, message });

    return Promise.resolve({

        success: true,

        message: 'Alert subscription received. SMS service will be configured in production.'

    });

}
 