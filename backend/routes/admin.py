from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db
from models import User, Calculation, Program, SupportRequest
from schemas import UserResponse, ProgramResponse, ProgramCreate, AdminStats, CalculationResponse, SupportRequestResponse
from utils import decode_token
from typing import List, Optional

router = APIRouter(prefix="/api/admin", tags=["admin"])

def get_admin_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

@router.get("/stats", response_model=AdminStats)
def get_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return AdminStats(
        total_users=db.query(User).count(),
        total_calculations=db.query(Calculation).count(),
        total_programs=db.query(Program).count(),
        total_support_requests=db.query(SupportRequest).count(),
        unread_support_requests=db.query(SupportRequest).filter(SupportRequest.is_read == False).count(),
    )

@router.get("/support", response_model=List[SupportRequestResponse])
def get_support_requests(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(SupportRequest).order_by(SupportRequest.created_at.desc()).all()

@router.patch("/support/{request_id}/read")
def mark_support_read(request_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    req = db.query(SupportRequest).filter(SupportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    req.is_read = True
    db.commit()
    return {"ok": True}

@router.delete("/support/{request_id}")
def delete_support_request(request_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    req = db.query(SupportRequest).filter(SupportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    db.delete(req)
    db.commit()
    return {"message": "Deleted"}

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.patch("/users/{user_id}/toggle-admin")
def toggle_admin(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_admin = not user.is_admin
    db.commit()
    return {"is_admin": user.is_admin}

@router.get("/calculations", response_model=List[CalculationResponse])
def get_all_calculations(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return db.query(Calculation).order_by(Calculation.created_at.desc()).limit(100).all()

@router.post("/programs", response_model=ProgramResponse)
def create_program(data: ProgramCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    program = Program(**data.model_dump())
    db.add(program)
    db.commit()
    db.refresh(program)
    return program

@router.put("/programs/{program_id}", response_model=ProgramResponse)
def update_program(program_id: int, data: ProgramCreate, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    for key, value in data.model_dump().items():
        setattr(program, key, value)
    db.commit()
    db.refresh(program)
    return program

@router.delete("/programs/{program_id}")
def delete_program(program_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    db.delete(program)
    db.commit()
    return {"message": "Program deleted"}
