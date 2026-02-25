# MedTree

MedTree is a full-stack web application for tracking and visualizing family medical history across generations. Users can build an interactive family tree, record medical conditions and medications for each family member, and view inherited health patterns at a glance.

---

## Project Structure

```
MedTree-Capstone/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── auth.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── .env
│   └── routes/
│       ├── __init__.py
│       ├── auth.py
│       ├── family.py
│       └── medical.py
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── context/
    │   └── AuthContext.jsx
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── LoginPage.jsx
    │   ├── SignupPage.jsx
    │   ├── FamilyTreePage.jsx
    │   ├── AccountPage.jsx
    │   ├── AddMedicalPage.jsx
    │   ├── AddProfessionalPage.jsx
    │   └── AboutPage.jsx
    └── components/
        ├── Header.jsx
        ├── FamilyTree.jsx
        └── FamilyCard.jsx
```

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Plain CSS

**Backend**
- Python 3.12
- FastAPI
- SQLAlchemy Core (raw SQL, no ORM)
- PyMySQL
- passlib + bcrypt (password hashing)
- python-jose (JWT authentication)

**Database**
- MySQL

---

## Prerequisites

- Node.js 18+
- Python 3.12+
- MySQL server running with the `medtree` schema applied

---

## Database Setup

Apply the schema to your MySQL instance before running the backend:

```bash
mysql -u your_username -p < MedTreeCreateDatabase.sql
```

The schema creates the following tables: `Person`, `Account`, `Contact`, `AccountContact`, `PersonRelationshipTypes`, `PersonRelationships`, `MedicalDiagnosis`, `PersonMedicalDiagnosis`, `Medications`, `PersonMedications`, `PreviousProcedures`, `PersonPreviousProcedures`, `Allergies`, `PersonAllergies`, `MedicalOffice`, `MedicalOfficePerson`.

---

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=medtree
JWT_SECRET=pick-a-long-random-string-here
```

Run the backend:

```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. An interactive API explorer is available at `http://localhost:8000/docs`.

---

## Frontend Setup

From the project root:

```bash
npm install
npm run dev
```

The React app will be available at `http://localhost:5173`.

---

## Authentication

Authentication uses JWT tokens. On login or signup, a token is issued and stored in `localStorage` under the key `medtree_token`. All protected API routes require this token as a Bearer header. Tokens expire after 24 hours.

Passwords are stored as bcrypt hashes. There are no plaintext passwords in the database.

---

## API Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Create a new account | No |
| POST | `/auth/login` | Log in and receive a token | No |
| GET | `/family/tree` | Get the logged-in user's family tree | Yes |
| POST | `/family/member` | Add a family member | Yes |
| POST | `/medical/condition` | Add a medical condition to a family member | Yes |
| POST | `/medical/medication` | Add a medication for the logged-in user | Yes |
| GET | `/health` | Health check | No |

## Development Notes

- Always activate the virtual environment before running the backend: `.venv\Scripts\activate`
- The backend must be running on port `8000` and the frontend on port `5173` for CORS to work correctly in development
- The `PersonRelationshipTypes` table requires at least one row with `TypeName = 'parent'`. The backend creates this row automatically on the first call to add a family member if it does not already exist
- The `.env` file is excluded from version control and must be created manually on each new environment