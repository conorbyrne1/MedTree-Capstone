# MedTree - Family Medical History Tracker

A React application for tracking and visualizing family medical history across generations.

## Features

- **Interactive Family Tree**: Draggable, zoomable tree visualization with color-coded cards for different generations
  - Blue cards: User (you)
  - Orange cards: Parents
  - Pink cards: Grandparents/Great-grandparents

- **Expandable Information Cards**: Click to expand sections showing:
  - Basic info (age, DOB, sex, alive status)
  - Medical issues with notes
  - Medications (for user)
  - Death information (for deceased family members)

- **User Authentication**: Login/signup functionality with session persistence

- **Medical Data Management**:
  - Add medical conditions for any family member
  - Track medications
  - Add healthcare providers

## Demo Credentials

```
Email: john@example.com
Password: password123
```

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. Extract the source code:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Project Structure

```
medtree/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Header.jsx      # Navigation header
│   │   ├── FamilyCard.jsx  # Expandable member card
│   │   └── FamilyTree.jsx  # Draggable tree visualization
│   ├── pages/              # Route pages
│   │   ├── HomePage.jsx    # Landing & dashboard
│   │   ├── LoginPage.jsx   # Authentication
│   │   ├── SignupPage.jsx  # Registration
│   │   ├── FamilyTreePage.jsx  # Tree view
│   │   ├── AboutPage.jsx   # About info
│   │   ├── AccountPage.jsx # User profile
│   │   ├── AddMedicalPage.jsx  # Add conditions/medications
│   │   └── AddProfessionalPage.jsx  # Add doctors
│   ├── context/
│   │   └── AuthContext.jsx # Authentication state
│   ├── data/
│   │   └── database.js     # Mock database & API
│   ├── styles/
│   │   └── global.css      # Global styles & variables
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Database Integration

The app uses a mock database (`src/data/database.js`). To connect to a real database:

1. Replace the mock API functions with actual API calls
2. Update the data structures to match your database schema
3. Add proper authentication (JWT, OAuth, etc.)

### API Functions to Replace

- `api.login()` - User authentication
- `api.signup()` - User registration
- `api.getFamilyTree()` - Fetch family tree data
- `api.addFamilyMember()` - Add new family member
- `api.updateFamilyMember()` - Update member info
- `api.addMedicalIssue()` - Add medical condition
- `api.addMedication()` - Add medication
- `api.getMedicalProfessionals()` - Get healthcare providers
- `api.addMedicalProfessional()` - Add healthcare provider

## Customization

### Colors
Edit CSS variables in `src/styles/global.css`:
```css
:root {
  --user-primary: #00b8e6;      /* User card color */
  --parent-primary: #ff9933;    /* Parent card color */
  --grandparent-primary: #ff6b9d; /* Grandparent card color */
}
```

### Adding More Generations
The data structure supports great-grandparents. Extend `FamilyTree.jsx` to add more rows.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
