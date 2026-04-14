# AI-Powered Learning Assistant

Turn your PDFs into an **interactive learning experience** with:
- Document-aware **AI chat**
- Auto-generated **flashcards**
- Auto-generated **quizzes**
- **Summaries**
- A simple **progress dashboard**

> Backend: `Express + MongoDB + JWT` • AI: `Google Gemini` (basic RAG) • Uploads: `Cloudinary` • Frontend: `React 19 + Vite + TailwindCSS`

## ⚡ Key Features

- **Authentication**: register/login, profile, change password (JWT Bearer token)
- **PDF documents**
  - Upload PDFs (Multer) and store them on Cloudinary
  - Extract text from PDFs and split into chunks for context-aware Q&A
  - View PDFs directly in the UI (iframe)
- **AI learning (Gemini)**
  - Generate flashcards (configurable count)
  - Generate multiple-choice quizzes
  - Generate document summaries
  - Chat with document context (basic RAG: retrieves relevant chunks before answering)
  - Explain a concept based on document content
- **Flashcards**
  - Persist flashcard sets in MongoDB
  - Star cards and track reviews
- **Quizzes**
  - Save quizzes per document
  - Submit answers and view results
- **Progress**
  - Dashboard endpoint for basic learning stats

## 🛠️ Tech Stack

### Backend
- **Node.js + Express 5**
- **MongoDB + Mongoose**
- **JWT** auth (`Authorization: Bearer <token>`)
- **@google/genai** (Google Gemini) for AI features
- **pdf-parse** for text extraction
- **Multer** for uploads
- **Cloudinary** for PDF storage

### Frontend
- **React 19** + **Vite**
- **React Router**
- **TailwindCSS 4**
- **Axios**
- **react-markdown + remark-gfm**
- **react-hot-toast**

## 🧱 Architecture Overview

- **API prefix**: `/v1/api/*`
- **Development**: frontend calls backend at `http://localhost:8000/v1`
- **Production**: backend serves the frontend build from `frontend/ai-learning-assistant/dist` and uses `/v1`

Upload & processing flow:
1. Client uploads a PDF → `POST /v1/api/documents/upload`
2. Backend uploads the file to Cloudinary and creates a Document with status `processing`
3. Backend extracts text + creates chunks (background) → updates status to `ready`
4. AI features (chat/flashcards/quiz/summary) work only when the Document is `ready`

Basic RAG used in chat:
- **Retrieve**: select a few most relevant chunks from the document for the user’s question
- **Augment**: build a prompt that includes those chunks as context
- **Generate**: Gemini produces the final answer grounded in that context

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS recommended)
- MongoDB (local or Atlas)
- Cloudinary account
- Google Gemini API key

### Install & Run (Dev)

#### 1) Backend

```bash
cd backend
npm install
```

Create env file:
- Copy `backend/.env.example` → `backend/.env`

Run:

```bash
npm run dev
```

Backend runs on `http://localhost:8000` by default.

#### 2) Frontend

```bash
cd frontend/ai-learning-assistant
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## 📦 Environment Variables

### Backend (`backend/.env`)

Create from `backend/.env.example`.

- **MONGO_URI**: MongoDB connection string
- **PORT**: backend port (default 8000)
- **JWT_SECRET**: JWT signing secret
- **JWT_EXPIRE**: token expiry (e.g. `7d`)
- **NODE_ENV**: `development` or `production`
- **MAX_FILE_SIZE**: upload limit (bytes)
- **GEMINI_API_KEY**: Google Gemini API key
- **CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET**: Cloudinary config

### Frontend (optional)

You can override API base URLs:
- **VITE_API_BASE_URL**: axios base URL (e.g. `http://localhost:8000/v1`)
- **VITE_API_URL**: used by the PDF viewer in some places (e.g. `http://localhost:8000`)

> If not set, the frontend defaults to `http://localhost:8000/v1` in dev and `/v1` in production.

## 🧩 API Endpoints (Summary)

All routes below use the `/v1` prefix.

### Auth (`/api/auth`)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (protected)
- `PUT /api/auth/profile` (protected)
- `POST /api/auth/change-password` (protected)

### Documents (`/api/documents`) (protected)
- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/:id`
- `DELETE /api/documents/:id`

### AI (`/api/ai`) (protected)
- `POST /api/ai/generate-flashcards`
- `POST /api/ai/generate-quiz`
- `POST /api/ai/generate-summary`
- `POST /api/ai/chat`
- `POST /api/ai/explain-concept`
- `GET /api/ai/chat-history/:documentId`

### Flashcards (`/api/flashcards`) (protected)
- `GET /api/flashcards`
- `GET /api/flashcards/:documentId`
- `POST /api/flashcards/:cardId/review`
- `PUT /api/flashcards/:cardId/star`
- `DELETE /api/flashcards/:id`

### Quizzes (`/api/quizzes`) (protected)
- `GET /api/quizzes/:documentId`
- `GET /api/quizzes/quiz/:id`
- `POST /api/quizzes/:id/submit`
- `GET /api/quizzes/:id/results`
- `DELETE /api/quizzes/:id`

### Progress (`/api/progress`) (protected)
- `GET /api/progress/dashboard`

## 🧪 Useful Scripts

### Root
- `npm run build`: installs deps for backend + frontend and builds the frontend
- `npm run start`: starts the backend (serves API + frontend build when `NODE_ENV=production`)

### Backend
- `npm run dev`: nodemon dev server
- `npm start`: production start

### Frontend
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## 🛠️ Troubleshooting

- **CORS issues in dev**
  - Backend allows `http://localhost:3000` and `http://localhost:5173`. Make sure you run the frontend on the correct port.
- **PDF upload fails**
  - Check `MAX_FILE_SIZE`
  - Verify Cloudinary credentials
- **AI features not working**
  - Verify `GEMINI_API_KEY` and quota
  - If you get 429/quota errors, try again later
- **MongoDB connection errors**
  - Check `MONGO_URI` and Atlas IP allowlist (if applicable)

## 🔐 Security Notes

- **Never commit `.env`** files.
- If any secret was ever pushed, **rotate** it (MongoDB credentials, JWT secret, Gemini API key, Cloudinary secret).

## 📄 License

MIT (see `LICENSE`).
