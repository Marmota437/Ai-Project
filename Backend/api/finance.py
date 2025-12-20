from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from typing import List

from core.database import get_session
from api.deps import get_current_user
from models.user import User
from models.family import Family
from models.finance import SavingsPayment, Goal, GoalContribution

router = APIRouter()


# --- OSZCZĘDNOŚCI (SAVINGS) ---

@router.get("/savings/status")
def get_savings_status(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Sprawdza, czy użytkownik wpłacił w tym miesiącu i ile rodzina ma łącznie."""
    if not user.family_id:
        raise HTTPException(400, "Nie masz rodziny")

    # 1. Sprawdź wpłatę usera w tym miesiącu
    now = datetime.utcnow()
    statement = select(SavingsPayment).where(
        SavingsPayment.user_id == user.id,
        SavingsPayment.date >= datetime(now.year, now.month, 1)
    )
    payment = session.exec(statement).first()

    # 2. Policz sumę wszystkich oszczędności rodziny (prosta agregacja)
    family_payments = session.exec(select(SavingsPayment).where(SavingsPayment.family_id == user.family_id)).all()
    total_savings = sum(p.amount for p in family_payments)

    return {
        "paid_this_month": payment is not None,
        "total_family_savings": total_savings,
        "payment_amount": payment.amount if payment else 0
    }


@router.post("/savings/pay")
def pay_savings(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Dokonuje wpłaty obowiązkowej na ten miesiąc."""
    if not user.family_id:
        raise HTTPException(400, "Nie masz rodziny")

    # Pobierz kwotę z ustawień rodziny
    family = session.get(Family, user.family_id)
    amount = family.monthly_contribution

    # Sprawdź czy już nie wpłacił
    now = datetime.utcnow()
    statement = select(SavingsPayment).where(
        SavingsPayment.user_id == user.id,
        SavingsPayment.date >= datetime(now.year, now.month, 1)
    )
    if session.exec(statement).first():
        raise HTTPException(400, "Już wpłaciłeś w tym miesiącu!")

    # Zapisz wpłatę
    payment = SavingsPayment(amount=amount, user_id=user.id, family_id=user.family_id)
    session.add(payment)
    session.commit()
    return {"msg": "Wpłata przyjęta"}


# --- CELE (GOALS) ---

@router.get("/goals", response_model=List[Goal])
def get_goals(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user.family_id:
        return []
    statement = select(Goal).where(Goal.family_id == user.family_id)
    return session.exec(statement).all()


@router.post("/goals")
def create_goal(name: str, target: float, user: User = Depends(get_current_user),
                session: Session = Depends(get_session)):
    if not user.family_id:
        raise HTTPException(400, "Nie masz rodziny")

    goal = Goal(name=name, target_amount=target, family_id=user.family_id, created_by_id=user.id)
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


@router.post("/goals/{goal_id}/contribute")
def contribute_to_goal(goal_id: int, amount: float, user: User = Depends(get_current_user),
                       session: Session = Depends(get_session)):
    goal = session.get(Goal, goal_id)
    if not goal or goal.family_id != user.family_id:
        raise HTTPException(404, "Cel nie znaleziony")

    if goal.is_completed:
        raise HTTPException(400, "Cel już zrealizowany!")

    # Dodaj wpłatę
    contribution = GoalContribution(amount=amount, user_id=user.id, goal_id=goal_id)
    session.add(contribution)

    # Zaktualizuj cel
    goal.current_amount += amount
    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True

    session.add(goal)
    session.commit()

    return {"msg": "Wpłacono", "is_completed": goal.is_completed}