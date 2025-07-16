// API URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const logoutBtn = document.querySelector('.logout-btn');
const navLinks = document.querySelector('.nav-links');

// Show/Hide Modals
function showLoginForm() {
    loginModal.style.display = 'flex';
}

function showRegisterForm() {
    registerModal.style.display = 'flex';
}

function hideModals() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === loginModal || event.target === registerModal) {
        hideModals();
    }
};

// Authentication Functions
async function register(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            showNotification('Registration successful!', 'success');
            hideModals();
            updateUI(true);
            return true;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('token', data.token);
            showNotification('Login successful!', 'success');
            hideModals();
            updateUI(true);
            return true;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    updateUI(false);
    showNotification('Logged out successfully', 'success');
    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        window.location.href = 'index.html';
    }
}

// Update UI based on authentication status
function updateUI(isLoggedIn) {
    const authButtons = `
        <button class="login-btn" onclick="showLoginForm()">Login</button>
        <button class="register-btn" onclick="showRegisterForm()">Register</button>
    `;
    const userButtons = `
        <a href="dashboard.html">Dashboard</a>
        <button class="logout-btn" onclick="logout()">Logout</button>
    `;

    const buttonsContainer = document.querySelector('.nav-links');
    if (buttonsContainer) {
        const existingLinks = Array.from(buttonsContainer.querySelectorAll('a:not(.auth-btn)'));
        const linksHTML = existingLinks.map(link => link.outerHTML).join('');
        buttonsContainer.innerHTML = linksHTML + (isLoggedIn ? userButtons : authButtons);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    const token = localStorage.getItem('token');
    updateUI(!!token);

    // Register Form Submit
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerForm.querySelector('#regName').value;
            const email = registerForm.querySelector('#regEmail').value;
            const password = registerForm.querySelector('#regPassword').value;
            const confirmPassword = registerForm.querySelector('#regConfirmPassword').value;

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            await register(name, email, password);
        });
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('#loginEmail').value;
            const password = loginForm.querySelector('#loginPassword').value;
            await login(email, password);
        });
    }
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '1rem 2rem',
        backgroundColor: type === 'success' ? '#4CAF50' :
                        type === 'error' ? '#f44336' :
                        '#2196F3',
        color: 'white',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: '1000',
        transition: 'opacity 0.3s ease'
    });

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Protected Route Check
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Export functions for use in other files
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.hideModals = hideModals;
window.logout = logout;
window.checkAuth = checkAuth;