import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in" 
            aria-hidden="true" 
            onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-middle bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full animate-slide-up ring-1 ring-black/5">
          
          <div className="bg-white px-6 pt-6 pb-6">
            <div className="flex justify-between items-start">
                 <h3 className="text-xl font-bold leading-6 text-slate-900" id="modal-title">
                  {title}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-1 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-4">
               {children}
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg shadow-indigo-200 px-5 py-3 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm active:scale-95"
              onClick={onConfirm}
            >
              Confirmar
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center items-center rounded-xl border border-slate-200 shadow-sm px-5 py-3 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:w-auto sm:text-sm active:scale-95"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;