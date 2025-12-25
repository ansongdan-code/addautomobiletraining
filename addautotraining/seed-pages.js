const axios = require('axios');

const API_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'superadmin@test.com';
const ADMIN_PASSWORD = 'superadmin123';

const pages = [
  {
    title: 'Home',
    slug: 'home',
    content: `<div style="padding: 40px 20px; text-align: center;">
      <h1 style="font-size: 48px; margin-bottom: 20px; color: #333;">Welcome to Auto Training Academy</h1>
      <p style="font-size: 18px; color: #666; margin-bottom: 30px;">Learn automotive skills from industry experts</p>
      <button style="background: #667eea; color: white; padding: 12px 30px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">Get Started</button>
    </div>`,
    description: 'Home page of the academy',
    isPublished: true,
    seoTitle: 'Auto Training Academy - Learn Automotive Skills',
    seoDescription: 'Professional automotive training and certification programs',
    seoKeywords: ['automotive', 'training', 'academy', 'courses']
  },
  {
    title: 'Blog',
    slug: 'blog',
    content: `<div style="padding: 40px 20px; max-width: 1200px; margin: 0 auto;">
      <h1 style="font-size: 36px; margin-bottom: 30px; color: #333;">Latest Articles</h1>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <article style="border: 1px solid #eee; border-radius: 8px; padding: 20px;">
          <h2 style="color: #667eea; margin-bottom: 10px;">Car Maintenance Tips</h2>
          <p style="color: #666;">Learn the essential maintenance tips to keep your vehicle running smoothly.</p>
        </article>
        <article style="border: 1px solid #eee; border-radius: 8px; padding: 20px;">
          <h2 style="color: #667eea; margin-bottom: 10px;">Engine Diagnostics</h2>
          <p style="color: #666;">Understanding engine diagnostics can save you time and money on repairs.</p>
        </article>
      </div>
    </div>`,
    description: 'Blog posts and articles',
    isPublished: true,
    seoTitle: 'Blog - Auto Training Academy',
    seoDescription: 'Read the latest automotive articles and tips',
    seoKeywords: ['blog', 'articles', 'automotive', 'tips']
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    content: `<div style="padding: 40px 20px; max-width: 600px; margin: 0 auto;">
      <h1 style="font-size: 36px; margin-bottom: 30px; color: #333;">Contact Us</h1>
      <form style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Name</label>
          <input type="text" placeholder="Your name" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"/>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Email</label>
          <input type="email" placeholder="your@email.com" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"/>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Message</label>
          <textarea placeholder="Your message" rows="5" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"></textarea>
        </div>
        <button type="submit" style="background: #667eea; color: white; padding: 12px 30px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; align-self: flex-start;">Send Message</button>
      </form>
    </div>`,
    description: 'Contact information and form',
    isPublished: true,
    seoTitle: 'Contact - Auto Training Academy',
    seoDescription: 'Get in touch with Auto Training Academy',
    seoKeywords: ['contact', 'support', 'email', 'message']
  }
];

async function seedPages() {
  try {
    console.log('🔐 Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const token = loginRes.data.token;
    console.log('✅ Login successful');

    const headers = { Authorization: `Bearer ${token}` };

    for (const page of pages) {
      try {
        const res = await axios.post(`${API_URL}/api/website/editor/pages`, page, { headers });
        console.log(`✅ Created page: ${page.title}`);
      } catch (err) {
        if (err.response?.status === 409) {
          console.log(`⚠️ Page already exists: ${page.title}`);
        } else {
          console.error(`❌ Error creating ${page.title}:`, err.response?.data?.error || err.message);
        }
      }
    }

    console.log('\n✨ Pages seeding complete!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

seedPages();
