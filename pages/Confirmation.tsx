import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Header } from '../components/Header';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve the code from the navigation state or fallback
  const generatedCode = location.state?.code || "LR-2024-XXXX";
  const isFromWebsite = location.state?.fromWebsite || false;

  return (
    <div className={`relative flex h-full min-h-full w-full flex-col bg-white dark:bg-slate-900 ${isFromWebsite ? 'absolute inset-0 z-50 overflow-y-auto' : ''}`}>
      
      {/* Mobile-style header just for this screen if needed, or rely on layout */}
      {!isFromWebsite && (
        <div className="flex items-center p-4 md:hidden">
            <button onClick={() => navigate('/complaints')} className="p-2 -ml-2 text-gray-600">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
      )}

      {/* Website Header Style if from Website (Prime Theme) */}
      {isFromWebsite && (
          <header className="bg-[#212529] py-5 mb-0 sticky top-0 z-40 shadow-lg">
            <div className="container mx-auto px-4 max-w-[1400px] flex justify-center md:justify-start">
                 <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="bg-prime-yellow text-black font-display font-bold text-2xl px-2 rounded-sm tracking-tighter">PRIME</div>
                    <span className="text-2xl font-display font-bold text-white tracking-tight">Electronics</span>
                </div>
            </div>
          </header>
      )}

      <div className="flex flex-col items-center justify-center grow px-4 text-center py-12">
        <div className={`flex items-center justify-center size-24 rounded-full mb-8 shadow-sm animate-in zoom-in duration-500 ${isFromWebsite ? 'bg-yellow-50' : 'bg-green-50 dark:bg-green-900/20'}`}>
          <span className={`material-symbols-outlined ${isFromWebsite ? 'text-prime-yellow' : 'text-green-500 dark:text-green-400'}`} style={{ fontSize: '48px' }}>
            check_circle
          </span>
        </div>

        <h1 className="text-text-dark dark:text-white tracking-tight text-2xl font-bold leading-tight px-4 pb-3">
          ¡Registrado con Éxito!
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed pb-6 px-8 max-w-sm mx-auto">
          Su solicitud ha sido guardada en el Libro de Reclamaciones Virtual. Se ha enviado una copia al correo electrónico registrado.
        </p>
        
        <div className={`px-8 py-5 rounded-sm mt-2 border border-dashed shadow-sm ${isFromWebsite ? 'bg-[#F9F9F9] border-gray-300' : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 rounded-xl'}`}>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Código de Registro</p>
            <p className={`text-2xl font-mono font-bold tracking-widest ${isFromWebsite ? 'text-[#212529]' : 'text-odoo-brand dark:text-white'}`}>{generatedCode}</p>
        </div>
      </div>

      <div className="flex flex-col p-5 space-y-3 pb-8 md:px-12 w-full max-w-sm mx-auto">
        {isFromWebsite ? (
             <button 
                onClick={() => navigate('/website/complaints')}
                className="w-full bg-prime-yellow hover:bg-prime-yellowHover text-black font-bold uppercase tracking-wide py-3 rounded-sm shadow-sm transition-transform active:scale-[0.99] text-sm"
            >
                Volver al Sitio Web
            </button>
        ) : (
            <>
                <Button 
                variant="primary" 
                fullWidth 
                onClick={() => navigate('/complaints')}
                >
                Ver Mis Reclamos
                </Button>
                
                <Button 
                variant="ghost" 
                fullWidth 
                onClick={() => navigate('/')} 
                >
                Volver al Inicio
                </Button>
            </>
        )}
      </div>
      
    </div>
  );
};

export default Confirmation;