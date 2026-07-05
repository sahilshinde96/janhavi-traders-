# Multi-Account Deployment & Custom Domain Guide (Vercel & Render)

This guide provides step-by-step instructions for deploying the **BLUSHH** application (Frontend, Backend, and Database) onto **new Render and Vercel accounts**, including how to map them to your new custom domain (e.g., `blushh.com`).

---

## 🗺️ Deployment Architecture

Your application is split into two parts:
1. **Frontend (Vite / React SPA):** Hosted on **Vercel** (connects to your main domain `https://blushh.com`).
2. **Backend (Django API) & Database (PostgreSQL):** Hosted on **Render** (connects to your API subdomain `https://api.blushh.com`).

---

## 🐘 Phase 1: Deploy Database & Backend on Render (New Account)

### 1. Set Up PostgreSQL on Render
1. Log in to the **new Render account**.
2. Click **New +** at the top right and select **PostgreSQL**.
3. Fill in the database details:
   * **Name:** `blushh_db`
   * **Region:** Choose a region close to your customers (e.g., `Oregon (US West)` or `Singapore (Asia)`).
   * **Datadog API Key / Log Stream:** Leave blank.
4. Choose the database tier (the Free plan works for testing, but the Starter plan is recommended for production to avoid downtime).
5. Click **Create Database**.
6. Once created, copy the **Internal Database URL** (for the backend web service) and **External Database URL** (for running migrations locally).

### 2. Set Up the Django Web Service on Render
1. Click **New +** and select **Web Service**.
2. Connect your GitHub repository (`janhavi-traders-`).
3. Set the following service configurations:
   * **Name:** `blushh-backend`
   * **Region:** Select the *same region* as your database.
   * **Branch:** `main`
   * **Root Directory:** `backend`
   * **Runtime:** `Python`
   * **Build Command:** `pip install -r requirements.txt && python manage.py migrate`
   * **Start Command:** `gunicorn janhavi_backend.wsgi`
4. Expand the **Advanced** section and click **Add Environment Variable**. Add these variables:

| Key | Value | Explanation |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@host/db` | Paste the **Internal Database URL** of your Render database |
| `ALLOWED_HOSTS` | `api.blushh.com,blushh-backend.onrender.com` | Replace with your backend domain and Render default URL |
| `CORS_ALLOWED_ORIGINS` | `https://blushh.com,https://www.blushh.com` | Replace with your frontend custom domain names |
| `DEBUG` | `False` | Forces production security controls |
| `SECRET_KEY` | `your-secure-random-secret-key-here` | Create a long, secure random string |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_name` | Cloudinary name for image hosting |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API Secret |
| `DJANGO_SETTINGS_MODULE` | `janhavi_backend.settings.production` | Instructs Django to load production database/security |

5. Click **Create Web Service**.

### 3. Run Migrations & Create Superuser on Render Free Tier (No Shell Access)

Because the **Render Free Tier** does not provide interactive shell or terminal access, you cannot run `createsuperuser` directly in the Render dashboard. Follow these methods instead:

#### Method A: Automatic Migrations (Recommended)
By setting the **Build Command** to `pip install -r requirements.txt && python manage.py migrate` in your Web Service settings, Render will automatically run all database migrations whenever you deploy your code.

#### Method B: Create Superuser from Local Machine
To create your administrator account, you can connect to your remote PostgreSQL database from your local computer:

1. Go to your **Render PostgreSQL Database** page.
2. In the **Connections** panel, locate and copy the **External Database URL**.
3. Open a terminal/command prompt on your local computer and navigate to the `backend` folder:
   ```bash
   cd "c:\Users\sahil\Desktop\janhavi traders\busy-maxwell\backend"
   ```
4. Activate your local virtual environment:
   ```bash
   venv\Scripts\activate
   ```
5. Temporarily set the database environment variable in your terminal:
   * **CMD (Windows Command Prompt):**
     ```cmd
     set DATABASE_URL="paste_your_external_database_url_here"
     ```
   * **PowerShell:**
     ```powershell
     $env:DATABASE_URL="paste_your_external_database_url_here"
     ```
   * **Git Bash / Linux / macOS:**
     ```bash
     export DATABASE_URL="paste_your_external_database_url_here"
     ```
6. Run the Django management command to create your superuser account:
   ```bash
   python manage.py createsuperuser
   ```
7. Follow the prompts in your local terminal to create your username, email, and password. This writes the account credentials directly into your live Render database!
8. Close your terminal when done to clear the temporary database URL credentials.

---

## 💻 Phase 2: Deploy Frontend on Vercel (New Account)

1. Log in to the **new Vercel account**.
2. Click **Add New...** and select **Project**.
3. Import your GitHub repository (`janhavi-traders-`).
4. Configure the Vite project:
   * **Framework Preset:** `Vite`
   * **Root Directory:** Edit and select `frontend`.
   * **Build Command:** `npm run build`
   * **Install Command:** Leave as default (`npm install` will run automatically)
   * **Output Directory:** `dist`
5. Expand the **Environment Variables** accordion and add:
   * **Key:** `VITE_API_URL`
   * **Value:** `https://api.blushh.com/api` (or your default Render URL, e.g., `https://blushh-backend.onrender.com/api` if you haven't mapped the custom domain yet).
6. Click **Deploy**. Vercel will compile the React code and give you a default `.vercel.app` URL.

---

## 🌐 Phase 3: Connect Custom Domains & 


DNS

Once both services are running, configure the custom domain `blushh.com`:

### 1. In Vercel (Frontend Domain)
1. Go to your Vercel project dashboard → **Settings** → **Domains**.
2. Enter your domain: `blushh.com` (and check the option to redirect `www.blushh.com` to `blushh.com`).
3. Vercel will show you the DNS records you need to add:
   * **A Record:** Name `@`, Value `76.76.21.21`
   * **CNAME Record:** Name `www`, Value `cname.vercel-dns.com`
4. Log into your domain provider account (Godaddy, Hostinger, Namecheap) and add these records.

### 2. In Render (Backend API Domain)
1. Go to your Render Web Service dashboard → **Settings** → **Custom Domains**.
2. Click **Add Custom Domain** and enter `api.blushh.com`.
3. Render will provide the CNAME value to map.
4. In your domain provider account, add this record:
   * **CNAME Record:** Name `api`, Value `blushh-backend.onrender.com`

---

## 🔒 Phase 4: Final Security & Verification

1. Once the DNS records propagate (typically 10-15 minutes), verify both domains load over secure **HTTPS**.
2. Open your storefront URL (`https://blushh.com`).
3. Open browser Developer Tools (Right-click → Inspect → Console tab).
4. Verify that you can browse products, add items to the cart, and proceed to checkout without encountering **CORS blocking** errors.
5. If there are CORS errors, double-check that your `CORS_ALLOWED_ORIGINS` on Render matches your frontend URL exactly.
