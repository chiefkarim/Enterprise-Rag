from fastapi import APIRouter
from fastapi import Depends
import sqlite3
from features.projects.dto import CreateProject
from deps import get_db
from features.projects.models import Project
from features.projects import repository as projects_repo

router = APIRouter(prefix="/projects")


@router.post(
    "/",
)
async def create_project(
    payload: CreateProject, db: sqlite3.Connection = Depends(get_db)
):
    return projects_repo.create_project(db, payload.name)


@router.get("/", response_model=list[Project])
async def projects(db: sqlite3.Connection = Depends(get_db)):
    return projects_repo.get_projects(db)
