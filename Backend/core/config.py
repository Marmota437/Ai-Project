from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "e4c2a9d8f6b14a0c9f3e2b7d5a8c1f0e6d9b4a2c7e5f8b1d3c0a9e6f2d4b"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()