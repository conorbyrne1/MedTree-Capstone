from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, family, medical, professionals
from database import engine
from sqlalchemy import text

app = FastAPI(title="MedTree API")


@app.on_event("startup")
def create_tables():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS MedicalProfessionals (
                ID INT NOT NULL AUTO_INCREMENT,
                AccountID INT NOT NULL,
                Name VARCHAR(255) NOT NULL,
                Specialty VARCHAR(255) NOT NULL,
                Phone VARCHAR(50) NULL,
                Email VARCHAR(255) NULL,
                Address VARCHAR(255) NULL,
                PRIMARY KEY (ID),
                INDEX fk_mp_account_idx (AccountID ASC),
                CONSTRAINT fk_mp_account
                    FOREIGN KEY (AccountID)
                    REFERENCES Account (ID)
                    ON DELETE CASCADE
            ) ENGINE = InnoDB
        """))
        conn.commit()

# CORS
# Allows the React dev server to talk to the FastAPI server locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)

# Routers
app.include_router(auth.router)
app.include_router(family.router)
app.include_router(medical.router)
app.include_router(professionals.router)

# Health Check
app.get("/health")
def health():
    return {"status": "ok"}

# Explicit OPTIONS Handlers
@app.options("/auth/signup")
def options_signup():
    return {}

@app.options("/auth/login")
def options_login():
    return{}
