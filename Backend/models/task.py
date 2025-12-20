from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    status: str = "TODO"
    rating: Optional[int] = None  # 1-5
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Klucze obce
    family_id: int = Field(foreign_key="family.id")
    created_by_id: int = Field(foreign_key="user.id")
    assigned_to_id: Optional[int] = Field(default=None, foreign_key="user.id")