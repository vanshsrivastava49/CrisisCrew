async function loadProfile() {
    const response = await fetch('http://localhost:3000/api/profile', {
        method: 'GET',
        credentials: 'include',
    });
        const data = await response.json();
        document.getElementById('profile').innerHTML = `
            <p>Username: ${data.username}</p>
            <p>Email: ${data.email}</p>
            <p>Latitude: ${data.latitude}</p>
            <p>Longitude: ${data.longitude}</p>
        `;
}
