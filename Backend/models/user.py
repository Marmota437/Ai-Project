from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from models.family import Family


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str

    family_id: Optional[int] = Field(default=None, foreign_key="family.id", index=True)
    family: Optional["Family"] = Relationship(back_populates="users")