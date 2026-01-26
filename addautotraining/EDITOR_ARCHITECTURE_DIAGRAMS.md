# Visual App Editor - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (Browser)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Application (Port 3000)                           │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  App.js (Main)                                     │  │   │
│  │  │  ├── Routes & Navigation                           │  │   │
│  │  │  ├── Auth Management                               │  │   │
│  │  │  └── Layout                                        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ↓                                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Admin.js                                          │  │   │
│  │  │  └── Role Check                                   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                           ↓                                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  AdminDashboard.js                                 │  │   │
│  │  │  ├── Nav Tabs (Dashboard, Users, Courses, etc.)   │  │   │
│  │  │  ├── Statistics                                    │  │   │
│  │  │  └── Lazy Loaded Tabs:                             │  │   │
│  │  │      ├── UserManager                               │  │   │
│  │  │      ├── CourseManager                             │  │   │
│  │  │      ├── BlogManager                               │  │   │
│  │  │      ├── WebsiteEditor                             │  │   │
│  │  │      └── 🆕 VisualAppEditor ← HERE                 │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  State Management:                                                │
│  • localStorage: token, user object                             │
│  • React State: activeTab, editorMode, pages, styles            │
│  • Component Props: userRole, onMount                           │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │ (HTTP/HTTPS) │              │
                 │ (JWT Token)  │              │
                 ↓              ↓              ↓
        
        ┌────────────────────────────────────────┐
        │   SERVER SIDE (Node.js Express)        │
        │   (Port 5000)                          │
        │                                        │
        │  Middleware Stack:                     │
        │  ├── CORS                              │
        │  ├── Rate Limiting                     │
        │  ├── Body Parser                       │
        │  ├── Helmet (Security)                 │
        │  └── Morgan (Logging)                  │
        │           ↓                            │
        │  ┌─────────────────────────────────┐  │
        │  │  Routes                         │  │
        │  │  ├── auth.js (login/register)   │  │
        │  │  ├── courses.js                 │  │
        │  │  ├── admin.js                   │  │
        │  │  ├── payment.js                 │  │
        │  │  ├── blog.js                    │  │
        │  │  ├── website-editor.js          │  │
        │  │  └── 🆕 app-editor.js ← HERE    │  │
        │  └─────────────────────────────────┘  │
        │           ↓                            │
        │  ┌─────────────────────────────────┐  │
        │  │  Middleware                     │  │
        │  │  ├── auth.js (JWT verify)       │  │
        │  │  ├── authorize() (role check)   │  │
        │  │  └── upload.js (file handling)  │  │
        │  └─────────────────────────────────┘  │
        │           ↓                            │
        │  ┌─────────────────────────────────┐  │
        │  │  Controllers (Business Logic)   │  │
        │  │  ├── Validation                 │  │
        │  │  ├── Processing                 │  │
        │  │  └── Response Formatting        │  │
        │  └─────────────────────────────────┘  │
        │           ↓                            │
        │  ┌─────────────────────────────────┐  │
        │  │  Data Layer (In-Memory Storage) │  │
        │  │  ├── appPages = [...]           │  │
        │  │  └── globalStyles = {...}       │  │
        │  └─────────────────────────────────┘  │
        │                                        │
        └────────────────────────────────────────┘
```

## Data Flow Diagram

### Creating a Page

```
┌────────────────────────────┐
│  Admin fills form:         │
│  • Name: "About Us"        │
│  • Slug: "about-us"        │
│  • Title: "About Us"       │
│  • Layout: "standard"      │
└────────────────┬───────────┘
                 │ User clicks "✨ Create Page"
                 ↓
┌────────────────────────────────────────────┐
│  Frontend Validation                       │
│  ✓ Name required                           │
│  ✓ Slug required                           │
│  ✓ Slug format valid                       │
└────────────────┬───────────────────────────┘
                 │ POST /api/editor/app/pages
                 │ Content-Type: application/json
                 │ Authorization: Bearer {token}
                 ↓
┌────────────────────────────────────────────┐
│  Backend Route Handler                     │
│  1. Verify JWT token                       │
│  2. Check admin/super_admin role           │
│  3. Validate required fields               │
│  4. Check slug uniqueness                  │
│  5. Create page object:                    │
│     {                                      │
│       _id: "page_1704936000000",          │
│       name: "About Us",                    │
│       slug: "about-us",                    │
│       title: "About Us",                   │
│       layout: "standard",                  │
│       components: [],                      │
│       isPublished: false,                  │
│       createdAt: timestamp,                │
│       updatedAt: timestamp                 │
│     }                                      │
│  6. Push to appPages array                 │
│  7. Return 201 Created                     │
└────────────────┬───────────────────────────┘
                 │ Response: { success: true, data: {...} }
                 ↓
┌────────────────────────────────────────────┐
│  Frontend Success Handler                  │
│  1. Add page to pages state                │
│  2. Clear form                             │
│  3. Show success notification              │
│  4. Update UI - page appears in list       │
│  5. User can now:                          │
│     - Add components                       │
│     - Publish page                         │
│     - Preview page                         │
│     - Delete page                          │
└────────────────────────────────────────────┘
```

### Adding a Component

```
┌──────────────────────────┐
│  Page selected:          │
│  "About Us"              │
│  slug: "about-us"        │
└──────────────┬───────────┘
               │
┌──────────────▼──────────────────┐
│  Admin fills component form:    │
│  • Type: "hero"                 │
│  • Title: "Welcome"             │
│  • Content: "Join us today"     │
│  • BG Color: "#667eea"          │
│  • Text Color: "#ffffff"        │
└──────────────┬──────────────────┘
               │ User clicks "➕ Add Component"
               ↓
┌───────────────────────────────────┐
│  Frontend Action                  │
│  1. Create component object:      │
│     {                             │
│       id: "comp_1704936000123",  │
│       type: "hero",               │
│       title: "Welcome",           │
│       content: "Join us today",   │
│       backgroundColor: "#667eea", │
│       textColor: "#ffffff",       │
│       alignment: "center"         │
│     }                             │
│  2. Update page.components array  │
│  3. Component preview renders     │
│  4. Show in components list       │
│  5. "Save" button enabled         │
└───────────────────────────────────┘
               │ Automatic update to UI
               ↓
┌───────────────────────────────────┐
│  Frontend Updates                 │
│  • Component appears in list      │
│  • Shows color preview            │
│  • Shows component type badge     │
│  • Shows remove button            │
│  • Page still marked as unsaved   │
│     until explicitly published    │
└───────────────────────────────────┘
```

### Publishing a Page

```
┌──────────────────────────────┐
│  Page in Draft state:        │
│  "About Us" ⭕ (unpublished) │
└──────────────┬───────────────┘
               │ User clicks ✅ publish icon
               ↓
┌──────────────────────────────────────────┐
│  Frontend Sends Request                  │
│  PUT /api/editor/app/pages/{id}          │
│  Body: {...page, isPublished: true}      │
│  Authorization: Bearer {token}           │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│  Backend Validation                      │
│  1. Verify JWT token                     │
│  2. Check admin/super_admin role         │
│  3. Find page by _id                     │
│  4. Update isPublished field             │
│  5. Update updatedAt timestamp           │
│  6. Return updated page                  │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│  Frontend State Update                   │
│  1. Page status changes: ⭕ → ✅          │
│  2. Show success message                 │
│  3. Preview now available                │
│  4. Can now share URL                    │
└──────────────────────────────────────────┘
```

### Previewing a Page

```
┌────────────────────────┐
│  Published page:       │
│  "About Us" ✅         │
└────────────┬───────────┘
             │ User clicks 👁️ preview icon
             ↓
┌────────────────────────────────────┐
│  Frontend                          │
│  1. Open modal                     │
│  2. Create iframe                  │
│  3. Set iframe src to              │
│     /api/editor/page/about-us      │
│  4. Wait for page to load          │
└────────────┬───────────────────────┘
             │
             ↓
┌────────────────────────────────────────────┐
│  Backend Preview Endpoint                  │
│  GET /api/editor/page/:slug                │
│  1. Find page by slug                      │
│  2. Check if published                     │
│  3. Generate HTML:                         │
│     <html>                                 │
│       <head>CSS from globalStyles</head>   │
│       <body>                               │
│         <h1>{page.title}</h1>             │
│         {components map to divs}           │
│       </body>                              │
│     </html>                                │
│  4. Return HTML content                    │
└────────────┬───────────────────────────────┘
             │
             ↓
┌────────────────────────────────────┐
│  Frontend                          │
│  1. Iframe renders HTML            │
│  2. Styles applied                 │
│  3. Components display correctly   │
│  4. User can scroll and see full   │
│     page layout                    │
│  5. Can close modal with ✕ button  │
└────────────────────────────────────┘
```

## Component Hierarchy

```
VisualAppEditor (Main Component)
│
├── Header Section
│   ├── Title: "🎨 Visual App Editor"
│   └── Mode Buttons:
│       ├── 📄 Pages (editorMode === 'pages')
│       ├── 🎨 Styles (editorMode === 'styles')
│       ├── 🧩 Components (editorMode === 'components')
│       └── ⚙️ Settings (editorMode === 'settings')
│
├── Notification System
│   ├── Success notifications (top right)
│   └── Error notifications (top right)
│
├── Content Area (Conditional Rendering)
│   │
│   ├── PAGES MODE
│   │   ├── Left Panel: Pages Editor
│   │   │   ├── Create New Page Form
│   │   │   │   ├── Input: name
│   │   │   │   ├── Input: slug
│   │   │   │   ├── Input: title
│   │   │   │   ├── Textarea: description
│   │   │   │   ├── Select: layout
│   │   │   │   └── Button: Create Page
│   │   │   │
│   │   │   └── Pages List
│   │   │       └── For each page:
│   │   │           ├── Page Info (icon, name, slug)
│   │   │           └── Actions:
│   │   │               ├── 👁️ Preview
│   │   │               ├── ✅ Publish Toggle
│   │   │               └── 🗑️ Delete
│   │   │
│   │   └── Right Panel: Selected Page Editor
│   │       ├── Page Details (name, slug, layout, status)
│   │       │
│   │       ├── Add Component Form
│   │       │   ├── Select: type
│   │       │   ├── Input: title
│   │       │   ├── Textarea: content
│   │       │   ├── Color picker: background
│   │       │   ├── Color picker: text
│   │       │   ├── Select: alignment
│   │       │   └── Button: Add Component
│   │       │
│   │       └── Components List
│   │           └── For each component:
│   │               ├── Component Preview (styled div)
│   │               └── Button: Remove
│   │
│   ├── STYLES MODE
│   │   ├── Style Group: Primary Color
│   │   │   ├── Color Picker
│   │   │   └── Hex Value Display
│   │   │
│   │   ├── Style Group: Secondary Color
│   │   │   ├── Color Picker
│   │   │   └── Hex Value Display
│   │   │
│   │   ├── Style Group: Accent Color
│   │   │   ├── Color Picker
│   │   │   └── Hex Value Display
│   │   │
│   │   ├── Style Group: Font Family
│   │   │   └── Select: (Arial, Georgia, etc.)
│   │   │
│   │   ├── Style Group: Font Size
│   │   │   └── Input: 16px
│   │   │
│   │   ├── Style Group: Border Radius
│   │   │   └── Input: 8px
│   │   │
│   │   ├── Style Preview Section
│   │   │   ├── Primary Color Sample
│   │   │   ├── Secondary Color Sample
│   │   │   └── Accent Color Sample
│   │   │
│   │   └── Button: Save Styles
│   │
│   ├── COMPONENTS MODE
│   │   └── Component Library Grid
│   │       ├── Hero Section
│   │       ├── Features
│   │       ├── Testimonials
│   │       ├── CTA
│   │       ├── Pricing Table
│   │       └── FAQ Section
│   │
│   └── SETTINGS MODE
│       ├── Quick Actions
│       │   ├── Button: Reload Configuration
│       │   └── Button: Clear All Pages
│       │
│       ├── Export & Import
│       │   ├── Button: Export Configuration
│       │   └── Button: Import Configuration
│       │
│       └── About
│           └── Version and description
│
└── Preview Modal (Conditional)
    ├── Header: "Preview: {page.name}"
    ├── Close Button: ✕
    └── Iframe: src="/api/editor/page/{slug}"
```

## State Management

```
VisualAppEditor State:

{
  // Mode Selection
  editorMode: 'pages' | 'styles' | 'components' | 'settings'
  
  // Data from Server
  pages: [
    {
      _id: string,
      name: string,
      slug: string,
      title: string,
      description: string,
      layout: 'standard' | 'landing' | 'blog' | 'gallery',
      icon: string,
      isPublished: boolean,
      components: [...],
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ],
  globalStyles: {
    primaryColor: hex,
    secondaryColor: hex,
    accentColor: hex,
    fontFamily: string,
    fontSize: string,
    borderRadius: string
  },
  
  // UI State
  selectedPage: Page | null,
  loading: boolean,
  saving: boolean,
  error: string,
  success: string,
  preview: boolean,
  previewUrl: string,
  
  // Form Data
  pageForm: {
    name: string,
    slug: string,
    title: string,
    description: string,
    layout: string,
    icon: string,
    isPublished: boolean,
    components: []
  },
  componentForm: {
    id: string,
    type: string,
    title: string,
    content: string,
    backgroundColor: hex,
    textColor: hex,
    alignment: string
  },
  styleForm: {
    primaryColor: hex,
    secondaryColor: hex,
    accentColor: hex,
    fontFamily: string,
    fontSize: string,
    borderRadius: string
  }
}
```

## API Response Format

```
Success Response (201 Created):
{
  success: true,
  data: {
    _id: "page_1704936000000",
    name: "About Us",
    slug: "about-us",
    title: "About Us",
    description: "...",
    layout: "standard",
    icon: "📄",
    isPublished: false,
    components: [],
    createdAt: "2024-01-11T...",
    updatedAt: "2024-01-11T..."
  },
  message: "Page created successfully"
}

Error Response (400 Bad Request):
{
  success: false,
  error: "Page name and slug are required"
}

List Response (200 OK):
{
  success: true,
  data: [
    {...page1},
    {...page2},
    {...page3}
  ],
  total: 3
}
```

## Authentication Flow

```
1. User logs in (App.js)
   ↓
2. JWT token received → stored in localStorage
   ↓
3. Admin navigates to /admin
   ↓
4. Admin clicks "Theme & UI"
   ↓
5. VisualAppEditor component mounts
   ↓
6. Every API request includes:
   Headers: {
     'Authorization': `Bearer ${localStorage.getItem('token')}`
   }
   ↓
7. Backend middleware (auth.js):
   - Extracts token from header
   - Verifies JWT signature
   - Finds user in database
   - Attaches user to req.user
   ↓
8. Authorization middleware (authorize()):
   - Checks req.user.role
   - Validates admin/super_admin
   - Allows/denies access
   ↓
9. Request proceeds to handler or returns 403 Forbidden
```

---

**All diagrams show complete flow from user interaction through database storage and response.**
