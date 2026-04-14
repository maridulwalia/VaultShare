📁 VaultShare - Secure File Sharing App
VaultShare is a secure and privacy-focused file sharing application built with the MERN stack (MongoDB, Express, React, Node.js). It allows users to upload files and share them with optional restrictions like password protection, expiration time, maximum downloads, and email-based access control.

🚀 Features
🔐 Authentication – User registration and login

📤 Secure File Upload – Upload files with metadata

🕒 Expiration Control – Set file expiry by hours

📉 Download Limit – Limit how many times a file can be downloaded

🔑 Password Protection – Share files with a required password

📧 Authorized Emails Only – Restrict access to specific email addresses (set during upload)

👑 Admin Access – Admin can download any file regardless of restrictions

📄 File Preview & Info – View file details before download

📲 Frontend in React – Modern UI/UX with a high-end, minimalist dark-themed design system (Vite + Tailwind CSS)

📦 Backend with Node.js + Express – REST API for handling business logic

☁️ MongoDB – Store file metadata and user information

🌐 Client/Server Communication – Secure API calls with JWT authentication

🔄 CORS Configured – Proper CORS setup for cross-origin communication between frontend and backend

🛠️ Tech Stack
Layer	Technology
Frontend	React, Vite, TypeScript, Tailwind CSS
Backend	Node.js, Express.js
Database	MongoDB + Mongoose
Auth	JWT (JSON Web Tokens)
Upload	Multer
File Storage	Local disk (can be upgraded to AWS S3)

⚙️ Setup Instructions
🔑 Prerequisites
Node.js (v18+ recommended)
MongoDB (local or MongoDB Atlas)

🧪 Local Development
1️⃣ Clone the repository
git clone https://github.com/maridulwalia/vaultshare.git
cd vaultshare

2️⃣ Set up environment variables
Create a .env file in the root directory.

Example .env for server:
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
STORAGE_MODE=local

3️⃣ Install dependencies
npm install

4️⃣ Start the app
npm run dev

🌍 Live Demo
🔗 Deployed Site: https://vault-share-beige.vercel.app/

👤 Author
Maridul Walia
