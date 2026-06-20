from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import SupportRequest
from schemas import SupportRequestCreate, SupportRequestResponse

router = APIRouter(prefix="/api/support", tags=["support"])

@router.post("", response_model=SupportRequestResponse)
def create_support_request(data: SupportRequestCreate, db: Session = Depends(get_db)):
    request = SupportRequest(email=data.email, message=data.message)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request
