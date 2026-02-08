# Transit Safe Ghana

A professional web application for planning bus trips between major cities in Ghana (Accra, Kumasi, Sunyani, Tamale) with real-time schedules, route planning, and SMS alerts.

## Features

- 🗺️ **Route Planning** - Google Maps Directions API integration for route visualization
- ⏰ **Bus Schedules** - View schedules and fares from multiple operators
- 📱 **SMS Alerts** - Receive alerts via Twilio/BulkSMSGH for delays and incidents
- ✅ **Trip Application** - Easy trip booking system
- 📊 **Dynamic Data** - JSON dataset with 8+ attributes per route

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Professional styling with animations
- **Vanilla JavaScript** - ES6 modules, no frameworks
- **Google Maps Directions API** - Route planning and mapping
- **Twilio/BulkSMSGH** - SMS alert system

## Project Structure

```
WDD330/
├── index.html          # Home page with mission and hero
├── apply.html          # Trip application form
├── schedules.html      # Bus schedules and fares
├── css/
│   └── styles.css      # All styles (professional design)
├── js/
│   ├── main.js         # Shared functionality
│   ├── apply.js        # Trip application + Google Maps
│   ├── schedules.js    # Schedule display and filtering
│   ├── api.js          # API calls (Google Maps, Twilio)
│   └── config.js       # API keys configuration
└── data/
    └── schedules.json  # Bus route data (8+ attributes)
```

## Setup Instructions

1. **Clone or download** the project

2. **Configure API Keys**
   - Open `js/config.js`
   - Add your **Google Maps API Key** (get from [Google Cloud Console](https://console.cloud.google.com/))
   - Enable **Directions API** in your Google Cloud project
   - For SMS alerts, configure your Twilio/BulkSMSGH endpoint URL

3. **Run Locally**
   - Use a local server (VS Code Live Server, `npx serve`, etc.)
   - Open `index.html` in your browser
   - **Note:** Opening files directly (file://) may cause CORS issues with JSON and Google Maps

## API Configuration

### Google Maps Directions API
- Get API key from Google Cloud Console
- Enable "Directions API" in your project
- Add key to `js/config.js`

### Twilio/BulkSMSGH SMS
- For production, deploy a serverless function (Netlify/Vercel)
- Function should accept POST requests with `phone`, `route`, `message`
- Add function URL to `js/config.js` → `alertsApiUrl`

## Data Structure

Each route in `data/schedules.json` contains:
- `id` - Unique identifier
- `origin` - Starting city
- `destination` - Ending city
- `operator` - Bus company name
- `departureTime` - Departure time
- `arrivalTime` - Arrival time
- `fare` - Ticket price
- `currency` - Currency code
- `stops` - Array of intermediate stops
- `duration` - Travel duration
- `status` - Route status
- `busType` - Type of bus
- `seatsAvailable` - Available seats

## Requirements Met

✅ HTML, CSS, Vanilla JavaScript (no frameworks)  
✅ Two external APIs (Google Maps Directions + Twilio/BulkSMSGH)  
✅ Static + dynamic markup  
✅ CSS animations  
✅ Clean, organized code (ES modules)  
✅ Professional design  
✅ Responsive layout  
✅ JSON dataset with 8+ attributes per element  

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ support.

## License

Educational project for WDD330 course.
