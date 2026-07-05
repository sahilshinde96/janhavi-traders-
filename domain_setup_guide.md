# Multi-Account Deployment & Custom Domain Guide (Vercel & Render)

This guide provides step-by-step instructions for deploying the **BLUSHH** application (Frontend, Backend, and Database) onto **new Render and Vercel accounts**, including how to map them to your new custom domain name: `blushh.online`.

---

## 🗺️ Deployment Architecture

Your application is split into two parts:
1. **Frontend (Vite / React SPA):** Hosted on **Vercel** (connects to your main domain `https://blushh.online`).
2. **Backend (Django API) & Database (PostgreSQL):** Hosted on **Render** (connects to your API subdomain `https://api.blushh.online`).

---

## 🐘 Phase 1: Deploy Database & Backend on Render (New Account)

### 1. Set Up PostgreSQL on Render
1. Log in to the **new Render account**.
2. Click **New +** at the top right and select **PostgreSQL**.
3. Fill in the database details:
   * **Name:** `blushh_db`
   * **Region:** Choose a region close to your customers (e.g., `Singapore (Asia)` which matches your database server region).
   * **Datadog API Key / Log Stream:** Leave blank.
4. Choose the database tier (Free plan).
5. Click **Create Database**.
6. Once created, copy the **Internal Database URL** (for the backend web service settings) and the **External Database URL** (which we used to seed the database).

### 2. Set Up the Django Web Service on Render
1. Click **New +** and select **Web Service**.
2. Connect your GitHub repository (`janhavi-traders-`).
3. Set the following service configurations:
   * **Name:** `blushh-backend`
   * **Region:** Select the *same region* as your database (`Singapore`).
   * **Branch:** `main`
   * **Root Directory:** `backend`
   * **Runtime:** `Python`
   * **Build Command:** `pip install -r requirements.txt && python manage.py migrate`
   * **Start Command:** `gunicorn janhavi_backend.wsgi`
4. Expand the **Advanced** section and click **Add Environment Variable**. Add these variables:

| Key | Value | Explanation |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://blushh_db_of3o_user:x2oBdKsQmOWBxXr8yDVfqlhvY0spC0Mu@dpg-d9571jlckfvc73b0k3cg-a.singapore-postgres.render.com/blushh_db_of3o` | Use the **Internal Database URL** from Render for security (Internal is faster/safer than External between Render services) |
| `ALLOWED_HOSTS` | `api.blushh.online,blushh-backend.onrender.com` | Allow Django to run on your custom API domain and Render URL |
| `CORS_ALLOWED_ORIGINS` | `https://blushh.online,https://www.blushh.online` | Allows your custom frontend domain to securely connect to the API |
| `DEBUG` | `False` | Forces production security controls |
| `SECRET_KEY` | `your-secure-random-secret-key-here` | Create a long, secure random string |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_name` | Cloudinary name for image hosting |
| `CLOUDINARY_API_KEY` | `your_api_key` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Cloudinary API Secret |
| `DJANGO_SETTINGS_MODULE` | `janhavi_backend.settings.production` | Instructs Django to load production settings |

5. Click **Create Web Service**.

### 3. Run Migrations & Create Superuser on Render Free Tier (No Shell Access)

Because the Render Free Tier does not provide interactive shell/terminal access, you cannot run `createsuperuser` directly in the Render dashboard. Follow these methods instead:

* **Automatic Migrations (Done):** By setting the **Build Command** to `pip install -r requirements.txt && python manage.py migrate`, Render runs migrations automatically on every deploy.
* **Superuser Admin Account (Done):** I have already initialized your database, run migrations, and created your admin account:
  * **Login Email:** `admin@blushh.com`
  * **Password:** `adminpassword123`
  *(Once your deployment is complete, log into the admin dashboard at `https://api.blushh.online/admin` and change your password for security).*

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
   * **Value:** `https://api.blushh.online/api`
6. Click **Deploy**. Vercel will compile the React code and give you a default `.vercel.app` URL.

---

## 🌐 Phase 3: Connect Custom Domains & DNS

Once both services are running, configure the custom domain `blushh.online`:

### 1. In Vercel (Frontend Domain)
1. Go to your Vercel project dashboard → **Settings** → **Domains**.
2. Enter your domain: `blushh.online` (and check the option to redirect `www.blushh.online` to `blushh.online`).
3. Vercel will show you the DNS records you need to add to your registrar:
   * **A Record:** Name `@`, Value `76.76.21.21`
   * **CNAME Record:** Name `www`, Value `cname.vercel-dns.com`

### 2. In Render (Backend API Domain)
1. Go to your Render Web Service dashboard → **Settings** → **Custom Domains**.
2. Click **Add Custom Domain** and enter `api.blushh.online`.
3. Render will provide the CNAME mapping value. In your domain provider account, add this record:
   * **CNAME Record:** Name `api`, Value `blushh-backend.onrender.com` (use your actual Render web service address)

---

## 🔒 Phase 4: Final Security & Verification

1. Once the DNS records propagate, verify both domains load over secure **HTTPS**.
2. Open your storefront URL (`https://blushh.online`).
3. Open browser Developer Tools (Right-click → Inspect → Console tab).
4. Verify that you can browse products, add items to the cart, and proceed to checkout without encountering **CORS blocking** errors.
5. If there are CORS errors, double-check that your `CORS_ALLOWED_ORIGINS` on Render matches your frontend URL exactly.
