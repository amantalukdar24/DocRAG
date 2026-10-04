# 📄 DocRAG — Intelligent Document RAG & Quiz Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-DocRAG-amber?style=for-the-badge&logo=render)](https://docrag-frontend-88qy.onrender.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-VectorDB-red?style=for-the-badge)](https://qdrant.tech/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-orange?style=for-the-badge&logo=googlegemini)](https://ai.google.dev/)

**DocRAG** is a full-stack, AI-driven Document Intelligence application built with Next.js, Express, Qdrant Vector Database, and Google Gemini AI via LangChain. Upload PDF documents, ask context-aware questions grounded in your document vectors (Retrieval-Augmented Generation), and generate interactive AI quizzes to test your knowledge.

🔗 **Live Frontend Application**: [https://docrag-frontend-88qy.onrender.com](https://docrag-frontend-88qy.onrender.com)

---

## ✨ Features

- 📤 **PDF Upload & Storage**: Seamlessly upload and store PDF documents powered by Cloudinary and Multer.
- ⚡ **Vector Embeddings & Semantic Search**: Automatically extracts PDF text, chunks content, generates embeddings via Google Gemini, and stores vectors in **Qdrant DB**.
- 💬 **Ask AI (RAG Chatbot)**: Query your documents with high accuracy. Answers are strictly grounded in document context using vector similarity search.
- 🎯 **Automated Quiz Generation**: Instantly generate multiple-choice quizzes from document content with real-time scoring, instant explanations, and review capabilities.
- 🔐 **User Authentication**: Secure JWT-based authentication system with encrypted passwords (Bcrypt) and MongoDB state management.
- 🎨 **Modern & Responsive UI**: Built with Next.js 16 App Router, Tailwind CSS v4, dynamic query-based routing (`?docId=...`), glassmorphism aesthetics, and toast notifications.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons & Notifications**: Lucide React, React Hot Toast

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt

### AI & Vector Database
- **Orchestration**: [LangChain](https://www.langchain.com/)
- **LLM & Embeddings**: Google Gemini API (`@langchain/google-genai`)
- **Vector Database**: [Qdrant Cloud REST DB](https://qdrant.tech/)
- **File Parsing & Cloud Storage**: `pdf-parse`, Cloudinary API

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Database URI
- Qdrant Vector DB Instance (URL & API Key)
- Google Gemini API Key
- Cloudinary Credentials

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/DocRAG.git
cd DocRAG
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Qdrant Vector DB
QDRANT_URL=your_qdrant_instance_url
QDRANT_API_KEY=your_qdrant_api_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the Backend Server:

```bash
# Development mode
npm run dev

# Production build & run
npm run build
npm start
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` (or `.env.local`) file in the `frontend/` directory:

```env
NEXT_PUBLIC_Backend_Url=http://localhost:8000
```

Start the Frontend Server:

```bash
# Development mode
npm run dev

# Production build & run
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **POST** | `/auth/signup` | Register a new user | ❌ |
| **POST** | `/auth/signin` | Log in existing user & receive JWT | ❌ |
| **POST** | `/doc/uploadpdf` | Upload a PDF document & index vector embeddings | ✅ |
| **GET** | `/doc/getdocuments` | Fetch user uploaded document list | ✅ |
| **DELETE**| `/doc/deletepdf` | Delete document & vector embeddings | ✅ |
| **POST** | `/chat/getanswer` | Ask a RAG question on a document (`docId`) | ✅ |
| **GET** | `/chat/getchats/:docId` | Retrieve chat history for a document | ✅ |
| **DELETE**| `/chat/deletechats` | Clear chat history for a document | ✅ |
| **GET** | `/quiz/generatequiz/:docId` | Generate AI multiple-choice quiz | ✅ |

---

## 🌟 Live Deployment

- **Frontend App**: [https://docrag-frontend-88qy.onrender.com](https://docrag-frontend-88qy.onrender.com)

---

## 📝 License

This project is licensed under the [ISC License](LICENSE).
