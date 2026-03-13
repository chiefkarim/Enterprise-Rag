# Enterprise RAG Platform

This repository contains the implementation of a Retrieval Augmented Generation (RAG) platform designed for low-budget and enterprise-grade scenarios. It features a modern React frontend and a robust Python (FastAPI + LlamaIndex) backend.

## Project Structure

This project is structured as a **pnpm monorepo**, containing two distinct applications:

- **`apps/frontend`**: A modern React SPA built with Vite, TanStack Query, Zustand, Zod, and shadcn-ui.
- **`apps/backend`**: The core RAG engine and API server built with FastAPI, LlamaIndex, FastEmbedEmbedding, and Ollama/Qwen.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20+)
- **pnpm** (v9+)
- **uv** (Python package installer and resolver)
- **Ollama** (Running locally on `127.0.0.1:11434` with model `qwen2.5:0.5b` or similar)

### 2. Setup the Frontend
The frontend uses a feature-driven layered architecture for maximum scalability.

```bash
# Navigate to the frontend directory
cd apps/frontend

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```
The React app will be available at `http://localhost:5173/`.

### 3. Setup the Backend
The backend utilizes `uv` for lightning-fast dependency management and virtual environments.

```bash
# Navigate to the backend directory
cd apps/backend

# Install dependencies and create a virtual environment (.venv)
uv sync

# Run the FastAPI server in development mode
source .venv/bin/activate
fastapi dev main.py
```
The backend API documentation is available at `http://localhost:8000/docs`.

---

## Architecture & Conventions

### Frontend Architecture
- **Framework**: React 19 + Vite + TypeScript.
- **Components**: `shadcn-ui` (Tailwind CSS v4).
- **State Management**: `Zustand` for global state (Auth), `TanStack Query` for server state and caching.
- **Validation**: `Zod` combined with `react-hook-form`.
- **Structure**: Based on a generic Feature-Driven Architecture (code split by feature domain in `src/features/*`).

### Backend Architecture
- **Framework**: `FastAPI` providing high-performance async endpoints.
- **RAG Engine**: `llama_index` handling document chunking, indexing, and retrieval.
- **Vector Store**: Processed documents reside in `./indexed-data/` locally.
- **Authentication**: Custom JWT Authentication using Argon2 password hashing.

---

## Blog Post Reference
The foundational RAG logic of this project implements concepts discussed in the Medium blog post: [Low-Budget RAG pipeline for your small company](https://mennakarim.medium.com/low-budget-rag-pipeline-for-your-small-company-43e9c30cf502).
