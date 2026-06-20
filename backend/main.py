from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

from database import Base, engine
from routes import auth, calculations, programs, admin, support

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mortgage Calculator API")

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("CORS_ORIGIN", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=3600,
)

# Routes
app.include_router(auth.router)
app.include_router(calculations.router)
app.include_router(programs.router)
app.include_router(admin.router)
app.include_router(support.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
