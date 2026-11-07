# 🧠 Brain Breakers Academy
> **Think Beyond, Learn Beyond.**  
> Abacus Learning & Competition Management System

---

## 🌟 Overview
Brain Breakers Academy is a comprehensive, production-grade educational platform engineered for abacus learning, mental arithmetic mastery, and online/offline tournament management.

---

## 🚀 Key Modules Implemented

1. **Interactive Virtual Abacus (`VirtualAbacus.tsx`)**:
   - 7-rod Japanese Soroban with authentic upper deck (heaven beads = 5) and lower deck (earth beads = 1).
   - Bead snap animations, reckoning beam unit dots, and synthetic Web Audio sound effects.
   - Real-time place value calculation ($10^0$ to $10^6$) and instant reset.

2. **Abacus & Mental Math Practice (`PracticePage.tsx`)**:
   - 4 fundamental operations: Addition ($+$), Subtraction ($-$), Multiplication ($\times$), and Division ($\div$), plus Mixed Mode.
   - 1-Digit, 2-Digit, and 3-Digit configurable problem generators.
   - Direct integration with the virtual abacus (one-click copy of bead values into problem solutions).
   - Live streak and score tracking with automatic background session recording.

3. **Flash Anzan Speed Trainer (`FlashAnzanPage.tsx`)**:
   - Rapid number sequence display from 1.2s down to 0.1s championship speed.
   - Configurable sequence length (3, 5, 10, 15 numbers) and digits (1D to 3D).
   - Audio pulse signals, mental calculation input, verification, and history breakdown.

4. **Timed Mock Examinations & Auto-Evaluation (`MockExamPage.tsx`)**:
   - Timed test simulation with countdown timer and automated submission on expiration.
   - Dynamic questions palette (answered vs unanswered trackers).
   - Instant automated grading: percentage, marks, letter grades (A+, A, B, C, D, F), and pass/fail determination.

5. **Competitions & Tournaments (`CompetitionsPage.tsx`, `OrganizerDashboard.tsx`)**:
   - Online virtual tournaments and physical/offline venue championships.
   - Student self-registration and participant capacity caps.
   - Global Hall of Fame leaderboard with medals (🥇, 🥈, 🥉) and ranking analytics.

6. **Teacher & Administration Console (`TeacherDashboard.tsx`, `MyStudents.tsx`, `AdminDashboard.tsx`, `UserManagement.tsx`)**:
   - Fast Math Parser: Create new exams by typing simple arithmetic problems.
   - Student roster management, progress inspection, and 8-level syllabus promotion.
   - User account activation/deactivation and role-based access control.

7. **8-Level Structured Abacus Syllabus (`SyllabusPage.tsx`)**:
   - Pre-seeded curriculum from Level 1 (Single Digit) through Level 8 (Master Mental Abacus).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Zustand (persisted auth), React Router v6, Recharts, Lucide Icons, React Hot Toast.
- **Backend**: Python FastAPI, SQLAlchemy 2.0 ORM, SQLite database, Pydantic v2 schemas, native bcrypt security, JWT auth.

---

## 🏃 Quick Start Guide

### 1. Backend (FastAPI)
```powershell
cd "d:\Brain Breakers\backend"
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Frontend (React + TypeScript)
```powershell
cd "d:\Brain Breakers\frontend"
npm install
npm run dev
```
- App URL: `http://localhost:5173`

---

## 🔑 Default Credentials & Role Accounts

- **Administrator**:
  - Email: `admin@brainbreakers.com`
  - Password: `Admin@1234`
- **Register new accounts**:
  - Open `/register` to create Student, Teacher, or Competition Organizer accounts instantly.

