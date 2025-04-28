// Global variables
let tm_map;
let tm_directionsMap;
let tm_markers = {
    stadium: [],
    hotel: [],
    restaurant: [],
    attraction: []
};
let tm_directionsService;
let tm_directionsRenderer;
let tm_infoWindow;
let tm_waypoints = [];
let tm_poiVisible = true;


// Initialize main map
async function tm_initMainMap() {
    const wimbledonLocation = { lat: 51.4339, lng: -0.2143 };

    tm_map = new google.maps.Map(document.getElementById('tm_map'), {
        center: wimbledonLocation,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: false,
    });

    tm_infoWindow = new google.maps.InfoWindow();
    tm_hidePointsOfInterest();
}

// Initialize directions map
function tm_initDirectionsMap() {
    tm_directionsMap = new google.maps.Map(document.getElementById('tm_directionsMap'), {
        zoom: 12,
        mapTypeControl: true
    });

    tm_directionsService = new google.maps.DirectionsService();
    tm_directionsRenderer = new google.maps.DirectionsRenderer({
        map: tm_directionsMap,
        panel: document.getElementById('tm_directionsPanel'),
        suppressMarkers: false
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
function tm_toggleAllFilters(checked) {
    document.querySelectorAll('.tm_filterGroup input[type="checkbox"]').forEach(box => {
        box.checked = checked;
    });
    tm_filterMarkers();
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

    if (location.price) {
        content += `<p>Average price: ${location.price}</p>`;
    }

    content += `</div>`;

    tm_infoWindow.setContent(content);
    tm_infoWindow.open(tm_map, tm_markers[location.type].find(m => m.title === location.name));
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


// Calculate route
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

// Add waypoint
function tm_addWaypoint() {
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

    // Update button text
    const button = document.querySelector('[onclick="tm_togglePoi()"]');
    if (button) {
        button.textContent = tm_poiVisible ?
            'Hide Points of Interest' :
            'Show Points of Interest';
    }
}
function tm_centerMap() {
    if (tm_map) {
        tm_map.setCenter(new google.maps.LatLng(51.4339, -0.2143));
        tm_map.setZoom(14);
    }
}