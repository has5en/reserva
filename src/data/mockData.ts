
import { Room, Class, Equipment, Request } from './models';

export const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    name: 'Lab A',
    capacity: 30,
    available: true,
    software: ['Python', 'MATLAB', 'Visual Studio Code'],
    equipment: ['Projecteur', 'Tableau blanc interactif'],
    department: 'Informatique'
  },
  {
    id: '2',
    name: 'Lab B',
    capacity: 25,
    available: true,
    software: ['AutoCAD', 'Adobe Creative Suite'],
    equipment: ['Imprimante 3D', 'Scanner'],
    department: 'Design'
  },
  {
    id: '3',
    name: 'Salle 101',
    capacity: 50,
    available: true,
    equipment: ['Projecteur', 'Système audio'],
    department: 'Général'
  },
  {
    id: '4',
    name: 'Lab Physique',
    capacity: 20,
    available: true,
    equipment: ['Microscopes', 'Équipement d\'expérimentation'],
    department: 'Sciences'
  }
];

export const MOCK_CLASSES: Class[] = [
  {
    id: '1',
    name: 'Classe 3A',
    studentCount: 30,
    department: 'Informatique'
  },
  {
    id: '2',
    name: 'Classe 4B',
    studentCount: 25,
    department: 'Informatique'
  },
  {
    id: '3',
    name: 'Design 2',
    studentCount: 18,
    department: 'Design'
  },
  {
    id: '4',
    name: 'Physique Appliquée',
    studentCount: 22,
    department: 'Sciences'
  }
];

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: '1',
    name: 'Ordinateur portable',
    category: 'Informatique',
    available: 15,
    department: 'IT'
  },
  {
    id: '2',
    name: 'Projecteur portable',
    category: 'Présentation',
    available: 5,
    department: 'Général'
  },
  {
    id: '3',
    name: 'Tablette graphique',
    category: 'Design',
    available: 10,
    department: 'Design'
  },
  {
    id: '4',
    name: 'Kit Arduino',
    category: 'Électronique',
    available: 20,
    department: 'Informatique'
  }
];

export const MOCK_REQUESTS: Request[] = [
  {
    id: '1',
    type: 'room',
    status: 'pending',
    createdAt: '2025-04-08T10:30:00Z',
    updatedAt: '2025-04-08T10:30:00Z',
    userId: '1',
    userName: 'Jean Dupont',
    roomId: '1',
    roomName: 'Lab A',
    classId: '1',
    className: 'Classe 3A',
    date: '2025-04-12',
    startTime: '09:00',
    endTime: '11:00',
    notes: 'Session de programmation Python',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSU...'
  },
  {
    id: '2',
    type: 'equipment',
    status: 'admin_approved',
    createdAt: '2025-04-07T14:15:00Z',
    updatedAt: '2025-04-07T16:30:00Z',
    userId: '1',
    userName: 'Jean Dupont',
    equipmentId: '1',
    equipmentName: 'Ordinateur portable',
    equipmentQuantity: 10,
    classId: '2',
    className: 'Classe 4B',
    date: '2025-04-15',
    notes: 'Travaux pratiques sur Excel',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSU...',
    adminApproval: {
      userId: '2',
      userName: 'Marie Lambert',
      timestamp: '2025-04-07T16:30:00Z',
      notes: 'Approuvé, matériel disponible'
    }
  },
  {
    id: '3',
    type: 'room',
    status: 'approved',
    createdAt: '2025-04-05T09:45:00Z',
    updatedAt: '2025-04-06T11:20:00Z',
    userId: '1',
    userName: 'Jean Dupont',
    roomId: '3',
    roomName: 'Salle 101',
    classId: '1',
    className: 'Classe 3A',
    date: '2025-04-10',
    startTime: '14:00',
    endTime: '16:00',
    notes: 'Présentation de fin de semestre',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSU...',
    adminApproval: {
      userId: '2',
      userName: 'Marie Lambert',
      timestamp: '2025-04-05T14:30:00Z',
      notes: 'Salle disponible'
    },
    supervisorApproval: {
      userId: '3',
      userName: 'Philippe Martin',
      timestamp: '2025-04-06T11:20:00Z',
      notes: 'Approuvé pour la présentation'
    }
  },
  {
    id: '4',
    type: 'equipment',
    status: 'rejected',
    createdAt: '2025-04-03T13:30:00Z',
    updatedAt: '2025-04-04T10:15:00Z',
    userId: '1',
    userName: 'Jean Dupont',
    equipmentId: '3',
    equipmentName: 'Tablette graphique',
    equipmentQuantity: 15,
    classId: '2',
    className: 'Classe 4B',
    date: '2025-04-09',
    notes: 'Atelier design',
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSU...',
    adminApproval: {
      userId: '2',
      userName: 'Marie Lambert',
      timestamp: '2025-04-04T10:15:00Z',
      notes: 'Quantité demandée non disponible, seulement 10 disponibles'
    }
  }
];
