// DOM Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelector('.nav-items');

// API URL
const API_URL = 'http://localhost:5000/api';

// Show/Hide Modals
function showLoginModal() {
    loginModal.style.display = 'block';
}

function showRegisterModal() {
    registerModal.style.display = 'block';
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

const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
const PAYSTACK_PUBLIC_KEY = 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY';

// Paystack initialization
const paystackButton = document.getElementById('paystack-button');
paystackButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please register first to proceed with payment.', 'error');
        return;
    }

    const email = registerForm.email.value.trim();
    if (!email) {
        showNotification('Please enter your email for Paystack payment.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/v1/paystack/initialize-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: 1000, email: email }) // Example amount
        });
        const data = await response.json();

        if (data.status) {
            window.location.href = data.data.authorization_url;
        } else {
            showNotification(data.message || 'Paystack initialization failed.', 'error');
        }
    } catch (err) {
        console.error('Error initializing Paystack payment:', err);
        showNotification('Could not initialize Paystack payment.', 'error');
    }
});
const elements = stripe.elements();
const card = elements.create('card');
card.mount('#card-element');

// Handle Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: registerForm.name.value.trim(),
        email: registerForm.email.value.trim(),
        password: registerForm.password.value
    };

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (formData.password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    try {
        console.log('Attempting registration with:', { ...formData, password: '[REDACTED]' });
        
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Registration response:', data);

        if (response.ok && data.success) {
            localStorage.setItem('token', data.token);
            showNotification('Registration successful! Please complete payment.', 'success');
            
            // Handle Stripe payment
            const paymentResponse = await fetch(`${API_URL}/v1/payment/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${data.token}`
                },
                body: JSON.stringify({ amount: 1000 }) // Example amount
            });

            const paymentData = await paymentResponse.json();

            if (paymentData.clientSecret) {
                const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
                    payment_method: {
                        card: card,
                        billing_details: {
                            name: formData.name,
                            email: formData.email
                        }
                    }
                });

                if (result.error) {
                    showNotification(result.error.message, 'error');
                } else {
                    if (result.paymentIntent.status === 'succeeded') {
                        showNotification('Payment successful!', 'success');
                        hideModals();
                        updateUI(true);
                        registerForm.reset();
                        card.clear();
                    }
                }
            } else {
                showNotification('Failed to create payment intent', 'error');
            }
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    } catch (err) {
        console.error('Registration error:', err);
        showNotification(err.message || 'Registration failed. Please try again.', 'error');
    }
});

// Paystack Button
const paystackButton = document.getElementById('paystack-button');
paystackButton.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please register first to proceed with payment.', 'error');
        return;
    }

    const email = registerForm.email.value.trim();
    if (!email) {
        showNotification('Please enter your email for Paystack payment.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/v1/paystack/initialize-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: 1000, email: email }) // Example amount
        });
        const data = await response.json();

        if (data.status) {
            window.location.href = data.data.authorization_url;
        } else {
            showNotification(data.message || 'Paystack initialization failed.', 'error');
        }
    } catch (err) {
        console.error('Error initializing Paystack payment:', err);
        showNotification('Could not initialize Paystack payment.', 'error');
    }
});

// PayPal Button
paypal.Buttons({
    createOrder: async function(data, actions) {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please register first to proceed with payment.', 'error');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/v1/paypal/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: '10.00' }) // Example amount
            });
            const order = await response.json();
            return order.orderID;
        } catch (err) {
            console.error('Error creating PayPal order:', err);
            showNotification('Could not create PayPal order.', 'error');
        }
    },
    onApprove: async function(data, actions) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/v1/paypal/capture-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderID: data.orderID })
            });
            const capture = await response.json();
            if (capture.success) {
                showNotification('PayPal payment successful!', 'success');
                hideModals();
                updateUI(true);
                registerForm.reset();
                card.clear();
            } else {
                showNotification('PayPal payment failed.', 'error');
            }
        } catch (err) {
            console.error('Error capturing PayPal order:', err);
            showNotification('Could not capture PayPal order.', 'error');
        }
    }
}).render('#paypal-button-container');

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: loginForm.email.value.trim(),
        password: loginForm.password.value
    };

    // Basic validation
    if (!formData.email || !formData.password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    try {
        console.log('Attempting login with:', { email: formData.email });
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (response.ok && data.success) {
            localStorage.setItem('token', data.token);
            showNotification('Login successful!', 'success');
            hideModals();
            updateUI(true);
            loginForm.reset();
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        showNotification(err.message || 'Login failed. Please try again.', 'error');
    }
});

// Handle Logout
function logout() {
    localStorage.removeItem('token');
    updateUI(false);
    showNotification('Logged out successfully', 'success');
}

// Update UI based on auth state
function updateUI(isLoggedIn) {
    const authButtons = document.querySelectorAll('.auth-btn');
    const userMenu = document.querySelector('.user-menu');

    if (isLoggedIn) {
        authButtons.forEach(btn => btn.style.display = 'none');
        userMenu.style.display = 'block';
    } else {
        authButtons.forEach(btn => btn.style.display = 'block');
        userMenu.style.display = 'none';
    }
}

// Show Notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Add show class after a small delay to trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Check auth status on page load
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        updateUI(false);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            updateUI(true);
        } else {
            throw new Error(data.error || 'Authentication failed');
        }
    } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        updateUI(false);
    }
}

// Fetch and display courses
async function getCourses() {
    try {
        const response = await fetch(`${API_URL}/v1/courses`);
        const data = await response.json();

        if (data.success) {
            const courseList = document.getElementById('course-list');
            courseList.innerHTML = ''; // Clear existing content
            data.data.forEach(course => {
                const courseItem = document.createElement('div');
                courseItem.className = 'course-item';
                courseItem.innerHTML = `
                    <img src="images/${course.image}" alt="${course.title}">
                    <div class="course-content">
                        <h3>${course.title}</h3>
                        <p>${course.description}</p>
                        <div class="price">${course.price}</div>
                        <a href="#" class="btn-register">Enroll Now</a>
                    </div>
                `;
                courseList.appendChild(courseItem);
            });
        } else {
            console.error('Failed to fetch courses');
        }
    } catch (err) {
        console.error('Error fetching courses:', err);
    }
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    getCourses();
});