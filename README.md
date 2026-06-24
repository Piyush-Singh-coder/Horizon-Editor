# Horizon - Online Code Editor & Compiler

Horizon is a premium online code editor and execution sandbox built for developers. It supports editing and running multiple programming languages, saving code execution history, and sharing code snippets with a community library.

---

## 🎨 Tech Stack & Architecture

### Frontend
* **Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Frosted glass panels, micro-animations, custom scrollbars)
* **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (Rich syntax highlighting & autocomplete)
* **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Dynamic class-based Theme toggle store)

### Backend
* **Language**: [Golang (Go)](https://go.dev/)
* **Web Framework**: [Fiber v2](https://gofiber.io/) (High performance & lightweight)
* **Database**: [MongoDB](https://www.mongodb.com/) (Robust document store for users, snippets, and executions)
* **Authentication**: [Firebase Auth Admin SDK](https://firebase.google.com/docs/auth) (Google OAuth verification)
* **Sandbox Runtime**: [Judge0 API Proxy](https://judge0.com/) (For sandboxed compilation and code execution)

---

## 🚀 Key Features

* **Advanced Multi-Language Sandbox**: Write and compile code in Python, JavaScript, Go, Java, and C++ with real-time output.
* **Premium Theme Engine**: Pure Tailwind CSS class-based system with a sleek developer Light and Dark mode.
* **Community Library**: Share your curated snippets with the community, view comments, and star popular codes.
* **Code History Dashboard**: Access, review, and reload previous code executions straight from your profile page.
* **High Security Auth**: Dual-layered local and Google sign-in using Firebase security validations.

---

## ⚙️ Installation & Run Guide

### 1. Clone the repository & setup environment variables
Create a `.env` file in the `backend/` directory referencing [.env.example] values (Port configurations, MongoDB connection string, SMTP server keys, Judge0 keys, and Firebase SDK credentials).

### 2. Run the Backend (Golang)
```bash
cd backend
go run cmd/server/main.go
```
*The backend server starts listening on `http://localhost:5001`.*

### 3. Run the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*The React dev server starts hosting on `http://localhost:5173`.*
