import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from api.deps import get_current_user
from core.database import get_session
from models.family import Family
from models.user import User
from typing import List
from models.finance import SavingsPayment
from datetime import datetime, timedelta
from models.task import Task

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


@router.get("/my-family", response_model=Family)
def get_my_family(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user.family_id:
        raise HTTPException(404, "Nie należysz do rodziny")

    family = session.get(Family, user.family_id)
    if not family:
        raise HTTPException(404, "Rodzina nie znaleziona")

    return family

@router.get("/alerts")
def get_dashboard_alerts(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user.family_id:
        return {"has_family": False}

    now = datetime.utcnow()
    stmt_savings = select(SavingsPayment).where(
        SavingsPayment.user_id == user.id,
        SavingsPayment.date >= datetime(now.year, now.month, 1)
    )
    paid_this_month = session.exec(stmt_savings).first() is not None

    three_days_ahead = now + timedelta(days=3)

    stmt_tasks = select(Task).where(
        Task.assigned_to_id == user.id,
        Task.status != "DONE",  # Tylko niewykonane
        Task.deadline <= three_days_ahead
    )
    upcoming_tasks = session.exec(stmt_tasks).all()

    return {
        "has_family": True,
        "savings_paid_this_month": paid_this_month,
        "upcoming_tasks_count": len(upcoming_tasks),
        "upcoming_tasks": upcoming_tasks,
        "alert_message": "Pamiętaj o wpłacie!" if not paid_this_month else "Wszystko opłacone."
    }