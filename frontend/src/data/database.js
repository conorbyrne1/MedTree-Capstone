// Mock database for family medical tree
// In production, this would be API calls to a real database

// Sample users database
export const usersDB = [
  {
    id: 1,
    email: 'john@example.com',
    password: 'password123', // In production, this would be hashed
    firstName: 'John',
    lastName: 'Doe'
  },
  {
    id: 2,
    email: 'jane@example.com',
    password: 'password456',
    firstName: 'Jane',
    lastName: 'Smith'
  }
];

// Family tree data structure
// Types: 'user', 'parent', 'grandparent', 'great-grandparent'
export const familyTreeDB = {
  1: { // User ID 1's family tree
    user: {
      id: 'u1',
      type: 'user',
      name: 'John Doe',
      info: {
        age: 32,
        dob: '15/03/1993',
        sex: 'Male'
      },
      medicalIssues: [
        {
          issue: 'Asthma',
          notes: ['Mild symptoms', 'Controlled with inhaler']
        },
        {
          issue: 'Allergies',
          notes: ['Seasonal pollen', 'Takes antihistamines']
        }
      ],
      medications: [
        {
          name: 'Albuterol',
          dosage: '90 mcg',
          prescribedBy: 'Dr. Williams',
          reason: 'Asthma relief'
        },
        {
          name: 'Cetirizine',
          dosage: '10 mg',
          prescribedBy: 'Dr. Williams',
          reason: 'Allergy symptoms'
        }
      ]
    },
    parents: [
      {
        id: 'p1',
        type: 'parent',
        name: 'Jeffery Doe',
        info: {
          age: 58,
          dob: '22/07/1967',
          sex: 'Male',
          alive: true
        },
        medicalIssues: [
          {
            issue: 'Type 2 Diabetes',
            notes: ['Diagnosed 2015', 'Diet controlled']
          },
          {
            issue: 'Hypertension',
            notes: ['On medication since 2018']
          }
        ],
        deathInfo: null
      },
      {
        id: 'p2',
        type: 'parent',
        name: 'Jane Doe',
        info: {
          age: 55,
          dob: '08/11/1970',
          sex: 'Female',
          alive: true
        },
        medicalIssues: [
          {
            issue: 'Osteoporosis',
            notes: ['Early stage', 'Taking calcium supplements']
          }
        ],
        deathInfo: null
      }
    ],
    grandparents: [
      {
        id: 'g1',
        type: 'grandparent',
        name: 'Jesus Doe',
        parentId: 'p1',
        info: {
          age: 82,
          dob: '03/05/1943',
          sex: 'Male',
          alive: false
        },
        medicalIssues: [
          {
            issue: 'Heart Disease',
            notes: ['Had bypass surgery in 2010']
          },
          {
            issue: 'Type 2 Diabetes',
            notes: ['Insulin dependent']
          }
        ],
        deathInfo: {
          date: '14/02/2020',
          reason: 'Heart failure',
          notes: 'Passed peacefully at home'
        }
      },
      {
        id: 'g2',
        type: 'grandparent',
        name: 'Juliet Doe',
        parentId: 'p1',
        info: {
          age: 79,
          dob: '19/09/1946',
          sex: 'Female',
          alive: false
        },
        medicalIssues: [
          {
            issue: 'Breast Cancer',
            notes: ['Diagnosed 2008', 'Underwent chemotherapy']
          },
          {
            issue: 'Arthritis',
            notes: ['Rheumatoid arthritis']
          }
        ],
        deathInfo: {
          date: '28/06/2018',
          reason: 'Cancer complications',
          notes: 'Passed in hospice care'
        }
      },
      {
        id: 'g3',
        type: 'grandparent',
        name: 'James Smith',
        parentId: 'p2',
        info: {
          age: 84,
          dob: '11/01/1941',
          sex: 'Male',
          alive: false
        },
        medicalIssues: [
          {
            issue: 'Alzheimer\'s Disease',
            notes: ['Diagnosed 2015', 'Progressive decline']
          },
          {
            issue: 'Prostate Cancer',
            notes: ['Diagnosed 2012', 'Treated with radiation']
          }
        ],
        deathInfo: {
          date: '05/12/2021',
          reason: 'Alzheimer\'s complications',
          notes: 'Required full-time care in final years'
        }
      },
      {
        id: 'g4',
        type: 'grandparent',
        name: 'Jennifer Smith',
        parentId: 'p2',
        info: {
          age: 80,
          dob: '27/04/1945',
          sex: 'Female',
          alive: false
        },
        medicalIssues: [
          {
            issue: 'Stroke',
            notes: ['Minor stroke in 2019', 'Full recovery']
          },
          {
            issue: 'High Cholesterol',
            notes: ['On statins since 2005']
          }
        ],
        deathInfo: {
          date: '18/03/2023',
          reason: 'Stroke',
          notes: 'Second major stroke'
        }
      }
    ],
    greatGrandparents: [] // Can be extended
  }
};

// Medical professionals database
export const medicalProfessionalsDB = {
  1: [
    {
      id: 'mp1',
      name: 'Dr. Sarah Williams',
      specialty: 'General Practitioner',
      phone: '(555) 123-4567',
      email: 'swilliams@medclinic.com',
      address: '123 Medical Center Dr, Suite 100'
    },
    {
      id: 'mp2',
      name: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      phone: '(555) 234-5678',
      email: 'mchen@heartcare.com',
      address: '456 Heart Health Blvd'
    }
  ]
};

// API simulation functions
export const api = {
  // User authentication
  login: async (email, password) => {
    await delay(500); // Simulate network delay
    const user = usersDB.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  signup: async (userData) => {
    await delay(500);
    const exists = usersDB.find(u => u.email === userData.email);
    if (exists) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      id: usersDB.length + 1,
      ...userData
    };
    usersDB.push(newUser);
    
    // Create empty family tree for new user
    familyTreeDB[newUser.id] = {
      user: {
        id: `u${newUser.id}`,
        type: 'user',
        name: `${userData.firstName} ${userData.lastName}`,
        info: {
          age: userData.age || null,
          dob: userData.dob || null,
          sex: userData.sex || null
        },
        medicalIssues: [],
        medications: []
      },
      parents: [],
      grandparents: [],
      greatGrandparents: []
    };
    
    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  },

  // Family tree operations
  getFamilyTree: async (userId) => {
    await delay(300);
    const tree = familyTreeDB[userId];
    if (tree) {
      return { success: true, data: tree };
    }
    return { success: false, error: 'Family tree not found' };
  },

  addFamilyMember: async (userId, memberData) => {
    await delay(300);
    const tree = familyTreeDB[userId];
    if (!tree) {
      return { success: false, error: 'Family tree not found' };
    }
    
    const { type, ...data } = memberData;
    const newMember = {
      id: `${type[0]}${Date.now()}`,
      type,
      ...data
    };
    
    if (type === 'parent') {
      tree.parents.push(newMember);
    } else if (type === 'grandparent') {
      tree.grandparents.push(newMember);
    } else if (type === 'great-grandparent') {
      tree.greatGrandparents.push(newMember);
    }
    
    return { success: true, data: newMember };
  },

  updateFamilyMember: async (userId, memberId, updates) => {
    await delay(300);
    const tree = familyTreeDB[userId];
    if (!tree) {
      return { success: false, error: 'Family tree not found' };
    }
    
    // Find and update the member
    const allMembers = [tree.user, ...tree.parents, ...tree.grandparents, ...tree.greatGrandparents];
    const member = allMembers.find(m => m.id === memberId);
    
    if (member) {
      Object.assign(member, updates);
      return { success: true, data: member };
    }
    
    return { success: false, error: 'Member not found' };
  },

  // Medical info operations
  addMedicalIssue: async (userId, memberId, issue) => {
    await delay(200);
    const tree = familyTreeDB[userId];
    if (!tree) return { success: false, error: 'Family tree not found' };
    
    const allMembers = [tree.user, ...tree.parents, ...tree.grandparents, ...tree.greatGrandparents];
    const member = allMembers.find(m => m.id === memberId);
    
    if (member) {
      if (!member.medicalIssues) member.medicalIssues = [];
      member.medicalIssues.push(issue);
      return { success: true };
    }
    return { success: false, error: 'Member not found' };
  },

  addMedication: async (userId, medication) => {
    await delay(200);
    const tree = familyTreeDB[userId];
    if (!tree) return { success: false, error: 'Family tree not found' };
    
    if (!tree.user.medications) tree.user.medications = [];
    tree.user.medications.push(medication);
    return { success: true };
  },

  // Medical professionals
  getMedicalProfessionals: async (userId) => {
    await delay(200);
    return { success: true, data: medicalProfessionalsDB[userId] || [] };
  },

  addMedicalProfessional: async (userId, professional) => {
    await delay(200);
    if (!medicalProfessionalsDB[userId]) {
      medicalProfessionalsDB[userId] = [];
    }
    const newPro = {
      id: `mp${Date.now()}`,
      ...professional
    };
    medicalProfessionalsDB[userId].push(newPro);
    return { success: true, data: newPro };
  }
};

// Helper function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
