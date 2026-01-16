import React, { useState, useMemo } from 'react';
import { Download, ChevronDown, AlertCircle, CheckCircle2, Search, Edit3, Save, X, FileText, Printer } from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';
import { getEmployees, getEmployeeRecords, formatTime, formatDate, isLate, updateRecord, getFaultCount } from '../services/store';

const HistoryPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(getEmployees());
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Acta Modal State
  const [actaModalOpen, setActaModalOpen] = useState(false);
  const [selectedActaRecord, setSelectedActaRecord] = useState<{employee: Employee, record: AttendanceRecord} | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEmployeeId(expandedEmployeeId === id ? null : id);
  };

  const filteredEmployees = useMemo(() => {
    let result = [...employees];
    // Sort by fault count (Descending)
    result.sort((a, b) => {
        const countA = getFaultCount(a.id);
        const countB = getFaultCount(b.id);
        return countB - countA;
    });
    return result.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [employees, searchTerm]);

  const handleEditStart = (record: AttendanceRecord) => {
    setEditingRecordId(record.id);
    const date = new Date(record.timestamp);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    setEditValue(localISOTime);
  };

  const handleEditSave = (recordId: string) => {
    if (editValue) {
        const date = new Date(editValue);
        updateRecord(recordId, date.toISOString());
        setEditingRecordId(null);
        setEmployees(getEmployees());
    }
  };

  const handleOpenActa = (employee: Employee, record: AttendanceRecord) => {
      setSelectedActaRecord({ employee, record });
      setActaModalOpen(true);
  };

  const handlePrintActa = () => {
      window.print();
  };

  const downloadCSV = (employee: Employee, records: AttendanceRecord[]) => {
    const headers = ['Nombre', 'Fecha', 'Hora', 'Estado'];
    const rows = records.map(record => {
      const late = isLate(record.timestamp);
      return [
        `"${employee.name}"`,
        `"${formatDate(record.timestamp)}"`,
        `"${formatTime(record.timestamp)}"`,
        `"${late ? 'Retardo' : 'A tiempo'}"`
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `faltas-${employee.name.replace(/\s+/g, '_')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    try {
      link.click();
    } catch (e) {
      console.error("Download failed", e);
      alert("No se pudo iniciar la descarga debido a restricciones del navegador.");
    } finally {
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:p-0 animate-fade-in">
      <div className="mb-10 print:hidden flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Historial</h1>
            <p className="mt-2 text-slate-500">Gestión de registros y actas administrativas.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm text-sm transition-all"
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="space-y-4 print:hidden">
          {filteredEmployees.map((employee, index) => {
            const records = getEmployeeRecords(employee.id);
            const isExpanded = expandedEmployeeId === employee.id;
            const lateCount = records.filter(r => isLate(r.timestamp)).length;

            return (
              <div 
                key={employee.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* List Header / Row */}
                <div 
                    className="p-5 cursor-pointer flex items-center justify-between group"
                    onClick={() => toggleExpand(employee.id)}
                >
                    <div className="flex items-center gap-4 min-w-0">
                         <img
                            className="h-12 w-12 rounded-full object-cover border-2 border-slate-100 group-hover:border-indigo-200 transition-colors"
                            src={employee.avatar}
                            alt=""
                          />
                          <div className="min-w-0">
                              <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{employee.name}</h3>
                              <p className="text-sm text-slate-500">{employee.department}</p>
                          </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                         <div className="hidden sm:flex flex-col items-end">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${lateCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {lateCount} {lateCount === 1 ? 'Retardo' : 'Retardos'}
                            </span>
                            <span className="text-xs text-slate-400 mt-1">{records.length} registros</span>
                         </div>
                         <div className={`p-2 rounded-full bg-slate-50 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-indigo-50 text-indigo-500' : ''}`}>
                             <ChevronDown className="h-5 w-5" />
                         </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-50 bg-slate-50/50 p-5 animate-fade-in">
                    <div className="flex justify-between items-center mb-5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detalle de Asistencia</h4>
                        {records.length > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); downloadCSV(employee, records); }}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                            >
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Exportar CSV
                            </button>
                        )}
                    </div>
                    
                    {records.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {records.map((record) => {
                                        const late = isLate(record.timestamp);
                                        const isEditing = editingRecordId === record.id;

                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                                                    {formatDate(record.timestamp)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {isEditing ? (
                                                        <input 
                                                            type="datetime-local" 
                                                            className="border border-indigo-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center group">
                                                            <span className="font-mono text-slate-900">{formatTime(record.timestamp)}</span>
                                                            <button 
                                                                onClick={() => handleEditStart(record)} 
                                                                className="ml-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                                            >
                                                                <Edit3 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {late ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            Retardo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            A tiempo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {isEditing ? (
                                                        <div className="flex justify-end space-x-2">
                                                            <button onClick={() => handleEditSave(record.id)} className="text-green-600 hover:text-green-800 p-1"><Save className="w-4 h-4" /></button>
                                                            <button onClick={() => setEditingRecordId(null)} className="text-red-500 hover:text-red-700 p-1"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleOpenActa(employee, record)}
                                                            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 hover:underline decoration-indigo-200 underline-offset-2 transition-all"
                                                        >
                                                            <FileText className="w-3.5 h-3.5 mr-1" />
                                                            Acta
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-sm text-slate-400 py-8 italic">No hay registros de asistencia.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredEmployees.length === 0 && (
             <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400">No se encontraron colaboradores.</p>
             </div>
          )}
      </div>

      {/* Acta Administrativa Modal (Print Friendly) */}
      {actaModalOpen && selectedActaRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm" style={{ margin: 0 }}>
             <div className="min-h-screen flex items-center justify-center p-4 print:p-0 print:block">
                 {/* Container */}
                 <div className="bg-white w-full max-w-4xl shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none">
                     
                     {/* Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center print:hidden">
                         <h2 className="text-lg font-bold text-slate-800">Vista Previa</h2>
                         <div className="flex space-x-3">
                            <button 
                                onClick={handlePrintActa}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir
                            </button>
                            <button 
                                onClick={() => setActaModalOpen(false)}
                                className="inline-flex items-center px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cerrar
                            </button>
                         </div>
                    </div>

                    {/* The document content */}
                    <div className="p-10 md:p-16 print:p-0 font-serif text-black leading-relaxed text-sm md:text-base">
                        <div className="text-center mb-12">
                            <h1 className="text-xl font-bold uppercase border-b-2 border-black inline-block pb-1">Acta Administrativa Laboral</h1>
                            <p className="text-xs mt-3 font-bold tracking-widest text-slate-600 print:text-black">POR RETARDOS Y/O FALTAS DE ASISTENCIA</p>
                        </div>

                        <div className="mb-8 text-right text-sm">
                            <p><strong>Lugar:</strong> Ciudad de México, México.</p>
                            <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric'})}.</p>
                            <p><strong>Hora:</strong> {new Date().toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}.</p>
                        </div>

                        <div className="text-justify space-y-6">
                            <p>
                                En la ciudad antes mencionada, se reúnen en el domicilio de la empresa, por una parte el <strong>C. REPRESENTANTE LEGAL/JEFE DE RECURSOS HUMANOS</strong> en su carácter de patrón o representante patronal, y por la otra el trabajador <strong>C. {selectedActaRecord.employee.name.toUpperCase()}</strong>, quien ocupa el puesto de <strong>{selectedActaRecord.employee.department.toUpperCase()}</strong>, así como dos testigos de asistencia.
                            </p>
                            
                            <p>
                                El motivo de la presente acta es hacer constar los hechos ocurridos el día <strong>{new Date(selectedActaRecord.record.timestamp).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</strong>.
                            </p>

                            <div className="bg-slate-50 p-6 border border-slate-100 rounded-lg print:border-none print:p-0 print:bg-transparent">
                                <p className="font-bold mb-2">HECHOS:</p>
                                <p>
                                    Se hace constar que el trabajador mencionado registró su entrada a las <strong>{new Date(selectedActaRecord.record.timestamp).toLocaleTimeString('es-MX')}</strong> horas, lo cual constituye {isLate(selectedActaRecord.record.timestamp) ? 'un retardo injustificado respecto a su horario laboral establecido' : 'un registro de asistencia'}.
                                </p>
                            </div>
                            
                            <p>
                                Dicha conducta contraviene las normas internas de trabajo de la empresa y lo dispuesto en la <strong>Ley Federal del Trabajo (LFT)</strong>, afectando la operación y disciplina del centro de trabajo. Se exhorta al trabajador a cumplir cabalmente con sus horarios establecidos para evitar la acumulación de sanciones que puedan derivar en la rescisión de la relación laboral conforme al Artículo 47 de la Ley Federal del Trabajo.
                            </p>

                            <p>
                                El trabajador en este acto hace uso de la voz para manifestar lo que a su derecho convenga respecto a los hechos imputados:
                            </p>
                            <div className="border-b border-black mt-8 mb-4 h-8"></div>
                            <div className="border-b border-black mb-8 h-8"></div>

                            <p>
                                No habiendo otro asunto que tratar, se cierra la presente acta, firmando al calce los que en ella intervinieron para su debida constancia y efectos legales a que haya lugar.
                            </p>
                        </div>

                        <div className="mt-24 grid grid-cols-2 gap-x-12 gap-y-20 text-center page-break-inside-avoid">
                            <div>
                                <div className="border-t border-black w-3/4 mx-auto pt-2"></div>
                                <p className="font-bold text-xs">EL TRABAJADOR</p>
                                <p className="text-[10px] uppercase mt-1">{selectedActaRecord.employee.name}</p>
                            </div>
                            <div>
                                <div className="border-t border-black w-3/4 mx-auto pt-2"></div>
                                <p className="font-bold text-xs">POR LA EMPRESA</p>
                                <p className="text-[10px] mt-1">JEFE DE RECURSOS HUMANOS</p>
                            </div>
                            <div>
                                <div className="border-t border-black w-3/4 mx-auto pt-2"></div>
                                <p className="font-bold text-xs">TESTIGO 1</p>
                            </div>
                            <div>
                                <div className="border-t border-black w-3/4 mx-auto pt-2"></div>
                                <p className="font-bold text-xs">TESTIGO 2</p>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;