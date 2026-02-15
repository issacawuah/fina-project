export class CountriesAPI {
    constructor() {
        this.baseURL = 'https://restcountries.com/v3.1';
    }
 
    /**
     * Get detailed information about Ghana
     * @returns {Promise<Object>} Ghana country data
     */
    async getGhanaInfo() {
        try {
            const response = await fetch(`${this.baseURL}/name/ghana`);
            if (!response.ok) {
                throw new Error(`Countries API error: ${response.status}`);
            }
            const data = await response.json();
            const ghana = data[0]; // Ghana is the first result
            return {
                name: ghana.name.common,
                officialName: ghana.name.official,
                capital: ghana.capital ? ghana.capital[0] : 'Accra',
                population: ghana.population,
                region: ghana.region,
                subregion: ghana.subregion,
                currencies: ghana.currencies,
                languages: ghana.languages,
                flag: ghana.flags.svg,
                flagPng: ghana.flags.png,
                coatOfArms: ghana.coatOfArms?.svg || ghana.coatOfArms?.png,
                coordinates: ghana.latlng,
                area: ghana.area,
                timezones: ghana.timezones,
                continents: ghana.continents,
                borders: ghana.borders || [],
                callingCode: ghana.idd.root + (ghana.idd.suffixes ? ghana.idd.suffixes[0] : ''),
                tld: ghana.tld,
                maps: ghana.maps
            };
        } catch (error) {
            console.error('Error getting Ghana info:', error);
            throw error;
        }
    }
 
    /**
     * Get information about neighboring countries
     * @param {Array<string>} countryCodes 
     * @returns {Promise<Array>} Array of country data
     */
    async getNeighboringCountries(countryCodes) {
        try {
            if (!countryCodes || countryCodes.length === 0) {
                return [];
            }
 
            const codes = countryCodes.join(',');
            const response = await fetch(`${this.baseURL}/alpha?codes=${codes}`);
            if (!response.ok) {
                throw new Error(`Countries API error: ${response.status}`);
            }
            const data = await response.json();
            return data.map(country => ({
                name: country.name.common,
                capital: country.capital ? country.capital[0] : 'N/A',
                population: country.population,
                flag: country.flags.svg
            }));
        } catch (error) {
            console.error('Error getting neighboring countries:', error);
            return [];
        }
    }
 
    /**
     * Format population number with commas
     * @param {number} population - Population number
     * @returns {string} Formatted population
     */
    formatPopulation(population) {
        return population.toLocaleString('en-US');
    }
 
    /**
     * Get currency information as formatted string
     * @param {Object} currencies - Currencies object from API
     * @returns {string} Formatted currency string
     */
    formatCurrencies(currencies) {
        if (!currencies) return 'N/A';
        const currencyList = Object.entries(currencies).map(([code, info]) => {
            return `${info.name} (${info.symbol || code})`;
        });
        return currencyList.join(', ');
    }
 
    /**
     * Get languages as formatted string
     * @param {Object} languages - Languages object from API
     * @returns {string} Formatted languages string
     */
    formatLanguages(languages) {
        if (!languages) return 'N/A';
        return Object.values(languages).join(', ');
    }
}