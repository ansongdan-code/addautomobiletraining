import React, { useState, useEffect, useCallback } from 'react';
import './Blog.css';
import { showNotification } from './App';

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
      excerpt: 'Dive deep into the latest engine technologies and how they\'re revolutionizing the automotive industry.',
      category: 'technology',
      author: 'Sarah Johnson',
      date: '2024-01-12',
      image: 'https://source.unsplash.com/800x600/?car-engine'
    },
    {
      id: 3,
      title: 'Safety First: Essential Workshop Practices',
      excerpt: 'Prioritize safety in your automotive workshop with these crucial practices and guidelines.',
      category: 'safety',
      author: 'David Lee',
      date: '2024-01-10',
      image: 'https://source.unsplash.com/800x600/?car-safety'
    },
    {
      id: 4,
      title: 'Top 10 Car Maintenance Mistakes to Avoid',
      excerpt: 'Avoid common pitfalls in car maintenance with this comprehensive guide to keeping your vehicle in top condition.',
      category: 'maintenance',
      author: 'Emily White',
      date: '2024-01-08',
      image: 'https://source.unsplash.com/800x600/?car-repair'
    },
    {
      id: 5,
      title: 'The Future of Automotive Training: Embracing Virtual Reality',
      excerpt: 'Discover how virtual reality technology is revolutionizing automotive training programs, providing immersive learning experiences.',
      category: 'technology',
      author: 'Michael Brown',
      date: '2024-01-05',
      image: 'https://source.unsplash.com/1200x600/?automotive-workshop'
    },
    {
      id: 6,
      title: 'Tips for Extending Your Car\'s Lifespan',
      excerpt: 'Simple yet effective tips to help you maximize the longevity and performance of your vehicle.',
      category: 'tips',
      author: 'Jessica Green',
      date: '2024-01-03',
      image: 'https://source.unsplash.com/800x600/?car-tips'
    },
  ];

function Blog() {
  const postsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  const filterAndDisplayPosts = useCallback(() => {
    let tempPosts = mockPosts;

    if (currentCategory !== 'all') {
      tempPosts = tempPosts.filter(post => post.category === currentCategory);
    }

    if (searchQuery) {
      tempPosts = tempPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredPosts(tempPosts);
  }, [currentCategory, searchQuery]);

  useEffect(() => {
    filterAndDisplayPosts();
  }, [currentPage, currentCategory, searchQuery, filterAndDisplayPosts]); // Re-run when these states change

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const input = e.target.querySelector('input');
    setSearchQuery(input.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredPosts.length / postsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    if (validateEmail(email)) {
      showNotification('Successfully subscribed to newsletter!', 'success');
      e.target.reset();
    } else {
      showNotification('Please enter a valid email address.', 'error');
    }
  };

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const generatePageNumbers = () => {
    let numbers = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        numbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) numbers.push(i);
        numbers.push('...');
        numbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        numbers.push(1);
        numbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) numbers.push(i);
      } else {
        numbers.push(1);
        numbers.push('...');
        numbers.push(currentPage - 1);
        numbers.push(currentPage);
        numbers.push(currentPage + 1);
        numbers.push('...');
        numbers.push(totalPages);
      }
    }

    return numbers.map((num, index) => (
      num === '...' ?
        <span key={index} className="dots">...</span> :
        <span
          key={index}
          className={num === currentPage ? 'active' : ''}
          onClick={() => handlePageChange(num)}
        >
          {num}
        </span>
    ));
  };

  return (
    <div className="blog-container">
      <header className="blog-header">
        <h1>Automotive Training Insights</h1>
        <p>Stay updated with the latest trends, tips, and techniques in automotive training</p>

        <form className="blog-search" onSubmit={handleSearchSubmit}>
          <input type="text" placeholder="Search articles..." required />
          <button type="submit">Search</button>
        </form>

        <div className="blog-categories">
          <button className={`category-btn ${currentCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryClick('all')}>All</button>
          <button className={`category-btn ${currentCategory === 'maintenance' ? 'active' : ''}`} onClick={() => handleCategoryClick('maintenance')}>Maintenance</button>
          <button className={`category-btn ${currentCategory === 'technology' ? 'active' : ''}`} onClick={() => handleCategoryClick('technology')}>Technology</button>
          <button className={`category-btn ${currentCategory === 'safety' ? 'active' : ''}`} onClick={() => handleCategoryClick('safety')}>Safety</button>
          <button className={`category-btn ${currentCategory === 'tips' ? 'active' : ''}`} onClick={() => handleCategoryClick('tips')}>Tips & Tricks</button>
        </div>
      </header>

      <main className="blog-content">
        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <section className="featured-post">
            <article className="post-card">
              <img src={filteredPosts[0].image} alt="Featured Post" />
              <div className="post-content">
                <span className="category">Featured</span>
                <div className="post-meta">
                  <span>By {filteredPosts[0].author}</span>
                  <span>{formatDate(filteredPosts[0].date)}</span>
                </div>
                <h2>{filteredPosts[0].title}</h2>
                <p>{filteredPosts[0].excerpt}</p>
                <button className="read-more" onClick={() => showNotification('Blog post detail view coming soon!', 'info')}>Read More →</button>
              </div>
            </article>
          </section>
        )}

        {/* Recent Posts Grid */}
        <section className="posts-grid">
          {paginatedPosts.map(post => (
            <article className="post-card" key={post.id}>
              <img src={post.image} alt={post.title} />
              <div className="post-content">
                <span className="category">{post.category}</span>
                <div className="post-meta">
                  <span>By {post.author}</span>
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button className="read-more" onClick={() => showNotification('Blog post detail view coming soon!', 'info')}>Read More →</button>
              </div>
            </article>
          ))}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="prev-page" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
            <div className="page-numbers">
              {generatePageNumbers()}
            </div>
            <button className="next-page" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </main>

      <aside className="blog-sidebar">
        <section className="sidebar-section about-blog">
          <h3>About Our Blog</h3>
          <p>Welcome to the Automobile Training Academy blog, your trusted source for automotive knowledge, industry insights, and expert tips. Our articles are crafted by experienced professionals to help you stay ahead in the automotive world.</p>
        </section>

        <section className="sidebar-section popular-posts">
          <h3>Popular Posts</h3>
          <ul>
            <li>
              <button className="popular-post-link" onClick={() => showNotification('Blog post detail view coming soon!', 'info')}>
                <img src="https://source.unsplash.com/100x100/?car-engine" alt="Popular Post 1" />
                <div>
                  <h4>Essential Diagnostic Tools Every Mechanic Needs</h4>
                  <span>December 28, 2023</span>
                </div>
              </button>
            </li>
            <li>
              <button className="popular-post-link" onClick={() => showNotification('Blog post detail view coming soon!', 'info')}>
                <img src="https://source.unsplash.com/100x100/?car-repair" alt="Popular Post 2" />
                <div>
                  <h4>Top 10 Car Maintenance Mistakes to Avoid</h4>
                  <span>December 20, 2023</span>
                </div>
              </button>
            </li>
            <li>
              <button className="popular-post-link" onClick={() => showNotification('Blog post detail view coming soon!', 'info')}>
                <img src="https://source.unsplash.com/100x100/?car-safety" alt="Popular Post 3" />
                <div>
                  <h4>Safety First: Essential Workshop Practices</h4>
                  <span>December 15, 2023</span>
                </div>
              </button>
            </li>
          </ul>
        </section>

        <section className="sidebar-section categories">
          <h3>Categories</h3>
          <ul>
            <li><button className="category-link" onClick={() => handleCategoryClick('maintenance')}>Maintenance <span>(12)</span></button></li>
            <li><button className="category-link" onClick={() => handleCategoryClick('technology')}>Technology <span>(8)</span></button></li>
            <li><button className="category-link" onClick={() => handleCategoryClick('safety')}>Safety <span>(6)</span></button></li>
            <li><button className="category-link" onClick={() => handleCategoryClick('tips')}>Tips & Tricks <span>(15)</span></button></li>
            <li><button className="category-link" onClick={() => showNotification('Industry News category coming soon!', 'info')}>Industry News <span>(4)</span></button></li>
          </ul>
        </section>

        <section className="sidebar-section newsletter">
          <h3>Newsletter</h3>
          <p>Subscribe to our newsletter and stay updated with the latest automotive insights.</p>
          <form onSubmit={handleNewsletterSubmit}>
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </section>

        <section className="sidebar-section">
          <h3>Popular Tags</h3>
          <div className="tag-cloud">
            <button className="tag" onClick={() => handleCategoryClick('maintenance')}>Maintenance</button>
            <button className="tag" onClick={() => handleCategoryClick('technology')}>Engine</button>
            <button className="tag" onClick={() => handleCategoryClick('safety')}>Safety</button>
            <button className="tag" onClick={() => showNotification('Tag filtering coming soon!', 'info')}>Diagnostics</button>
            <button className="tag" onClick={() => showNotification('Tag filtering coming soon!', 'info')}>Electric</button>
            <button className="tag" onClick={() => showNotification('Tag filtering coming soon!', 'info')}>Tools</button>
            <button className="tag" onClick={() => showNotification('Tag filtering coming soon!', 'info')}>Training</button>
            <button className="tag" onClick={() => handleCategoryClick('tips')}>Tips</button>
          </div>
        </section>
      </aside>
    </div>
  );
}

export default Blog;