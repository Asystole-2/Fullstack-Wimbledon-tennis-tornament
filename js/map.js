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
let tm_locations = [];
let tm_waypoints = [];

// Initialize main map
function tm_initMainMap() {
    const wimbledonLocation = { lat: 51.4339, lng: -0.2143 }; // Wimbledon coordinates

    tm_map = new google.maps.Map(document.getElementById('tm_map'), {
        center: wimbledonLocation,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: false,
        mapId: 'TM_MAP_ID'
    });

    tm_infoWindow = new google.maps.InfoWindow();
    tm_hidePointsOfInterest(tm_map);
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

    // Add autocomplete to start and end points
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

    // Add click event to show details
    marker.addListener('click', () => {
        tm_showLocationDetails(location);
    });

    return marker;
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

// Toggle POI visibility
function tm_togglePoi() {
    const styles = tm_map.get('styles') ? [] : [
        {
            featureType: "poi",
            stylers: [{ visibility: "off" }]
        }
    ];

    tm_map.set('styles', styles);
}

// Calculate route with waypoints
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

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a location';
    locationSelect.appendChild(defaultOption);

    // Add locations
    tm_locations.forEach(location => {
        const option = document.createElement('option');
        option.value = JSON.stringify(location.position);
        option.textContent = location.name;
        locationSelect.appendChild(option);
    });

    // Add container for this waypoint
    const waypointDiv = document.createElement('div');
    waypointDiv.className = 'tm_waypoint';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'tm_button tm_smallButton';
    removeButton.onclick = () => {
        waypointDiv.remove();
        tm_waypoints = tm_waypoints.filter(wp => wp.id !== id);
    };

    const id = Date.now();
    waypointDiv.appendChild(locationSelect);
    waypointDiv.appendChild(removeButton);

    document.getElementById('tm_waypointsList').appendChild(waypointDiv);

    // Store waypoint reference
    tm_waypoints.push({
        id: id,
        position: null,
        element: waypointDiv
    });

    // Add change listener
    locationSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            const position = JSON.parse(e.target.value);
            const waypoint = tm_waypoints.find(wp => wp.id === id);
            waypoint.position = position;
        }
    });
}

// Hide points of interest
function tm_hidePointsOfInterest(map) {
    const styles = [
        {
            featureType: "poi",
            stylers: [{ visibility: "off" }]
        }
    ];

    const styledMapType = new google.maps.StyledMapType(styles, { name: "POI Hidden" });
    map.mapTypes.set('hide_poi', styledMapType);
    map.setMapTypeId('hide_poi');
}