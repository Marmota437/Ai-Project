import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from api.deps import get_current_user
from core.database import get_session
from models.family import Family
from models.user import User
from typing import List


router = APIRouter()


@router.post("/create")
def create_family(name: str, monthly_amount: float, user: User = Depends(get_current_user),
                  session: Session = Depends(get_session)):
    if user.family_id:
        raise HTTPException(400, "Masz już rodzinę")
    code = secrets.token_urlsafe(6)
    family = Family(name=name, invite_code=code, owner_id=user.id, monthly_contribution=monthly_amount)
    session.add(family)
    session.commit()
    session.refresh(family)

    user.family_id = family.id
    session.add(user)
    session.commit()
    return family


@router.post("/join")
def join_family(code: str, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Family).where(Family.invite_code == code)
    family = session.exec(statement).first()
    if not family:
        raise HTTPException(404, "Zły kod")
    user.family_id = family.id
    session.add(user)
    session.commit()
    return {"msg": "Dołączono!"}

@router.get("/members", response_model=List[User])
def get_family_members(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user.family_id:
        return []
    statement = select(User).where(User.family_id == user.family_id)
    return session.exec(statement).all()