// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    try {
        await loadUserProfile();
        initializeDashboard();
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (data.success) {
            updateProfileUI(data.data);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        throw new Error('Failed to load user profile');
    }
}

// Update profile UI with user data
function updateProfileUI(user) {
    const profileSection = document.querySelector('.profile-info');
    if (profileSection) {
        profileSection.innerHTML = `
            <h2>Welcome, ${user.name}!</h2>
            <p>Email: ${user.email}</p>
            <p>Member since: ${new Date(user.createdAt).toLocaleDateString()}</p>
        `;
    }
}

// Initialize dashboard functionality
function initializeDashboard() {
    // Initialize sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.dashboard-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.style.display = section.id === targetSection ? 'block' : 'none';
            });
        });
    });

    // Show default section
    if (sidebarLinks[0]) {
        sidebarLinks[0].click();
    }

    // Initialize progress tracking
    initializeProgress();

    // Initialize certificates
    initializeCertificates();
}

// Initialize progress tracking
function initializeProgress() {
    // Mock progress data - In a real app, this would come from the backend
    const progressData = [
        { course: 'Basic Mechanics', progress: 75 },
        { course: 'Engine Systems', progress: 60 },
        { course: 'Electrical Systems', progress: 40 },
        { course: 'Safety Protocols', progress: 90 }
    ];

    const progressContainer = document.querySelector('.progress-cards');
    if (progressContainer) {
        progressContainer.innerHTML = progressData.map(course => `
            <div class="progress-card">
                <h3>${course.course}</h3>
                <div class="progress-bar">
                    <div class="progress" style="width: ${course.progress}%"></div>
                </div>
                <p>${course.progress}% Complete</p>
            </div>
        `).join('');
    }
}

// Initialize certificates section
function initializeCertificates() {
    // Mock certificates data - In a real app, this would come from the backend
    const certificates = [
        {
            id: 1,
            name: 'Basic Automotive Maintenance',
            issueDate: '2023-12-01',
            status: 'completed'
        },
        {
            id: 2,
            name: 'Engine Systems Specialist',
            issueDate: '2023-11-15',
            status: 'completed'
        },
        {
            id: 3,
            name: 'Electrical Systems',
            status: 'in-progress'
        }
    ];

    const certificatesContainer = document.querySelector('.certificates-grid');
    if (certificatesContainer) {
        certificatesContainer.innerHTML = certificates.map(cert => `
            <div class="certificate-card ${cert.status}">
                <h3>${cert.name}</h3>
                ${cert.status === 'completed' ? `
                    <p>Issued: ${new Date(cert.issueDate).toLocaleDateString()}</p>
                    <button onclick="downloadCertificate(${cert.id})">Download Certificate</button>
                ` : `
                    <p class="status">In Progress</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: 60%"></div>
                    </div>
                `}
            </div>
        `).join('');
    }
}

// Download certificate function
function downloadCertificate(certId) {
    // In a real app, this would make an API call to get the certificate PDF
    showNotification('Downloading certificate...', 'info');
    setTimeout(() => {
        showNotification('Certificate downloaded successfully!', 'success');
    }, 2000);
}

// Export functions
window.downloadCertificate = downloadCertificate;