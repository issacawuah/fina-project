// API Configuration
// IMPORTANT: Get your own API keys from the services below and replace the placeholder values
// DO NOT commit real API keys to GitHub - use environment variables for production

export const config = {
    // Google Maps API Key - Get from https://console.cloud.google.com/
    // For development/demo, replace with your own API key
    // For production, use an environment variable or serverless function
    googleMapsApiKey: '75a4baddf31b814521a646b55579f6aba2e3277f737b5704c9f9841f342865b8',

    // Twilio/BulkSMSGH Configuration
    // For production, use a serverless function (Netlify/Vercel) to call Twilio
    // Function should be deployed with your actual API credentials
    alertsApiUrl: 'https://your-function.netlify.app/.netlify/functions/sendAlert'
};
