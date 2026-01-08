from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from core.database import get_session
from api.deps import get_current_user
from models.user import User
from models.family import Family
from models.task import Task, TaskComment
from datetime import datetime

router = APIRouter()


# 1. Pobierz wszystkie zadania rodziny
@router.get("/", response_model=List[Task])
def get_tasks(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user.family_id:
        return []
    statement = select(Task).where(Task.family_id == user.family_id).order_by(Task.deadline.asc())
    return session.exec(statement).all()

# 2. Dodaj zadanie (z terminem)
@router.post("/")
def create_task(
        title: str,
        deadline: Optional[datetime] = None,
        assigned_to_id: Optional[int] = None,
        user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
):
    if not user.family_id:
        raise HTTPException(400, "Nie masz rodziny")

    new_task = Task(
        title=title,
        deadline=deadline,
        family_id=user.family_id,
        created_by_id=user.id,
        assigned_to_id=assigned_to_id,
        status="TODO"
    )
    session.add(new_task)
    session.commit()
    session.refresh(new_task)
    return new_task


# 3. Oznacz jako wykonane (DONE)
@router.post("/{task_id}/complete")
def complete_task(task_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task or task.family_id != user.family_id:
        raise HTTPException(404, "Zadanie nie znalezione")

    task.status = "DONE"
    session.add(task)
    session.commit()
    return {"msg": "Zadanie wykonane"}


# 4. Oceń zadanie (ZABEZPIECZENIE: Nie można ocenić siebie)
@router.post("/{task_id}/rate")
def rate_task(
        task_id: int,
        rating: int,
        user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Brak zadania")

    # Nie możesz ocenić siebie
    if task.assigned_to_id == user.id:
        raise HTTPException(400, "Nie możesz ocenić własnego wykonania!")

    if not (1 <= rating <= 5):
        raise HTTPException(400, "Ocena musi być od 1 do 5")

    task.rating = rating
    session.add(task)
    session.commit()
    return {"msg": "Oceniono zadanie"}


# 5. Usuń zadanie (Tylko ADMIN RODZINY)
@router.delete("/{task_id}")
def delete_task(task_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Brak zadania")

    family = session.get(Family, user.family_id)

    # Sprawdzenie czy user jest właścicielem rodziny
    if family.owner_id != user.id:
        raise HTTPException(403, "Tylko głowa rodziny może usuwać zadania")

    session.delete(task)
    session.commit()
    return {"msg": "Usunięto"}


# 6. Edytuj zadanie (Tylko ADMIN RODZINY, z terminem)
@router.put("/{task_id}")
def update_task(
        task_id: int,
        title: str,
        deadline: Optional[datetime] = None, # NOWE
        assigned_to_id: Optional[int] = None,
        user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Brak zadania")

    family = session.get(Family, user.family_id)
    if family.owner_id != user.id:
        raise HTTPException(403, "Tylko założyciel rodziny może edytować zadania")

    task.title = title
    task.assigned_to_id = assigned_to_id
    if deadline:
        task.deadline = deadline

    session.add(task)
    session.commit()
    session.refresh(task)
    return task

# 7. Komentarze
@router.post("/{task_id}/comments")
def add_comment(
        task_id: int,
        content: str,
        user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
):
    task = session.get(Task, task_id)
    if not task or task.family_id != user.family_id:
        raise HTTPException(404, "Zadanie nie istnieje")

    if task.assigned_to_id == user.id:
        raise HTTPException(400, "Jako wykonawca nie możesz dodawać komentarzy motywujących :)")

    comment = TaskComment(
        content=content,
        task_id=task_id,
        user_id=user.id
    )
    session.add(comment)
    session.commit()
    return comment


@router.get("/{task_id}/comments", response_model=List[TaskComment])
def get_comments(task_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task or task.family_id != user.family_id:
        raise HTTPException(404, "Brak dostępu")

    statement = select(TaskComment).where(TaskComment.task_id == task_id).order_by(TaskComment.created_at)
    return session.exec(statement).all()