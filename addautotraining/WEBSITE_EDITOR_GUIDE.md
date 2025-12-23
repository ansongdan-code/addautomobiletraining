# Website Editor - Usage Guide & Troubleshooting

## How to Access the Website Editor

1. **Login to Admin Dashboard**
   - Go to: `http://localhost:3000`
   - Login with super admin credentials:
     - Email: `superadmin@test.com`
     - Password: `superadmin123`

2. **Navigate to Website Editor**
   - Click on the **"Website Editor"** menu item in the left sidebar
   - It should appear after the Dashboard and Settings links

## Using the Editor

### Create a New Page
1. Click the **"+ New Page"** button in the Pages sidebar (top right)
2. A blank form will appear with these fields:
   - **Page Title** (required) - The page name
   - **Page Slug** (required) - URL-friendly name (e.g., "about-us")
   - **Description** - Brief page description
   - **Content** (required) - The main page content (HTML supported)
   - **SEO Title** - For search engines
   - **SEO Description** - Meta description
   - **SEO Keywords** - Comma-separated keywords
   - **Custom CSS** - Page-specific styles
   - **Custom JavaScript** - Page-specific scripts
   - **Publish** - Checkbox to make page public

3. Fill in the form and click **"Save Page"**

### Edit an Existing Page
1. Find the page in the **Pages** list on the left sidebar
2. Click on it to select it
3. The form will populate with the page's content
4. Make your changes
5. Click **"Save Page"** to update

### Publish/Unpublish Pages
- Check the **"Publish this page"** checkbox to make it public
- Uncheck it to save as draft
- The page will immediately update status

### Delete a Page
1. Select the page from the list
2. Click the **"Delete Page"** button (red button at bottom)
3. Confirm the deletion when prompted

## Troubleshooting

### "Can't edit in the super admin page"

**Problem 1: Form not appearing**
- Make sure you're logged in as super admin (superadmin@test.com)
- Check browser console for JavaScript errors (F12 → Console tab)
- Try refreshing the page

**Problem 2: Changes not saving**
- Check if the "Save Page" button is enabled (not greyed out)
- All required fields must be filled: Title, Slug, and Content
- Check browser console for error messages
- Verify you have a valid token (check localStorage → token)

**Problem 3: Can't see pages in the sidebar**
- Wait for the page to load (spinner appears during loading)
- Check network tab in browser developer tools
- If you get a 401 error, you need to log in again

**Problem 4: Form fields not updating**
- Clear your browser cache and refresh
- Try using a different browser
- Check if JavaScript is enabled in your browser

## API Endpoints (for developers)

### Public Endpoints
```
GET /api/website/pages
   - List all published pages

GET /api/website/pages/:slug
   - Get a specific page by slug
```

### Super Admin Editor Endpoints (JWT required)
```
GET /api/website/editor/pages
   - List all pages (draft + published)

POST /api/website/editor/pages
   - Create new page

PUT /api/website/editor/pages/:id
   - Update page

DELETE /api/website/editor/pages/:id
   - Delete page

PUT /api/website/editor/pages/:id/publish
   - Toggle publish status
```

## Tips for Content Editing

1. **HTML Support**: You can use HTML in the Content field:
   ```html
   <h1>Heading</h1>
   <p>This is a paragraph</p>
   <ul>
     <li>List item</li>
   </ul>
   ```

2. **Custom CSS**: Only applies to this specific page:
   ```css
   .highlight {
     background: yellow;
     padding: 10px;
   }
   ```

3. **SEO Best Practices**:
   - Keep SEO Title under 60 characters
   - Keep SEO Description under 160 characters
   - Use relevant keywords in the content

4. **Slug Rules**:
   - Must be unique
   - Use lowercase letters, numbers, and hyphens
   - No spaces or special characters
   - Examples: "home", "about-us", "contact-page"

## Common Issues

| Issue | Solution |
|-------|----------|
| "Access Denied" message | You must be logged in as super_admin role |
| Pages not loading | Check if backend service is running (docker ps) |
| Save button disabled | Fill in Title, Slug, and Content (all required) |
| Changes not appearing | Click Save button and wait for success message |
| 401 Unauthorized errors | Log out and log back in |
| Slug already exists error | Use a unique slug for each page |

## Browser Console Debugging

If you have issues, open the browser developer tools and check:

1. **Console Tab**: Look for JavaScript errors (red text)
2. **Network Tab**: Check API requests for 401/404/500 errors
3. **Application Tab**: Check that localStorage has a valid token

## Testing the API Directly

To test API endpoints from command line:

```bash
# Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.com","password":"superadmin123"}'

# List pages (use token from above)
curl -X GET http://localhost:5000/api/website/editor/pages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create page
curl -X POST http://localhost:5000/api/website/editor/pages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Page",
    "slug": "my-page",
    "content": "<h1>Welcome</h1>",
    "isPublished": true
  }'
```

## Still Having Issues?

1. Check the browser console for error messages
2. Look at the Docker logs: `docker logs addauto_backend`
3. Verify the backend is running: `docker ps`
4. Clear browser cache and try again
5. Make sure all form fields are filled correctly before saving
