from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session
from core.database import get_session
from models.user import User
from core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_token(token: str = Depends(oauth2_scheme)):
    """Weryfikuje token JWT."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Brak ID użytkownika w tokenie")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token jest nieprawidłowy", headers={"WWW-Authenticate": "Bearer"})

def get_current_user(user_id: str = Depends(verify_token), session: Session = Depends(get_session)) -> User:
    """Pobiera użytkownika z bazy na podstawie ID z tokena."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    return user