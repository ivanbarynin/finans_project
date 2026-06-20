from pydantic import BaseModel, EmailStr
from typing import Optional, Any, Dict
from datetime import datetime

class UserCreate(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: Optional[str]
    email: str
    is_admin: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProgramCreate(BaseModel):
    name: str
    description: Optional[str] = None
    conditions: Dict[str, Any]
    is_active: bool = True

class SupportRequestCreate(BaseModel):
    email: EmailStr
    message: str

class SupportRequestResponse(BaseModel):
    id: int
    email: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AdminStats(BaseModel):
    total_users: int
    total_calculations: int
    total_programs: int
    total_support_requests: int
    unread_support_requests: int

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class CalculationParams(BaseModel):
    propertyPrice: float
    downPayment: float
    loanAmount: float
    termYears: int
    rate: float
    paymentType: str

class CalculationResult(BaseModel):
    monthlyPayment: Optional[float] = None
    firstPayment: Optional[float] = None
    lastPayment: Optional[float] = None
    avgPayment: Optional[float] = None
    totalPaid: float
    overpayment: float
    schedule: list

class CalculationCreate(BaseModel):
    params: Dict[str, Any]
    result: Dict[str, Any]

class CalculationResponse(CalculationCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProgramConditions(BaseModel):
    maxRate: Optional[float] = None
    maxAmount: Optional[float] = None
    requiresChildren: bool = False
    requiresIT: bool = False
    regions: list = ["all"]

class ProgramResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    conditions: Dict[str, Any]
    is_active: bool

    class Config:
        from_attributes = True
