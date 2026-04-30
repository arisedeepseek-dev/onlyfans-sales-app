# OnlyFans Sales Tracker — SPEC.md

## 1. Concept & Vision

A sleek, professional mobile-first admin panel for OnlyFans creators to track sales, calculate net income, commissions, and hourly rates. The app feels like a premium financial dashboard — clean, data-driven, and empowering. Think "personal CFO for creators."

**Tagline:** Your sales, your numbers, your empire.

---

## 2. Design Language

### Aesthetic
Dark-first premium fintech aesthetic. Inspired by Linear, Stripe Dashboard, and high-end crypto apps. Sharp contrasts, subtle glows, and purposeful whitespace.

### Color Palette
| Role | Dark Mode | Light Mode |
|---|---|---|
| Background Primary | `#0A0A0F` | `#F5F6FA` |
| Background Card | `#13131A` | `#FFFFFF` |
| Background Elevated | `#1A1A26` | `#F0F1F8` |
| Text Primary | `#FFFFFF` | `#0A0A0F` |
| Text Secondary | `#8B8B9E` | `#6B6B80` |
| Accent Primary | `#6C5CE7` | `#5B4BD4` |
| Accent Secondary | `#A29BFE` | `#7B6AE8` |
| Success | `#00D68F` | `#00B87A` |
| Warning | `#FFB800` | `#E5A500` |
| Danger | `#FF4D6A` | `#E5394D` |
| Border | `#1E1E2E` | `#E0E2F0` |

### Typography
- **Font Family:** "Inter" (Google Fonts) — clean, professional, excellent number rendering
- **Headings:** Inter 600–700
- **Body:** Inter 400–500
- **Numbers/Data:** Inter 500–600 (tabular-nums feature)

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48
- Card border-radius: 16px
- Button border-radius: 12px
- Input border-radius: 10px

### Motion
- Transitions: 200ms ease-out for interactive elements
- Page transitions: 300ms fade + slide
- Number counters: animate on load (500ms)
- Cards: subtle scale on tap (0.98)

---

## 3. Layout & Structure

### Page Architecture

**Auth Pages (Unauthenticated)**
- `/login` — Admin or User login
- `/signup` — User registration

**User App**
- `/dashboard` — Sales overview, quick stats, recent entries
- `/sales` — Full sales log, add/edit/delete entries
- `/profile` — Edit email, password, delete account

**Admin Panel**
- `/admin` — Overview: user count, total sales, app health
- `/admin/users` — List all users, delete accounts
- `/admin/settings` — App name, title, admin credentials

### Navigation
- **User:** Bottom tab bar — Dashboard, Sales, Profile
- **Admin:** Bottom tab bar — Overview, Users, Settings

### Responsive Strategy
- Mobile-first (375px–428px primary target)
- Tablet/Desktop: max-width 480px centered (like a phone frame)
- Cards stack vertically, full-width inputs

---

## 4. Features & Interactions

### Authentication

**Default Admin Credentials (fresh install):**
- Username: `admin`
- Password: `admin`
- Admin can change credentials in Settings after first login

**User Sign Up:**
- Fields: email, password (min 8 chars)
- Auto-assigned role: `user`
- Immediate redirect to dashboard after signup

**User Sign In:**
- Email + password
- Error: "Invalid credentials" (no enumeration)
- Success: redirect to dashboard

**Admin Sign In:**
- Same login form, role detected automatically
- Success: redirect to admin panel

### Sales Tracker

**Add Sale Entry:**
- Gross Sales (required, number)
- Hourly Rate (optional, number)
- Custom Commission Base (optional, number)
- Auto-timestamps on creation

**Auto-Calculations (server-side or client-side):**

```
net_sales = gross_sales        (what the platform takes + fees)
salary_without_hourly = gross_sales - net_sales - comms_base
salary_with_hourly = gross_sales - net_sales - comms_base + (hourly_rate × hours_worked)
```

*Note: "net_sales" in this app = gross after platform fees (typically 20-40% OnlyFans cut). User inputs their net (what they actually receive from platform before other deductions).*

**Calculations Display:**
- Today / Weekly / Biweekly / Monthly / Yearly
- For each period: gross total, net total, commission base total, salary estimate
- Hours worked: user inputs hours, or defaults to estimated (period hours)

**Edit Entry:**
- Tap any entry → slide-in edit panel
- All fields editable
- Save / Cancel

**Delete Entry:**
- Swipe or tap delete icon
- Confirmation modal: "Delete this entry? This cannot be undone."
- Soft delete (deleted_at timestamp) for audit trail

### Admin Panel

**App Settings:**
- App Name (text input, max 50 chars)
- App Title / Tagline (text input, max 100 chars)
- Admin Username (change)
- Admin Password (change, requires current password)
- Save button with loading state

**User Management:**
- Paginated list of users (10 per page)
- Each row: email, role, created date, action buttons
- Delete user → confirmation modal
- Cannot delete self (admin)

### Theme Toggle
- Toggle in Profile / Settings header
- Sun/Moon icon
- Preference saved to localStorage + user profile
- Instant switch, no reload

---

## 5. Component Inventory

### Buttons
- **Primary:** Purple gradient background, white text, 48px height, full-width on mobile
- **Secondary:** Transparent with purple border
- **Danger:** Red background for destructive actions
- **Ghost:** Text only, purple accent
- **States:** Default, Hover (brightness +10%), Active (scale 0.98), Disabled (opacity 0.5), Loading (spinner)

### Input Fields
- Full-width, 48px height, dark card background
- Label above, placeholder inside
- Focus: purple border glow
- Error: red border + error message below
- Password: toggle visibility icon

### Cards
- Background card color, 16px radius, 16px padding
- Subtle border: 1px solid border color
- Shadow: none (flat design)
- Active/pressed: scale 0.98

### Stat Display
- Large number (28px, tabular-nums)
- Label below (12px, secondary color)
- Optional trend indicator (↑↓ with percentage)
- Optional accent glow on hover

### Navigation
- Bottom tab bar, 64px height
- 3 tabs max, icon + label
- Active: accent color, inactive: secondary
- Safe area padding for notch devices

### Modals
- Centered overlay, dark backdrop (60% opacity)
- Slide-up animation on mobile
- Close button top-right
- Action buttons bottom

---

## 6. Technical Approach

### Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | React Context + hooks |
| Forms | React Hook Form + Zod |
| Backend | Supabase (Postgres + Auth + Row Level Security) |
| Deployment | Vercel (optional) |
| Source | GitHub (open source) |

### Supabase Schema

**Table: `users`**
```sql
id          uuid primary key default gen_random_uuid()
email       text unique not null
password    text not null (hashed with bcrypt)
role        text default 'user' check (role in ('user', 'admin'))
app_name    text
app_title   text
created_at  timestamptz default now()
updated_at  timestamptz default now()
theme       text default 'dark'
```

**Table: `sales`**
```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid references users(id) on delete cascade
gross_sales     numeric not null default 0
hourly_rate     numeric default 0
comms_base      numeric default 0
hours_worked    numeric default 0
net_sales       numeric generated always as (gross_sales) stored
salary          numeric generated always as (gross_sales - comms_base + (hourly_rate * hours_worked)) stored
created_at      timestamptz default now()
updated_at      timestamptz default now()
deleted_at      timestamptz
```

**RLS Policies:**
- Users can only read/write their own sales
- Admin can read all sales and manage users
- Soft delete filter: `deleted_at IS NULL`

### API Design (Supabase calls)

All data access via Supabase JS client with RLS. No custom REST API needed.

Key operations:
- `supabase.auth.signUp({ email, password })`
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.from('sales').select('*').eq('user_id', uid).eq('deleted_at', null)`
- `supabase.from('sales').insert({ ... })`
- `supabase.from('sales').update({ ... }).eq('id', id)`
- `supabase.from('sales').update({ deleted_at: new Date() }).eq('id', id)` (soft delete)
- Admin queries: bypass RLS with service role key for admin operations only

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 7. File Structure

```
onlyfans-sales-app/
├── SPEC.md
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.example
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── calculations.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useTheme.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── AppLayout.tsx
│   │   └── sales/
│   │       ├── SaleForm.tsx
│   │       └── SaleList.tsx
│   └── pages/
│       ├── Login.tsx
│       ├── SignUp.tsx
│       ├── user/
│       │   ├── Dashboard.tsx
│       │   ├── Sales.tsx
│       │   └── Profile.tsx
│       └── admin/
│           ├── AdminDashboard.tsx
│           ├── AdminUsers.tsx
│           └── AdminSettings.tsx
```