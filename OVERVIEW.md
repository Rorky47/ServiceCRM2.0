# Service CRM - Project Overview

## 🎯 Project Summary

A multi-site website builder MVP that allows you to create and manage multiple service business websites from a single Next.js codebase. All content is JSON-driven and fully editable through an admin interface.

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Upload**: Cloudinary (with base64 fallback)
- **Drag & Drop**: @dnd-kit
- **Storage**: JSON files (can migrate to database)
- **Deployment**: Vercel-ready

### Project Structure
```
ServiceCRM/
├── app/                          # Next.js App Router
│   ├── site/[slug]/             # Multi-site pages
│   ├── admin/[slug]/leads/      # Leads inbox
│   └── api/                     # API routes
│       ├── pages/               # Save page data
│       ├── leads/               # Save/fetch leads
│       ├── cloudinary/          # Image uploads
│       └── init/                 # Initialize sample data
├── components/
│   ├── sections/                # Section components
│   │   ├── HeroSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── TextImageSection.tsx
│   │   └── ContactSection.tsx
│   ├── PageRenderer.tsx         # Main page renderer
│   └── SectionRenderer.tsx       # Section router
├── lib/
│   └── data.ts                  # Data access layer
├── types/
│   └── index.ts                 # TypeScript types
├── data/                        # JSON data storage
│   ├── sites/                   # Site configurations
│   ├── pages/                   # Page content
│   └── leads/                   # Contact form leads
└── scripts/
    └── init-data.ts             # Initialize sample data
```

---

## 📊 Data Models

### Site
```typescript
{
  id: string
  slug: string              // URL identifier (e.g., "plumber")
  name: string             // Display name
  theme: {
    primaryColor: string   // Theme color
    font: string          // Font family
  }
}
```

### Page
```typescript
{
  siteSlug: string         // Which site this belongs to
  slug: string            // Page identifier (e.g., "home")
  sections: Section[]     // Array of sections
}
```

### Section Types

#### 1. Hero Section
```typescript
{
  id: string
  type: "hero"
  content: {
    headline: string
    subheadline: string
    image: string                    // Background image
    backgroundColor?: string         // Optional solid color
    ctaButton?: {                    // Optional CTA
      text: string
      link: string
    }
  }
}
```

#### 2. Services Section
```typescript
{
  id: string
  type: "services"
  content: {
    title: string
    backgroundColor?: string          // Section background
    items: Array<{
      title: string
      description?: string
      image?: string                 // Service image
      color?: string                 // Card background color
      button?: {                     // Optional button
        text: string
        link: string
      }
    }>
  }
}
```

#### 3. TextImage Section
```typescript
{
  id: string
  type: "textImage"
  content: {
    title: string
    text: string
    image: string
  }
}
```

#### 4. Contact Section
```typescript
{
  id: string
  type: "contact"
  content: {
    title: string
    description: string
  }
}
```

### Lead
```typescript
{
  id: string
  siteSlug: string
  name: string
  email: string
  message: string
  createdAt: string
}
```

---

## ✨ Features

### 1. Multi-Site Support
- **Route**: `/site/[slug]`
- Multiple websites from one codebase
- Each site has its own theme and content
- Example: `/site/plumber` and `/site/electrician`

### 2. Admin Mode
- **Activation**: Add `?admin=true` to any URL
- **Visual Indicator**: Yellow banner at top
- **Features**:
  - Section outlines (dashed borders)
  - Click-to-edit text fields
  - Image upload/replace
  - Section reordering (drag & drop)
  - Auto-save on changes
  - Quick access to leads inbox

### 3. Hero Section Features
- ✅ **Headline & Subheadline**: Click to edit
- ✅ **Background Image**: Upload, URL, or remove
- ✅ **Background Color**: Color picker + hex input
- ✅ **CTA Button**: Add/edit/remove with text and link
- ✅ **Admin Controls**: Collapsible panels in top-left

### 4. Services Section Features
- ✅ **Section Title**: Click to edit
- ✅ **Section Background**: Color picker
- ✅ **Service Cards**: Each with:
  - **Title**: Click to edit
  - **Description**: Optional, click to edit
  - **Image**: Upload, URL, or remove
  - **Card Color**: Custom background per card
  - **Button**: Optional CTA with text and link
- ✅ **Add/Remove Services**: Easy management
- ✅ **Admin Controls**: Per-service editor panel

### 5. TextImage Section Features
- ✅ **Title & Text**: Click to edit
- ✅ **Image**: Click to replace (upload or URL)
- ✅ **Responsive Layout**: Side-by-side on desktop

### 6. Contact Section Features
- ✅ **Title & Description**: Click to edit
- ✅ **Contact Form**: Name, email, message
- ✅ **Form Submission**: Saves to leads inbox
- ✅ **Success Message**: User feedback

### 7. Leads Management
- ✅ **Form Submission**: Auto-saves to JSON
- ✅ **Leads Inbox**: `/admin/[slug]/leads`
- ✅ **Lead Display**: Name, email, message, timestamp
- ✅ **Quick Access**: Button in admin mode

### 8. Section Management
- ✅ **Drag & Drop**: Reorder sections in admin mode
- ✅ **Auto-Save**: Changes persist immediately
- ✅ **Visual Feedback**: Saving indicator

---

## 🎨 Admin Interface

### How to Use Admin Mode

1. **Enable Admin**: Add `?admin=true` to URL
   - Example: `http://localhost:3000/site/plumber?admin=true`

2. **Edit Text**:
   - Click any text field
   - Type new content
   - Press Enter or click away to save

3. **Edit Images**:
   - **Hero/TextImage**: Click image to replace
   - **Services**: Use "⚙️ Edit Service" → Image controls
   - Options: Upload file, enter URL, or remove

4. **Edit Colors**:
   - **Hero**: "🎨 Background" panel
   - **Services**: "⚙️ Section Settings" or per-service editor
   - Use color picker or enter hex code

5. **Add/Edit Buttons**:
   - **Hero**: "🔘 CTA Button" panel
   - **Services**: "⚙️ Edit Service" → Button section
   - Click text/link fields to edit

6. **Reorder Sections**:
   - In admin mode, drag the "⋮⋮ Drag" handle
   - Sections reorder automatically

7. **View Leads**:
   - Click "View Leads" button (bottom-right in admin mode)
   - Or visit `/admin/[slug]/leads`

---

## 📁 Sample Data

### Default Sites
1. **Plumber** (`/site/plumber`)
   - Hero with CTA button
   - Services with images and buttons
   - TextImage section
   - Contact form

2. **Electrician** (`/site/electrician`)
   - Hero with CTA button
   - Services with images and buttons
   - TextImage section
   - Contact form

### Initialize Data
```bash
# Local development
npx tsx scripts/init-data.ts

# After deployment
Visit: https://your-app.vercel.app/api/init
```

---

## 🚀 API Endpoints

### `/api/pages` (POST)
- Save page data
- Called automatically on edits

### `/api/leads` (POST/GET)
- **POST**: Save contact form submission
- **GET**: Fetch leads for a site (`?siteSlug=plumber`)

### `/api/cloudinary` (POST)
- Upload images
- Returns image URL (or base64 data URL)

### `/api/init` (GET/POST)
- **GET**: Initialize sample data (if not exists)
- **POST**: Force re-initialize data

---

## 🎯 Current Capabilities

### ✅ What Works Now
- [x] Multi-site routing
- [x] JSON-driven content
- [x] Admin edit mode
- [x] Text editing (all sections)
- [x] Image uploads (with fallback)
- [x] Background colors (hero & services)
- [x] CTA buttons (hero & services)
- [x] Service cards with images
- [x] Service descriptions
- [x] Service buttons with links
- [x] Section reordering
- [x] Contact form
- [x] Leads inbox
- [x] Auto-save on changes
- [x] Responsive design
- [x] SEO metadata

### 🔄 What's Next (Optional Enhancements)
- [ ] Database migration (PostgreSQL)
- [ ] User authentication (if needed)
- [ ] Rich text editor
- [ ] More section types
- [ ] Analytics integration
- [ ] Email notifications for leads
- [ ] Custom domains per site
- [ ] Page templates
- [ ] Media library

---

## 📝 Usage Examples

### Creating a New Site
1. Create site JSON: `data/sites/new-site.json`
2. Create page JSON: `data/pages/new-site-home.json`
3. Visit: `/site/new-site`

### Adding a New Section
1. Enable admin mode
2. Edit page JSON directly, or
3. Add section via admin UI (future enhancement)

### Customizing a Service
1. Enable admin mode
2. Click "⚙️ Edit Service" on any card
3. Upload image, set color, add button
4. Edit title and description
5. Changes save automatically

---

## 🛠️ Development

### Start Development
```bash
npm install
npx tsx scripts/init-data.ts
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Deploy
See `DEPLOYMENT.md` for detailed instructions.

---

## 📊 File Sizes
- **Hero Section**: ~386 lines
- **Services Section**: ~450+ lines
- **TextImage Section**: ~150 lines
- **Contact Section**: ~120 lines
- **Total Components**: ~1,100+ lines

---

## 🎉 Summary

You now have a **fully functional multi-site website builder** with:
- ✅ 4 section types (Hero, Services, TextImage, Contact)
- ✅ Complete admin interface
- ✅ Image management
- ✅ Color customization
- ✅ CTA buttons
- ✅ Contact forms & leads
- ✅ Drag & drop reordering
- ✅ Auto-save functionality
- ✅ Two sample sites ready to use

**Everything is JSON-driven, editable without code changes, and ready for deployment!**

