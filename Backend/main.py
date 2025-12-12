from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.database import create_db_and_tables
from api import auth, family

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(family.router, prefix="/family", tags=["Family"])