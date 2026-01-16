import { Employee } from './types';

// Mock Employees Data
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    employeeNumber: 'EMP001',
    department: 'Ventas',
    avatar: 'https://picsum.photos/seed/carlos/200/200',
  },
  {
    id: '2',
    name: 'Ana García',
    employeeNumber: 'EMP002',
    department: 'Recursos Humanos',
    avatar: 'https://picsum.photos/seed/ana/200/200',
  },
  {
    id: '3',
    name: 'Miguel Ángel Torres',
    employeeNumber: 'EMP003',
    department: 'Desarrollo',
    avatar: 'https://picsum.photos/seed/miguel/200/200',
  },
  {
    id: '4',
    name: 'Lucía Fernández',
    employeeNumber: 'EMP004',
    department: 'Marketing',
    avatar: 'https://picsum.photos/seed/lucia/200/200',
  },
  {
    id: '5',
    name: 'Roberto Sánchez',
    employeeNumber: 'EMP005',
    department: 'Logística',
    avatar: 'https://picsum.photos/seed/roberto/200/200',
  },
  {
    id: '6',
    name: 'Elena Díaz',
    employeeNumber: 'EMP006',
    department: 'Desarrollo',
    avatar: 'https://picsum.photos/seed/elena/200/200',
  },
];

export const LATE_THRESHOLD_HOUR = 9; // 9:00 AM
export const LATE_THRESHOLD_MINUTE = 15; // 9:15 AM
