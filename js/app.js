let tm_locations = [];
let tm_map, tm_directionsMap, tm_markers = { stadium: [], hotel: [], restaurant: [], attraction: [] };
let tm_directionsService, tm_directionsRenderer, tm_infoWindow, tm_waypoints = [], tm_poiVisible = true;
let tm_allSelected = true


// Update tm_toggleAllFilters function
function tm_toggleAllFilters() {
    tm_allSelected = !tm_allSelected;
    const checkboxes = document.querySelectorAll('.tm_filterGroup input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = tm_allSelected;
    });
    tm_filterMarkers();

    // Update button text
    const button = document.querySelector('.tm_button[onclick="tm_toggleAllFilters()"]');
    button.textContent = tm_allSelected ? 'Deselect All' : 'Select All';
}
// Initialize app
async function tm_initMap() {
    tm_initGoogleTranslate();
    await tm_loadLocations();
    tm_initMainMap();
    tm_initDirectionsMap();
    tm_createStadiumCards();

    // Check all filters by default
    document.querySelectorAll('input[name="tm_placeType"]').forEach(checkbox => {
        checkbox.checked = true;
        checkbox.addEventListener('change', tm_filterMarkers);
    });
    // Show all markers initially
    tm_filterMarkers();

    // Set the initial button state
    const button = document.querySelector('.tm_button[onclick="tm_toggleAllFilters()"]');
    button.textContent = 'Deselect All';
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

    // Hide all markers first
    Object.values(tm_markers).flat().forEach(marker => marker.setMap(null));

    // Show selected markers only if any types are selected
    if (selectedTypes.length > 0) {
        selectedTypes.forEach(type => {
            if (tm_markers[type]) {
                tm_markers[type].forEach(marker => marker.setMap(tm_map));
            }
        });
    }
}

function tm_createStadiumCards() {
    const container = document.getElementById('tm_stadiumCards');
    container.innerHTML = '';

    fetch('data/locations.json')
        .then(response => response.json())
        .then(data => {
            const stadiums = data.filter(item => item.type === 'stadium');

            stadiums.forEach(stadium => {
                const card = document.createElement('div');
                card.className = 'tm_card';

                card.innerHTML = `
          <img src="images/${stadium.image}" alt="${stadium.name}">
          <div class="tm_cardContent">
            <h3 class="tm_cardTitle">${stadium.name}</h3>
            <p class="tm_cardDescription">${stadium.description}</p>
            <button class="tm_cardButton" onclick="tm_showOnMap(${stadium.id})">View on Map</button>
          </div>
          <div class="tm_cardPrice">${stadium.price}</div>
        `;

                container.appendChild(card);
            });
        })
        .catch(error => console.error('Error loading JSON data:', error));
}


function tm_showOnMap(stadiumId) {
    // Switch to Explore tab
    document.querySelector('[onclick="tm_openTab(event, \'tm_placesTab\')"]').click();

    // Find the stadium and its marker
    const stadium = tm_locations.find(loc => loc.id === stadiumId);
    const marker = tm_markers.stadium.find(m => m.title === stadium.name);

    if (marker) {
        // Center map on marker
        tm_map.panTo(marker.getPosition());
        tm_map.setZoom(17);

        // Open info window
        tm_showLocationDetails(stadium);

        // Add pulse animation
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 1500);
    }
}

// Show location details
function tm_showLocationDetails(location) {
    const content = `
    <div class="tm_locationDetails">
      <h3>${location.name}</h3>
      <p>${location.address}</p>
      <p class="tm_cardPrice">${location.price}</p>
      ${location.image ? `<img src="images/${location.image}" alt="${location.name}" style="max-width:100%;">` : ''}
      ${location.description ? `<p>${location.description}</p>` : ''}
    </div>
  `;
    document.getElementById('tm_sidePanelContent').innerHTML = content;
    document.getElementById('tm_sidePanel').classList.add('open');
}

function closeSidePanel() {
    document.getElementById('tm_sidePanel').classList.remove('open');
}
// Route calculation
function tm_calculateRoute(travelMode) {
    const start = document.getElementById('tm_startPoint').value;
    const end = document.getElementById('tm_endPoint').value;

    if (!start || !end) {
        alert('Please enter both start and end locations');
        return;
    }

    // Filter valid waypoints and format locations correctly
    const validWaypoints = tm_waypoints
        .filter(wp => wp.location && wp.location.position)
        .map(wp => ({
            location: new google.maps.LatLng(wp.location.position.lat, wp.location.position.lng),
            stopover: true
        }));

    const request = {
        origin: start,
        destination: end,
        waypoints: validWaypoints,
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
        // option.value = JSON.stringify(location.position);
        option.value = JSON.stringify(location)
        option.textContent = location.name;
        locationSelect.appendChild(option);
    });
    const waypointDiv = document.createElement('div');
    waypointDiv.className = 'tm_waypoint';

    const infoButton = document.createElement('button');
    infoButton.innerHTML = 'ℹ️'; // Information icon
    infoButton.className = 'tm_infoButton';
    infoButton.onclick = () => tm_showWaypointDetails(JSON.parse(locationSelect.value));

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'tm_button tm_smallButton';
    removeButton.onclick = () => {
        waypointDiv.remove();
        tm_waypoints = tm_waypoints.filter(wp => wp.id !== id);
    };

    waypointDiv.appendChild(locationSelect);
    waypointDiv.appendChild(infoButton);
    waypointDiv.appendChild(removeButton);
    document.getElementById('tm_waypointsList').appendChild(waypointDiv);

    tm_waypoints.push({
        id: id,
        location: null,
        element: waypointDiv
    });

    locationSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            const location = JSON.parse(e.target.value);
            const waypoint = tm_waypoints.find(wp => wp.id === id);
            waypoint.location = location;
            infoButton.disabled = false;
        }
    });
}
function tm_showWaypointDetails(location) {
    const content = `
        <div class="tm_waypointDetails">
            <h3>${location.name}</h3>
            <p>${location.address}</p>
            ${location.price ? `<p class="tm_cardPrice">${location.price}</p>` : ''}
            ${location.image ? `<img src="images/attractions/${location.image}" alt="${location.name}" style="max-width:200px; height:auto;">` : ''}
            ${location.description ? `<p>${location.description}</p>` : ''}
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: content,
        maxWidth: 300
    });

    infoWindow.setPosition(new google.maps.LatLng(location.position.lat, location.position.lng));
    infoWindow.open(tm_directionsMap);
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
function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

// Close modals when clicking outside of them
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

//selectors/checkboxes
document.querySelector('.tm_dropdownBtn').addEventListener('click', function() {
    const dropdownContent = document.querySelector('.tm_dropdownContent');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});
