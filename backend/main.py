from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, family, medical

app = FastAPI(title="MedTree API")

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
