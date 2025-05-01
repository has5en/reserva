import { Room, Class, Equipment, Request } from './models';

export const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    name: 'Lab A',
    capacity: 30,
    available: true,
    type: 'classroom',
    software: ['Python', 'MATLAB', 'Visual Studio Code'],
    equipment: ['Projecteur', 'Tableau blanc interactif'],
    floor: 'Rez-de-chaussée',
    building: 'Bâtiment A'
  },
  {
    id: '2',
    name: 'Lab B',
    capacity: 25,
    available: true,
    type: 'classroom',
    software: ['AutoCAD', 'Adobe Creative Suite'],
    equipment: ['Imprimante 3D', 'Scanner'],
    floor: '1er étage',
    building: 'Bâtiment B'
  },
  {
    id: '3',
    name: 'Salle 101',
    capacity: 50,
    available: true,
    type: 'classroom',
    equipment: ['Projecteur', 'Système audio'],
    floor: '2e étage',
    building: 'Bâtiment A'
  },
  {
    id: '4',
    name: 'Lab Physique',
    capacity: 20,
    available: true,
    type: 'classroom',
    equipment: ['Microscopes', 'Équipement d\'expérimentation'],
    floor: 'Sous-sol',
    building: 'Bâtiment C'
  }
];

export const MOCK_CLASSES: Class[] = [
  {
    id: '1',
    name: 'Classe 3A',
    studentCount: 30,
    departmentId: '1',
    unit: 'Unité A'
  },
  {
    id: '2',
    name: 'Classe 4B',
    studentCount: 25,
    departmentId: '1',
    unit: 'Unité B'
  },
  {
    id: '3',
    name: 'Design 2',
    studentCount: 18,
    departmentId: '2',
    unit: 'Unité C'
  },
  {
    id: '4',
    name: 'Physique Appliquée',
    studentCount: 22,
    departmentId: '3',
    unit: 'Unité D'
  }
];

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: '1',
    name: 'Ordinateur portable',
    category: 'Informatique',
    available: 15,
    location: 'Salle 101',
    description: 'Ordinateurs portables pour usage en classe'
  },
  {
    id: '2',
    name: 'Projecteur portable',
    category: 'Présentation',
    available: 5,
    location: 'Bureau technique',
    description: 'Projecteurs HD pour présentations'
  },
  {
    id: '3',
    name: 'Tablette graphique',
    category: 'Design',
    available: 10,
    location: 'Laboratoire design',
    description: 'Tablettes graphiques professionnelles'
  },
  {
    id: '4',
    name: 'Kit Arduino',
    category: 'Électronique',
    available: 20,
    location: 'Laboratoire électronique',
    description: 'Kits complets avec composants'
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
