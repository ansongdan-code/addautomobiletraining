const slug = process.argv[2] || 'home';
const base = process.env.API_BASE || 'http://localhost:5000';

(async () => {
  try {
    const res = await fetch(`${base}/api/website/pages/${slug}`);
    const text = await res.text();
    console.log('HTTP', res.status);
    try {
      const data = JSON.parse(text);
      console.log('Response JSON:');
      console.log('isPublished:', data.data && data.data.isPublished);
      console.log('customCSS length:', data.data && data.data.customCSS ? data.data.customCSS.length : 0);
      console.log('customJavaScript length:', data.data && data.data.customJavaScript ? data.data.customJavaScript.length : 0);
      console.log('--- customCSS ---');
      console.log((data.data && data.data.customCSS) || '(empty)');
      console.log('--- customJavaScript ---');
      console.log((data.data && data.data.customJavaScript) || '(empty)');
    } catch (err) {
      console.log('Non-JSON response:');
      console.log(text);
    }
  } catch (err) {
    console.error('Fetch failed', err);
    process.exit(1);
  }
})();
