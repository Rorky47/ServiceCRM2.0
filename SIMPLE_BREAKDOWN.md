# Simple Breakdown - What We Built

## 🎯 What Is This?

A **multi-site website builder** that lets you create and manage multiple service business websites from one codebase.

---

## 🏗️ The Basics

### One Codebase → Multiple Websites
- Build once, use for many sites
- Each site has its own content and theme
- Example: `/site/plumber` and `/site/electrician`

### JSON-Driven Content
- All content stored in JSON files (or PostgreSQL)
- No code changes needed to edit content
- Easy to manage

### Admin Edit Mode
- Add `?admin=true` to any URL
- Click any text to edit
- Click images to replace
- Drag sections to reorder
- Changes save automatically

---

## 📦 What's Included

### 4 Section Types

1. **Hero Section**
   - Big headline + subheadline
   - Background image or color
   - Call-to-action button
   - Full-width banner

2. **Services Section**
   - Grid of service cards
   - Each card can have:
     - Image
     - Title
     - Description (rich text)
     - Custom color
     - Button with link

3. **Text + Image Section**
   - Title
   - Rich text content
   - Image side-by-side

4. **Contact Section**
   - Title + description
   - Contact form
   - Saves leads to inbox

### Features

✅ **Rich Text Editor**
- Format text (bold, italic, lists, links)
- Used in descriptions and content

✅ **Image Management**
- Upload images
- Or use image URLs
- Click to replace

✅ **Color Customization**
- Section backgrounds
- Service card colors
- Hero backgrounds

✅ **Buttons & Links**
- CTA buttons on hero
- Service buttons with links
- All editable

✅ **Leads Management**
- Contact form submissions
- View in `/admin/[slug]/leads`
- All saved automatically

✅ **Drag & Drop**
- Reorder sections in admin mode
- Visual drag handles

---

## 💾 Data Storage

### Two Options:

1. **PostgreSQL Database** (Production)
   - Set `DATABASE_URL` on Railway
   - Data persists forever
   - Automatic setup on deploy

2. **JSON Files** (Development/Backup)
   - Stored in `data/` folder
   - Committed to git
   - Works without database

**The app automatically chooses** based on `DATABASE_URL`

---

## 🚀 How It Works

### For Users (Public)
1. Visit `/site/plumber` or `/site/electrician`
2. See the website
3. Fill out contact form
4. That's it!

### For Admins
1. Add `?admin=true` to URL
2. See yellow "ADMIN MODE" banner
3. Click anything to edit:
   - Text → Rich text editor
   - Images → Upload/URL
   - Colors → Color picker
   - Buttons → Edit text/link
4. Drag sections to reorder
5. Changes save automatically

---

## 📁 Project Structure

```
ServiceCRM/
├── app/                    # Next.js pages & API
│   ├── site/[slug]/       # Website pages
│   ├── admin/[slug]/leads # Leads inbox
│   └── api/               # Save data endpoints
├── components/
│   ├── sections/          # 4 section types
│   ├── RichTextEditor.tsx # Text editor
│   └── PageRenderer.tsx   # Main renderer
├── lib/
│   ├── data.ts            # Data access (DB or JSON)
│   └── db.ts              # Database connection
├── data/                  # JSON files (if using)
│   ├── sites/            # Site configs
│   ├── pages/            # Page content
│   └── leads/            # Form submissions
└── scripts/
    ├── setup-db.ts        # Create tables, migrations, optional JSON migration
    ├── init-data.ts       # Seed local JSON data
    └── migrate-json-to-db.ts  # One-time JSON to Postgres
```

---

## 🎨 What You Can Edit

### Hero Section
- Headline (text)
- Subheadline (text)
- Background image (upload/URL)
- Background color (picker)
- CTA button (text + link)

### Services Section
- Section title (text)
- Section background color
- Each service:
  - Title (text)
  - Description (rich text)
  - Image (upload/URL)
  - Card color
  - Button (text + link)

### Text + Image Section
- Title (text)
- Text content (rich text)
- Image (upload/URL)

### Contact Section
- Title (text)
- Description (rich text)
- Form fields (not editable, auto-generated)

---

## 🔧 Tech Stack

- **Next.js 14** - Framework
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **PostgreSQL** - Database (optional)
- **React Quill** - Rich text editor
- **dnd-kit** - Drag & drop

---

## 📊 Current Status

### ✅ Working Features
- [x] Multi-site routing
- [x] Admin edit mode
- [x] Text editing (rich text)
- [x] Image uploads
- [x] Color customization
- [x] CTA buttons
- [x] Service cards with images
- [x] Contact forms
- [x] Leads inbox
- [x] Section reordering
- [x] Auto-save
- [x] PostgreSQL support
- [x] Auto database setup

### 📝 Sample Sites
- Plumber site (`/site/plumber`)
- Electrician site (`/site/electrician`)

---

## 🚀 Deployment

### Railway (Current Setup)
1. Push to GitHub
2. Railway auto-deploys
3. Set `DATABASE_URL` (if using database)
4. Database auto-setup runs
5. Done!

### What Happens on Deploy
- Build Next.js app
- Run database setup (if `DATABASE_URL` set)
- Migrate JSON files to database (if any)
- Start app
- Your data is safe ✅

---

## 💡 Quick Examples

### Create a New Site
1. Create `data/sites/new-site.json`
2. Create `data/pages/new-site-home.json`
3. Visit `/site/new-site`

### Edit Content
1. Go to `/site/plumber?admin=true`
2. Click any text/image
3. Make changes
4. Click away to save

### View Leads
1. Go to `/admin/plumber/leads`
2. See all form submissions

---

## 🎯 In Simple Terms

**Think of it like:**
- WordPress, but simpler
- Squarespace, but self-hosted
- Wix, but for service businesses
- All content editable without code
- Multiple sites from one install

**Perfect for:**
- Service businesses (plumbers, electricians, etc.)
- Multiple clients from one codebase
- Quick website creation
- Content management without complexity

---

## 📈 What's Next?

The foundation is complete! You can:
- Add more sites
- Customize existing sites
- Deploy to Railway
- Start using it!

**Optional enhancements:**
- More section types
- Email notifications for leads
- Analytics
- Custom domains per site

---

## 🎉 Summary

**You have:**
- ✅ Multi-site website builder
- ✅ Full admin interface
- ✅ Rich text editing
- ✅ Image management
- ✅ Contact forms & leads
- ✅ PostgreSQL database
- ✅ Auto-deployment setup
- ✅ Two sample sites ready

**Everything works and is ready to use!** 🚀


