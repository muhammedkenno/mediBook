# MediBook — AI-Based Hospital Appointment & Disease Prediction System

**Graduation Project | Full-Stack Web Application with AI Integration**

---

## 1. Project Overview

MediBook is an intelligent hospital appointment booking system that uses machine learning to guide patients to the right doctor. Instead of navigating confusing specialty lists, a patient simply types their symptoms in plain language. The AI analyses the text, predicts the likely disease, identifies whether the case is an emergency, and recommends the correct medical specialty. The patient can then instantly book an appointment with an available doctor in that specialty.

Hospital administrators access a separate, protected dashboard where they can view all appointments, update their status (pending / confirmed / cancelled), and monitor key statistics such as total bookings and emergency flag counts.

### Key Features

- **AI Symptom Checker** — Hybrid model combining machine learning with medical rule-based logic
- **Emergency Detection** — Automatically flags critical symptoms (chest pain, stroke, paralysis) and blocks non-urgent booking
- **Smart Doctor Matching** — Filters the doctor list by the AI-recommended specialty
- **Full Booking Flow** — Doctor selection, date and time picker, appointment confirmation
- **Admin Dashboard** — Appointment management, status updates, and usage statistics
- **Secure Authentication** — Email/password login with role-based access control (patient vs. admin)

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) + TypeScript | Patient UI, admin dashboard, server-side rendering |
| **Styling** | Tailwind CSS v4 + Shadcn UI | Component library and design system |
| **AI Microservice** | FastAPI (Python) | Exposes the ML models as a REST API |
| **Machine Learning** | Scikit-learn + Joblib | Disease prediction and specialty recommendation |
| **Database** | Supabase (PostgreSQL) | Appointments, doctors, triage logs |
| **Authentication** | Supabase Auth | Email/password login, session management, RLS |

### AI Models

Two pre-trained scikit-learn models are used:

- `final_disease_model.pkl` — Predicts the likely disease from symptom text
- `final_specialty_model.pkl` — Recommends the correct medical specialty

Both models use a text-based pipeline. Input is plain-language symptom text; output is a structured JSON prediction. The triage engine adds rule-based emergency and infectious-disease detection on top of the ML output.

---

## 3. Project Structure

```
AI-Based Hospital Appointment & Disease Prediction System/
│
├── AI_Engine_Ready/              # Pre-trained models and inference engine
│   ├── final_disease_model.pkl
│   ├── final_specialty_model.pkl
│   └── triage_engine.py
│
├── ai-service/                   # FastAPI backend (Python)
│   ├── app/
│   │   ├── main.py               # API server + model loading
│   │   └── schemas.py            # Request/response types
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                     # Next.js frontend (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── check-symptoms/   # AI symptom checker
│   │   │   ├── book/             # Booking flow
│   │   │   ├── login/            # Sign in
│   │   │   ├── signup/           # Register
│   │   │   └── admin/            # Admin dashboard (protected)
│   │   ├── lib/
│   │   │   ├── supabase-client.ts
│   │   │   ├── supabase-server.ts
│   │   │   └── triage.ts         # AI service fetch wrapper
│   │   └── types/index.ts
│   └── .env.local.example
│
└── supabase/
    └── schema.sql                # Database tables, RLS policies, seed data
```

---

## 4. Installation & Local Setup

### Prerequisites

- Node.js 20 or later
- Python 3.10 or later (with `py` launcher on Windows)
- A free Supabase account at [supabase.com](https://supabase.com)

### Step 1 — Clone or download the project

```bash
# If using Git
git clone <your-repo-url>
cd "AI-Based Hospital Appointment & Disease Prediction System"
```

### Step 2 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, open the **SQL Editor**.
3. Paste the entire contents of `supabase/schema.sql` and click **Run**.
   This creates all tables, security policies, and seeds 10 sample doctors.
4. Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key
   - **service_role** key

### Step 3 — Configure the frontend environment

```bash
cd frontend
copy .env.local.example .env.local
```

Open `frontend/.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4 — Install frontend dependencies

> **Windows note:** The project directory name contains special characters that confuse Node.js.
> Create a simple shortcut path first (run once in PowerShell as administrator):
>
> ```powershell
> cmd /c "mklink /J C:\medibook-frontend ""C:\AI-Based Hospital Appointment & Disease Prediction System\frontend"""
> ```

```bash
# Use the junction path on Windows
cd C:\medibook-frontend
npm install
```

### Step 5 — Install AI service dependencies

```bash
cd ai-service
py -m pip install -r requirements.txt
```

### Step 6 — Run the project (three terminals)

**Terminal 1 — AI microservice:**

```bash
cd ai-service
py -m uvicorn app.main:app --reload --port 8000
```

You should see: `Application startup complete.`
Test it: open `http://localhost:8000/docs` in your browser (auto-generated API docs).

**Terminal 2 — Next.js frontend:**

```bash
cd C:\medibook-frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

### Step 7 — Create an admin account

1. Go to `http://localhost:3000/signup` and register a new account.
2. In the Supabase dashboard, open **Table Editor → profiles**.
3. Find your user row and change the `role` column from `patient` to `admin`.
4. Sign in again at `http://localhost:3000/login` — you will be redirected to the admin dashboard.

---

## 5. How to Use the System

### Patient Flow

1. **Visit the homepage** at `http://localhost:3000`
2. Click **"Check my symptoms"**
3. Type your symptoms in plain English in the text box (e.g., *"I have had a fever for three days, persistent cough, and I feel very tired"*)
4. Click **"Check symptoms"**
5. The AI returns:
   - **Likely condition** — the predicted disease
   - **Recommended specialist** — the medical specialty you should visit
   - **Badges** — Emergency, Infectious, or Non-urgent
6. If the result shows **Emergency**, a red warning is displayed — call emergency services immediately and do not book an appointment online.
7. If the result is non-urgent, click **"Book appointment"** — this takes you directly to the doctors filtered by the recommended specialty.
8. Select a doctor, choose a date and time slot, add optional notes, and click **"Confirm appointment"**.
9. A confirmation screen shows your appointment reference number.

### Admin Flow

1. Sign in with an admin account at `http://localhost:3000/login`
2. You are redirected to `/admin/dashboard` which shows:
   - Total appointments, pending count, confirmed count, cancellation count
   - Emergency flag count (AI-detected emergencies)
   - Five most recent bookings
3. Click **"Appointments"** in the top navigation to see the full list
4. Use the status dropdown in each row to change an appointment from **Pending** to **Confirmed** or **Cancelled** — the change saves instantly
5. Click **"Sign out"** when finished

---

## 6. API Reference (AI Microservice)

The FastAPI service runs at `http://localhost:8000`. Interactive documentation is available at `http://localhost:8000/docs`.

### Health Check

```
GET /health
```

Response:
```json
{ "status": "ok", "models_loaded": true }
```

### Predict

```
POST /predict
Content-Type: application/json

{ "symptoms": "fever cough fatigue" }
```

Response:
```json
{
  "user_symptoms": "fever cough fatigue",
  "predicted_disease": "Bronchial Asthma",
  "recommended_specialty": "Respiratory",
  "is_emergency": "No",
  "is_infectious": "No"
}
```

Emergency example:
```json
{
  "user_symptoms": "chest pain crushing pain left arm",
  "predicted_disease": "Hypertension",
  "recommended_specialty": "Emergency",
  "is_emergency": "Yes",
  "is_infectious": "No"
}
```

---

*Built with Next.js, FastAPI, Supabase, and Scikit-learn.*
