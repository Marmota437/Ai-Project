from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship


class Family(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    invite_code: str = Field(unique=True, index=True)
    owner_id: int
    monthly_contribution: float = 0.0
    users: List["User"] = Relationship(back_populates="family")