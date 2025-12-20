from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from core.database import create_db_and_tables
from api import auth, family, finance, task
from api.deps import get_current_user
from models.user import User
from schemas.auth import UserRead

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/auth/me", response_model=UserRead, tags=["Auth"])
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

app.include_router(finance.router, prefix="/finance", tags=["Finance"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(family.router, prefix="/family", tags=["Family"])
app.include_router(task.router, prefix="/tasks", tags=["Task"])
