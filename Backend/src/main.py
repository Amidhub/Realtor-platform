from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from src.config import setting
from src.database import engine

from src.auth.router import router as auth_router
from src.listings.router import router as listing_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управление жизненным циклом приложения.
    Здесь инициализируются и закрываются ресурсы.
    """
    # Startup
    print(f"Starting {setting.PROJECT_NAME} in {setting.MODE} mode")
    
    yield  # App running
    
    # Shutdown
    print("Shutting down...")
    await engine.dispose()
    print("Resources cleaned up")


# Создание приложения
app = FastAPI(
    title=setting.PROJECT_NAME,
    # version=setting.VERSION,
    # description=setting.DESCRIPTION,
    docs_url="/docs" if setting.MODE == "DEV" else None,
    redoc_url="/redoc" if setting.MODE == "DEV" else None,
    openapi_url="/openapi.json" if setting.MODE == "DEV" else None,
    lifespan=lifespan,
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=setting.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Подключение роутеров
app.include_router(auth_router)
app.include_router(listing_router)


# Корневой эндпоинт
@app.get("/", tags=["health"])
async def root():
    """
    Корневой эндпоинт для проверки работоспособности.
    """
    return {
        "name": setting.PROJECT_NAME,
        "version": setting.VERSION,
        "environment": setting.ENVIRONMENT,
        "status": "healthy",
    }

# Health check для мониторинга
@app.get("/health", tags=["health"], include_in_schema=False)
async def health_check():
    """
    Эндпоинт для систем мониторинга.
    """
    return {"status": "ok", "environment": setting.MODE}
