from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    family_id: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str