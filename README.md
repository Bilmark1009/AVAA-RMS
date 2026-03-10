# 📋 RMS – Recruitment Management System

A full-stack web application for managing job listings, applications, interviews, and user accounts across three roles: **Admin**, **Employer**, and **Job Seeker**.

---

## 🚀 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **PHP** | ^8.2 | Server-side language |
| **Laravel** | ^12.0 | Backend framework (routing, ORM, auth, queues) |
| **Inertia.js (Laravel adapter)** | ^2.0 | SPA bridge between Laravel and React |
| **Laravel Sanctum** | ^4.0 | API token authentication |
| **Laravel Socialite** | ^5.24 | OAuth login (Google) |
| **Ziggy** | ^2.0 | Named Laravel routes in JavaScript |
| **SQLite** | — | Default database (can be swapped to MySQL/PostgreSQL) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | ^18.2 | UI component library |
| **TypeScript** | ^5.0 | Typed JavaScript |
| **Inertia.js (React adapter)** | ^2.0 | SPA page rendering without a separate API |
| **Tailwind CSS** | ^3 / ^4 | Utility-first styling |
| **Headless UI** | ^2.0 | Accessible UI components |
| **Vite** | ^7.0 | Frontend build tool and dev server |
| **Axios** | ^1.11 | HTTP client |

### Dev Tools
| Tool | Purpose |
|---|---|
| **Laravel Breeze** | Auth scaffolding |
| **Laravel Pail** | Real-time log viewer |
| **Laravel Pint** | PHP code style fixer |
| **PHPUnit** | Backend testing |
| **Concurrently** | Run multiple processes at once |

---

## ✨ Features

### 👤 Authentication & Security
- Email/password registration and login
- **Google OAuth** login via Laravel Socialite
- **OTP Verification** on login/registration
- Email verification flow
- Password reset via email link
- Session-based auth with CSRF protection

### 🛡️ Role-Based Access Control (RBAC)
Three distinct user roles, each with their own dashboard and features:

| Role | Access |
|---|---|
| **Admin** | Full system oversight, user management, verifications |
| **Employer** | Post & manage jobs, view/filter applicants, schedule interviews |
| **Job Seeker** | Browse & apply for jobs, manage profile, track applications |

### 🔒 Navigation Security (Browser History Protection)
A 4-layer system preventing unauthorized access via browser back/forward button after login, logout, or role switches:
- **`PreventBackToAuth` Middleware** — Adds `no-store, no-cache` HTTP headers on authenticated pages
- **`PreventRoleMismatchAccess` Middleware** — Redirects users accessing pages outside their role
- **`usePreventAuthBack` Hook** — Client-side React hook using `history.pushState` manipulation
- **Inertia.js visit invalidation** — Forces fresh page loads on navigation events

### 💼 Job Seeker Features
- Browse and search job listings with filters
- View full job details
- Apply for jobs (with document uploads)
- Save/unsave jobs
- Manage profile and work experience
- Track submitted applications and statuses

### 🏢 Employer Features
- Create, edit, and manage job listings
- View and filter job applicants per listing
- Manage application statuses (pending, reviewed, shortlisted, rejected, hired)
- Schedule and manage interviews
- Employer profile management
- Account and notification settings

### 🔧 Admin Features
- Dashboard overview of system activity
- User management (view, soft delete/restore users)
- Job listing management
- Employer/Job Seeker verification system
- Report management

### 💬 Messaging System
- Real-time-style conversation threads between Employers and Job Seekers
- Full message history per conversation

### 🔔 Notifications
- In-app notification system
- Configurable notification settings per user

### 📄 Documents
- Job Seekers can upload and manage supporting documents (resume, certificates)
- Documents attached to job applications

---

## ⚙️ System Requirements

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 18.x & **npm** >= 9.x
- **SQLite** (default, bundled with PHP) or MySQL / PostgreSQL

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd rms
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install Node.js dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Open `.env` and adjust the following as needed:

```env
APP_NAME="RMS"
APP_URL=http://localhost:8000

# Database (SQLite is default — no extra setup needed)
DB_CONNECTION=sqlite

# Mail (use 'log' for local dev, configure SMTP for production)
MAIL_MAILER=log

# Google OAuth (required for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### 5. Run database migrations & seeders

```bash
php artisan migrate
# Optional: seed with sample data
php artisan db:seed
```

### 6. Create the storage symlink

```bash
php artisan storage:link
```

### 7. Start the development servers
**Run separately:**
```bash
# Terminal 1 – Laravel
php artisan serve

# Terminal 2 – Vite (React/CSS hot reload)
npm run dev

### 8. Open the app

```
http://127.0.0.1:8000
```

---

## 📁 Project Structure

```
rms/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/          # Login, Register, Google OAuth, OTP, Password Reset
│   │   │   ├── Admin/         # Admin-facing controllers
│   │   │   ├── Employer/      # Employer-facing controllers
│   │   │   ├── JobSeeker/     # Job Seeker-facing controllers
│   │   │   ├── Messaging/     # Conversation & message controllers
│   │   │   ├── Settings/      # Account/notification settings
│   │   │   └── NotificationController.php
│   │   ├── Middleware/
│   │   │   ├── PreventBackToAuth.php         # Adds no-cache headers
│   │   │   ├── PreventRoleMismatchAccess.php # Role guard on navigation
│   │   │   ├── EnsureProfileCompleted.php    # Redirect if profile incomplete
│   │   │   ├── CheckUserNotDeleted.php       # Soft-delete session guard
│   │   │   └── RoleMiddleware.php            # Route-level role enforcement
│   │   └── Requests/          # Form Request validation classes
│   ├── Models/
│   │   ├── User.php
│   │   ├── EmployerProfile.php
│   │   ├── JobSeekerProfile.php
│   │   ├── JobListing.php
│   │   ├── JobApplication.php
│   │   ├── Interview.php
│   │   ├── SavedJob.php
│   │   ├── Conversation.php
│   │   ├── Message.php
│   │   ├── UserDocument.php
│   │   ├── WorkExperience.php
│   │   ├── UserNotificationSettings.php
│   │   ├── UserSecuritySettings.php
│   │   └── Report.php
│   ├── Mail/                  # Mailable classes
│   ├── Notifications/         # Notification classes
│   └── Observers/             # Model observers
│
├── resources/js/
│   ├── Pages/
│   │   ├── Auth/              # Login, Register, Verify Email, etc.
│   │   ├── Admin/             # Admin dashboard, users, verifications
│   │   ├── Employer/          # Jobs, applications, interviews, settings
│   │   ├── JobSeeker/         # Browse jobs, apply, profile, saved jobs
│   │   ├── Messaging/         # Chat interface
│   │   ├── Notifications/     # Notifications page
│   │   ├── Settings/          # Account settings
│   │   └── Welcome.tsx        # Landing page
│   ├── Components/            # Reusable React components
│   ├── Layouts/               # Page layout wrappers
│   ├── hooks/
│   │   └── usePreventAuthBack.ts  # Browser history security hook
│   └── types/                 # TypeScript type definitions
│
├── database/
│   ├── migrations/            # Database schema migrations
│   ├── seeders/               # Sample data seeders
│   └── database.sqlite        # SQLite database file
│
├── routes/                    # Laravel route definitions
├── config/                    # App configuration files
└── public/                    # Publicly served files
```

## 🏗️ Production Build

```bash
# Build optimized frontend assets
npm run build

# Optional: cache Laravel config/routes for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 📝 Notes

- **Queue worker** must be running for email notifications and OTP delivery to work.
- **Google OAuth** credentials must be set in `.env` for social login to function.
- The app uses **SQLite by default** — for production, switch to MySQL or PostgreSQL by updating `DB_CONNECTION` in `.env`.
- File uploads (documents, profile photos) are stored in `storage/app/public` and served via the storage symlink.
