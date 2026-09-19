import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.utils.security import hash_password, create_access_token

# In-memory SQLite for testing with StaticPool so all connections share the DB
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def recruiter_user(db_session):
    user = User(
        name="Sarah Jenkins",
        email="sarah.test@hiresense.internal",
        password_hash=hash_password("RecruiterPass123!"),
        role=UserRole.RECRUITER,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def recruiter_headers(recruiter_user):
    token = create_access_token(subject=recruiter_user.id, role=recruiter_user.role.value)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def candidate_user(db_session):
    user = User(
        name="Alex Chen",
        email="alex.test@hiresense.internal",
        password_hash=hash_password("CandidatePass123!"),
        role=UserRole.CANDIDATE,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    candidate = Candidate(
        user_id=user.id,
        phone="+1-555-0199",
        education="B.S. Computer Science",
        experience_years=3.5,
        skills=["Python", "FastAPI", "React", "Docker", "SQL"],
    )
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)
    return user

@pytest.fixture
def candidate_headers(candidate_user):
    token = create_access_token(subject=candidate_user.id, role=candidate_user.role.value)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def candidate_user_2(db_session):
    user = User(
        name="Priya Patel",
        email="priya.test@hiresense.internal",
        password_hash=hash_password("CandidatePass123!"),
        role=UserRole.CANDIDATE,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    candidate = Candidate(
        user_id=user.id,
        phone="+1-555-0288",
        education="M.S. Data Science",
        experience_years=4.0,
        skills=["Python", "Machine Learning", "PyTorch", "NLP"],
    )
    db_session.add(candidate)
    db_session.commit()
    db_session.refresh(candidate)
    return user

@pytest.fixture
def candidate_headers_2(candidate_user_2):
    token = create_access_token(subject=candidate_user_2.id, role=candidate_user_2.role.value)
    return {"Authorization": f"Bearer {token}"}
