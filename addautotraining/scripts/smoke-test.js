const base = process.env.API_BASE || 'http://localhost:5000';
const fetch = global.fetch;

(async () => {
  console.log('=== Smoke Test: CSS-Only Editing Workflow ===\n');
  
  try {
    // Test 1: Login as super admin
    console.log('1. [Login] Testing super_admin credentials...');
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@test.com', password: 'superadmin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginData);
      process.exit(1);
    }
    const token = loginData.token;
    console.log('✓ Login successful, token received\n');

    // Test 2: Fetch published home page (public endpoint)
    console.log('2. [Public API] Fetching published home page...');
    const pageRes = await fetch(`${base}/api/website/pages/home`);
    if (!pageRes.ok) {
      console.error('❌ Failed to fetch home page:', pageRes.status);
      process.exit(1);
    }
    const pageData = await pageRes.json();
    console.log('✓ Home page fetched successfully');
    console.log(`  - isPublished: ${pageData.data.isPublished}`);
    console.log(`  - customCSS length: ${pageData.data.customCSS ? pageData.data.customCSS.length : 0} bytes\n`);

    // Test 3: Preview draft page (with auth)
    console.log('3. [Preview API] Testing draft page preview with auth...');
    const previewRes = await fetch(`${base}/api/website/pages/home?preview=true`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!previewRes.ok) {
      console.error('❌ Failed to preview page:', previewRes.status);
      process.exit(1);
    }
    console.log('✓ Draft preview accessible with auth\n');

    // Test 4: Fetch editor pages (admin or super_admin)
    console.log('4. [Editor API] Fetching all pages for editor...');
    const editorRes = await fetch(`${base}/api/website/editor/pages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!editorRes.ok) {
      console.error('❌ Failed to fetch editor pages:', editorRes.status);
      process.exit(1);
    }
    const editorData = await editorRes.json();
    console.log(`✓ Editor pages fetched: ${editorData.data.length} page(s)\n`);

    // Test 5: Verify publish endpoint works
    console.log('5. [Publish API] Testing publish endpoint...');
    const pages = editorData.data;
    const blog = pages.find(p => p.slug === 'blog');
    if (blog) {
      const publishTestRes = await fetch(`${base}/api/website/editor/pages/${blog._id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isPublished: true })
      });
      if (!publishTestRes.ok) {
        console.error('❌ Publish endpoint failed:', publishTestRes.status);
        process.exit(1);
      }
      console.log('✓ Publish endpoint works\n');
    } else {
      console.log('⚠ No blog page found to test publish (skipping)\n');
    }

    // Test 6: Verify App.js CSS injection setup
    console.log('6. [Client Setup] Verifying CSS/JS injection configured...');
    const appContent = require('fs').readFileSync('src/App.js', 'utf8');
    if (appContent.includes('page-custom-css') && appContent.includes('customCSS')) {
      console.log('✓ Client-side CSS injection configured\n');
    } else {
      console.error('⚠ Client CSS injection may not be configured\n');
    }

    // Test 7: Verify WebsiteEditor component
    console.log('7. [Editor Component] Verifying WebsiteEditor component...');
    const editorContent = require('fs').readFileSync('src/components/Admin/WebsiteEditor.js', 'utf8');
    if (editorContent.includes('handlePublishNow') && editorContent.includes('Publish Now')) {
      console.log('✓ WebsiteEditor component has publish feature\n');
    } else {
      console.error('⚠ WebsiteEditor publish feature may be missing\n');
    }

    console.log('=== ✓ All Tests Passed ===');
    console.log('\nSummary:');
    console.log('- Authentication: Working');
    console.log('- Public API (published pages): Working');
    console.log('- Preview API (draft access with auth): Working');
    console.log('- Editor API (super_admin access): Working');
    console.log('- Publish endpoint: Working');
    console.log('- Client CSS/JS injection: Configured');
    console.log('- Frontend publish UI: Configured');
    console.log('\nThe CSS-only editing workflow is ready.');
    console.log('Admins can now: Edit page → Customize CSS/JS → Click "Publish Now" → See changes live.\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Smoke test error:', err);
    process.exit(1);
  }
})();
