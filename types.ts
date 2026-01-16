export interface Employee {
  id: string;
  name: string;
  employeeNumber: string;
  department: string;
  avatar: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  timestamp: string; // ISO String
}

export interface AttendanceExportRow {
  Nombre: string;
  Fecha: string;
  Hora: string;
  Estado: string;
}
