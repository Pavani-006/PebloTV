import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Peblo TV Mini API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "peblo-tv-mini-super-secret-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./peblo_tv_mini.db")
    
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local") # "local" or "r2"
    LOCAL_STORAGE_PATH: str = os.getenv("LOCAL_STORAGE_PATH", os.path.abspath("./media"))
    CATALOG_STORAGE_PATH: str = os.getenv("CATALOG_STORAGE_PATH", os.path.abspath("../catalog"))
    
    # R2 Storage settings (optional cloud adapter)
    R2_ENDPOINT_URL: str = os.getenv("R2_ENDPOINT_URL", "")
    R2_ACCESS_KEY_ID: str = os.getenv("R2_ACCESS_KEY_ID", "")
    R2_SECRET_ACCESS_KEY: str = os.getenv("R2_SECRET_ACCESS_KEY", "")
    R2_BUCKET_NAME: str = os.getenv("R2_BUCKET_NAME", "peblo-tv-mini")
    R2_PUBLIC_DOMAIN: str = os.getenv("R2_PUBLIC_DOMAIN", "")

    class Config:
        case_sensitive = True

settings = Settings()
