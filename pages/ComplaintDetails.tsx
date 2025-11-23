import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_COMPLAINTS } from '../constants';
import { OdooControlPanel } from '../components/OdooControlPanel';
import { Complaint, ComplaintStatus } from '../types';

const ComplaintDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | undefined>();
  const [activeTab, setActiveTab] = useState('info');
  const [currentStatus, setCurrentStatus] = useState<ComplaintStatus>('Pendiente');

  useEffect(() => {
    const found = MOCK_COMPLAINTS.find(c => c.id === id);
    if (found) {
        setComplaint(found);
        setCurrentStatus(found.status);
    }
  }, [id]);

  if (!complaint) return <div className="p-8 text-center text-gray-500">Cargando reclamación...</div>;

  const handleStatusChange = (status: ComplaintStatus) => {
      // In a real app, this would be an API call
      setCurrentStatus(status);
  };

  const handlePrint = () => {
      window.print();
  };

  const statusOptions: ComplaintStatus[] = ['Pendiente', 'En Proceso', 'Resuelto', 'Anulado'];

  return (
    <div className="flex flex-col h-full bg-odoo-bg overflow-hidden print:bg-white">
      <div className="print:hidden">
        <OdooControlPanel 
            title={`Reclamaciones / ${complaint.id}`} 
            showCreate={true}
            onCreate={() => navigate('/create')}
            showBack={true}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center gap-6 print:p-0 print:overflow-visible">
        
        {/* Odoo Form Sheet */}
        <div className="w-full max-w-6xl bg-white shadow-sheet rounded border border-gray-300 flex flex-col relative print:shadow-none print:border-none print:max-w-none">
            
            {/* Print Only Header */}
            <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-8">
                <h1 className="text-2xl font-bold uppercase">Hoja de Reclamación</h1>
                <p className="text-sm">Conforme al Código de Protección y Defensa del Consumidor</p>
                <p className="text-xl font-mono font-bold mt-2">{complaint.id}</p>
            </div>

            {/* Smart Buttons (Top Right inside sheet) */}
            <div className="absolute top-0 right-0 p-2 flex gap-2 print:hidden">
                 <button onClick={handlePrint} className="flex flex-col items-center justify-center bg-transparent hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded px-3 py-1 text-gray-600 min-w-[80px]">
                      <span className="material-symbols-outlined text-lg">print</span>
                      <span className="text-[10px] font-bold">Imprimir</span>
                 </button>
            </div>

            {/* Status Bar Header */}
            <div className="flex flex-col md:flex-row justify-between items-center p-3 border-b border-gray-100 gap-4 mt-8 md:mt-0 print:hidden">
                <div className="flex gap-2">
                    <button className="bg-odoo-brand hover:bg-odoo-brandDark text-white px-3 py-1.5 rounded text-sm font-medium uppercase shadow-sm">
                        Editar
                    </button>
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium uppercase shadow-sm">
                        Enviar por Email
                    </button>
                </div>

                {/* Interactive Status Pipeline Widget */}
                <div className="flex rounded-sm overflow-hidden text-xs font-medium border border-gray-300 cursor-pointer">
                    {statusOptions.map((step, idx) => {
                        const isActive = currentStatus === step;
                        const isPast = statusOptions.indexOf(currentStatus) > idx;
                        
                        let bgClass = 'bg-gray-50 text-gray-500 hover:bg-gray-100'; // Default Future
                        if (isActive) bgClass = 'bg-teal-700 text-white hover:bg-teal-800'; // Current
                        else if (isPast) bgClass = 'bg-white text-teal-700 hover:bg-gray-50'; // Past

                        return (
                             <div 
                                key={step} 
                                onClick={() => handleStatusChange(step)}
                                className={`${bgClass} px-3 py-1.5 border-r border-gray-200 last:border-0 relative flex items-center transition-colors`}
                            >
                                 {step}
                             </div>
                        );
                    })}
                </div>
            </div>

            {/* Sheet Body */}
            <div className="p-8 md:px-12 md:py-8 space-y-8">
                 <div className="flex justify-between items-start">
                    <h1 className="text-2xl md:text-4xl font-normal text-gray-800 mb-2">{complaint.title}</h1>
                    <span className="text-2xl text-gray-300 font-light print:hidden">{complaint.date}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-16 text-sm">
                     {/* Identification Consumer */}
                     <div className="space-y-4">
                        <h3 className="text-odoo-brand font-bold uppercase text-xs tracking-wider border-b border-gray-200 pb-1">1. Consumidor</h3>
                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                             <span className="font-bold text-gray-600 text-right">Nombre:</span>
                             <span className="font-medium text-gray-900">{complaint.consumerName}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                             <span className="font-bold text-gray-600 text-right">{complaint.documentType}:</span>
                             <span>{complaint.documentNumber}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                             <span className="font-bold text-gray-600 text-right">Domicilio:</span>
                             <span className="truncate">{complaint.address}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                             <span className="font-bold text-gray-600 text-right">Contacto:</span>
                             <span>{complaint.email} / {complaint.phone}</span>
                        </div>
                     </div>

                     {/* Asset */}
                     <div className="space-y-4">
                        <h3 className="text-odoo-brand font-bold uppercase text-xs tracking-wider border-b border-gray-200 pb-1">2. Bien Contratado</h3>
                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                             <span className="font-bold text-gray-600 text-right">Tipo:</span>
                             <span className="px-2 py-0.5 rounded bg-gray-100 inline-block w-fit text-xs">{complaint.assetType}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                             <span className="font-bold text-gray-600 text-right">Descripción:</span>
                             <span>{complaint.assetDescription}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                             <span className="font-bold text-gray-600 text-right">Monto Reclamado:</span>
                             <span>{complaint.amountClaimed ? `S/ ${complaint.amountClaimed.toFixed(2)}` : 'No especificado'}</span>
                        </div>
                     </div>
                 </div>

                 {/* Tabbed Content */}
                 <div className="mt-8">
                     <div className="border-b border-gray-200 flex gap-6 text-sm print:hidden">
                         <button 
                            className={`pb-2 border-b-2 font-medium transition-colors ${activeTab === 'info' ? 'border-odoo-brand text-odoo-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('info')}
                         >
                            Detalle del Reclamo
                         </button>
                         <button 
                            className={`pb-2 border-b-2 font-medium transition-colors ${activeTab === 'response' ? 'border-odoo-brand text-odoo-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('response')}
                         >
                            Acciones Tomadas
                         </button>
                     </div>
                     
                     <div className="py-6 min-h-[150px] text-sm text-gray-800 leading-relaxed">
                         {/* Display logic for Tabs OR print everything if printing */}
                         <div className={activeTab === 'info' ? 'block' : 'hidden print:block'}>
                             <h3 className="hidden print:block font-bold mb-2 uppercase text-xs">3. Detalle y Pedido</h3>
                             <div className="bg-gray-50 p-4 rounded border border-gray-100 mb-4 print:bg-white print:border-none print:p-0">
                                 <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Hechos</span>
                                 <p className="whitespace-pre-wrap">{complaint.description}</p>
                             </div>
                             <div className="bg-blue-50 p-4 rounded border border-blue-100 print:bg-white print:border-none print:p-0">
                                 <span className="text-xs font-bold text-blue-500 uppercase block mb-1">Pedido del Consumidor</span>
                                 <p className="whitespace-pre-wrap">{complaint.consumerRequest}</p>
                             </div>
                         </div>

                         <div className={activeTab === 'response' ? 'block' : 'hidden print:block print:mt-4'}>
                             <h3 className="hidden print:block font-bold mb-2 uppercase text-xs">4. Respuesta de la Empresa</h3>
                             {complaint.companyResponse ? (
                                 <div className="bg-white p-4 border border-gray-200 rounded">
                                     <span className="font-bold block mb-1 text-gray-600">Respuesta:</span>
                                     <p>{complaint.companyResponse}</p>
                                     {complaint.resolutionDate && (
                                         <p className="text-xs text-gray-400 mt-2 text-right">Fecha: {complaint.resolutionDate}</p>
                                     )}
                                 </div>
                             ) : (
                                 <p className="text-gray-400 italic">No se ha registrado respuesta aún.</p>
                             )}
                         </div>
                     </div>
                 </div>
            </div>
            
            {/* Legal Footer for Print */}
            <div className="hidden print:flex justify-between items-end mt-12 pt-8 border-t border-gray-400 px-12 pb-8">
                <div className="text-center w-1/3">
                    <div className="border-t border-black pt-2">Firma del Consumidor</div>
                </div>
                <div className="text-center w-1/3">
                    <div className="border-t border-black pt-2">Firma del Proveedor</div>
                </div>
            </div>
        </div>

        {/* Odoo Chatter Section (Hidden on Print) */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 pb-12 print:hidden">
            <div className="flex-1 space-y-4">
                 <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4">
                     <div className="flex gap-4">
                         <button className="text-sm font-medium text-gray-600 hover:text-odoo-brand">Enviar mensaje</button>
                         <button className="text-sm font-medium text-gray-600 hover:text-odoo-brand">Poner nota</button>
                     </div>
                 </div>
                 <div className="bg-white p-4 rounded border border-gray-200 text-center text-gray-400 text-sm">
                     Historial de cambios y mensajes aparecerá aquí.
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetails;
