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
    deadline: Optional[datetime] = None

    # Klucze obce
    family_id: int = Field(foreign_key="family.id")
    created_by_id: int = Field(foreign_key="user.id")
    assigned_to_id: Optional[int] = Field(default=None, foreign_key="user.id")

class TaskComment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    task_id: int = Field(foreign_key="task.id")
    user_id: int = Field(foreign_key="user.id")