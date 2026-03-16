from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Request
from starlette.responses import HTMLResponse
from infrastructure.databases.db import DatabaseConfig
from infrastructure.vector_store_provider import VectorStoreProvider
import sqlite3
from deps import get_db, get_google_drive, get_vector_store
from features.query.models import QueryRequest
from features.ingestion.dto import EmbedRequest
from features.query import service as query_service
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from features.google_drive.google_drive_service import GoogleDriveService
from features.ingestion.embed import embed as embed_service
from infrastructure.config import get_settings
from infrastructure.logging_config import setup_logging

settings = get_settings()
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = DatabaseConfig()
    app.state.vector_store = VectorStoreProvider()
    app.state.google_drive = GoogleDriveService()
    yield


from fastapi.middleware.cors import CORSMiddleware
from features.projects.routes import router as projects_router
from features.users.routes import router as users_router
from features.user_projects.routes import router as users_projects_router
from features.auth.routes import router as auth_router
from features.departments.routes import router as departments_router
from features.documents.routes import router as documents_router
from features.query.chat_routes import router as chat_router

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="./static/"), name="static")
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(users_router)
app.include_router(users_projects_router)
app.include_router(departments_router)
app.include_router(documents_router)
app.include_router(chat_router)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request, db: sqlite3.Connection = Depends(get_db)):
    from features.departments import repository as departments_repo
    deps = departments_repo.get_departments(db)
    departments = [d.name for d in deps]
    return templates.TemplateResponse(
        "query.html",
        {"request": request, "departments": departments},
    )


@app.post("/query")
async def query(
    payload: QueryRequest,
    vector_store: VectorStoreProvider = Depends(get_vector_store),
):
    return query_service.query(
        vector_store=vector_store, query=payload.query, user_filters=payload.filters
    )


@app.post("/embed")
def embed(
    payload: EmbedRequest,
    vector_store: VectorStoreProvider = Depends(get_vector_store),
    google_drive: GoogleDriveService = Depends(get_google_drive),
    db: sqlite3.Connection = Depends(get_db),
):
    return embed_service(
        file_ids=payload.file_ids,
        project_id=payload.project_id,
        department=payload.department,
        google_drive_service=google_drive,
        vector_store=vector_store,
        db=db,
    )
