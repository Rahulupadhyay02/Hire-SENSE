from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserLogin, UserResponse, Token
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.deps import get_current_user, require_recruiter, require_candidate

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user (Recruiter or Candidate)"""
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Create new user
    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hashed_pwd,
        role=user_in.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT
    access_token = create_access_token(subject=new_user.id, role=new_user.role.value)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password, with role validation"""
    user = db.query(User).filter(User.email == credentials.email.lower().strip()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account has been deactivated."
        )

    # Strict role verification: prevent cross-portal unauthorized access
    if credentials.expected_role:
        # Admin is allowed on any portal
        if user.role != UserRole.ADMIN and user.role != credentials.expected_role:
            actual_role_name = user.role.value.capitalize()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: This account is registered as a {actual_role_name}. Please switch to the {actual_role_name} portal to sign in."
            )

    access_token = create_access_token(subject=user.id, role=user.role.value)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile"""
    return UserResponse.model_validate(current_user)

@router.get("/test-recruiter")
def test_recruiter_access(current_user: User = Depends(require_recruiter)):
    """Test route restricted to recruiters and admins"""
    return {"message": f"Welcome Recruiter {current_user.name}!", "role": current_user.role}

@router.get("/test-candidate")
def test_candidate_access(current_user: User = Depends(require_candidate)):
    """Test route restricted to candidates and admins"""
    return {"message": f"Welcome Candidate {current_user.name}!", "role": current_user.role}
