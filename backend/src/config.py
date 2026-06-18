from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/database.db"
    # DATABASE_URL: str = "mysql+aiomysql://root:密码@127.0.0.1:3306/elite_sales?charset=utf8mb4"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    UPLOAD_DIR: str = "./uploads"

    model_config = {"env_file": ".env"}


settings = Settings()
