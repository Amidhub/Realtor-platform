from pathlib import Path

from pydantic_settings import BaseSettings
from typing import List, Literal

BASE_DIR = Path(__file__).parent.parent


class Setting(BaseSettings):
    MODE: Literal["DEV", "TEST", "PROD"]
    PROJECT_NAME: str
    VERSION: int
    
    #DB
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASS: str
    DB_NAME: str
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    ALLOWED_HOSTS: List[str] = ["*"]

    #AUTH
    SECRETE_KEY: str
    ALGORITHM: str
    
    #S3
    ACCESS_KEY_S3: str
    SECRET_KEY_S3: str
    ENDPOINT_URl_S3: str
    BUCKET_NAME_S3: str
    
    class Config:
        env_file = ".env"
        # env_file = ".env-non-dev" #DEV
        extra = "ignore"
        
setting = Setting()
