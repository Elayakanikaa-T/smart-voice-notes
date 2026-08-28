# 🎓 Smart Voice Note Application

> An AI-powered study companion that converts spoken lecture and study notes into structured notes, executive summaries, flashcard key points, adaptive quizzes, and personalized learning paths.

---

## 🚀 Key Features

- **🎙️ Voice Recording & Speech-to-Text**: In-browser microphone recording with MediaRecorder, live waveform animation, audio playback, and asynchronous AI transcription (OpenAI Whisper or Gemini Audio).
- **💼 Employee Meeting Portal**: Dedicated workspace for recording/uploading meetings, automatic speech-to-text, AI executive summaries & detailed markdown notes, decisions extraction, and action item tracking.
- **✅ Action Item & Task Tracking**: Automatically extracts task, owner, and due date with editable inline fields, cross-meeting "My Action Items" dashboard, and automated in-app + email reminders for due/overdue deliverables.
- **🔍 Full-Text Meeting Archive Search**: MongoDB text index search across transcripts, summaries, decisions, and action items with multi-field filters (date range, title, participant).
- **🛡️ Admin & Employee Portals**: Multi-role JWT authentication supporting Student, Admin, and Employee roles with real-time employee count on the admin command center.
- **📝 Structured Note & Summary Generation**: AI pipeline automatically organizes transcripts into hierarchical headings, bullet-point takeaways, vocabulary/keyword definitions, action items, and slide outlines.
- **🔍 Entity & Deadline Extraction**: Automatically recognizes exam dates, assignment deadlines, formulas, and key historical/academic entities.
- **🧠 Context-Aware AI Study Guide**: Interactive RAG-style chat companion grounded in the student's own subject material and transcripts.
- **🧪 Auto-Generated Adaptive Quizzes**: AI generates 4-option multiple choice tests with Bloom's Taxonomy categorization (Remember, Understand, Apply, Analyze, Evaluate), instant grading, and mistake analysis.
- **📈 Readiness & Progress Tracking**: Formula-driven readiness index combining quiz accuracy (50%), material coverage (30%), and study recency (20%).
- **🗺️ Personalized Learning Paths**: Ordered step-by-step milestone plans tailored to the student's weak areas and target exam dates.
- **💡 Smart Course & Topic Recommendations**: Suggests targeted revision topics and external high-quality study materials for weak areas.
- **⏰ Study Reminders**: Manage upcoming exam milestones, revision cycles, and recurrence schedules.
- **🌐 Multi-Language Support**: Support for 10+ languages with automated AI content translation.

---

## 🏗️ Architecture & Tech Stack

```
smart voice note application/
├── frontend/               # React 19 + Vite 8 + Tailwind CSS v4 + React Router
│   ├── src/
│   │   ├── components/     # AppLayout, Sidebar, ProtectedRoute, UI atoms (Button, Card, Modal, Badge, Spinner)
│   │   ├── context/        # AuthContext (JWT tokens & role permissions)
│   │   ├── hooks/          # usePolling (real-time AI pipeline progress)
│   │   ├── lib/            # Axios API client with automatic token attachment
│   │   └── pages/          # Login, StudentHome, Subjects, RecordAudio, Notes, AIGuide, Quiz, Progress, etc.
│   ├── Dockerfile
│   └── package.json
│
├── backend/                # Node.js + Express + TypeScript (Modular Architecture)
│   ├── src/
│   │   ├── config/         # Environment vars, MongoDB connection, Storage drivers
│   │   ├── models/         # 13 Mongoose Schemas (User, Subject, AudioNote, Notes, Quiz, Progress, etc.)
│   │   ├── middleware/     # JWT Auth, Zod Validation, Error handling, Rate limiting, Helmet
│   │   ├── modules/        # Feature modules (auth, notes, subjects, quizzes, ai, progress, reminders, etc.)
│   │   ├── services/ai/    # Swappable AI Providers (OpenAI, Google Gemini, Mock) + BullMQ Workers
│   │   └── swagger/        # OpenAPI documentation UI
│   ├── tests/              # Jest + Supertest test suites
│   ├── Dockerfile
│   └── package.json
│
├── infra/                  # Docker Compose orchestration (MongoDB + Redis + Backend + Frontend)
└── README.md
```

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7 |
| **Backend** | Node.js (v20+), Express, TypeScript, Zod, Helmet, Morgan |
| **Database** | MongoDB (Mongoose ODM) with fallback in-memory cache |
| **AI Providers** | OpenAI (GPT-4o-mini, Whisper) & Google Gemini (1.5 Flash), Swappable Provider interface |
| **Async Pipeline** | BullMQ & Redis (with event-driven in-process fallback) |
| **Auth** | JWT (Access + Refresh Token rotation), bcrypt.js password hashing |
| **Storage** | Local disk storage (`./uploads`) or AWS S3 Presigned URLs |

---

## 📦 Data Model (Mongoose Schemas)

1. **`User`**: `name`, `email`, `password_hash`, `role`, `preferred_language`, `theme_pref`, `settings`
2. **`Subject`**: `user_id`, `name`, `description`, `color`, `note_count`, `is_archived`
3. **`AudioNote`**: `user_id`, `subject_id`, `title`, `audio_url`, `duration_seconds`, `status` (`recording` → `uploaded` → `transcribing` → `processing` → `ready` → `failed`)
4. **`Transcript`**: `note_id`, `user_id`, `raw_text`, `language`, `confidence`, `segments:[{start, end, text, speaker}]`
5. **`Notes`**: `audio_note_id`, `user_id`, `structured_notes_text`, `sections:[{heading, level, content, bullet_points}]`
6. **`KeyPoints`**: `audio_note_id`, `key_points`, `detected_dates:[{date_string, context, is_exam_or_deadline}]`, `detected_entities:[{name, category}]`
7. **`AIGuideSession`**: `user_id`, `audio_note_id`, `subject_id`, `messages:[{role, content, timestamp}]`
8. **`Quiz`**: `user_id`, `subject_id`, `questions:[{question, options, correct_answer, correct_index, explanation, difficulty, bloom_level}]`
9. **`QuizResult`**: `quiz_id`, `user_id`, `score`, `answers:[{question_id, selected_answer, is_correct}]`, `weak_topics`, `analysis_summary`
10. **`Progress`**: `user_id`, `subject_id`, `readiness_score`, `quiz_accuracy_avg`, `material_coverage_pct`, `weak_topics`
11. **`Reminder`**: `user_id`, `subject_id`, `title`, `due_date`, `recurrence`, `notification_channels`
12. **`Recommendation`**: `user_id`, `recommended_topics`, `recommended_courses:[{title, reason, link}]`
13. **`LearningPath`**: `user_id`, `subject_id`, `ordered_steps:[{order, topic, description, resource_type, status}]`

---

## ⚡ Quickstart (Local Development)

### 1. Prerequisites
- Node.js v20+ installed
- MongoDB running locally on port 27017 or MongoDB Atlas URI

### 2. Run Full-Stack (Frontend + Backend Together)
You can now start both servers with a single command from the project root:

```bash
# From the root directory:
npm run dev
```

This starts:
- **Backend API (Node/Express)**: `http://localhost:5000/api/v1`
- **Frontend App (React/Vite)**: `http://localhost:5173`
- **Swagger Documentation**: `http://localhost:5000/api-docs`
- **API Health Check**: `http://localhost:5000/health`

---

### 3. Running Services Individually (Optional)

#### Backend:
```bash
cd backend
npm run dev
```

#### Frontend:
```bash
cd frontend
npm run dev
```

The Web Application will be live at `http://localhost:5173`.

---

## 🐳 Docker Compose Deployment

Run the entire full-stack application (MongoDB, Redis, API, and Frontend) in isolated containers:

```bash
cd infra
docker compose up --build -d
```

- **Frontend App**: `http://localhost`
- **Backend API**: `http://localhost:5000/api/v1`
- **Swagger API Docs**: `http://localhost:5000/api-docs`
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

---

## ☁️ Cloud Deployment Guide

### Option 1: Render / Railway (PaaS)
1. **Database**: Provision a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and obtain your `MONGODB_URI`.
2. **Backend API**:
   - Create a Web Service pointing to `/backend`.
   - Set environment variables:
     - `MONGODB_URI`: `<Atlas Connection String>`
     - `JWT_ACCESS_SECRET`: `<Random 32+ character string>`
     - `JWT_REFRESH_SECRET`: `<Random 32+ character string>`
     - `LLM_PROVIDER`: `gemini` or `openai`
     - `GEMINI_API_KEY` / `OPENAI_API_KEY`: `<Your API key>`
     - `STORAGE_DRIVER`: `local` or `s3`
3. **Frontend**:
   - Create a Static Site pointing to `/frontend`.
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://<your-backend-url>/api/v1`

### Option 2: AWS (ECS Fargate + S3)
- Use `/infra/docker-compose.yml` or Amazon ECS task definitions with AWS ECR images.
- Set `STORAGE_DRIVER=s3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `S3_BUCKET_NAME` for cloud audio persistence.
