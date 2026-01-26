import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./Dashboard'));
const Blog = React.lazy(() => import('./Blog'));
const Contact = React.lazy(() => import('./Contact'));
const Admin = React.lazy(() => import('./Admin'));
const Payment = React.lazy(() => import('./Payment'));

// Basic notification utility
export const showNotification = (message, type = 'info') => {
  const notificationDiv = document.createElement('div');
  notificationDiv.className = `notification ${type}`;
  notificationDiv.textContent = message;
  Object.assign(notificationDiv.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    borderRadius: '5px',
    backgroundColor: type === 'success' ? '#4CAF50' : (type === 'error' ? '#f44336' : '#2196F3'),
    color: 'white',
    zIndex: '10000',
    opacity: '0',
    transition: 'opacity 0.5s ease-in-out',
  });
  document.body.appendChild(notificationDiv);

  setTimeout(() => {
    notificationDiv.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    notificationDiv.style.opacity = '0';
    setTimeout(() => notificationDiv.remove(), 500);
  }, 3000);
};

function App() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Inject page-level custom CSS (from WebsiteEditor) into document head
  useEffect(() => {
    const path = location.pathname || '/';

    const slugForPath = (p) => {
      if (p === '/' || p === '') return 'home';
      if (p.startsWith('/blog')) return 'blog';
      if (p.startsWith('/contact')) return 'contact';
      return null;
    };

    const slug = slugForPath(path);
    const styleId = 'page-custom-css';

    const removeStyle = () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };

    if (!slug) {
      removeStyle();
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/website/pages/${slug}`);
        if (!res || !res.ok) {
          removeStyle();
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const css = data.data && data.data.customCSS ? data.data.customCSS : '';

        // update or create style tag
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = styleId;
          document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = css || '';

        // Inject page-level custom JavaScript safely
        const jsId = 'page-custom-js';
        const removeScript = () => {
          const existingScript = document.getElementById(jsId);
          if (existingScript) existingScript.remove();
        };

        removeScript();
        const pageJS = data.data && data.data.customJavaScript ? data.data.customJavaScript : '';
        if (pageJS && pageJS.trim()) {
          try {
            const scriptTag = document.createElement('script');
            scriptTag.id = jsId;
            scriptTag.type = 'text/javascript';
            // Avoid using src or eval; set textContent to inline JS
            scriptTag.textContent = pageJS;
            // Append at end of body so it runs after DOM
            document.body.appendChild(scriptTag);
          } catch (err) {
            console.error('Failed to inject page customJavaScript', err);
            removeScript();
          }
        }
      } catch (err) {
        console.error('Failed to load page customCSS', err);
        removeStyle();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const showLoginForm = () => {
    console.log('Opening login modal');
    setLoginModalOpen(true);
  };

  const closeLoginForm = () => {
    console.log('Closing login modal');
    setLoginModalOpen(false);
  };

  const showRegisterForm = () => {
    console.log('Opening register modal');
    setRegisterModalOpen(true);
  };

  const closeRegisterForm = () => {
    console.log('Closing register modal');
    setRegisterModalOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log('Login data:', { email, password: password ? '***' : 'empty' });
    
    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        
        // Get user details
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('user', JSON.stringify(userData.data));
          setUser(userData.data);
          
          showNotification('Login successful!', 'success');
          closeLoginForm();
          
          // Redirect based on user role
          if (userData.data.role === 'admin' || userData.data.role === 'super_admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        showNotification(data.error || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Login failed. Please try again.', 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    const formData = new FormData(e.target);
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    console.log('Register data:', { fullName, email, password: password ? '***' : 'empty', confirmPassword: confirmPassword ? '***' : 'empty' });
    
    if (!fullName || !email || !password || !confirmPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: fullName, 
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        
        // Get user details
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('user', JSON.stringify(userData.data));
          setUser(userData.data);
          
          showNotification('Registration successful!', 'success');
          closeRegisterForm();
          navigate('/dashboard');
        }
      } else {
        showNotification(data.error || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('Registration failed. Please try again.', 'error');
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google OAuth process
    showNotification('Redirecting to Google...', 'info');
    setTimeout(() => {
      showNotification('Google login successful! (Demo mode)', 'success');
      closeLoginForm();
      navigate('/dashboard');
    }, 2000);
  };

  const handleGoogleRegister = () => {
    // Simulate Google OAuth process
    showNotification('Redirecting to Google...', 'info');
    setTimeout(() => {
      showNotification('Google registration successful! (Demo mode)', 'success');
      closeRegisterForm();
      navigate('/dashboard');
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showNotification('Logged out successfully', 'success');
    navigate('/');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">Auto Training Academy</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          {user ? (
            <>
              {(user.role === 'admin' || user.role === 'super_admin') && <Link to="/admin" className="nav-link">Admin</Link>}
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/blog" className="nav-link">Blog</Link>
              <Link to="/contact" className="nav-link">Contact Us</Link>
              <Link to="/payment" className="nav-link">Payment</Link>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/blog" className="nav-link">Blog</Link>
              <Link to="/contact" className="nav-link">Contact Us</Link>
              <button className="login-btn" onClick={showLoginForm}>Login</button>
              <button className="register-btn" onClick={showRegisterForm}>Register</button>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <div className="home-page">
              {/* Hero Section */}
              <section className="hero">
                <div className="hero-content">
                  <h1>Welcome to Auto Training Academy</h1>
                  <p>Your journey to becoming an automotive expert starts here</p>
                  <div className="hero-buttons">
                    <button className="cta-btn primary" onClick={showRegisterForm}>Start Learning Today</button>
                    <button className="cta-btn secondary" onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}>View Courses</button>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section className="features">
                <div className="container">
                  <h2>Why Choose Auto Training Academy?</h2>
                  <div className="features-grid">
                    <div className="feature-card">
                      <div className="feature-icon">🎓</div>
                      <h3>Expert Instructors</h3>
                      <p>Learn from certified automotive professionals with years of industry experience.</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">💻</div>
                      <h3>Online & Hands-on</h3>
                      <p>Flexible learning with both online modules and practical workshop sessions.</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">📜</div>
                      <h3>Certification</h3>
                      <p>Earn recognized certificates upon completion of each course module.</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">🔧</div>
                      <h3>Latest Technology</h3>
                      <p>Stay current with the latest automotive diagnostic tools and techniques.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Courses Section */}
              <section id="courses" className="courses">
                <div className="container">
                  <h2>Our Course Catalog</h2>
                  <p className="section-subtitle">Comprehensive automotive training programs designed for all skill levels</p>
                  
                  <div className="courses-grid">
                    <div className="course-card">
                      <div className="course-image">
                        <img src="https://source.unsplash.com/400x250/?car-engine" alt="Engine Fundamentals" />
                        <div className="course-level">Beginner</div>
                      </div>
                      <div className="course-content">
                        <h3>Engine Fundamentals</h3>
                        <p>Master the basics of internal combustion engines, components, and operation principles.</p>
                        <div className="course-details">
                          <span>⏱️ 8 weeks</span>
                          <span>📚 12 modules</span>
                          <span>🎯 Certification</span>
                        </div>
                        <ul className="course-topics">
                          <li>Engine Components & Systems</li>
                          <li>Four-Stroke Cycle Operation</li>
                          <li>Engine Performance Analysis</li>
                          <li>Basic Troubleshooting</li>
                        </ul>
                        <button className="course-btn" onClick={showRegisterForm}>Enroll Now</button>
                      </div>
                    </div>

                    <div className="course-card">
                      <div className="course-image">
                        <img src="https://source.unsplash.com/400x250/?car-diagnostic" alt="Diagnostic Systems" />
                        <div className="course-level">Intermediate</div>
                      </div>
                      <div className="course-content">
                        <h3>Diagnostic Systems</h3>
                        <p>Learn modern diagnostic techniques using OBD-II systems and advanced scanning tools.</p>
                        <div className="course-details">
                          <span>⏱️ 10 weeks</span>
                          <span>📚 15 modules</span>
                          <span>🎯 Certification</span>
                        </div>
                        <ul className="course-topics">
                          <li>OBD-II System Operation</li>
                          <li>Diagnostic Trouble Codes</li>
                          <li>Scan Tool Operation</li>
                          <li>Advanced Diagnostics</li>
                        </ul>
                        <button className="course-btn" onClick={showRegisterForm}>Enroll Now</button>
                      </div>
                    </div>

                    <div className="course-card">
                      <div className="course-image">
                        <img src="https://source.unsplash.com/400x250/?electric-car" alt="Electric Vehicles" />
                        <div className="course-level">Advanced</div>
                      </div>
                      <div className="course-content">
                        <h3>Electric Vehicle Technology</h3>
                        <p>Explore the future of automotive technology with comprehensive EV training.</p>
                        <div className="course-details">
                          <span>⏱️ 12 weeks</span>
                          <span>📚 18 modules</span>
                          <span>🎯 Certification</span>
                        </div>
                        <ul className="course-topics">
                          <li>EV Battery Systems</li>
                          <li>Electric Motor Operation</li>
                          <li>Charging Infrastructure</li>
                          <li>Safety Protocols</li>
                        </ul>
                        <button className="course-btn" onClick={showRegisterForm}>Enroll Now</button>
                      </div>
                    </div>

                    <div className="course-card">
                      <div className="course-image">
                        <img src="https://source.unsplash.com/400x250/?car-transmission" alt="Transmission Systems" />
                        <div className="course-level">Intermediate</div>
                      </div>
                      <div className="course-content">
                        <h3>Transmission Systems</h3>
                        <p>Master manual and automatic transmission operation, maintenance, and repair.</p>
                        <div className="course-details">
                          <span>⏱️ 9 weeks</span>
                          <span>📚 14 modules</span>
                          <span>🎯 Certification</span>
                        </div>
                        <ul className="course-topics">
                          <li>Manual Transmission Operation</li>
                          <li>Automatic Transmission Systems</li>
                          <li>CVT Technology</li>
                          <li>Transmission Diagnostics</li>
                        </ul>
                        <button className="course-btn" onClick={showRegisterForm}>Enroll Now</button>
                      </div>
                    </div>

                    <div className="course-card">
                      <div className="course-image">
                        <img src="https://source.unsplash.com/400x250/?car-brakes" alt="Brake Systems" />
                        <div className="course-level">Beginner</div>
                      </div>
                      <div className="course-content">
                        <h3>Brake Systems</h3>
                        <p>Essential training on hydraulic brake systems, ABS, and modern brake technologies.</p>
                        <div className="course-details">
                          <span>⏱️ 6 weeks</span>
                          <span>📚 10 modules</span>
                          <span>🎯 Certification</span>
                        </div>
                        <ul className="course-topics">
                          <li>Hydraulic Brake Systems</li>
                          <li>ABS & Electronic Brake Control</li>
                          <li>Brake Maintenance & Repair</li>
                          <li>Safety Procedures</li>
                        </ul>
                        <button className="course-btn" onClick={showRegisterForm}>Enroll Now</button>
                      </div>
                    </div>

                    <div className="course-card">
                      <div className="course-image">
                        <img src="https://source.unsplash.com/400x250/?car-suspension" alt="Suspension & Steering" />
                        <div className="course-level">Intermediate</div>
                      </div>
                      <div className="course-content">
                        <h3>Suspension & Steering</h3>
                        <p>Comprehensive coverage of suspension systems, steering mechanisms, and alignment.</p>
                        <div className="course-details">
                          <span>⏱️ 8 weeks</span>
                          <span>📚 13 modules</span>
                          <span>🎯 Certification</span>
                        </div>
                        <ul className="course-topics">
                          <li>Suspension System Types</li>
                          <li>Steering Geometry</li>
                          <li>Wheel Alignment</li>
                          <li>Shock & Strut Service</li>
                        </ul>
                        <button className="course-btn" onClick={showRegisterForm}>Enroll Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Section */}
              <section className="stats">
                <div className="container">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">500+</div>
                      <div className="stat-label">Students Enrolled</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">25+</div>
                      <div className="stat-label">Expert Instructors</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">95%</div>
                      <div className="stat-label">Success Rate</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">50+</div>
                      <div className="stat-label">Course Modules</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="cta-section">
                <div className="container">
                  <h2>Ready to Start Your Automotive Career?</h2>
                  <p>Join thousands of successful graduates who have transformed their careers with our comprehensive training programs.</p>
                  <div className="cta-buttons">
                    <button className="cta-btn primary" onClick={showRegisterForm}>Get Started Today</button>
                    <button className="cta-btn secondary" onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}>Browse All Courses</button>
                  </div>
                </div>
              </section>
            </div>
          } />
          <Route path="/dashboard" element={
            <Suspense fallback={<div className="loading">Loading Dashboard...</div>}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="/blog" element={
            <Suspense fallback={<div className="loading">Loading Blog...</div>}>
              <Blog />
            </Suspense>
          } />
          <Route path="/contact" element={
            <Suspense fallback={<div className="loading">Loading Contact...</div>}>
              <Contact />
            </Suspense>
          } />
          <Route path="/payment" element={
            <Suspense fallback={<div className="loading">Loading Payment...</div>}>
              <Payment />
            </Suspense>
          } />
          <Route path="/admin" element={
            <Suspense fallback={<div className="loading">Loading Admin...</div>}>
              <Admin showNotification={showNotification} />
            </Suspense>
          } />
        </Routes>
      </main>

      {/* Modals */}
      {loginModalOpen && (
        <div id="loginModal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeLoginForm}>&times;</span>
            <h2>Login</h2>
            <form id="loginForm" onSubmit={handleLoginSubmit}>
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit">Login</button>
            </form>
            <div className="social-login">
              <p>Or login with:</p>
              <button 
                type="button" 
                className="google-btn" 
                onClick={handleGoogleLogin}
              >
                <span className="google-icon">G</span>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}

      {registerModalOpen && (
        <div id="registerModal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeRegisterForm}>&times;</span>
            <h2>Register</h2>
            <form id="registerForm" onSubmit={handleRegisterSubmit}>
              <input type="text" name="fullName" placeholder="Full Name" required />
              <input type="email" name="email" placeholder="Email" required />
              <input type="password" name="password" placeholder="Password" required />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
              <button type="submit">Register</button>
            </form>
            <div className="social-login">
              <p>Or register with:</p>
              <button 
                type="button" 
                className="google-btn" 
                onClick={handleGoogleRegister}
              >
                <span className="google-icon">G</span>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer: Only Social Media Handles */}
      <footer className="footer">
        <div className="footer-content social-only">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook" title="Follow us on Facebook">
              <i className="fab fa-facebook-f"></i>
              <span>Facebook</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter" title="Follow us on Twitter">
              <i className="fab fa-twitter"></i>
              <span>Twitter</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Follow us on Instagram">
              <i className="fab fa-instagram"></i>
              <span>Instagram</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="Connect on LinkedIn">
              <i className="fab fa-linkedin-in"></i>
              <span>LinkedIn</span>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link youtube" title="Watch on YouTube">
              <i className="fab fa-youtube"></i>
              <span>YouTube</span>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-link tiktok" title="Follow us on TikTok">
              <i className="fab fa-tiktok"></i>
              <span>TikTok</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
