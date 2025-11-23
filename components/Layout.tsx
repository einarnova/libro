import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isDashboard = location.pathname === '/';

  return (
    <div className="min-h-screen bg-odoo-bg flex flex-col font-sans text-gray-600 text-[13px] md:text-sm">
      {/* Odoo Top Navbar */}
      <nav className="w-full bg-odoo-brand text-white h-[46px] flex items-center px-4 justify-between shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          {/* App Switcher / Home */}
          <button 
            onClick={() => navigate('/')}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
            title="Aplicaciones"
          >
            <span className="material-symbols-outlined text-[20px]">apps</span>
          </button>
          
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <span className="opacity-90 cursor-pointer hover:underline" onClick={() => navigate('/')}>Odoo</span>
            
            {location.pathname.includes('/complaints') && !location.pathname.includes('/website') && (
              <>
                <span className="opacity-60 text-xs">/</span>
                <span className="opacity-90 cursor-pointer hover:underline" onClick={() => navigate('/complaints')}>Reclamaciones</span>
              </>
            )}

            {location.pathname.includes('/module-code') && (
              <>
                <span className="opacity-60 text-xs">/</span>
                <span className="opacity-100">Código del Módulo</span>
              </>
            )}

            {location.pathname.includes('/create') && (
               <>
                 <span className="opacity-60 text-xs">/</span>
                 <span className="opacity-100">Nuevo</span>
               </>
            )}
            {location.pathname.includes('/complaint/') && (
               <>
                 <span className="opacity-60 text-xs">/</span>
                 <span className="opacity-100">Detalles</span>
               </>
            )}
          </div>
        </div>

        {/* Top Right User Menu */}
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-white/90">
                <button className="hover:text-white"><span className="material-symbols-outlined text-[18px]">chat_bubble</span></button>
                <button className="hover:text-white"><span className="material-symbols-outlined text-[18px]">schedule</span></button>
                <button className="hover:text-white"><span className="material-symbols-outlined text-[18px]">notifications</span></button>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-white/30">
                    AD
                </div>
                <span className="hidden md:block text-sm font-medium">Admin</span>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
         {children}
      </main>
    </div>
  );
};