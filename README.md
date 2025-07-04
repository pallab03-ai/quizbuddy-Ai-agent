# QuizBuddy

A modern quiz platform with AI-powered quiz generation, role-based dashboards, and robust result management.

## Features

- **User & Admin Roles:** Secure login, registration, and role-based dashboards.
- **Quiz Generation:**
  - Manual quiz creation (admin only)
  - AI-powered quiz generation (admin only, via NVIDIA API)
  - Unique quiz codes for sharing
- **Quiz Taking:** Users can join quizzes by code and submit answers.
- **Result Review:**
  - Users: See detailed results for their attempts
  - Admins: View all student attempts and results for any quiz
- **Profile Page:** View user ID, email, and log out
- **AI Chat:** (Optional) Chat with AI for quiz explanations
- **Modern UI:** Responsive, clean, and user-friendly

## Tech Stack

- **Frontend:** React, React Router, CSS Modules
- **Backend:** Node.js, Express, PostgreSQL
- **AI Agent:** FastAPI (Python), NVIDIA/LLM via LangChain

## Folder Structure

```
/ (root)
  frontend/         # React app
    src/pages/      # All main pages (Login, Register, Quiz, Result, Dashboards, Profile, etc.)
    src/api.js      # API helper
  apps/
    backend/        # Node.js/Express backend
      src/
        controllers/
        routes/
        services/
        middleware/
    ai-agent/       # FastAPI Python AI agent
      main.py       # AI quiz/chat logic
      test_nvidia_key.py # NVIDIA API test script
  database/
    schema.sql      # PostgreSQL schema
```

## Setup Instructions

### 1. Database

- Install PostgreSQL and create a database (e.g., `quizbuddy`)
- Run the SQL in `database/schema.sql` to set up tables

### 2. Backend (Node.js/Express)

```bash
cd apps/backend
npm install
# Create a .env file with DB connection and JWT secret
npm start
```

### 3. AI Agent (Python/FastAPI)

```bash
cd apps/ai-agent
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
# Create a .env file with NVIDIA_API_KEY and NVIDIA_BASE_URL
uvicorn main:app --reload --port 8001
```

### 4. Frontend (React)

```bash
cd frontend
npm install
npm start
```

## Environment Variables

- **Backend:**
  - `DATABASE_URL` (Postgres connection string)
  - `JWT_SECRET`
- **AI Agent:**
  - `NVIDIA_API_KEY`
  - `NVIDIA_BASE_URL` (default: https://integrate.api.nvidia.com/v1)

## Usage

- Register as user or admin
- Admins: Create quizzes manually or with AI, share quiz code
- Users: Join quizzes by code, submit answers, view results
- Admins: View all attempts/results for any quiz
- All: View profile and log out

## Troubleshooting

- If AI quiz generation fails, check the AI agent terminal for errors
- Ensure all .env variables are set and correct
- Make sure all services (backend, AI agent, frontend) are running

## License

MIT
