// API URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const userProfile = document.querySelector('.user-profile');
const progressSection = document.querySelector('.progress-section');
const certificatesSection = document.querySelector('.certificates-section');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

// Check Authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!data.success) {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            return;
        }

        return data.data;
    } catch (err) {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    }
}

// Load User Profile
async function loadUserProfile(user) {
    userProfile.innerHTML = `
        <div class="profile-info">
            <h2>${user.name}</h2>
            <p>${user.email}</p>
            <p>Role: ${user.role}</p>
            <p>Member since: ${new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
    `;
}

// Load Progress Data
function loadProgress() {
    // Mock progress data - replace with actual API call
    const progressData = [
        { course: 'Basic Auto Maintenance', progress: 75 },
        { course: 'Engine Diagnostics', progress: 45 },
        { course: 'Brake Systems', progress: 90 }
    ];

    progressSection.innerHTML = `
        <h2>Course Progress</h2>
        <div class="progress-cards">
            ${progressData.map(course => `
                <div class="progress-card">
                    <h3>${course.course}</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${course.progress}%"></div>
                    </div>
                    <p>${course.progress}% Complete</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Load Certificates
function loadCertificates() {
    // Mock certificate data - replace with actual API call
    const certificates = [
        { name: 'Basic Auto Maintenance', date: '2023-10-15', id: 'CERT001' },
        { name: 'Brake Systems Specialist', date: '2023-11-20', id: 'CERT002' }
    ];

    certificatesSection.innerHTML = `
        <h2>Certificates</h2>
        <div class="certificate-grid">
            ${certificates.map(cert => `
                <div class="certificate-card">
                    <h3>${cert.name}</h3>
                    <p>Issued: ${new Date(cert.date).toLocaleDateString()}</p>
                    <p>Certificate ID: ${cert.id}</p>
                    <button onclick="downloadCertificate('${cert.id}')">Download</button>
                </div>
            `).join('')}
        </div>
    `;
}

// Download Certificate
function downloadCertificate(certId) {
    // Mock download function - replace with actual API call
    showNotification(`Downloading certificate ${certId}...`, 'success');
}

// Show Notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle Sidebar Navigation
function initializeSidebar() {
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            showSection(section);

            // Update active link
            sidebarLinks.forEach(link => link.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// Show Selected Section
function showSection(sectionId) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}

// Handle Logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
}

// Initialize Dashboard
async function initializeDashboard() {
    const user = await checkAuth();
    if (user) {
        loadUserProfile(user);
        loadProgress();
        loadCertificates();
        initializeSidebar();
        
        // Show default section
        showSection('progress');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);