# Visual App Editor - Complete Guide

## Overview

The **Visual App Editor** is a comprehensive admin tool for managing your automotive training platform. It allows admins and super_admins to create and edit pages, customize app styles, manage components, and export/import configurations—all through an intuitive visual interface.

## Features

### 📄 Page Management
- **Create Pages**: Build new pages with custom layouts (Standard, Landing, Blog, Gallery)
- **Edit Content**: Modify page titles, descriptions, and slugs
- **Publish/Unpublish**: Control which pages are live
- **Delete Pages**: Remove pages you no longer need
- **Preview**: See live previews of published pages

### 🎨 Style Customization
- **Color Theming**: Set primary, secondary, and accent colors for the entire app
- **Typography**: Customize font families and sizes
- **Spacing**: Adjust border radius globally
- **Real-time Preview**: See changes instantly in the preview panel

### 🧩 Component Management
- **Add Components**: Drag-and-drop various component types to pages
  - Section
  - Header
  - Hero
  - Call-to-Action
  - Feature
  - Testimonial
  - Footer
- **Customize Colors**: Set background and text colors per component
- **Alignment Options**: Left, center, or right align component content
- **Reorder Components**: Organize components on each page

### ⚙️ Configuration
- **Export**: Download your entire app configuration as JSON
- **Import**: Upload previously exported configurations
- **Reset**: Clear all pages and start fresh
- **Settings**: Quick access to common configurations

## Accessing the Editor

1. **Login as Admin**
   - Navigate to your app
   - Click "Login" in the top right
   - Use admin or super_admin credentials

2. **Navigate to Editor**
   - After login, click your name in the header
   - Select "Admin Dashboard" or go to `/admin`
   - Click "Theme & UI" tab in the navigation

## How to Use

### Creating a New Page

1. Click **Theme & UI** in the Admin navigation
2. In the "Create New Page" form, fill in:
   - **Page Name**: Display name (e.g., "About Us")
   - **Page Slug**: URL path (e.g., "about-us")
   - **Page Title**: SEO title
   - **Description**: Brief page description
   - **Layout**: Choose layout type
3. Click **✨ Create Page**
4. The page appears in the "All Pages" list

### Adding Components to a Page

1. Select a page from the "All Pages" list
2. In the "➕ Add Component" section:
   - Select component type
   - Enter component title
   - Add content
   - Choose background and text colors
   - Set text alignment
3. Click **➕ Add Component**
4. Component appears in the page's component list

### Customizing Global Styles

1. Click the **🎨 Styles** mode button at the top
2. Adjust the color pickers:
   - Primary Color (main theme color)
   - Secondary Color (complementary)
   - Accent Color (highlights)
3. Customize typography:
   - Font Family (Arial, Georgia, etc.)
   - Base Font Size
   - Border Radius
4. View changes in the "Preview" section
5. Click **💾 Save Styles** to apply globally

### Publishing Pages

1. Find the page in "All Pages"
2. Click the **✅** button to publish (or **⭕** to unpublish)
3. Published pages appear with a checkmark and can be previewed

### Previewing Pages

1. Click the **👁️** icon next to any page
2. A preview modal opens showing the rendered page
3. Close preview by clicking the **✕** button

### Exporting Configuration

1. Go to **⚙️ Settings** mode
2. Click **📥 Export Configuration**
3. Download the JSON file containing all pages and styles
4. Keep as a backup or share with team

### Importing Configuration

1. Go to **⚙️ Settings** mode
2. Click **📤 Import Configuration**
3. Select a previously exported JSON file
4. All pages and styles are restored

## Component Types Reference

| Type | Purpose | Best For |
|------|---------|----------|
| **Section** | Generic content container | Flexible layouts |
| **Header** | Navigation and top content | Page headers |
| **Hero** | Large banner with CTA | Landing pages |
| **CTA** | Call-to-action button | Conversions |
| **Feature** | Feature showcase | Benefits/features |
| **Testimonial** | Customer reviews | Social proof |
| **Footer** | Bottom content | Legal, links, info |

## Layout Types

- **Standard**: Basic single-column layout
- **Landing Page**: Optimized for conversions with hero + CTA sections
- **Blog**: Column-based layout for articles
- **Gallery**: Multi-column grid for showcasing images

## Color Customization Tips

1. **Primary Color**: Used for main buttons and highlights
   - Recommended: Bold, brand color
   - Example: `#667eea` (Purple-blue)

2. **Secondary Color**: Used for alternate elements
   - Recommended: Complementary to primary
   - Example: `#764ba2` (Darker purple)

3. **Accent Color**: Used for special highlights
   - Recommended: Contrasting, eye-catching
   - Example: `#f093fb` (Pink)

### Popular Color Schemes

**Modern Blue:**
- Primary: `#667eea`
- Secondary: `#764ba2`
- Accent: `#f093fb`

**Professional Green:**
- Primary: `#4CAF50`
- Secondary: `#2E7D32`
- Accent: `#66BB6A`

**Bold Orange:**
- Primary: `#FF9800`
- Secondary: `#F57C00`
- Accent: `#FFB74D`

## API Endpoints (For Developers)

The Visual App Editor uses these backend endpoints:

```
GET  /api/editor/app/pages           # Get all pages
POST /api/editor/app/pages           # Create new page
PUT  /api/editor/app/pages/:id       # Update page
DELETE /api/editor/app/pages/:id     # Delete page

GET  /api/editor/app/styles          # Get global styles
PUT  /api/editor/app/styles          # Update styles

POST /api/editor/app/pages/:pageId/components      # Add component
DELETE /api/editor/app/pages/:pageId/components/:componentId  # Remove component

GET  /api/editor/app/export          # Export configuration
POST /api/editor/app/import          # Import configuration

GET  /api/editor/page/:slug          # Preview page (HTML)
```

## Troubleshooting

### Pages Not Showing
- **Check authorization**: Ensure you're logged in as admin/super_admin
- **Reload**: Refresh the page (Ctrl+R or Cmd+R)
- **Check browser console**: Press F12 to see error messages

### Changes Not Saving
- **Check network**: Ensure internet connection is stable
- **Verify token**: Logout and login again
- **Check for errors**: Look for red error messages in the UI

### Preview Not Loading
- **Publish first**: Pages must be published to preview
- **Check slug**: Ensure the page slug is valid (lowercase, hyphens only)
- **Browser issues**: Try a different browser

### Styles Not Applied
- **Save required**: Don't forget to click "💾 Save Styles"
- **Clear cache**: Ctrl+Shift+Delete to clear browser cache
- **Reload**: Refresh all browser tabs showing the app

## Best Practices

1. **Use Descriptive Names**: Give pages meaningful names for easy identification
2. **Consistent Slugs**: Use lowercase with hyphens (e.g., `about-us`)
3. **Test Before Publishing**: Always preview pages before making them live
4. **Regular Backups**: Export configurations regularly
5. **Mobile Testing**: Preview on mobile devices too
6. **Limit Components**: Keep pages lean (5-10 components max)
7. **Consistent Colors**: Use your 3 theme colors consistently

## Security Notes

- **Admin Only**: Only users with admin/super_admin roles can access
- **Token Required**: All requests require valid JWT token
- **HTTPS**: Use HTTPS in production
- **Backups**: Regular configuration exports serve as backups
- **Color Validation**: Color inputs are validated for proper hex format

## Performance Tips

- **Component Limit**: Keep component count under 20 per page
- **Image Optimization**: Compress images before using URLs
- **CSS Size**: Large custom CSS can slow down pages
- **Caching**: Browsers cache styles, so clear cache when updating

## FAQ

**Q: Can I delete the home page?**
A: Yes, but ensure you have another page set as default before deleting.

**Q: Can I have more than 3 theme colors?**
A: The current system supports 3 primary colors. Additional colors require code changes.

**Q: Are my changes auto-saved?**
A: No, you must click "Save" buttons. Unsaved changes show a warning.

**Q: Can I revert to previous styles?**
A: Export your config before major changes, then import to restore.

**Q: How do I change the default page?**
A: The home page (/) can be configured in backend settings.

## Support

For issues or feature requests:
1. Check this guide first
2. Review error messages in browser console (F12)
3. Contact your system administrator
4. Submit a support ticket with screenshot

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Compatible With**: React 18+, Node 18+, Express 5+
