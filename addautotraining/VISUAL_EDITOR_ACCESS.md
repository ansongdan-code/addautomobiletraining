# 🎨 How to Access the Visual Editor

## Location in Admin Dashboard

The **Visual Editor** tab is located in the Admin Dashboard navigation bar.

### Navigation Path:
1. **Login** to the application as `admin` or `super_admin`
2. Click on **"Admin"** in the top navigation (or go to `/admin`)
3. In the Admin Dashboard, look for the navigation tabs at the top
4. Find the **"Visual Editor"** tab with a 🎨 (palette) icon

### Tab Order:
The navigation tabs appear in this order:
- Dashboard
- Settings
- Blog
- Users
- Courses
- Videos
- Analytics
- **Visual Editor** ← HERE (with palette icon 🎨)
- Website Editor

## Visual Identification

- **Icon**: 🎨 (palette/fas fa-palette)
- **Text**: "Visual Editor"
- **Location**: Between "Analytics" and "Website Editor" tabs

## If You Can't See It

### Check 1: Scroll Horizontally
The navigation bar has horizontal scrolling. If you have many tabs, try scrolling left/right in the navigation area.

### Check 2: User Role
Make sure you're logged in as:
- `admin` role, OR
- `super_admin` role

Student and instructor roles cannot see the Visual Editor.

### Check 3: Browser Cache
If you still can't see it:
1. Hard refresh the page: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Try a different browser

### Check 4: Direct URL
You can also try navigating directly to:
```
http://localhost:3000/admin#theme
```
Or manually set the active tab using browser console:
```javascript
// In browser console (F12)
localStorage.setItem('user', JSON.stringify({role: 'admin'}));
// Then refresh the page
```

## What the Visual Editor Does

The Visual Editor allows you to:
- ✅ Create and manage custom pages
- ✅ Add visual components (headers, sections, CTAs, etc.)
- ✅ Customize page layouts and styles
- ✅ Manage global app styles (colors, fonts, etc.)
- ✅ Preview pages before publishing

## Quick Test

After accessing the Visual Editor, you should see:
1. Header with "🎨 Visual App Editor" title
2. Mode buttons: Pages, Styles, Components, Settings
3. Page management interface

If you see this, the Visual Editor is working correctly!

## Troubleshooting

If the tab is still not visible after trying the above:

1. **Check Docker containers are running**:
   ```bash
   docker-compose ps
   ```

2. **Check browser console for errors**:
   - Press F12 to open DevTools
   - Look for any red error messages

3. **Verify the component is loaded**:
   - Check Network tab in DevTools
   - Look for VisualAppEditor component loading

4. **Contact Support**: If none of the above works, there may be a build issue.
