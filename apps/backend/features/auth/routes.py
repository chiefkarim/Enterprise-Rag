from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Annotated
from datetime import timedelta
from deps import get_db
import sqlite3
from features.auth.service import authenticate_user, register_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
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
    return {"access_token": access_token, "token_type": "bearer"}
