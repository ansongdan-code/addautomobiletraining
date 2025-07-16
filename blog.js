document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    let currentPage = 1;
    const postsPerPage = 6;
    let currentCategory = 'all';
    let posts = [];

    // Mock posts data
    const mockPosts = [
        {
            id: 1,
            title: 'Essential Car Maintenance Tips for Beginners',
            excerpt: 'Learn the basics of car maintenance with these beginner-friendly tips that will help keep your vehicle running smoothly.',
            category: 'maintenance',
            author: 'John Smith',
            date: '2024-01-15',
            image: 'https://source.unsplash.com/800x600/?car-maintenance'
        },
        {
            id: 2,
            title: 'Understanding Modern Engine Technology',
            excerpt: 'Dive deep into the latest engine technologies and how they're revolutionizing the automotive industry.',
            category: 'technology',
            author: 'Sarah Johnson',
            date: '2024-01-12',
            image: 'https://source.unsplash.com/800x600/?car-engine'
        },
        // Add more mock posts as needed
    ];

    // Initialize blog
    function initBlog() {
        posts = mockPosts;
        displayPosts();
        setupEventListeners();
        updatePagination();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Search functionality
        const searchForm = document.querySelector('.blog-search');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchQuery = searchForm.querySelector('input').value.toLowerCase();
                filterPosts(searchQuery);
            });
        }

        // Category filtering
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentCategory = button.dataset.category;
                currentPage = 1;
                filterPosts();
            });
        });

        // Newsletter subscription
        const newsletterForm = document.querySelector('.newsletter form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input').value;
                if (validateEmail(email)) {
                    showNotification('Successfully subscribed to newsletter!', 'success');
                    newsletterForm.reset();
                } else {
                    showNotification('Please enter a valid email address.', 'error');
                }
            });
        }

        // Pagination
        setupPagination();
    }

    // Display posts
    function displayPosts() {
        const postsGrid = document.querySelector('.posts-grid');
        if (!postsGrid) return;

        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = posts.slice(startIndex, endIndex);

        postsGrid.innerHTML = paginatedPosts.map(post => `
            <article class="post-card">
                <img src="${post.image}" alt="${post.title}">
                <div class="post-content">
                    <span class="category">${post.category}</span>
                    <div class="post-meta">
                        <span>${post.author}</span>
                        <span>${formatDate(post.date)}</span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <a href="#" class="read-more">Read More →</a>
                </div>
            </article>
        `).join('');

        updatePagination();
    }

    // Filter posts
    function filterPosts(searchQuery = '') {
        let filtered = mockPosts;

        if (currentCategory !== 'all') {
            filtered = filtered.filter(post => post.category === currentCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchQuery) ||
                post.excerpt.toLowerCase().includes(searchQuery)
            );
        }

        posts = filtered;
        currentPage = 1;
        displayPosts();
        updatePagination();

        if (filtered.length === 0) {
            showNotification('No posts found matching your criteria.', 'info');
        }
    }

    // Pagination setup
    function setupPagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        const prevButton = pagination.querySelector('.prev-page');
        const nextButton = pagination.querySelector('.next-page');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayPosts();
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentPage < Math.ceil(posts.length / postsPerPage)) {
                    currentPage++;
                    displayPosts();
                }
            });
        }
    }

    // Update pagination
    function updatePagination() {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(posts.length / postsPerPage);
        const prevButton = pagination.querySelector('.prev-page');
        const nextButton = pagination.querySelector('.next-page');
        const pageNumbers = pagination.querySelector('.page-numbers');

        if (prevButton) {
            prevButton.disabled = currentPage === 1;
        }

        if (nextButton) {
            nextButton.disabled = currentPage === totalPages;
        }

        if (pageNumbers) {
            pageNumbers.innerHTML = generatePageNumbers(currentPage, totalPages);
            
            // Add click events to page numbers
            pageNumbers.querySelectorAll('span').forEach(span => {
                span.addEventListener('click', () => {
                    if (!span.classList.contains('active')) {
                        currentPage = parseInt(span.textContent);
                        displayPosts();
                    }
                });
            });
        }
    }

    // Generate page numbers
    function generatePageNumbers(current, total) {
        let numbers = [];
        const maxVisible = 5;

        if (total <= maxVisible) {
            for (let i = 1; i <= total; i++) {
                numbers.push(i);
            }
        } else {
            if (current <= 3) {
                for (let i = 1; i <= 4; i++) numbers.push(i);
                numbers.push('...');
                numbers.push(total);
            } else if (current >= total - 2) {
                numbers.push(1);
                numbers.push('...');
                for (let i = total - 3; i <= total; i++) numbers.push(i);
            } else {
                numbers.push(1);
                numbers.push('...');
                numbers.push(current - 1);
                numbers.push(current);
                numbers.push(current + 1);
                numbers.push('...');
                numbers.push(total);
            }
        }

        return numbers.map(num => 
            num === '...' ? 
                `<span class="dots">...</span>` :
                `<span class="${num === current ? 'active' : ''}">${num}</span>`
        ).join('');
    }

    // Utility functions
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Add styles dynamically
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '1rem 2rem';
        notification.style.borderRadius = '5px';
        notification.style.backgroundColor = type === 'success' ? '#4CAF50' :
                                           type === 'error' ? '#f44336' :
                                           '#2196F3';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.3s ease';

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialize the blog
    initBlog();
}));