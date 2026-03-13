from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Request
from starlette.responses import HTMLResponse
from infrastructure.databases.db import DatabaseConfig
from infrastructure.vector_store_provider import VectorStoreProvider
from deps import get_google_drive, get_vectore_store
from features.departments.models import Department
from features.query.models import QueryRequest
from features.ingestion.dto import EmbedRequest
from features.query import service as query_service
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from features.projects.routes import router as projects_router
from features.users.routes import router as users_router
from features.user_projects.routes import router as users_projects_router
from features.auth.routes import router as auth_router
from features.departments.routes import router as departments_router
from features.documents.routes import router as documents_router
from features.google_drive.google_drive_service import GoogleDriveService
from features.ingestion.embed import embed as embed_service

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = DatabaseConfig()
    app.state.vector_store = VectorStoreProvider()
    app.state.google_drive = GoogleDriveService()
    yield


app = FastAPI(lifespan=lifespan)


templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="./static/"), name="static")
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(users_router)
app.include_router(users_projects_router)
app.include_router(departments_router)
app.include_router(documents_router)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    departments = [d.value for d in Department]
    return templates.TemplateResponse(
        "query.html",
        {"request": request, "departments": departments},
    )


@app.post("/query")
async def query(
    payload: QueryRequest,
    vector_store: VectorStoreProvider = Depends(get_vectore_store),
):
    return query_service.query(
        vector_store=vector_store, query=payload.query, user_filters=payload.filters
    )


@app.post("/embed")
def embed(
    payload: EmbedRequest,
    vector_store: VectorStoreProvider = Depends(get_vectore_store),
    google_drive: GoogleDriveService = Depends(get_google_drive),
):
    return embed_service(
        file_ids=payload.file_ids,
        project_id=payload.project_id,
        department=payload.department,
        google_drive_service=google_drive,
        vector_store=vector_store,
    )
