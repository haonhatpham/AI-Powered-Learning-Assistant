# AI-Powered Learning Assistant

Ứng dụng giúp bạn **upload PDF → trích xuất nội dung → học tương tác** với:
- Chat hỏi đáp theo ngữ cảnh tài liệu
- Tạo **flashcards** tự động
- Tạo **quiz trắc nghiệm** tự động
- Tạo **tóm tắt** tự động
- Theo dõi tiến độ học tập (dashboard)

> Backend: `Express + MongoDB + JWT` • AI: `Google Gemini` • Upload: `Cloudinary` • Frontend: `React 19 + Vite + TailwindCSS`

## ⚡ Tính năng chính

- **Xác thực người dùng**: đăng ký/đăng nhập, profile, đổi mật khẩu (JWT Bearer token)
- **Quản lý tài liệu PDF**
  - Upload PDF (Multer) và lưu file trên Cloudinary
  - Trích xuất text từ PDF và chia đoạn (chunk) để phục vụ chat theo ngữ cảnh
  - Xem PDF trực tiếp trong UI (iframe)
- **AI học tập (Gemini)**
  - Tạo flashcards theo số lượng yêu cầu
  - Tạo quiz trắc nghiệm
  - Tóm tắt tài liệu
  - Chat theo ngữ cảnh các đoạn liên quan trong tài liệu
  - Giải thích khái niệm dựa trên nội dung tài liệu
- **Flashcards**
  - Lưu bộ thẻ vào MongoDB
  - Đánh dấu sao (star), ghi nhận review
- **Quizzes**
  - Lưu quiz theo tài liệu
  - Submit và xem kết quả
- **Progress dashboard**
  - Tổng quan tiến độ (API dashboard)

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js + Express 5**
- **MongoDB + Mongoose**
- **JWT** cho auth (`Authorization: Bearer <token>`)
- **@google/genai** (Google Gemini) cho AI features
- **pdf-parse** để trích xuất text từ PDF
- **Multer** nhận file upload
- **Cloudinary** lưu file PDF online

### Frontend
- **React 19** + **Vite**
- **React Router** cho routing
- **TailwindCSS 4** cho UI
- **Axios** cho gọi API
- **react-markdown + remark-gfm** cho hiển thị nội dung dạng markdown
- **react-hot-toast** cho thông báo

## 🧱 Kiến trúc & luồng hoạt động

- **API prefix**: `/v1/api/*`
- **Dev**: frontend gọi trực tiếp backend qua `http://localhost:8000/v1`
- **Production**: backend serve luôn build của frontend (`frontend/ai-learning-assistant/dist`) và dùng base path `/v1`

Luồng upload và xử lý PDF:
1. Client upload PDF → `POST /v1/api/documents/upload`
2. Backend upload file lên Cloudinary, tạo Document với trạng thái `processing`
3. Backend trích xuất text + tạo chunks (background) → cập nhật Document sang `ready`
4. Các tính năng AI (chat/flashcards/quiz/summary) chỉ hoạt động khi Document `ready`

## 🚀 Bắt đầu nhanh

### Yêu cầu
- Node.js (khuyến nghị LTS)
- MongoDB (local hoặc MongoDB Atlas)
- Cloudinary account
- Google Gemini API key

### Cài đặt

Clone repo và cài dependencies cho cả backend + frontend.

#### 1) Backend

```bash
cd backend
npm install
```

Tạo file env:
- Copy `backend/.env.example` → `backend/.env`

Chạy dev:

```bash
npm run dev
```

Backend mặc định chạy ở `http://localhost:8000`.

#### 2) Frontend

```bash
cd frontend/ai-learning-assistant
npm install
npm run dev
```

Frontend mặc định ở `http://localhost:5173`.

## 📦 Biến môi trường

### Backend (`backend/.env`)

Tạo từ `backend/.env.example`.

- **MONGO_URI**: chuỗi kết nối MongoDB
- **PORT**: port backend (mặc định 8000)
- **JWT_SECRET**: secret để ký JWT
- **JWT_EXPIRE**: thời hạn token (ví dụ `7d`)
- **NODE_ENV**: `development` hoặc `production`
- **MAX_FILE_SIZE**: giới hạn upload (bytes)
- **GEMINI_API_KEY**: API key của Google Gemini
- **CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET**: cấu hình Cloudinary

### Frontend (tuỳ chọn)

Frontend có thể cấu hình base URL qua env:
- **VITE_API_BASE_URL**: base URL cho axios (ví dụ `http://localhost:8000/v1`)
- **VITE_API_URL**: (một số nơi dùng để dựng URL xem PDF), ví dụ `http://localhost:8000`

> Nếu không set, frontend sẽ tự dùng `http://localhost:8000/v1` khi dev và `/v1` khi production.

## 🧩 API endpoints (tóm tắt)

Tất cả endpoint dưới đây dùng prefix `/v1`.

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

## 🧪 Scripts hữu ích

### Root
- `npm run build`: cài deps backend + frontend và build frontend
- `npm run start`: chạy backend (dùng để serve API + frontend build khi `NODE_ENV=production`)

### Backend
- `npm run dev`: chạy với nodemon
- `npm start`: chạy production

### Frontend
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## 🛠️ Troubleshooting

- **CORS lỗi khi dev**
  - Backend cho phép origin `http://localhost:3000` và `http://localhost:5173`. Hãy đảm bảo bạn chạy frontend đúng port.
- **Upload PDF thất bại**
  - Kiểm tra `MAX_FILE_SIZE`
  - Kiểm tra cấu hình Cloudinary và quyền truy cập
- **AI không hoạt động**
  - Kiểm tra `GEMINI_API_KEY` hợp lệ và còn quota
  - Nếu bị 429/quota: thử lại sau
- **MongoDB không kết nối được**
  - Kiểm tra `MONGO_URI` và IP allowlist (nếu dùng Atlas)

## 🔐 Bảo mật (khuyến nghị)

- **Không commit file `.env`** lên repo.
- Nếu `.env`/secret đã từng bị lộ, hãy **rotate** các key (MongoDB credentials, JWT secret, Gemini API key, Cloudinary secret) ngay.

## 📄 License

MIT (xem `LICENSE`).
