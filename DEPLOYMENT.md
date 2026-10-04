# Production Deployment Guide: Coolify & Cloudflare Pages

This guide outlines how to deploy the **Student on Duty (SoD) Management System** to production using:
- **Backend & PostgreSQL**: Hosted on **Coolify** using Docker Compose.
- **Frontend SPA**: Hosted on **Cloudflare Pages** (global CDN edge with automatic SSL).

---

## Architecture Overview

```
                      +-----------------------------+
                      |       User's Browser        |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v (HTTPS)                                   v (HTTPS API Calls)
+-------------------------------+           +-------------------------------+
|       Cloudflare Pages        |           |       Coolify Server          |
|  - Global Edge CDN            |           |  - Traefik Reverse Proxy      |
|  - React SPA + Vite           |           |  - Auto SSL / Custom Domain   |
|  - `_redirects` SPA Fallback  |           +---------------+---------------+
+-------------------------------+                           |
                                                            v
                                            +-------------------------------+
                                            |   FastAPI Backend Container   |
                                            |   - Port 8000 (Internal)      |
                                            |   - Alembic Auto-Migrations   |
                                            |   - Idempotent Admin Bootstrap|
                                            +---------------+---------------+
                                                            |
                                                            v (Private Network)
                                            +-------------------------------+
                                            |    PostgreSQL 16 Container    |
                                            |   - Persistent Named Volume   |
                                            |   - Healthcheck Probing       |
                                            +-------------------------------+
```

---

## Part 1: Deploy Backend & PostgreSQL on Coolify

### 1. Create a New Resource in Coolify
1. Log into your **Coolify** dashboard.
2. Navigate to your **Project** and **Environment**.
3. Click **+ New Resource** -> **Docker Compose**.
4. Choose your Git repository source (GitHub/GitLab) or point to this repository.

### 2. Configure Docker Compose Settings
- **Compose file**: Coolify will automatically detect the root `docker-compose.yml`.
- **Exposed Service**: Select `backend` as the primary web service.
- **Port**: Set to `8000`.
- **Domain**: Enter your production backend API domain (e.g. `https://api.yourdomain.com`). Coolify's Traefik will automatically provision a Let's Encrypt SSL certificate.

### 3. Configure Environment Variables in Coolify
In the Coolify **Environment Variables** tab for the service, configure the following secrets:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `POSTGRES_DB` | Database name | `sod_db` |
| `POSTGRES_USER` | Database username | `postgres` |
| `POSTGRES_PASSWORD` | Strong PostgreSQL password | *(generate secure password)* |
| `JWT_SECRET` | Secret key for JWT signing (minimum 32 chars) | *(run `openssl rand -hex 32`)* |
| `JWT_ALGORITHM` | Algorithm for JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session token lifetime in minutes | `1440` (24 hours) |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins | `https://sod-frontend.pages.dev,https://sod.youruniversity.edu` |
| `CORS_ALLOW_CLOUDFLARE_PAGES` | Allow Cloudflare preview deployments | `true` |
| `FIRST_ADMIN_EMAIL` | Initial admin account email | `admin@univ.edu` |
| `FIRST_ADMIN_PASSWORD` | Initial admin password | *(secure password)* |
| `FIRST_ADMIN_NAME` | Initial admin display name | `Department Administrator` |
| `FIRST_ADMIN_DEPT_ID` | Admin identification tag | `ADMIN-0001` |
| `FIRST_ADMIN_ROLE` | Admin role type | `DeptManager` |
| `RUN_DEMO_SEED` | Populate demo students & duties | `false` (keep `false` for real production) |
| `WEB_CONCURRENCY` | Uvicorn worker count | `2` |

### 4. Deploy & Verify
1. Click **Deploy**.
2. Coolify will build the backend container and spin up PostgreSQL.
3. On startup, the container automatically:
   - Waits for PostgreSQL to pass its health check.
   - Executes `alembic upgrade head` to ensure all database tables and indexes are created.
   - Creates the initial Administrator account if not already present.
   - Starts Uvicorn with proxy headers enabled.
4. Verify backend health in browser or terminal:
   ```bash
   curl https://api.yourdomain.com/api/v1/health
   # Expected response: {"status":"healthy","database":"connected"}
   ```

---

## Part 2: Deploy Frontend on Cloudflare Pages

### 1. Connect Repository
1. Log into your **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select your repository.

### 2. Configure Build Settings
Fill in the build configuration:
- **Project Name**: `sod-system` (or your preferred name)
- **Production branch**: `main` (or `master`)
- **Framework preset**: `Vite`
- **Root directory**: `frontend`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### 3. Add Environment Variables
Under **Environment Variables (Production & Preview)**, add:

| Variable | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://api.yourdomain.com/api/v1` |

*(Replace `https://api.yourdomain.com` with your actual Coolify backend domain).*

### 4. SPA Routing (Pre-configured)
Single Page Applications require routing fallbacks so that refreshing pages (like `/login` or `/schedule`) does not cause 404 errors. 

This repository includes [`frontend/public/_redirects`](file:///Users/gm-ict/Documents/CSE451-SoftwareEngineering-SoDManagementSystem/frontend/public/_redirects):
```
/* /index.html 200
```
Vite automatically bundles this file into the `dist/` directory at build time, and Cloudflare Pages automatically reads it.

### 5. Deploy & Custom Domains
1. Click **Save and Deploy**.
2. Once the build completes, test accessing your site at the assigned `*.pages.dev` URL.
3. In Cloudflare Pages, go to **Custom Domains** if you wish to attach a custom domain (e.g. `sod.youruniversity.edu`).
4. Make sure your custom domain is also added to `CORS_ORIGINS` in your Coolify backend environment variables!

---

## Part 3: Local Development & Staging

### Running Locally with Docker Compose
To test the production Docker setup locally on your machine:
```bash
# Copy example env and adjust if needed
cp .env.example .env

# Start PostgreSQL and Backend
docker compose up --build
```
The backend API will be available at `http://localhost:8000` with Swagger documentation at `http://localhost:8000/docs`.

### Running Database Migrations Locally
If you make model changes in `backend/app/model/`:
```bash
cd backend
source .venv/bin/activate
# Generate new migration script
alembic revision --autogenerate -m "describe_changes"
# Apply migration
alembic upgrade head
```

---

## Part 4: Backups & Maintenance

### PostgreSQL Backups in Coolify
In Coolify, open your database or compose resource:
1. Navigate to the **Backups** tab.
2. Enable automated scheduled backups (e.g. daily cron `0 2 * * *` to S3 or local storage).
3. Set retention policy (e.g. keep 14 days of backups).
