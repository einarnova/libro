import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AppIconProps {
  icon: string;
  name: string;
  color: string;
  onClick?: () => void;
  badge?: string;
  isDev?: boolean;
}

const AppIcon: React.FC<AppIconProps> = ({ icon, name, color, onClick, badge, isDev }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl hover:bg-black/5 transition-all duration-200 group w-[120px] md:w-[140px]"
  >
    <div 
        className={`size-16 md:size-[75px] rounded-2xl flex items-center justify-center text-white shadow-odoo shadow-lg transform group-hover:scale-105 transition-transform duration-200 relative ${isDev ? 'bg-gray-800' : ''}`}
        style={{ backgroundColor: isDev ? undefined : color }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>{icon}</span>
      {badge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
              {badge}
          </span>
      )}
      {isDev && (
          <span className="absolute bottom-1 right-1 text-[8px] opacity-70 font-mono">DEV</span>
      )}
    </div>
    <span className="text-gray-700 font-medium text-sm md:text-[15px] group-hover:text-gray-900 drop-shadow-sm text-center leading-tight">{name}</span>
  </button>
);

const OdooDashboard: React.FC = () => {
  const navigate = useNavigate();

  const apps = [
    { name: 'Conversaciones', icon: 'forum', color: '#10B981', action: () => alert('Demo: Módulo de Mensajes') },
    { name: 'Sitio Web', icon: 'language', color: '#3B82F6', action: () => navigate('/website/complaints') },
    { name: 'Facturación', icon: 'receipt_long', color: '#F59E0B', action: () => alert('Demo: Contabilidad') },
    { name: 'Contactos', icon: 'contacts', color: '#6366F1', action: () => alert('Demo: Contactos') },
    { name: 'Reclamaciones', icon: 'report_problem', color: '#714B67', action: () => navigate('/complaints'), badge: '3' },
    { name: 'Exportar Módulo', icon: 'code', color: '#343a40', action: () => navigate('/module-code'), isDev: true },
  ];

  return (
    <div 
      className="flex-1 overflow-y-auto bg-cover bg-center flex items-start justify-center pt-10 md:pt-20"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80")', backgroundSize: 'cover' }}
    >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl"></div>
        
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6 max-w-5xl mx-auto">
            {apps.map((app, index) => (
                <AppIcon 
                    key={index}
                    name={app.name}
                    icon={app.icon}
                    color={app.color}
                    onClick={app.action}
                    badge={app.badge}
                    isDev={app.isDev}
                />
            ))}
        </div>
    </div>
  );
};

export default OdooDashboard;