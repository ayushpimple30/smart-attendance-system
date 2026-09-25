<div align="center">

# 🎓 Smart Attendance System

**AI-powered face recognition attendance, built for classrooms.**

Real-time face detection · Liveness check · Analytics dashboard · CSV export

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?logo=trpc&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## ✨ Features

| | |
|---|---|
| 🧑‍🎓 **Student Registration** | Capture face images via webcam, auto-generate embeddings |
| 📹 **Live Attendance** | Real-time webcam feed, face match, confidence score, timestamp |
| 🕵️ **Liveness Detection** | Blink/motion check, blocks spoofed photos |
| 🚫 **Duplicate Prevention** | One mark per student per session |
| 📊 **History & Stats** | Searchable records, per-session analytics |
| 📤 **CSV Export** | One-click export for reports |
| 🎨 **Modern UI** | React 19 + Tailwind 4, sidebar dashboard, dark mode |

---

## 🏗️ Tech Stack

**Frontend** — React 19 · TypeScript · Vite · Tailwind CSS 4 · tRPC client · WebRTC (camera)
**Backend** — Node.js · Express · tRPC · Drizzle ORM
**Database** — MySQL
**Face Recognition** — 128-D face embeddings, cosine similarity matching
**Storage** — AWS S3 (face image uploads)

---

## 📁 Project Structure

```
client/                    React frontend
  src/pages/
    RegisterStudent.tsx    Enroll student + capture face
    LiveAttendance.tsx     Real-time recognition dashboard
    AttendanceHistory.tsx  Records, filters, CSV export
    About.tsx              How it works

server/                    Backend (Express + tRPC)
  routers/attendance.ts    API endpoints
  services/faceRecognition.ts  Embedding extraction + matching
  db.ts / storage.ts       DB queries + S3 uploads

drizzle/                   Schema + migrations (students, sessions, attendance)
shared/                    Shared types between client/server
```

---

## 🗄️ Database Schema

```
students    id · studentId · name · email · embeddings (JSON) · imageCount
sessions    id · sessionName · startTime · endTime · status
attendance  id · sessionId → sessions · studentId → students
            timestamp · confidenceScore · livenessScore · faceBoundingBox
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 22+, pnpm, MySQL 8+, browser with WebRTC support

```bash
# 1. Install deps
pnpm install

# 2. Configure environment — create .env.local
DATABASE_URL=mysql://user:password@localhost:3306/attendance_db
JWT_SECRET=your-secret-key

# 3. Run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 4. Start dev server
pnpm dev
```

Open **http://localhost:3000**

---

## 🔌 API (tRPC)

| Endpoint | Purpose |
|---|---|
| `attendance.registerStudent` | Enroll new student |
| `attendance.getAllStudents` | List students |
| `attendance.createSession` | Start attendance session |
| `attendance.getActiveSession` | Fetch current session |
| `attendance.recognizeAndMarkAttendance` | Match face → mark present |
| `attendance.getSessionAttendance` | Records for one session |
| `attendance.getAllAttendance` | Full history |
| `attendance.getAttendanceStats` | Aggregate stats |
| `attendance.exportAttendanceCSV` | Export CSV |

---

## 🧠 How Recognition Works

1. Face captured → 128-dimension embedding extracted
2. New embedding compared to stored embeddings via **cosine similarity**
3. Best match above threshold + passing liveness check → attendance marked
4. Result logged with confidence score + bounding box

---

## 🤝 Contributing

Fork → branch → commit → PR. Run `pnpm test` and `pnpm check` before submitting.


