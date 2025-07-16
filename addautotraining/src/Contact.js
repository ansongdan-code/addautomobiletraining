import React, { useState } from 'react';
import './Contact.css';
import { showNotification } from './App';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.name.length < 2) {
      showNotification('Please enter a valid name', 'error');
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      showNotification('Please enter a valid email address', 'error');
      return false;
    }

    if (formData.subject.length < 3) {
      showNotification('Please enter a subject', 'error');
      return false;
    }

    if (formData.message.length < 10) {
      showNotification('Please enter a message (minimum 10 characters)', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('Contact form submission:', formData);
    showNotification('Message sent successfully! We will get back to you soon.', 'success');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <main className="contact-container">
      <section className="contact-header">
        <h1>Contact Us</h1>
        <p>Have questions? We're here to help!</p>
      </section>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <div className="icon">📍</div>
            <h3>Our Location</h3>
            <p>123 Auto Training Street<br />Mechanic City, MC 12345</p>
          </div>
          <div className="info-card">
            <div className="icon">📞</div>
            <h3>Phone</h3>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="info-card">
            <div className="icon">✉️</div>
            <h3>Email</h3>
            <p>info@autotrainingacademy.com</p>
          </div>
          <div className="info-card">
            <div className="icon">⏰</div>
            <h3>Business Hours</h3>
            <p>Monday - Friday: 9AM - 6PM<br />Saturday: 10AM - 4PM</p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send us a Message</h2>
          <form id="contactForm" className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </div>

      <div className="map-container">
        <h2>Find Us</h2>
        <div className="map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30596698663!2d-74.25987368715491!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1645564756836!5m2!1sen!2s"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Google Maps Location"
          ></iframe>
        </div>
      </div>
    </main>
  );
}

export default Contact;