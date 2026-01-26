# Troubleshooting: Visual Editor Not Showing

## Quick Fix: Direct Access

If the Visual Editor tab is not visible in the navigation, you can access it directly:

### Method 1: Browser Console (Quickest)
1. Open your browser's Developer Tools (Press F12)
2. Go to the Console tab
3. Type this command and press Enter:
```javascript
window.location.hash = '#theme';
window.location.reload();
```

### Method 2: URL Hash
Navigate directly to:
```
http://localhost:3000/admin#theme
```

### Method 3: Browser Console - Set Tab Directly
```javascript
// Open browser console (F12) and run:
const event = new Event('hashchange');
window.location.hash = 'theme';
window.dispatchEvent(event);

// Or manually trigger the tab change:
document.querySelectorAll('.nav-link').forEach(btn => {
  if (btn.textContent.includes('Visual Editor')) {
    btn.click();
  }
});
```

## Why Navigation Tabs Might Not Be Visible

The navigation tabs should appear between the "Admin Dashboard" header and the main content area. If they're missing:

1. **CSS Conflict**: Another stylesheet might be hiding them
2. **Browser Cache**: Old JavaScript/CSS might be cached
3. **Build Issue**: Frontend container needs to be rebuilt

## Verification Steps

1. **Check if navigation exists in HTML**:
   - Right-click on the page → Inspect Element
   - Look for `<nav class="admin-nav">` in the HTML
   - If it exists but is hidden, check computed styles

2. **Force navigation visibility**:
   ```javascript
   // In browser console:
   document.querySelector('.admin-nav').style.display = 'block';
   document.querySelector('.admin-nav').style.visibility = 'visible';
   document.querySelector('.admin-nav').style.opacity = '1';
   ```

3. **Check for CSS hiding it**:
   ```javascript
   // In browser console:
   const nav = document.querySelector('.admin-nav');
   console.log(window.getComputedStyle(nav).display);
   console.log(window.getComputedStyle(nav).visibility);
   console.log(window.getComputedStyle(nav).opacity);
   ```

## Permanent Fix

The navigation should be visible. If it's still not showing after rebuilding:

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Clear browser cache completely
3. **Check Docker**: Ensure frontend container is running the latest build:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

## Alternative: Add Visual Editor Button

If navigation still doesn't work, we can add a direct button to access Visual Editor. The debug tooltip shows you're logged in as `super_admin`, so you should have access.
