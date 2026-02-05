# PostgreSQL Database Setup

## Overview

The application now supports PostgreSQL database storage. It automatically detects if `DATABASE_URL` is set and uses the database, otherwise falls back to JSON files.

## Railway Setup

### 1. Create PostgreSQL Database on Railway

1. Go to [railway.app](https://railway.app)
2. Create a new project or open existing project
3. Click "New" → "Database" → "Add PostgreSQL"
4. Railway will automatically create the database and provide connection details

### 2. Get Connection String

Railway provides the connection string in the database service:
- Click on your PostgreSQL service
- Go to "Variables" tab
- Copy the `DATABASE_URL` value
- Format: `postgresql://user:password@host:port/database`

### 3. Set Environment Variable

**In Railway:**
1. Go to your web service (Next.js app)
2. Click "Variables" tab
3. Add new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the connection string from PostgreSQL service
4. Railway will automatically link it if services are in the same project

**Or manually:**
- Copy the `DATABASE_URL` from PostgreSQL service
- Add it to your Next.js service environment variables

### 4. Automatic Database Setup

**✅ Database setup runs automatically on every deploy!**

The application automatically:
- Creates database tables (if they don't exist)
- Migrates JSON files to database (if any exist)
- Runs before the app starts

**No manual setup required!** Just set `DATABASE_URL` and deploy.

**Manual setup (if needed):**
```bash
# Via Railway CLI
railway run npm run db:setup

# Or locally
export DATABASE_URL="postgresql://..."
npm run db:setup
```

**Note**: The setup script is idempotent - safe to run multiple times. It won't duplicate data.

## Database Schema

Data is split into **public** (shared) and **per-site schemas** (site-specific).

### Public schema

Shared tables live in the default `public` schema:

#### `sites`
```sql
CREATE TABLE sites (
  id VARCHAR(255) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  domains TEXT[] DEFAULT '{}',
  name VARCHAR(255) NOT NULL,
  theme JSONB NOT NULL,
  seo JSONB,
  header JSONB,
  footer JSONB,
  analytics JSONB,
  notifications JSONB,
  sociallinks JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `users`
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('siteOwner', 'superAdmin')),
  site_slugs TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Per-site schemas

Each site has its own schema named **`site_<sanitized_id>`** (e.g. `site_abc123def456`), where the id is `sites.id` with hyphens replaced by underscores and non-alphanumeric characters stripped. Inside each schema:

- **`pages`** – `id`, `slug`, `sections` (JSONB), `created_at`, `updated_at` (no `site_slug`; the schema implies the site).
- **`leads`** – `id`, `name`, `email`, `message`, `created_at` (no `site_slug`).

Schema and tables are created automatically when a site is saved (`saveSite`) or when setup runs for existing sites. This gives clear separation: one site’s pages and leads live in one schema, so backup/restore or dropping a site can target that schema.

### Indexes

- `idx_sites_domains` on `sites` (GIN on `domains`).
- Per-site: `idx_leads_created_at` on `"site_xxx".leads(created_at DESC)`.

## Environment Variables

### Required for Database
- `DATABASE_URL` - PostgreSQL connection string

### Optional
- `CLOUDINARY_CLOUD_NAME` - For image uploads
- `CLOUDINARY_API_KEY` - For image uploads
- `CLOUDINARY_API_SECRET` - For image uploads

## Local Development

### Using Railway Database Locally

1. Get connection string from Railway PostgreSQL service
2. Create `.env.local` file:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

3. Initialize database:
```bash
npm run db:init
```

4. Run migrations (if needed):
```bash
# Migrate JSON files into the database
npm run db:migrate

# If you have an existing DB with old shared public.pages/public.leads, run once:
npm run db:migrate-schemas
```

### Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create database:
```bash
createdb service_crm
```

3. Set environment variable:
```bash
DATABASE_URL=postgresql://localhost:5432/service_crm
```

4. Initialize:
```bash
npm run db:init
```

## Fallback Behavior

The application automatically detects the storage method:

- **If `DATABASE_URL` is set**: Uses PostgreSQL
- **If `DATABASE_URL` is not set**: Falls back to JSON files

This allows:
- ✅ Development without database (JSON files)
- ✅ Production with database (PostgreSQL)
- ✅ Easy migration path

## API Endpoints

All existing API endpoints work the same way:
- `/api/pages` - Saves to database or JSON
- `/api/leads` - Saves to database or JSON
- `/api/init` - Initializes data in database or JSON

## Troubleshooting

### Connection Errors

**Error**: "Connection refused"
- **Solution**: Check `DATABASE_URL` is correct
- **Solution**: Ensure Railway PostgreSQL is running
- **Solution**: Check firewall/network settings

### Table Not Found

**Error**: "relation 'sites' does not exist"
- **Solution**: Run `npm run db:init` to create tables

**Error**: "relation 'pages' does not exist" (or similar for per-site data)
- **Solution**: Setup creates per-site schemas for each row in `sites`. Ensure `npm run db:init` has run. If you migrated from an older DB that had `public.pages`/`public.leads`, run `npm run db:migrate-schemas` once to copy data into per-site schemas.

### SSL Errors

**Error**: "SSL connection required"
- **Solution**: Railway handles SSL automatically
- **Solution**: For local dev, SSL is disabled in non-production

### Migration Issues

**Error**: "Migration failed"
- **Solution**: Ensure `DATABASE_URL` is set
- **Solution**: Check database connection
- **Solution**: Verify JSON files exist in `data/` folder

## Production Checklist

- [ ] PostgreSQL database created on Railway
- [ ] `DATABASE_URL` environment variable set
- [ ] Database tables initialized (`npm run db:init`)
- [ ] Existing data migrated (if applicable)
- [ ] Test database connection
- [ ] Test saving/loading data
- [ ] Monitor database performance
- [ ] Set up database backups (Railway handles this)

## Benefits of PostgreSQL

✅ **Persistent Storage**: Data survives deployments
✅ **Better Performance**: Indexed queries
✅ **Scalability**: Handles more data efficiently
✅ **Reliability**: ACID transactions
✅ **Backups**: Railway provides automatic backups
✅ **Querying**: Can query data directly if needed

## Migrating from old shared tables (public.pages / public.leads)

If you have an existing database that still uses the old layout (single `public.pages` and `public.leads` with a `site_slug` column), run the one-time migration to copy data into per-site schemas and drop the old tables:

```bash
npm run db:migrate-schemas
```

This script:

1. Finds all distinct `site_slug` values in `public.pages` and `public.leads`.
2. Resolves each slug to `sites.id` and creates the schema `site_<sanitized_id>` with `pages` and `leads` tables.
3. Copies rows from `public.pages` and `public.leads` into the corresponding per-site schema (omitting `site_slug`).
4. Drops `public.pages` and `public.leads`.

Run it **before** or right after deploying the schema-per-site code. Safe to run multiple times if the old tables are already dropped (it will exit early).

## Next Steps

After setting up PostgreSQL:
1. Initialize tables: `npm run db:init`
2. Migrate JSON files (optional): `npm run db:migrate`
3. If you had shared `public.pages`/`public.leads`: run `npm run db:migrate-schemas` once
4. Test the application
5. Remove JSON files (after verifying everything works)

