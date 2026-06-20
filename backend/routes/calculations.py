from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db
from models import Calculation, User
from schemas import CalculationCreate, CalculationResponse
from utils import decode_token
from typing import List, Optional

router = APIRouter(prefix="/api/calculations", tags=["calculations"])

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )

    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )

    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token"
        )

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user

@router.post("", response_model=CalculationResponse)
def save_calculation(
    calc_data: CalculationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    calculation = Calculation(
        user_id=user.id,
        params=calc_data.params,
        result=calc_data.result
    )
    db.add(calculation)
    db.commit()
    db.refresh(calculation)
    return calculation

@router.get("", response_model=List[CalculationResponse])
def get_calculations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    calculations = db.query(Calculation).filter(
        Calculation.user_id == user.id
    ).order_by(Calculation.created_at.desc()).all()
    return calculations

@router.delete("/{calc_id}")
def delete_calculation(
    calc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    calculation = db.query(Calculation).filter(
        Calculation.id == calc_id,
        Calculation.user_id == user.id
    ).first()

    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found"
        )

    db.delete(calculation)
    db.commit()
    return {"message": "Calculation deleted"}
