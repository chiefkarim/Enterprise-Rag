from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from functools import lru_cache
import os
from typing import Any, Optional


class Settings(BaseSettings):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        print(f"DEBUG: All ENV keys: {list(os.environ.keys())}")
        print(f"DEBUG: Loaded REDIS_URL='{self.REDIS_URL}'")
    # Database
    DATABASE_URL: str
    DATABASE_READ_AUTH_TOKEN: str | None = None
    DATABASE_WRITE_AUTH_TOKEN: str | None = None
    # Qdrant
    QDRANT_API_KEY: str
    QDRANT_URL: str

    # Google Drive
    GOOGLE_SERVICE_ACCOUNT_JSON: str | None = None

    # JWT
    JWT_SECRET_KEY: str
    OPENROUTER_API_KEY: str | None = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    MODEL_NAME: str = "BAAI/bge-small-en-v1.5"
    OCR_MODEL_NAME: str = "openrouter/hunter-alpha"
    RERANKER_MODEL_NAME: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    COLLECTION_NAME: str = "company-docs"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @model_validator(mode="after")
    def strip_quotes(self) -> "Settings":
        for field_name, value in self.__dict__.items():
            if isinstance(value, str):
                # Aggressive stripping of quotes and whitespace
                cleaned = value.strip().strip("\"'")
                setattr(self, field_name, cleaned)
        
        # SQLAlchemy requires 'postgresql://' instead of 'postgres://' for standard psycopg2
        if hasattr(self, 'DATABASE_URL') and self.DATABASE_URL:
            if self.DATABASE_URL.startswith('postgres://'):
                self.DATABASE_URL = self.DATABASE_URL.replace('postgres://', 'postgresql://', 1)
            elif self.DATABASE_URL.startswith('postgresql+psycopg://'):
                self.DATABASE_URL = self.DATABASE_URL.replace('postgresql+psycopg://', 'postgresql://', 1)
            
        return self

@lru_cache
def get_settings():
    return Settings()

if __name__ == "__main__":
    # Test block to verify env var loading
    try:
        settings = get_settings()
        print("Configuration loaded successfully!")
        print(f"Database URL: {settings.DATABASE_URL}")
        print(f"Qdrant URL: {settings.QDRANT_URL}")
    except Exception as e:
        print(f"Failed to load configuration: {e}")
