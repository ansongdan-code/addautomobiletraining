// Contact Form Handling
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    // Validate form data
    if (!validateForm(contactData)) {
        return;
    }

    // In a real application, this would be sent to a backend server
    console.log('Contact form submission:', contactData);

    // Show success message
    showNotification('Message sent successfully! We will get back to you soon.');

    // Reset form
    contactForm.reset();
});

// Form validation
function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (data.name.length < 2) {
        showNotification('Please enter a valid name', 'error');
        return false;
    }

    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }

    if (data.subject.length < 3) {
        showNotification('Please enter a subject', 'error');
        return false;
    }

    if (data.message.length < 10) {
        showNotification('Please enter a message (minimum 10 characters)', 'error');
        return false;
    }

    return true;
}

// Notification system
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add notification styles
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.3s ease';

    // Add to document
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Form input animation
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

formInputs.forEach(input => {
    // Add focus effect
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    // Remove focus effect if input is empty
    input.addEventListener('blur', function() {
        if (!this.value) {
            this.parentElement.classList.remove('focused');
        }
    });

    // Check initial state
    if (input.value) {
        input.parentElement.classList.add('focused');
    }
});