import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_COMPLAINTS } from '../constants';
import { ComplaintStatus } from '../types';
import { OdooControlPanel } from '../components/OdooControlPanel';

const ComplaintList: React.FC = () => {
  const navigate = useNavigate();

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pendiente': return 'bg-gray-200 text-gray-700';
      case 'En Proceso': return 'bg-blue-100 text-blue-800';
      case 'Resuelto': return 'bg-green-100 text-green-800';
      case 'Anulado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getBorderColor = (status: ComplaintStatus) => {
    switch(status) {
        case 'Pendiente': return 'border-l-gray-400';
        case 'En Proceso': return 'border-l-blue-500';
        case 'Resuelto': return 'border-l-green-500';
        default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-odoo-bg">
      <OdooControlPanel 
        title="Libro de Reclamaciones" 
        onCreate={() => navigate('/create')} 
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MOCK_COMPLAINTS.map((complaint) => (
                <div 
                    key={complaint.id}
                    onClick={() => navigate(`/complaint/${complaint.id}`)}
                    className={`bg-white rounded shadow-sm border border-gray-200 p-3 hover:shadow-md cursor-pointer transition-shadow flex flex-col gap-2 relative overflow-hidden border-l-4 ${getBorderColor(complaint.status)}`}
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 truncate pr-2 text-[13px]">{complaint.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(complaint.status)}`}>
                            {complaint.status}
                        </span>
                    </div>

                    <div className="text-xs font-mono text-gray-500 mb-1">
                        {complaint.id}
                    </div>

                    <div className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                        {complaint.description}
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                         <div className="flex-1">
                             <p className="text-[11px] font-bold text-gray-700 truncate">{complaint.consumerName}</p>
                             <p className="text-[10px] text-gray-400">{complaint.date}</p>
                         </div>
                         {complaint.type === 'Reclamo' ? (
                             <span className="material-symbols-outlined text-red-400 text-[16px]" title="Reclamo">error</span>
                         ) : (
                             <span className="material-symbols-outlined text-orange-400 text-[16px]" title="Queja">sentiment_dissatisfied</span>
                         )}
                    </div>
                </div>
            ))}
            
            {/* Empty State / Add New Card */}
            <div 
                onClick={() => navigate('/create')}
                className="border-2 border-dashed border-gray-300 rounded p-4 flex flex-col items-center justify-center text-gray-400 hover:border-odoo-brand hover:text-odoo-brand hover:bg-white transition-colors cursor-pointer min-h-[140px]"
            >
                <span className="material-symbols-outlined text-3xl mb-1">post_add</span>
                <span className="text-sm font-medium">Registrar Nuevo</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintList;