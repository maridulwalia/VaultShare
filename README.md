# 📁 VaultShare - Secure File Sharing App

VaultShare is a secure and privacy-focused file sharing application built with the MERN stack (MongoDB, Express, React, Node.js). It allows users to upload files and share them with optional restrictions like password protection, expiration time, maximum downloads, and email-based access control.

---

## 🚀 Features

- 🔐 **Authentication** – User registration & login
- 📤 **Secure File Upload** – Upload files with metadata
- 🕒 **Expiration Control** – Set file expiry by hours
- 📉 **Download Limit** – Limit how many times a file can be downloaded
- 🔑 **Password Protection** – Share files with a required password
- 📧 **Authorized Emails Only** – Restrict access to specific email addresses
- 📄 **File Preview & Info** – See file details before download
- 📲 **Frontend in React** – Intuitive UI built with Vite + Tailwind
- 📦 **Backend with Node.js + Express** – REST API for handling logic
- ☁️ **MongoDB** – Store file metadata and user information
- 🌐 **Client/Server Communication** – Axios-based HTTP communication

---

## 🛠️ Tech Stack

| Layer        | Technology                      |
|-------------|----------------------------------|
| Frontend    | React, Vite, TypeScript, Tailwind CSS |
| Backend     | Node.js, Express.js              |
| Database    | MongoDB + Mongoose               |
| Auth        | JWT (JSON Web Tokens)            |
| Upload      | Multer                           |
| File Storage| Local disk (or upgrade to S3)    |

---

## ⚙️ Setup Instructions

### 🔑 Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud via MongoDB Atlas)

---

### 🧪 Local Development

#### 1. Clone the repository
git clone https://github.com/maridulwalia/vaultshare.git
cd vaultshare

#### 2. Set up environment variables
Create a .env file in vaultshare/ or root directory

🗂️ Example .env.example for server:
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:5000

##### 3. Install dependencies
npm install

#### 4. Start the app
npm run dev

#### Author – Maridul Walia