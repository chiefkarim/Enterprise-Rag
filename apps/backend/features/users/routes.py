from features.auth.service import require_admin
from fastapi import APIRouter
from fastapi import Depends, HTTPException, status
import sqlite3
from deps import get_db
from features.users.dto import CreateUser
from features.users.models import User
from features.users import repository as users_repo
from features.auth.service import get_current_user, get_password_hash

router = APIRouter(prefix="/users",
dependencies=[Depends(require_admin)]
)


@router.get("/", response_model=list[User])
async def users(db: sqlite3.Connection = Depends(get_db)):
    return users_repo.get_users(db)


@router.post("/", response_model=User)
async def create_user(
    payload: CreateUser, 
    db: sqlite3.Connection = Depends(get_db)
):
    # Check if user already exists
    existing = users_repo.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
    hashed_password = get_password_hash(payload.password)
    return users_repo.create_user(db, payload.name, payload.email, "user", hashed_password)
