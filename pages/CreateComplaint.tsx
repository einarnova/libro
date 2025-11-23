import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OdooControlPanel } from '../components/OdooControlPanel';
import { improveComplaintDraft } from '../services/geminiService';
import { ComplaintType, DocumentType, AssetType } from '../types';

const CreateComplaint: React.FC = () => {
  const navigate = useNavigate();
  const [isPolishing, setIsPolishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'consumer' | 'claim'>('consumer');

  // State matching legal requirements
  const [formData, setFormData] = useState({
    // Section 1: Consumer
    consumerName: '',
    documentType: 'DNI' as DocumentType,
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
    isMinor: false,
    guardianName: '',

    // Section 2: Asset
    assetType: 'Producto' as AssetType,
    assetDescription: '',
    amountClaimed: '',

    // Section 3: Claim
    type: 'Reclamo' as ComplaintType,
    description: '',
    consumerRequest: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePolish = async (field: 'description' | 'consumerRequest') => {
    if (!formData[field]) return;
    setIsPolishing(true);
    const polished = await improveComplaintDraft(formData[field]);
    setFormData(prev => ({ ...prev, [field]: polished }));
    setIsPolishing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate ID generation
    const currentYear = new Date().getFullYear();
    const randomId = Math.floor(Math.random() * 1000) + 4; // Mock correlative
    const generatedCode = `LR-${currentYear}-${randomId.toString().padStart(4, '0')}`;
    
    // Pass the generated ID to the confirmation page
    navigate('/confirmation', { state: { code: generatedCode } });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col h-full bg-odoo-bg overflow-hidden">
      <OdooControlPanel 
        title="Nueva Hoja de Reclamación" 
        showCreate={false} 
        showBack={true}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        {/* Odoo Form Sheet */}
        <div className="w-full max-w-5xl bg-white shadow-sheet rounded border border-gray-300 min-h-[600px] flex flex-col mb-10">
            
            {/* Sheet Header / Actions */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center p-4 border-b border-gray-100 gap-4 sticky top-0 bg-white z-10">
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={handleSubmit}
                        className="bg-odoo-brand hover:bg-odoo-brandDark text-white px-4 py-1.5 rounded text-sm font-medium uppercase transition-colors flex-1 md:flex-none justify-center flex"
                    >
                        Registrar
                    </button>
                    <button 
                        onClick={() => navigate('/complaints')}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-sm font-medium uppercase transition-colors flex-1 md:flex-none justify-center flex"
                    >
                        Descartar
                    </button>
                </div>

                <div className="flex flex-col items-end w-full md:w-auto">
                    <span className="text-2xl font-light text-gray-400">Borrador</span>
                    <span className="text-xs text-gray-500">LR-{currentYear}-XXXX</span>
                </div>
            </div>

            {/* Sheet Content */}
            <div className="p-6 md:p-10 space-y-8">

                {/* Header Title */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                    <h1 className="text-2xl md:text-3xl text-odoo-brand font-normal">Libro de Reclamaciones</h1>
                    <p className="text-gray-500 text-sm mt-1">Hoja de Reclamación Virtual • Conforme a lo establecido en el Código de Protección y Defensa del Consumidor.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN: Section 1 & 2 */}
                    <div className="space-y-8">
                        {/* Section 1: Identificación del Consumidor */}
                        <div>
                            <h3 className="text-odoo-brand font-bold uppercase text-xs tracking-wider border-b border-gray-200 pb-2 mb-4">
                                1. Identificación del Consumidor
                            </h3>
                            <div className="grid grid-cols-1 gap-y-3 gap-x-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Nombre / Razón Social</label>
                                    <input type="text" name="consumerName" value={formData.consumerName} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 px-0 py-1 text-sm bg-transparent" placeholder="Nombre completo" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700">Tipo Doc.</label>
                                        <select name="documentType" value={formData.documentType} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 px-0 py-1 text-sm bg-transparent">
                                            <option value="DNI">DNI</option>
                                            <option value="RUC">RUC</option>
                                            <option value="CE">C. Extranjería</option>
                                            <option value="Pasaporte">Pasaporte</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700">N° Documento</label>
                                        <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 px-0 py-1 text-sm bg-transparent" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Domicilio</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 px-0 py-1 text-sm bg-transparent" placeholder="Dirección completa" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700">Teléfono</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 px-0 py-1 text-sm bg-transparent" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-gray-700">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 px-0 py-1 text-sm bg-transparent" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input type="checkbox" name="isMinor" id="isMinor" checked={formData.isMinor} onChange={handleChange} className="text-odoo-brand focus:ring-odoo-brand rounded border-gray-300" />
                                    <label htmlFor="isMinor" className="text-sm text-gray-700">Es menor de edad</label>
                                </div>

                                {formData.isMinor && (
                                    <div className="space-y-1 bg-gray-50 p-2 rounded">
                                        <label className="text-sm font-bold text-gray-700">Nombre del Padre/Madre/Apoderado</label>
                                        <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 px-0 py-1 text-sm bg-transparent" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Identificación del Bien */}
                        <div>
                            <h3 className="text-odoo-brand font-bold uppercase text-xs tracking-wider border-b border-gray-200 pb-2 mb-4">
                                2. Identificación del Bien Contratado
                            </h3>
                            <div className="grid grid-cols-1 gap-y-3 gap-x-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 block">Tipo de Bien</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input type="radio" name="assetType" value="Producto" checked={formData.assetType === 'Producto'} onChange={handleChange} className="text-odoo-brand focus:ring-odoo-brand" />
                                            Producto
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input type="radio" name="assetType" value="Servicio" checked={formData.assetType === 'Servicio'} onChange={handleChange} className="text-odoo-brand focus:ring-odoo-brand" />
                                            Servicio
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Descripción del Producto/Servicio</label>
                                    <input type="text" name="assetDescription" value={formData.assetDescription} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 px-0 py-1 text-sm bg-transparent" placeholder="Ej. Laptop HP / Servicio de Internet" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700">Monto Reclamado (Opcional)</label>
                                    <div className="relative">
                                        <span className="absolute left-0 top-1 text-sm text-gray-500">S/</span>
                                        <input type="number" name="amountClaimed" value={formData.amountClaimed} onChange={handleChange} className="w-full border-0 border-b border-gray-300 focus:border-odoo-brand focus:ring-0 pl-6 py-1 text-sm bg-transparent" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Section 3 */}
                    <div className="space-y-8 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                        {/* Section 3: Detalle */}
                        <div>
                            <h3 className="text-odoo-brand font-bold uppercase text-xs tracking-wider border-b border-gray-200 pb-2 mb-4">
                                3. Detalle de la Reclamación
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 block">Tipo</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 p-3 border rounded cursor-pointer transition-colors ${formData.type === 'Reclamo' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white border-gray-200'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <input type="radio" name="type" value="Reclamo" checked={formData.type === 'Reclamo'} onChange={handleChange} className="text-odoo-brand focus:ring-odoo-brand" />
                                                <span className="font-bold text-gray-800 text-sm">Reclamo</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 pl-6 leading-tight">Disconformidad relacionada a los productos o servicios.</p>
                                        </label>
                                        <label className={`flex-1 p-3 border rounded cursor-pointer transition-colors ${formData.type === 'Queja' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white border-gray-200'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <input type="radio" name="type" value="Queja" checked={formData.type === 'Queja'} onChange={handleChange} className="text-odoo-brand focus:ring-odoo-brand" />
                                                <span className="font-bold text-gray-800 text-sm">Queja</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 pl-6 leading-tight">Disconformidad no relacionada a los productos o servicios (ej: mala atención).</p>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1 relative">
                                    <label className="text-sm font-bold text-gray-700">Detalle de los Hechos</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        rows={6} 
                                        className="w-full border-gray-300 rounded focus:border-odoo-brand focus:ring-1 focus:ring-odoo-brand text-sm leading-relaxed p-2"
                                        placeholder="Describa lo sucedido de forma detallada..."
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => handlePolish('description')}
                                        disabled={isPolishing || !formData.description}
                                        className="absolute bottom-2 right-2 text-xs text-odoo-brand bg-white border border-gray-200 px-2 py-1 rounded hover:bg-purple-50 flex items-center gap-1 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Mejorar
                                    </button>
                                </div>

                                <div className="space-y-1 relative">
                                    <label className="text-sm font-bold text-gray-700">Pedido del Consumidor</label>
                                    <textarea 
                                        name="consumerRequest" 
                                        value={formData.consumerRequest} 
                                        onChange={handleChange} 
                                        rows={4} 
                                        className="w-full border-gray-300 rounded focus:border-odoo-brand focus:ring-1 focus:ring-odoo-brand text-sm leading-relaxed p-2"
                                        placeholder="¿Qué solución espera recibir?"
                                    />
                                     <button 
                                        type="button"
                                        onClick={() => handlePolish('consumerRequest')}
                                        disabled={isPolishing || !formData.consumerRequest}
                                        className="absolute bottom-2 right-2 text-xs text-odoo-brand bg-white border border-gray-200 px-2 py-1 rounded hover:bg-purple-50 flex items-center gap-1 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Mejorar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;
