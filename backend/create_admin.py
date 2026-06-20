import sys
from database import SessionLocal, engine, Base
from models import User
from utils import hash_password

Base.metadata.create_all(bind=engine)

email = sys.argv[1] if len(sys.argv) > 1 else input("Email: ")
password = sys.argv[2] if len(sys.argv) > 2 else input("Password: ")
name = sys.argv[3] if len(sys.argv) > 3 else input("Name (optional): ")

db = SessionLocal()
existing = db.query(User).filter(User.email == email).first()

if existing:
    existing.is_admin = True
    db.commit()
    print(f"✅ User '{email}' is now admin")
else:
    user = User(email=email, password=hash_password(password), name=name or None, is_admin=True)
    db.add(user)
    db.commit()
    print(f"✅ Admin user '{email}' created")

db.close()
