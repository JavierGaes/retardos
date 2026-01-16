import React, { useState, useMemo, useEffect } from 'react';
import { Search, UserCheck, UserPlus, Briefcase, User, Hash } from 'lucide-react';
import { Employee } from '../types';
import { getEmployees, addRecord, getFaultCount, addNewEmployee } from '../services/store';
import Modal from '../components/Modal';

const CheckInPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check-in Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  
  // Add Employee Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');
  const [newEmpNumber, setNewEmpNumber] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  const sortedAndFilteredEmployees = useMemo(() => {
    let result = [...employees];
    
    // Sort by fault count (Descending) -> Red first, then Orange, Yellow, Gray
    result.sort((a, b) => {
        const countA = getFaultCount(a.id);
        const countB = getFaultCount(b.id);
        return countB - countA;
    });

    // Filter by search term
    const term = searchTerm.toLowerCase();
    if (term) {
        result = result.filter(
            (emp) => emp.name.toLowerCase().includes(term) || emp.employeeNumber.toLowerCase().includes(term)
        );
    }

    return result;
  }, [employees, searchTerm]);

  const handleCardClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsCheckInModalOpen(true);
    setSuccessMessage(null);
  };

  const handleConfirmCheckIn = () => {
    if (selectedEmployee) {
      addRecord(selectedEmployee.id);
      setIsCheckInModalOpen(false);
      setSuccessMessage(`Asistencia registrada para ${selectedEmployee.name}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setSelectedEmployee(null);
      // Refresh to update borders immediately if they just got a fault
      setEmployees(getEmployees()); 
    }
  };

  const handleSaveEmployee = () => {
    if (newEmpName.trim() && newEmpDept.trim()) {
      addNewEmployee(newEmpName, newEmpDept, newEmpNumber);
      setEmployees(getEmployees());
      setIsAddModalOpen(false);
      
      // Reset fields
      setNewEmpName('');
      setNewEmpDept('');
      setNewEmpNumber('');
      
      setSuccessMessage('Nuevo empleado registrado correctamente.');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const getBorderColorClass = (count: number) => {
    // Minimalist logic: Thinner borders, but colored shadows for "glow"
    if (count >= 3) return 'border-red-500 shadow-lg shadow-red-100 ring-1 ring-red-100';
    if (count === 2) return 'border-orange-400 shadow-lg shadow-orange-100 ring-1 ring-orange-100';
    if (count === 1) return 'border-yellow-400 shadow-lg shadow-yellow-100 ring-1 ring-yellow-100';
    return 'border-white shadow-sm hover:shadow-md';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Hola, buen día.</h1>
        <p className="mt-3 text-lg text-slate-500">Registra tu asistencia seleccionando tu perfil.</p>
      </div>

      {/* Success Notification - Toast Style */}
      {successMessage && (
        <div className="fixed top-24 right-5 z-50 animate-fade-in">
             <div className="bg-white/90 backdrop-blur border-l-4 border-green-500 shadow-2xl rounded-lg p-4 flex items-center pr-8">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                    <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{successMessage}</p>
             </div>
        </div>
      )}

      {/* Controls Container */}
      <div className="max-w-4xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col sm:flex-row gap-4 bg-white p-2 rounded-2xl shadow-sm ring-1 ring-slate-100">
                {/* Search */}
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl text-slate-900 placeholder-slate-400 focus:ring-0 sm:text-sm"
                        placeholder="Buscar por nombre o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Add Button */}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex-shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all duration-200 shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Nuevo
                </button>
            </div>
          </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
        {sortedAndFilteredEmployees.map((employee, index) => {
            const faultCount = getFaultCount(employee.id);
            const borderClass = getBorderColorClass(faultCount);
            
            return (
              <div
                key={employee.id}
                onClick={() => handleCardClick(employee)}
                className={`group relative bg-white rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 border-2 hover:-translate-y-1 ${borderClass}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative">
                     <img
                        className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                        src={employee.avatar}
                        alt={employee.name}
                    />
                    {faultCount > 0 && (
                        <span className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white ${faultCount >= 3 ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'}`}>
                            {faultCount}
                        </span>
                    )}
                </div>
                
                <div className="mt-4 w-full">
                  <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {employee.name}
                  </h3>
                  <p className="text-sm font-medium text-indigo-500 mb-1">{employee.department}</p>
                  <p className="text-xs text-slate-400 bg-slate-50 py-1 px-3 rounded-full inline-block">
                    {employee.employeeNumber}
                  </p>
                </div>
              </div>
            );
        })}

        {sortedAndFilteredEmployees.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg font-medium">No se encontraron empleados.</p>
            <p className="text-slate-400 text-sm">Intenta con otro término o agrega uno nuevo.</p>
          </div>
        )}
      </div>

      {/* Check In Confirmation Modal */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onConfirm={handleConfirmCheckIn}
        title="Confirmar Entrada"
      >
        <div className="mt-4 flex flex-col items-center">
             {selectedEmployee && (
                 <>
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-indigo-200 rounded-full blur opacity-40"></div>
                        <img 
                            src={selectedEmployee.avatar} 
                            alt="Avatar" 
                            className="relative h-24 w-24 rounded-full border-4 border-white shadow-lg" 
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedEmployee.name}</h2>
                    <p className="text-indigo-500 font-medium">{selectedEmployee.department}</p>
                 </>
             )}
        </div>
        
        <div className="mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
             <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Hora de registro</p>
             <p className="text-3xl font-mono font-bold text-slate-800 tracking-widest">
                 {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
             </p>
        </div>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleSaveEmployee}
        title="Nuevo Colaborador"
      >
         <div className="space-y-5 mt-2">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                        placeholder="Ej. Juan Pérez"
                        value={newEmpName}
                        onChange={(e) => setNewEmpName(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">No. de Empleado <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                        placeholder="Ej. 12345"
                        value={newEmpNumber}
                        onChange={(e) => setNewEmpNumber(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Departamento</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                        placeholder="Ej. Ventas"
                        value={newEmpDept}
                        onChange={(e) => setNewEmpDept(e.target.value)}
                    />
                </div>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default CheckInPage;