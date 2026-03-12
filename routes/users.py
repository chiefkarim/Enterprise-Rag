from fastapi import APIRouter
from fastapi import Depends, HTTPException, status
import sqlite3
from deps import get_db
from .users_dto import CreateUser
from models.user import User
from repositories import users as users_repo
from services.auth import get_current_user, get_password_hash

router = APIRouter(prefix="/users")


@router.get("/", response_model=list[User])
async def users(db: sqlite3.Connection = Depends(get_db)):
    return users_repo.get_users(db)


@router.post("/", response_model=User)
async def create_user(
    payload: CreateUser, 
    current_user: User = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db)
):
    # Check if user already exists
    existing = users_repo.get_user_by_name(db, payload.name)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
        
    hashed_password = get_password_hash(payload.password)
    return users_repo.create_user(db, payload.name, hashed_password)
