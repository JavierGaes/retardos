import React from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, Users } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 border-b border-white/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">
              Asistencia<span className="text-indigo-600">PRO</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                    : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                }`
              }
            >
              <Users className="w-4 h-4 mr-2" />
              Registro
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                    : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                }`
              }
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Historial
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;