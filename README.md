# Wimbledon 2025 Tourist Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A responsive, Google Maps-based website for tourists visiting Wimbledon during the 2025 tennis championships (June 30 - July 13).

## Features

- 🗺️ Interactive Google Maps integration with custom markers
- 📱 Fully responsive design for mobile, tablet, and desktop
- 🏨 Curated listings of hotels, restaurants, and attractions
- 🔍 Filterable points of interest with show/hide functionality
- 🚗 Route planning with multiple stop support
- 🌐 Multi-language support (via translation API)
- 💱 Currency conversion for international visitors
- 📲 Installable as a Progressive Web App (PWA)

## Technologies Used

- HTML5, JavaScript (ES6+)
- SCSS for styling (compiled to CSS)
- Google Maps JavaScript API
- Additional APIs:
  - Google Places API
  - Translation API (e.g., Google Translate)
  - Currency Conversion API

## Installation

 Clone the repository:
   ```bash
   git clone https://github.com/Asystole-2/Fullstack-Wimbledon-tennis-tornament.git
   npm install
   npm run scss
   ```
Configuration
Create a config.js file in the js directory with your API keys:
const CONFIG = {
  GOOGLE_MAPS_API_KEY: 'your-api-key-here',
  TRANSLATION_API_KEY: 'your-api-key-here',
  CURRENCY_API_KEY: 'your-api-key-here'
};


