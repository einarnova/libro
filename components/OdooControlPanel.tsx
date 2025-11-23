import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ControlPanelProps {
  title: string;
  onSearch?: (query: string) => void;
  onCreate?: () => void;
  showCreate?: boolean;
  showBack?: boolean; // New prop for explicit back button
}

export const OdooControlPanel: React.FC<ControlPanelProps> = ({ 
  title, 
  onCreate, 
  showCreate = true,
  showBack = false 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-odoo-border p-3 md:px-5 md:py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        {/* Back Button */}
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="md:hidden p-1.5 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        )}

        <h1 className="text-lg md:text-xl text-gray-800 font-bold truncate">{title}</h1>
        
        {showCreate && (
            <button 
                onClick={onCreate}
                className="bg-odoo-brand hover:bg-odoo-brandDark text-white px-3 py-1.5 rounded text-sm uppercase font-medium shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap ml-2"
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="hidden sm:inline">Nuevo</span>
            </button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search Bar Odoo Style */}
        <div className="relative flex-1 md:w-[300px] lg:w-[400px]">
            <input 
                type="text" 
                placeholder="Buscar..."
                className="w-full bg-odoo-bg border-b border-gray-300 focus:border-odoo-brand px-3 py-1.5 text-sm outline-none transition-colors rounded-t-sm"
            />
            <span className="absolute right-2 top-1.5 material-symbols-outlined text-gray-400 text-[18px]">search</span>
        </div>

        {/* View Switcher - Hidden on mobile */}
        <div className="hidden md:flex bg-gray-100 rounded border border-gray-200 p-0.5 shrink-0">
            <button className="p-1 rounded bg-white shadow-sm text-odoo-brand"><span className="material-symbols-outlined text-[18px]">view_kanban</span></button>
            <button className="p-1 rounded hover:bg-white text-gray-500 hover:text-odoo-brand"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
        </div>
      </div>
    </div>
  );
};
