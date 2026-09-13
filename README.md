# traCO2 — The Carbon Footprint Tracking System

**Every Watt. Every Mile. Where Data Meets Sustainability.**

traCO2 is a carbon footprint tracking platform that enables users to measure, understand, and reduce their greenhouse gas emissions across electricity, transport, food, waste, and water.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| Frontend | React (Vite) + TailwindCSS | Single-page application with responsive UI, Recharts visualizations |
| Backend | Node.js + Express | RESTful API with structured routing and error handling |
| Database | SQLite (`node:sqlite` built-in) | File-based, zero-config relational store at `backend/data/traco2.db` |
| Authentication | JWT + bcrypt | Access tokens + refresh token flow, role separation (Users vs Admins) |
| Bill Parsing | Python Subprocess (`pdf_parser.py`) | Child process extracting electricity units consumed from PDF bills |

---

## Project Structure

```
traCo2--The-Carbon-Footprint-Tracking-System/
├── backend/
│   ├── src/
│   │   ├── app.js               # Express application configuration
│   │   ├── server.js            # Server entry point (port 5000)
│   │   ├── db/
│   │   │   ├── schema.sql       # SQLite DDL (10 core tables)
│   │   │   ├── index.js         # node:sqlite database client wrapper
│   │   │   └── seed.js          # Seed script (factors, badges, admin, demo user)
│   │   ├── lib/
│   │   │   ├── co2Calculator.js # Carbon factor lookup & CO2e calculation
│   │   │   ├── pdfBillParser.js # Child process wrapper for pdf_parser.py
│   │   │   ├── recommendations.js # Rule-based period-over-period insights
│   │   │   └── badgeChecker.js  # Automated badge eligibility evaluator
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification (verifyToken, verifyAdmin)
│   │   │   └── upload.js        # Multer disk storage for avatars & PDF bills
│   │   └── routes/
│   │       ├── auth.js          # /api/auth (register, login, refresh, logout)
│   │       ├── admin-auth.js    # /api/admin/auth/login
│   │       ├── user.js          # /api/user/profile (view, edit, avatar)
│   │       ├── emissions.js     # /api/emissions (electricity, transport, food, waste, water)
│   │       ├── dashboard.js     # /api/dashboard (totals, breakdown, trend, score)
│   │       ├── device.js        # /api/device (registration & status)
│   │       ├── reports.js       # /api/reports & CSV export
│   │       ├── recommendations.js # /api/recommendations
│   │       ├── rewards.js       # /api/rewards (badges, credits, challenges)
│   │       └── admin/           # Admin panel APIs (dashboard, users, devices, sensor data, carbon factors, rewards)
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Routes & navigation
│   │   ├── main.jsx             # React DOM root & React Query provider
│   │   ├── api/                 # Axios API clients for all backend endpoints
│   │   ├── context/             # AuthContext (user state & session tokens)
│   │   ├── components/          # Layout, ProtectedRoute, AdminRoute, StatCard, Toast, etc.
│   │   └── pages/
│   │       ├── auth/            # Login, Register, ForgotPassword
│   │       ├── Dashboard.jsx    # Emissions overview, trend chart, breakdown, score
│   │       ├── TrackEmission.jsx# 5-category entry forms + PDF bill upload
│   │       ├── MyDevice.jsx     # Device registration & hardware placeholder (v2)
│   │       ├── Reports.jsx      # Historical analytics & CSV report export
│   │       ├── Recommendations.jsx # Actionable reduction suggestions
│   │       ├── Rewards.jsx      # Badges, credits, active challenges
│   │       ├── Profile.jsx      # Profile settings & defaults
│   │       └── admin/           # Admin Dashboard, Users, Devices, Sensor Data, Carbon Factors, Rewards
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── pdf_parser.py                # Python utility for parsing electricity bill PDFs
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v22.5+ or v24+
- Python 3.x with `PyPDF2` (for electricity bill PDF parsing)

### 1. Backend Setup

```bash
cd backend
npm install
node --experimental-sqlite src/db/seed.js
node --experimental-sqlite src/server.js
```
The backend API starts on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The React web app starts on `http://localhost:5173`.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| User | `demo@traco2.local` | `User@1234` |
| Admin | `admin@traco2.local` | `Admin@1234` |

---

## Hardware Integration (Future Scope)

The hardware ingestion pipeline (ESP32 with LDR electricity pulse counting and GPS vehicle tracking) is designed for direct REST ingestion via `POST /api/device/data`. In the current MVP version:
- Users can register hardware devices by entering their device code in the **My Device** page.
- Live hardware telemetry ingestion is scheduled for the v2 release; the placeholder UI and metadata structure are fully wired.
