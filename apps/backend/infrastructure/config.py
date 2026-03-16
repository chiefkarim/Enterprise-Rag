from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from os import path


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DATABASE_READ_AUTH_TOKEN: str
    DATABASE_WRITE_AUTH_TOKEN: str
    DATABASE_LOCAL_PATH: str = "./infrastructure/databases/sqlite/local.db"

    # Qdrant
    QDRANT_API_KEY: str
    QDRANT_URL: str

    # JWT
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    MODEL_NAME: str = "BAAI/bge-small-en-v1.5"
    COLLECTION_NAME: str = "company-docs"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

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
