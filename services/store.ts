import { Employee, AttendanceRecord } from '../types';
import { INITIAL_EMPLOYEES } from '../constants';

const STORAGE_KEY_RECORDS = 'asistencia_records';
const STORAGE_KEY_EMPLOYEES = 'asistencia_employees';

export const getEmployees = (): Employee[] => {
  const stored = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with mock data if empty
  localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  return INITIAL_EMPLOYEES;
};

export const addNewEmployee = (name: string, department: string, employeeNumber?: string): Employee => {
  const employees = getEmployees();
  const nextId = employees.length + 1;
  
  // Use provided number or auto-generate
  const finalEmployeeNumber = employeeNumber && employeeNumber.trim() !== '' 
    ? employeeNumber 
    : `EMP${nextId.toString().padStart(3, '0')}`;

  const newEmployee: Employee = {
    id: Date.now().toString(),
    name,
    department,
    employeeNumber: finalEmployeeNumber,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
  };
  
  const updatedEmployees = [...employees, newEmployee];
  localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(updatedEmployees));
  return newEmployee;
};

export const getRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY_RECORDS);
  return data ? JSON.parse(data) : [];
};

export const addRecord = (employeeId: string): AttendanceRecord => {
  const records = getRecords();
  const newRecord: AttendanceRecord = {
    id: Date.now().toString(),
    employeeId,
    timestamp: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify([...records, newRecord]));
  return newRecord;
};

export const updateRecord = (recordId: string, newTimestamp: string): void => {
  const records = getRecords();
  const updatedRecords = records.map(r => 
    r.id === recordId ? { ...r, timestamp: newTimestamp } : r
  );
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updatedRecords));
};

export const getEmployeeRecords = (employeeId: string): AttendanceRecord[] => {
  const records = getRecords();
  return records
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const isLate = (isoString: string): boolean => {
  const date = new Date(isoString);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  
  // Hardcoded rule: Late if after 9:15 AM
  if (hour > 9) return true;
  if (hour === 9 && minutes > 15) return true;
  return false;
};

export const getFaultCount = (employeeId: string): number => {
  const records = getEmployeeRecords(employeeId);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return records.filter(r => {
    const recordDate = new Date(r.timestamp);
    // Count as fault if it is within the last 30 days AND it is late
    return recordDate >= thirtyDaysAgo && isLate(r.timestamp);
  }).length;
};