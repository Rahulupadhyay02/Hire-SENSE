"""
Admin Creation & Seeding Utility for HireSense
Run this script to initialize or reset an Admin account.

Usage:
    ./venv/bin/python create_admin.py [email] [name] [password]

Default (if no args provided):
    Email:    admin@hiresense.com
    Name:     System Administrator
    Password: AdminPassword123!
    Role:     admin
"""
import sys
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.utils.security import hash_password

def seed_admin(email="admin@hiresense.com", name="System Administrator", password="AdminPassword123!"):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        if user:
            print(f"[*] User '{email}' already exists. Promoting to ADMIN and updating password...")
            user.role = UserRole.ADMIN
            user.password_hash = hash_password(password)
            user.name = name
            user.is_active = True
            db.commit()
            print(f"[✓] Admin account updated successfully for: {email}")
        else:
            print(f"[*] Creating new ADMIN account: {email}...")
            new_admin = User(
                name=name,
                email=email.lower().strip(),
                password_hash=hash_password(password),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(new_admin)
            db.commit()
            print(f"[✓] Admin account created successfully!")
            
        print("\n--- ADMIN CREDENTIALS ---")
        print(f"Email:    {email}")
        print(f"Password: {password}")
        print(f"Role:     admin")
        print("-------------------------\n")
    finally:
        db.close()

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "admin@hiresense.com"
    name = sys.argv[2] if len(sys.argv) > 2 else "System Administrator"
    pwd = sys.argv[3] if len(sys.argv) > 3 else "AdminPassword123!"
    seed_admin(email, name, pwd)
