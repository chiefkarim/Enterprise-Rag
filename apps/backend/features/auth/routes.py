from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Annotated
from datetime import timedelta
from deps import get_db
import sqlite3
import jwt
from features.users import repository as users_repo
from features.auth.service import (
    authenticate_user, 
    register_user, 
    create_access_token, 
    create_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, 
    get_current_user
)
from infrastructure.config import get_settings

settings = get_settings()
from features.users.models import User

router = APIRouter(tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/signup", response_model=User)
async def sign_up(
    payload: SignUpRequest,
    db: sqlite3.Connection = Depends(get_db)
):
    return register_user(db, payload.name, payload.email, payload.password)

@router.post("/login")
async def login_for_access_token(
    payload: LoginRequest,
    db: sqlite3.Connection = Depends(get_db)
):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email}
    )
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
async def refresh_token(
    payload: RefreshRequest,
    db: sqlite3.Connection = Depends(get_db)
):
    try:
        token_payload = jwt.decode(payload.refresh_token, str(settings.JWT_SECRET_KEY), algorithms=[settings.ALGORITHM])
        if token_payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        sub = token_payload.get("sub")
        if sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        email: str = str(sub)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token",
        )
    
    user = users_repo.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.get("/users/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

