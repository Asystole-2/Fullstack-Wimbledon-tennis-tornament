// Global variables
let tm_locations = [];
let tm_map, tm_directionsMap, tm_markers = { stadium: [], hotel: [], restaurant: [], attraction: [] };
let tm_directionsService, tm_directionsRenderer, tm_infoWindow, tm_waypoints = [], tm_poiVisible = true;

// Initialize app
async function tm_initMap() {
    tm_initGoogleTranslate();
    await tm_loadLocations();
    tm_initMainMap();
    tm_initDirectionsMap();

    document.querySelectorAll('input[name="tm_placeType"]').forEach(checkbox => {
        checkbox.addEventListener('change', tm_filterMarkers);
    });
}

function tm_initGoogleTranslate() {
    const script = document.createElement('script');
    script.src = "https://translate.google.com/translate_a/element.js?cb=tm_googleTranslateElementInit";
    document.body.appendChild(script);
}

function tm_googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr,de,zh,ja',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}

async function tm_loadLocations() {
    try {
        const response = await fetch('data/locations.json');
        tm_locations = await response.json();
        tm_displayLocations(tm_locations);
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

function tm_initMainMap() {
    tm_map = new google.maps.Map(document.getElementById('tm_map'), {
        center: { lat: 51.4339, lng: -0.2143 },
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: false,
    });
    tm_infoWindow = new google.maps.InfoWindow();
    tm_hidePointsOfInterest();
}

function tm_initDirectionsMap() {
    tm_directionsMap = new google.maps.Map(document.getElementById('tm_directionsMap'), { zoom: 12 });
    tm_directionsService = new google.maps.DirectionsService();
    tm_directionsRenderer = new google.maps.DirectionsRenderer({
        map: tm_directionsMap,
        panel: document.getElementById('tm_directionsPanel')
    });
    new google.maps.places.Autocomplete(document.getElementById('tm_startPoint'));
    new google.maps.places.Autocomplete(document.getElementById('tm_endPoint'));
}

// Display locations on map
function tm_displayLocations(locations) {
    locations.forEach(location => {
        const marker = tm_createCustomMarker(location);
        tm_markers[location.type].push(marker);
    });
}

// Create custom markers
function tm_createCustomMarker(location) {
    const icon = {
        url: `images/markers/${location.type}.png`,
        scaledSize: new google.maps.Size(32, 32)
    };

    const marker = new google.maps.Marker({
        position: location.position,
        map: tm_map,
        icon: icon,
        title: location.name
    });

    marker.addListener('click', () => {
        tm_showLocationDetails(location);
    });

    return marker;
}

// Filter markers
function tm_filterMarkers() {
    const selectedTypes = Array.from(document.querySelectorAll('input[name="tm_placeType"]:checked')).map(el => el.value);
    Object.values(tm_markers).flat().forEach(marker => marker.setMap(null));
    selectedTypes.forEach(type => {
        if (tm_markers[type]) {
            tm_markers[type].forEach(marker => marker.setMap(tm_map));
        }
    });
}

// Show location details
function tm_showLocationDetails(location) {
    let content = `
        <div class="tm_locationDetails">
            <h3>${location.name}</h3>
            <p>${location.address}</p>
    `;

    if (location.image) {
        content += `<img src="images/attractions/${location.image}" alt="${location.name}" style="max-width:100%;">`;
    }

    if (location.description) {
        content += `<p>${location.description}</p>`;
    }

    content += `</div>`;
    tm_infoWindow.setContent(content);
    tm_infoWindow.open(tm_map, tm_markers[location.type].find(m => m.title === location.name));
}

// Route calculation
function tm_calculateRoute(travelMode) {
    const start = document.getElementById('tm_startPoint').value;
    const end = document.getElementById('tm_endPoint').value;

    if (!start || !end) {
        alert('Please enter both start and end locations');
        return;
    }

    const waypoints = tm_waypoints.map(wp => ({
        location: wp.position,
        stopover: true
    }));

    const request = {
        origin: start,
        destination: end,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode[travelMode]
    };

    tm_directionsService.route(request, (response, status) => {
        if (status === 'OK') {
            tm_directionsRenderer.setDirections(response);
        } else {
            alert('Directions request failed: ' + status);
        }
    });
}

// Waypoint management
function tm_addWaypoint() {
    const id = Date.now();
    const locationSelect = document.createElement('select');
    locationSelect.className = 'tm_locationSelect';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a location';
    locationSelect.appendChild(defaultOption);

    tm_locations.forEach(location => {
        const option = document.createElement('option');
        option.value = JSON.stringify(location.position);
        option.textContent = location.name;
        locationSelect.appendChild(option);
    });

    const waypointDiv = document.createElement('div');
    waypointDiv.className = 'tm_waypoint';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'tm_button tm_smallButton';
    removeButton.onclick = () => {
        waypointDiv.remove();
        tm_waypoints = tm_waypoints.filter(wp => wp.id !== id);
    };

    waypointDiv.appendChild(locationSelect);
    waypointDiv.appendChild(removeButton);
    document.getElementById('tm_waypointsList').appendChild(waypointDiv);

    tm_waypoints.push({
        id: id,
        position: null,
        element: waypointDiv
    });

    locationSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            const position = JSON.parse(e.target.value);
            const waypoint = tm_waypoints.find(wp => wp.id === id);
            waypoint.position = position;
        }
    });
}

// Currency conversion function
async function tm_convertCurrency() {
    const amount = document.getElementById("tm_amount").value;
    const fromCurrency = document.getElementById("tm_fromCurrency").value;
    const toCurrency = document.getElementById("tm_toCurrency").value;

    if (!amount || isNaN(amount)) {
        alert("Please enter a valid amount");
        return;
    }

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await response.json();

        if (data.rates && data.rates[toCurrency]) {
            const rate = data.rates[toCurrency];
            const converted = (amount * rate).toFixed(2);

            document.getElementById("tm_convertedAmount").value = converted;
            document.querySelector('.tm_conversionRate').textContent =
                `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        } else {
            throw new Error("Currency conversion failed");
        }
    } catch (error) {
        console.error("Currency conversion error:", error);
        alert("Currency conversion failed. Please try again later.");
    }
}

// POI visibility
function tm_togglePoi() {
    tm_poiVisible = !tm_poiVisible;
    const styles = tm_poiVisible ? [] : [
        {
            featureType: "poi",
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: "transit",
            stylers: [{ visibility: "off" }]
        }
    ];
    tm_map.set('styles', styles);
    document.querySelector('[onclick="tm_togglePoi()"]').textContent =
        tm_poiVisible ? 'Hide Points of Interest' : 'Show Points of Interest';
}

// Utility functions
function tm_centerMap() {
    if (tm_map) {
        tm_map.setCenter(new google.maps.LatLng(51.4339, -0.2143));
        tm_map.setZoom(14);
    }
}

function tm_toggleAllFilters(checked) {
    document.querySelectorAll('.tm_filterGroup input[type="checkbox"]').forEach(box => {
        box.checked = checked;
    });
    tm_filterMarkers();
}

function tm_hidePointsOfInterest() {
    tm_map.set('styles', [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] }
    ]);
}

// Tab functionality
function tm_openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tm_tabContent');
    const tabButtons = document.getElementsByClassName('tm_tabButton');

    Array.from(tabContents).forEach(content => content.classList.remove('tm_active'));
    Array.from(tabButtons).forEach(button => button.classList.remove('tm_active'));

    document.getElementById(tabName).classList.add('tm_active');
    evt.currentTarget.classList.add('tm_active');

    if (tabName === 'tm_placesTab' && tm_map) {
        setTimeout(() => google.maps.event.trigger(tm_map, 'resize'), 100);
    } else if (tabName === 'tm_directionsTab' && tm_directionsMap) {
        setTimeout(() => google.maps.event.trigger(tm_directionsMap, 'resize'), 100);
    }
}