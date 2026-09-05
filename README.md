# Peblo TV Mini — Full-Stack Media Platform

**Peblo TV Mini** is an end-to-end full-stack streaming platform featuring a FastAPI backend, CMS Admin Dashboard, Public Viewer Web App, and an Atomic & Idempotent Catalog Publishing Pipeline.

---

## 🌟 Architectural Features

1. **FastAPI Backend Service**:
   - Role-Based Access Control (`admin`, `editor`) with JWT auth.
   - Storage Abstraction Interface (`LocalStorage` for local disk & `R2Storage` for Cloudflare S3/R2).
   - Real-time pre-flight **Validation Engine** verifying aspect ratios (Poster 2:3, Banner 16:9, Thumbnail 16:9), maximum file sizes (200 KB), sections, and episode durations.
   - **Atomic Publishing Engine**: Deterministic versioning (`catalog/versions/catalog-v{N}.json`) with safe atomic replacement to `catalog/current.json`.
   - Season 0 isolating trailers and promos into dedicated fields.
   - Multi-language episode variant grouping by `content_group`.

2. **CMS Admin Dashboard (`cms/`)**:
   - Built with React + Vite + Lucide Icons.
   - Shows/Seasons/Episodes CRUD dashboard.
   - Drag-and-drop Artwork validator with real-time feedback.
   - Publishing Dashboard with blocking error reports and audit log history.

3. **Public Viewer Application (`viewer/`)**:
   - Built with React + Vite + Vanilla CSS design system.
   - Featured Hero Banner carousel, section rows (Featured, Series, Minisodes, Songs), category filtering.
   - Interactive Season Selector, dedicated Season 0 Trailers section, and Multi-language Audio Language toggles.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional for containerized setup)

### Running locally with Python & Vite

1. **Start Backend Server**:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

2. **Run Pytest Test Suite**:
```bash
cd backend
pytest -v
```

3. **Start CMS Admin UI**:
```bash
cd cms
npm install
npm run dev
```
- Accessible at [http://localhost:3000](http://localhost:3000)
- Login: `admin` / `adminpassword` or `editor` / `editorpassword`

4. **Start Public Viewer UI**:
```bash
cd viewer
npm install
npm run dev
```
- Accessible at [http://localhost:3001](http://localhost:3001)

---

## 🐳 Docker Compose Orchestration

To launch the full stack with containerized services:
```bash
docker compose up --build
```
- **Backend API**: `http://localhost:8000`
- **CMS Admin**: `http://localhost:3000`
- **Public Viewer**: `http://localhost:3001`
