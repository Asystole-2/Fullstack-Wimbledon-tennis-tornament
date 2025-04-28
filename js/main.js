// Global variables
let tm_locations = [];

// Initialize the application
async function tm_initMap() {
    // Initialize Google Translate
    tm_initGoogleTranslate();

    // Load locations from JSON
    await tm_loadLocations();


    // Initialize map
    tm_initMainMap();
    tm_initDirectionsMap();

    tm_initYouTube();

    // Set up event listeners
    document.querySelectorAll('input[name="tm_placeType"]').forEach(checkbox => {
        checkbox.addEventListener('change', tm_filterMarkers);
    });

}

// Initialize Google Translate
function tm_initGoogleTranslate() {
    const script = document.createElement('script');
    script.src = "https://translate.google.com/translate_a/element.js?cb=tm_googleTranslateElementInit";
    document.body.appendChild(script);
}

// Google Translate callback
function tm_googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr,de,zh,ja',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}

// Load locations from JSON file
async function tm_loadLocations() {
    try {
        const response = await fetch('data/locations.json');
        tm_locations = await response.json();
        if (typeof tm_displayLocations === 'function') {
            tm_displayLocations(tm_locations);
        }
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

// Initialize currency dropdown
function tm_initCurrency() {
    const currencies = ['GBP', 'USD', 'EUR', 'JPY', 'AUD'];
    const currSelect = document.getElementById('tm_currencySelect');
    currencies.forEach(curr => {
        const option = document.createElement('option');
        option.value = curr;
        option.textContent = curr;
        currSelect.appendChild(option);
    });
    currSelect.value = 'GBP';
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

    if (tabName === 'tm_placesTab' && typeof google !== 'undefined' && tm_map) {
        setTimeout(() => google.maps.event.trigger(tm_map, 'resize'), 100);
    } else if (tabName === 'tm_directionsTab' && typeof google !== 'undefined' && tm_directionsMap) {
        setTimeout(() => google.maps.event.trigger(tm_directionsMap, 'resize'), 100);
    }
}
