# OnlyFans Sales Tracker 📊

A sleek, professional mobile-first admin panel for OnlyFans creators to track sales, calculate net income, commissions, and hourly rates.

![Version](https://img.shields.io/badge/version-1.0.0-6C5CE7)
![License](https://img.shields.io/badge/license-MIT-00D68F)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)

## ✨ Features

### Admin Panel
- **App Management**: Customize app name, title, and branding
- **Admin Credentials**: Change admin username and password
- **Dashboard Overview**: Total users, active today, total sales, gross revenue

### User Features
- **Authentication**: Sign up / Sign in with email and password
- **Sales Tracker**: Add, edit, delete sales entries
- **Auto Calculations**:
  - Gross sales input
  - Custom commission base
  - Optional hourly rate and hours worked
  - Auto-calculated: Today/Weekly/Biweekly/Monthly/Yearly stats
  - Salary formula: `gross - comms + (hourly_rate × hours_worked)`
- **Profile Management**: Update email, change password, delete account
- **Dark/Light Mode**: Toggle theme with instant switch

### Design
- Mobile-first responsive design (375px–428px primary)
- Premium fintech aesthetic inspired by Linear/Stripe
- Smooth animations and transitions
- Tabular numbers for financial data
- Bottom tab navigation for easy thumb access

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Backend | Supabase (Postgres + Auth + RLS) |
| Icons | Lucide React |
| Deployment | Vercel (optional) |

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- GitHub account (for deployment)

### 2. Clone the Repository
```bash
git clone https://github.com/arisedeepseek-dev/onlyfans-sales-app.git
cd onlyfans-sales-app
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. Go to **SQL Editor** and run the schema:
   - Copy the contents of `supabase/schema.sql`
   - Paste and execute in Supabase SQL Editor

3. Get your API keys:
   - Go to **Settings → API**
   - Copy `Project URL` and `anon public` key

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Default Admin Login

First time setup — create your admin account in **Supabase SQL Editor**:

```sql
INSERT INTO public.users (id, email, role)
VALUES ('YOUR_AUTH_UID', 'admin@yourdomain.com', 'admin');
```

Then set your password in **Supabase Dashboard → Authentication → Users → Update**.

⚠️ **Important**: Change these credentials after first login in **Admin Settings**.

## 📁 Project Structure

```
onlyfans-sales-app/
├── src/
│   ├── components/
│   │   ├── ui/          # Button, Input, Card, Modal, StatCard, ThemeToggle
│   │   ├── layout/      # AppLayout, AuthLayout, BottomNav
│   │   └── sales/        # SaleForm, SaleList
│   ├── pages/
│   │   ├── user/        # Dashboard, Sales, Profile
│   │   └── admin/       # AdminDashboard, AdminSettings
│   ├── context/         # AuthContext
│   ├── hooks/           # useTheme
│   ├── lib/             # supabase, calculations
│   ├── types/           # TypeScript interfaces
│   └── App.tsx          # Router setup
├── supabase/
│   └── schema.sql       # Database schema
├── public/
│   └── favicon.svg
└── Configuration files
```

## 📱 UI Preview

### Dashboard
- Today's gross/net salary at a glance
- Weekly stats with gross, comms, and salary breakdown
- Monthly overview with all metrics
- Yearly total with gradient card
- Recent sales quick view

### Sales Tracker
- Full list of all sales entries
- Add/Edit modal with form validation
- Delete confirmation modal
- Salary calculation displayed per entry

### Profile
- Email/password change forms
- Account deletion with confirmation
- Sign out functionality

### Admin Panel
- Overview with key metrics
- Settings for app branding and credentials

## 🎨 Color Palette

| Mode | Background | Card | Accent |
|---|---|---|---|
| Dark | `#0A0A0F` | `#13131A` | `#6C5CE7` |
| Light | `#F5F6FA` | `#FFFFFF` | `#5B4BD4` |

## 🔐 Security

- Row Level Security (RLS) on all tables
- Users can only access their own data
- Admin role required for admin routes
- Soft delete for audit trail
- Password validation on signup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is MIT licensed.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Lucide](https://lucide.dev) - Beautiful icons
- [Vercel](https://vercel.com) - Deployment platform

---

Built with ❤️ for creators