const base = process.env.API_BASE || 'http://localhost:5000';
const fetch = global.fetch;

(async () => {
  try {
    // login as super admin
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@test.com', password: 'superadmin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed', loginData);
      process.exit(1);
    }
    const token = loginData.token;
    console.log('Got token');

    // fetch editor pages
    const pagesRes = await fetch(`${base}/api/website/editor/pages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const pagesData = await pagesRes.json();
    if (!pagesRes.ok) {
      console.error('Failed fetching editor pages', pagesData);
      process.exit(1);
    }

    const pages = pagesData.data || [];
    const home = pages.find(p => p.slug === 'home');
    if (!home) {
      console.error('Home page not found among editor pages. Pages:', pages.map(p=>p.slug));
      process.exit(1);
    }

    console.log('Home page id:', home._id, 'isPublished:', home.isPublished);

    // publish
    const publishRes = await fetch(`${base}/api/website/editor/pages/${home._id}/publish`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isPublished: true })
    });
    const publishData = await publishRes.json();
    console.log('Publish response HTTP', publishRes.status, publishData);

    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
})();
