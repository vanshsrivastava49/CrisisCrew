let socket = new WebSocket('ws://localhost:3000'); // Adjust port if necessary

// Handle incoming messages from the WebSocket
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Update the marker for the user whose location is received
    updateMarker(data.userId, data.latitude, data.longitude);
};

let map;
let markers = {}; // Store markers by userId
let updateInterval;

// Initialize the map
function initMap(latitude, longitude) {
    console.log('Initializing map at:', latitude, longitude); // Debug log
    map = L.map('map').setView([latitude, longitude], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    // Add a marker for the user's location
    markers[localStorage.getItem('userId')] = L.marker([latitude, longitude]).addTo(map);
}

// Update the marker's position
function updateMarker(userId, latitude, longitude) {
    console.log("Updating marker for userId:", userId, "to:", latitude, longitude);
    if (markers[userId]) {
        markers[userId].setLatLng([latitude, longitude]);
    } else {
        markers[userId] = L.marker([latitude, longitude]).addTo(map); // Create a new marker for new users
    }
}

// Start location updates
function startLocationUpdates(userId) {
    if (updateInterval) {
        clearInterval(updateInterval); // Clear any existing interval
    }

    updateInterval = setInterval(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                updateMarker(userId, latitude, longitude);
                const message = {
                    userId,
                    latitude,
                    longitude,
                };
                socket.send(JSON.stringify(message));
            }, (error) => {
                console.error('Error getting location:', error.message);
            }, {
                enableHighAccuracy:true,
            });
        }
    }, 5000);
}
async function checkAdminStatus(userId) {
    const response = await fetch(`http://localhost:3000/api/check-admin/${userId}`);
    const data = await response.json();
    if (data.isAdmin) {
        document.getElementById('adminSection').style.display = 'block';
        loadUsers();
    }
}
async function loadUsers() {
    const response = await fetch('http://localhost:3000/api/users');
    const users = await response.json();

    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.innerText = user.username;
        userList.appendChild(listItem);
    });
}
document.getElementById('getLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            document.getElementById('latitude').value = latitude;
            document.getElementById('longitude').value = longitude;
            initMap(latitude, longitude);
        }, (error) => {
            document.getElementById('message').innerText = 'Error getting location: ' + error.message;
        }, {
            enableHighAccuracy: true,
        });
    } else {
        document.getElementById('message').innerText = 'Geolocation is not supported by this browser.';
    }
});
document.getElementById('locationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    if (!userId) {
        document.getElementById('message').innerText = 'Please log in first.';
        return;
    }

    const message = {
        userId,
        latitude,
        longitude,
    };
    socket.send(JSON.stringify(message));
    updateMarker(userId, latitude, longitude);
});
document.getElementById('logoutButton').addEventListener('click', () => {
    socket.close();
    const userId = localStorage.getItem('userId');
    if (markers[userId]) {
        map.removeLayer(markers[userId]);
        delete markers[userId];
    }
    localStorage.removeItem('userId');
    document.getElementById('message').innerText = 'Logged out successfully.';
});
