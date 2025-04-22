// Initialize the application
function tm_initMap() {
    // Load locations from JSON
    tm_loadLocations();

    // Initialize language and currency dropdowns
    tm_initLanguageCurrency();

    // Initialize map
    tm_initMainMap();
    tm_initDirectionsMap();

    // Set up event listeners
    document.querySelectorAll('input[name="tm_placeType"]').forEach(checkbox => {
        checkbox.addEventListener('change', tm_filterMarkers);
    });
}

// Load locations from JSON file
async function tm_loadLocations() {
    try {
        const response = await fetch('data/locations.json');
        tm_locations = await response.json();
        tm_displayLocations(tm_locations);
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

// Filter markers based on selected types
function tm_filterMarkers() {
    const selectedTypes = Array.from(document.querySelectorAll('input[name="tm_placeType"]:checked')).map(el => el.value);

    // Hide all markers first
    Object.values(tm_markers).flat().forEach(marker => marker.setMap(null));

    // Show only selected types
    selectedTypes.forEach(type => {
        if (tm_markers[type]) {
            tm_markers[type].forEach(marker => marker.setMap(tm_map));
        }
    });
}

// Initialize language and currency dropdowns
function tm_initLanguageCurrency() {
    const languages = ['English', 'French', 'Spanish', 'German', 'Japanese'];
    const currencies = ['GBP', 'USD', 'EUR', 'JPY', 'AUD'];

    const langSelect = document.getElementById('tm_languageSelect');
    const currSelect = document.getElementById('tm_currencySelect');

    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.toLowerCase();
        option.textContent = lang;
        langSelect.appendChild(option);
    });

    currencies.forEach(curr => {
        const option = document.createElement('option');
        option.value = curr;
        option.textContent = curr;
        currSelect.appendChild(option);
    });

    // Set default to English and GBP
    langSelect.value = 'english';
    currSelect.value = 'GBP';

    // Add event listeners for changes
    langSelect.addEventListener('change', async (e) => {
        // In a real app, we would translate content here
        console.log('Language changed to:', e.target.value);
    });

    currSelect.addEventListener('change', async (e) => {
        // In a real app, we would convert prices here
        console.log('Currency changed to:', e.target.value);
    });
}

// Tab functionality
function tm_openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tm_tabContent');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('tm_active');
    }

    const tabButtons = document.getElementsByClassName('tm_tabButton');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('tm_active');
    }

    document.getElementById(tabName).classList.add('tm_active');
    evt.currentTarget.classList.add('tm_active');

    // Trigger resize for maps when tab changes
    if (tabName === 'tm_placesTab' && tm_map) {
        setTimeout(() => google.maps.event.trigger(tm_map, 'resize'), 100);
    } else if (tabName === 'tm_directionsTab' && tm_directionsMap) {
        setTimeout(() => google.maps.event.trigger(tm_directionsMap, 'resize'), 100);
    }
}