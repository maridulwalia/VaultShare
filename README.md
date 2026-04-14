# 📁 VaultShare - Secure File Sharing App

---

**VaultShare** is a secure and privacy-focused file sharing application built with the MERN stack. It allows users to upload files and share them with fine-grained access control, providing a robust platform to exchange sensitive information safely.

The system provides flexible sharing restrictions such as password protection, expiration times, maximum downloads, and email-based authorization, bringing total control and security to your digital asset sharing.

> **Stack:** MongoDB · Express.js · React (Vite + TypeScript) · Node.js · Tailwind CSS

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| **Modern UI/UX** | High-end, minimalist dark-themed design system |
| **Secure File Upload** | Upload files with metadata securely to the server |
| **Authentication** | JWT-based user registration and login |
| **Password Protection** | Option to require a secret password before file download |
| **Expiration Control** | Time-bomb files by setting an expiration in hours or days |
| **Download Limits** | Restrict how many times a single file can be downloaded |
| **Email Authorization** | Lock access exclusively to specific email addresses |
| **Admin Controls** | Admins can bypass restrictions and manage hosted files |
| **File Previews** | View file details and metadata before initiating download |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JSON Web Tokens (JWT), Bcrypt |
| **File Storage** | Local disk via Multer (cloud-ready architecture) |

---

## 📁 Project Structure

```text
VAULTSHARE/
│
├── backend/                  # Backend (Node.js + Express)
│   ├── controllers/          # Route logic / request handlers
│   ├── middleware/           # Auth & file validation middlewares
│   ├── models/               # Mongoose schemas (User, File)
│   ├── routes/               # API route definitions
│   ├── uploads/              # Local storage for uploaded files
│   └── server.js             # Backend entry point
│
├── src/                      # Frontend (React + Vite + TypeScript)
│   ├── components/           # Reusable UI components
│   ├── context/              # Context Providers (Auth, Files)
│   ├── pages/                # Page-level components
│   ├── services/             # API wrappers
│   ├── index.css             # Global Tailwind Styles
│   ├── App.tsx               # Root component with routing
│   └── main.tsx              # App bootstrap
│
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── .env.example              # Environment variable template
└── package.json              # Dependencies & npm scripts
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Git**

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/maridulwalia/vaultshare.git
cd vaultshare
```

### 2️⃣ Configure Environment Variables
```bash
# Copy the example file
copy .env.example .env    # Windows
# cp .env.example .env   # macOS / Linux
```

Edit your `.env` file with accurate values:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your_mongo_connection

# JWT Auth
JWT_SECRET=your_secret_key

# URLs
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000

# File Upload Mode
STORAGE_MODE=local
```

### 3️⃣ Install Dependencies
```bash
npm install
```

### 4️⃣ Start the App Locally
```bash
npm run dev
```

> The `npm run dev` script uses concurrently to start both the Vite frontend (`dev:frontend`) and the Express Node server (`dev:backend`) within the same terminal window!

- **Frontend Application:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

## 🏗️ Building for Production

```bash
# To build the React frontend: 
npm run build
# Output goes to the /dist folder to be deployed on services like Vercel or Netlify.
```

For production deployment, configure the `CLIENT_URL` and `VITE_API_URL` environment variables to point to your live frontend and backend domains correctly. Ensure HTTPS enforcement with your host for maximum security when transmitting secure files and auth tokens.

---

## 🔐 Security Notes

- **Never commit `.env`** — Ensure `.env` is listed within the `.gitignore`.
- Always generate a **strong, cryptographically random `JWT_SECRET`** for verifying tokens in production.
- Proper CORS settings restrict cross-origin interactions. Ensure only verified origin domains are specified in production.

---

## 🌍 Live Demo
🔗 **Deployed Site:** [https://vault-share-beige.vercel.app/](https://vault-share-beige.vercel.app/)

---

## 👤 Author
**Maridul Walia**
