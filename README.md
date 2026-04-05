# 🎥 VideoSense — Video Upload, Sensitivity Processing & Streaming App

A full-stack application that enables users to upload videos, processes them for content sensitivity analysis using a real-time pipeline, and provides seamless HTTP range-based video streaming.

---

## 🏗️ Architecture Overview

```
video-app/
├── backend/                  # Node.js + Express + MongoDB
│   ├── models/
│   │   ├── User.js           # User schema with RBAC
│   │   └── Video.js          # Video schema with sensitivity fields
│   ├── routes/
│   │   ├── auth.js           # Register, Login, /me
│   │   ├── videos.js         # Upload, Stream, CRUD, Sensitivity
│   │   └── users.js          # Admin user management
│   ├── middleware/
│   │   ├── auth.js           # JWT verification + RBAC middleware
│   │   └── upload.js         # Multer config with user isolation
│   ├── utils/
│   │   └── sensitivityAnalysis.js  # AI sensitivity pipeline (simulated)
│   └── server.js             # Express + Socket.io server entry
│
└── frontend/                 # React + Vite
    └── src/
        ├── context/
        │   ├── AuthContext.jsx    # Global auth state
        │   └── SocketContext.jsx  # Real-time socket events
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   └── ProcessingCard.jsx  # Floating real-time progress
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx      # Stats + recent videos
            ├── Upload.jsx         # Drag & drop upload
            ├── Library.jsx        # Video grid with filters
            ├── VideoPlayer.jsx    # Streaming player + sensitivity report
            └── Users.jsx          # Admin user management
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ (LTS recommended): https://nodejs.org
- **MongoDB** v6+ running locally: https://www.mongodb.com/try/download/community
- **Git**

Verify installations:
```bash
node --version    # Should show v18+
npm --version     # Should show 9+
mongod --version  # Should show v6+
```

---

## 🚀 Local Setup — Step by Step

### Step 1: Clone / Extract the Project

```bash
# If using git
git clone <your-repo-url>
cd video-app

# Or extract the zip and navigate to the folder
cd video-app
```

---

### Step 2: Start MongoDB

**On macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**On Ubuntu/Linux:**
```bash
sudo systemctl start mongod
```

**On Windows:**
```bash
# Start MongoDB service from Services panel
# OR run manually:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**Verify MongoDB is running:**
```bash
mongosh
# You should see a MongoDB shell. Type `exit` to quit.
```

---

### Step 3: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` file** (open in any text editor):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videosensitivity
JWT_SECRET=change_this_to_a_strong_secret_key_123!
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=524288000
NODE_ENV=development
```

> ⚠️ Change `JWT_SECRET` to any random string in production.

**Start the backend server:**
```bash
# Development mode (auto-restart on changes)
npm run dev

# OR production mode
npm start
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

---

### Step 4: Setup Frontend

Open a **new terminal window/tab** (keep backend running):

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 5: Open the App

Open your browser and go to:
```
http://localhost:5173
```

---

## 👤 Creating Your First Account

1. Click **Register** on the login page
2. Fill in your name, email, password
3. Choose a **role**:
   - `viewer` — Can only watch videos
   - `editor` — Can upload and manage videos  
   - `admin` — Full access including user management
4. Set an **organisation** name (e.g., `my-company`)
5. Click **Create Account**

> 💡 Tip: Create one `admin` account first to access all features.

---

## 🎯 Complete User Journey

### 1. Upload a Video (Editor/Admin)
- Go to **Upload** page
- Drag & drop a video file or click to browse
- Supported formats: MP4, MOV, AVI, MKV, WebM (max 500MB)
- Add title, description, category, tags
- Click **Upload & Analyze**

### 2. Watch Real-Time Processing
- A floating card appears in the bottom-right corner
- Progress updates in real-time via WebSocket
- Steps: Frame extraction → Content scanning → Score generation → Report

### 3. View Results
- Go to **Library** to see all your videos
- Filter by status: Safe ✅ / Flagged ⚠️ / Processing ⚙️
- Click a video to see the full **Sensitivity Report**

### 4. Stream Video
- Safe videos can be played directly in the browser
- Uses HTTP Range Requests for efficient seeking/streaming
- Flagged videos can be viewed by Admins only

### 5. Manage Users (Admin)
- Go to **Users** page
- Change user roles in real-time
- Deactivate users when needed

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Videos
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/videos/upload` | Editor/Admin | Upload video |
| GET | `/api/videos` | All | List videos (filtered) |
| GET | `/api/videos/:id` | All | Get single video |
| GET | `/api/videos/:id/stream` | All | Stream video (range support) |
| PUT | `/api/videos/:id` | Editor/Admin | Update metadata |
| DELETE | `/api/videos/:id` | Editor/Admin | Delete video |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| PUT | `/api/users/:id/role` | Update user role |
| DELETE | `/api/users/:id` | Deactivate user |

---

## 🔐 Role-Based Access Control

| Feature | Viewer | Editor | Admin |
|---------|--------|--------|-------|
| Watch safe videos | ✅ | ✅ | ✅ |
| Upload videos | ❌ | ✅ | ✅ |
| Delete own videos | ❌ | ✅ | ✅ |
| View flagged content | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View all org videos | ❌ | ❌ | ✅ |

---

## 🧠 Sensitivity Analysis Pipeline

The pipeline runs automatically after each upload:

1. **Upload Validation** — File type, size, MIME type check
2. **Storage** — Saved to `uploads/<userId>/<uuid>.<ext>` for isolation
3. **Processing** — 10-step simulated analysis (800ms each ≈ 8 seconds total)
4. **Scoring** — 4 categories scored 0–100: Violence, Adult, Hate, Spam
5. **Classification** — Score > 50 in any category = **Flagged**, otherwise **Safe**
6. **Real-Time Updates** — Each step emitted via Socket.io to the uploader

> To integrate a real AI API (e.g., Google Video Intelligence, AWS Rekognition),
> replace the `simulateSensitivityAnalysis` function in `backend/utils/sensitivityAnalysis.js`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Runtime | Node.js (LTS) |
| Backend Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Real-Time | Socket.io |
| Authentication | JWT (jsonwebtoken) |
| File Uploads | Multer |
| Frontend Build | Vite |
| Frontend Framework | React 18 |
| State Management | Context API |
| HTTP Client | Axios |
| Styling | Custom CSS (no framework) |
| Socket Client | socket.io-client |

---

## 🐛 Troubleshooting

**MongoDB connection refused:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod     # Linux
brew services list               # macOS
# Start it if not running
sudo systemctl start mongod      # Linux
brew services start mongodb-community  # macOS
```

**Port 5000 already in use:**
```bash
# Kill the process on port 5000
lsof -ti:5000 | xargs kill -9    # macOS/Linux
netstat -ano | findstr :5000     # Windows (then taskkill /PID <pid> /F)
# Or change PORT in backend/.env
```

**Frontend can't reach backend:**
- Make sure backend is running on port 5000
- Vite proxy is configured to forward `/api` → `http://localhost:5000`
- Check `frontend/vite.config.js`

**Video won't play:**
- Video must complete processing (status = safe) before streaming
- Check browser console for errors
- Ensure video file wasn't deleted from `backend/uploads/`

**Upload fails with "Invalid file type":**
- Only video files are accepted: MP4, MOV, AVI, MKV, WebM, OGG
- Check file is not corrupt

---

## 📦 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `MONGODB_URI` | `mongodb://localhost:27017/videosensitivity` | MongoDB connection string |
| `JWT_SECRET` | *(required)* | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry duration |
| `UPLOAD_PATH` | `./uploads` | Video storage directory |
| `MAX_FILE_SIZE` | `524288000` | Max upload size in bytes (500MB) |
| `NODE_ENV` | `development` | Environment mode |

---

## 📝 Design Decisions & Assumptions

1. **Simulated AI Analysis**: Real ML/AI integration (Google Video Intelligence API, AWS Rekognition) would replace `utils/sensitivityAnalysis.js`. The simulation demonstrates the full pipeline flow.

2. **Multi-tenant isolation**: Videos are stored in per-user directories (`uploads/<userId>/`). Database queries are filtered by `organisation` for admin users, and by `uploadedBy` for editors/viewers.

3. **HTTP Range Requests**: The `/stream` endpoint supports `Range` headers, enabling browser-native video seeking and efficient partial content delivery.

4. **Token in Query Param for Streaming**: HTML5 `<video src="">` cannot send custom headers. The JWT token is passed as `?auth=<token>` query param for the stream endpoint only.

5. **Socket.io Rooms**: Each user joins a room named `user-<userId>` on connect, ensuring processing updates are private and not broadcast to other users.

---

## 🙏 License

This project is built as an assignment submission. All code is original and written for educational purposes.
