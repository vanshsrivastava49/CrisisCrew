const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            document.getElementById('latitude').value = position.coords.latitude;
            document.getElementById('longitude').value = position.coords.longitude;
        }, error => {
            alert('Error getting location: ' + error.message);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});
document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('name').value; 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const latitude = document.getElementById('latitude').value; 
    const longitude = document.getElementById('longitude').value; 

    const response = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, latitude, longitude }),
    });

    if (response.ok) {
        alert('User registered successfully!');
        const data = await response.json();
        localStorage.setItem('username', username);
        window.location.href = 'home.html';
    } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'An error occurred.'));
    }
});
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value; 
    const password = document.getElementById('loginPassword').value;
    const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        const data = await response.json();
        alert('Logged in! Token: ' + data.token);
    } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'An error occurred.'));
    }
});
