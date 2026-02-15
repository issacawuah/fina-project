export class WeatherAPI {

    constructor(apiKey) {

        this.apiKey = apiKey;

        this.baseURL = 'https://api.weatherapi.com/v1';

    }
 
    /**

     * Get current weather for a city

     * @param {string} city - City name (e.g., "Accra", "Kumasi")

     * @returns {Promise<Object>} Weather data

     */

    async getCurrentWeather(city) {

        try {

            const response = await fetch(

                `${this.baseURL}/current.json?key=${this.apiKey}&q=${encodeURIComponent(city)},Ghana&aqi=no`

            );

            if (!response.ok) {

                throw new Error(`Weather API error: ${response.status}`);

            }

            const data = await response.json();

            return {

                location: data.location.name,

                temp_c: data.current.temp_c,

                temp_f: data.current.temp_f,

                condition: data.current.condition.text,

                icon: data.current.condition.icon,

                humidity: data.current.humidity,

                wind_kph: data.current.wind_kph,

                feelslike_c: data.current.feelslike_c,

                feelslike_f: data.current.feelslike_f,

                last_updated: data.current.last_updated

            };

        } catch (error) {

            console.error(`Error getting weather for ${city}:`, error);

            throw error;

        }

    }
 
    /**

     * Get weather for multiple cities at once

     * @param {Array<string>} cities - Array of city names

     * @returns {Promise<Array>} Array of weather data

     */

    async getMultipleCitiesWeather(cities) {

        try {

            const weatherPromises = cities.map(city => this.getCurrentWeather(city));

            const results = await Promise.allSettled(weatherPromises);

            return results.map((result, index) => {

                if (result.status === 'fulfilled') {

                    return result.value;

                } else {

                    console.error(`Failed to get weather for ${cities[index]}:`, result.reason);

                    return {

                        location: cities[index],

                        temp_c: 'N/A',

                        temp_f: 'N/A',

                        condition: 'Data unavailable',

                        icon: '',

                        humidity: 'N/A',

                        wind_kph: 'N/A',

                        feelslike_c: 'N/A',

                        feelslike_f: 'N/A',

                        error: true

                    };

                }

            });

        } catch (error) {

            console.error('Error getting multiple cities weather:', error);

            throw error;

        }

    }
 
    /**

     * Get forecast for a city (3-day forecast)

     * @param {string} city - City name

     * @param {number} days - Number of days (1-3 for free tier)

     * @returns {Promise<Object>} Forecast data

     */

    async getForecast(city, days = 3) {

        try {

            const response = await fetch(

                `${this.baseURL}/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(city)},Ghana&days=${days}&aqi=no`

            );

            if (!response.ok) {

                throw new Error(`Weather API error: ${response.status}`);

            }

            const data = await response.json();

            return {

                location: data.location.name,

                forecast: data.forecast.forecastday.map(day => ({

                    date: day.date,

                    maxtemp_c: day.day.maxtemp_c,

                    mintemp_c: day.day.mintemp_c,

                    condition: day.day.condition.text,

                    icon: day.day.condition.icon,

                    chance_of_rain: day.day.daily_chance_of_rain

                }))

            };

        } catch (error) {

            console.error(`Error getting forecast for ${city}:`, error);

            throw error;

        }

    }

}

	 
 