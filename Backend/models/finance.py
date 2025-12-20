from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime


class SavingsPayment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    amount: float
    date: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")
    family_id: int = Field(foreign_key="family.id")


class Goal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    target_amount: float
    current_amount: float = 0.0
    is_completed: bool = False
    family_id: int = Field(foreign_key="family.id")

    created_by_id: int = Field(foreign_key="user.id")


class GoalContribution(SQLModel, table=True):
    """Historia wpłat na konkretny cel"""
    id: Optional[int] = Field(default=None, primary_key=True)
    amount: float
    date: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(foreign_key="user.id")
    goal_id: int = Field(foreign_key="goal.id")