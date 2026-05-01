# Installation Guide — OnlyFans Sales Tracker

Choose your hosting method below.

---

## 🖥️ VPS (Ubuntu/Debian)

Auto-install script sets up everything automatically.

**Quick install:**
```bash
# SSH into your VPS, then run:
curl -fsSL https://raw.githubusercontent.com/arisedeepseek-dev/onlyfans-sales-app/main/install-vps.sh | bash
```

Or download and run manually:
```bash
wget https://raw.githubusercontent.com/arisedeepseek-dev/onlyfans-sales-app/main/install-vps.sh
chmod +x install-vps.sh
./install-vps.sh
```

The script will:
1. Install Node.js 20, PM2, Nginx, Git
2. Clone the repo
3. Install dependencies
4. Build the app
5. Configure PM2 to keep it running
6. Configure Nginx as reverse proxy (HTTP only — use Cloudflare for HTTPS)
7. Ask for your Supabase URL and Anon Key

**Default admin after install:**
- Email: `admin@yourdomain.com`
- Password: `admin123` ← **change this immediately after first login**

**VPS with custom domain + HTTPS:**
```bash
# After the script runs, set up Cloudflare
# Point your domain to your VPS IP
# Enable Cloudflare proxy (orange cloud)
# HTTPS is handled automatically by Cloudflare, no Nginx SSL needed
```

**Useful commands:**
```bash
pm2 status              # Check app status
pm2 logs                # View logs
pm2 restart app         # Restart app
pm2 save                # Save PM2 process list
```

---

## 🌐 Shared Hosting (cPanel, DirectAdmin, etc.)

Manual installation — no auto-script for shared hosting.

### Step 1: Build the app on your local machine or a VM

```bash
git clone https://github.com/arisedeepseek-dev/onlyfans-sales-app.git
cd onlyfans-sales-app
npm install
npm run build
```

This creates a `dist/` folder with static files.

### Step 2: Upload to hosting

1. Zip the `dist/` folder
2. Upload to your hosting file manager
3. Extract to your domain's public directory (usually `public_html/` or `www/`)
4. Move ALL contents from `dist/` to the root of your public directory (not inside a subfolder)

### Step 3: Configure Supabase

1. Edit `index.html` in your hosting file manager
2. Add this script tag in the `<head>` BEFORE the app loads:

```html
<script>
  window.env = {
    VITE_SUPABASE_URL: 'https://your-project.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'your-anon-key-here'
  };
</script>
```

Or use your hosting's environment variable feature (cPanel → Node.js → Environment Variables).

### Step 4: Create admin user in Supabase

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Run:

```sql
-- Replace with your desired admin email and auth UID
INSERT INTO public.users (id, email, role)
VALUES ('your-auth-uid-here', 'admin@yourdomain.com', 'admin');
```

3. Set password via **Supabase Dashboard → Authentication → Users → Update**

**Default admin after setup:**
- Email: `admin@yourdomain.com`
- Password: `your-set-password` ← set in Supabase Dashboard

---

## ☁️ Vercel + GitHub + Supabase

Automated deployment with zero manual steps.

### Step 1: Fork the repo

Fork this repo to your GitHub account:
```
https://github.com/arisedeepseek-dev/onlyfans-sales-app/fork
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **Add New Project**
3. Import from **GitHub** (authorize Vercel to access your repos)
4. Select the forked repo `your-username/onlyfans-sales-app`
5. Click **Deploy**

### Step 3: Add Environment Variables

In Vercel project dashboard → **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` (from Supabase Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key-here` (from Supabase Settings → API) |

Click **Save**, then trigger a **redeploy** (Projects → Deployments → latest → ⋯ → Redeploy).

### Step 4: Create admin user in Supabase

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Run:

```sql
-- Replace with your auth UID and desired email
INSERT INTO public.users (id, email, role)
VALUES ('your-auth-uid-here', 'admin@yourdomain.com', 'admin');
```

3. Set password via **Supabase Dashboard → Authentication → Users → Update**

**After deploy finishes:**
- Vercel gives you a URL like: `https://onlyfans-sales-app.vercel.app`
- Your admin login: `admin@yourdomain.com` + password you set

### Custom Domain (Vercel)

1. Vercel project → **Settings → Domains**
2. Add your domain (e.g., `app.yoursite.com`)
3. Add the DNS record Vercel shows you in your DNS provider
4. Wait for SSL to provision (usually ~5 min)

---

## 📋 Supabase Setup (All Methods)

**Create your Supabase project first regardless of hosting method:**

1. Go to [supabase.com](https://supabase.com) → Create project
2. Wait for the project to provision (~2 min)
3. Go to **SQL Editor** → paste and run ALL contents of `supabase/schema.sql`
4. Go to **Settings → API** → copy `Project URL` and `anon public` key

**Your Supabase URL format:**
```
https://xxxxxxxxxxxx.supabase.co
```

**Your anon key format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJl...
```

---

## 🔒 Security Notes

- **Change default admin password immediately** after first login
- Use Cloudflare proxy or Vercel built-in HTTPS — never run HTTP in production
- Never expose your Supabase service role key in frontend code
- Keep your `.env` file private (Vercel handles this automatically with env vars)

---

## 🆘 Troubleshooting

**App shows blank screen:**
- Check browser console (F12) for errors
- Verify Supabase URL and anon key are correct
- Make sure Supabase project is not paused (free tier sleeps after 7 days inactive)

**Login doesn't work:**
- Confirm admin user exists in `public.users` table (SQL Editor → `SELECT * FROM public.users`)
- Confirm password was set in Supabase Authentication

**Build fails:**
- Make sure Node.js 18+ is installed (`node -v`)
- Run `npm install` again
- Clear cache: `rm -rf node_modules && npm install`