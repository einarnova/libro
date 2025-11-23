import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { improveComplaintDraft } from '../services/geminiService';
import { ComplaintType, DocumentType, AssetType } from '../types';

const WebComplaintForm: React.FC = () => {
  const navigate = useNavigate();
  const [isPolishing, setIsPolishing] = useState(false);

  const [formData, setFormData] = useState({
    consumerName: '',
    documentType: 'DNI' as DocumentType,
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
    isMinor: false,
    guardianName: '',
    assetType: 'Producto' as AssetType,
    assetDescription: '',
    amountClaimed: '',
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
    const currentYear = new Date().getFullYear();
    const randomId = Math.floor(Math.random() * 1000) + 4;
    const generatedCode = `PRIME-${currentYear}-${randomId.toString().padStart(4, '0')}`;
    navigate('/confirmation', { state: { code: generatedCode, fromWebsite: true } });
  };

  return (
    <div className="bg-white min-h-screen font-sans text-[#333] flex flex-col absolute inset-0 z-50 overflow-y-auto">
      
      {/* --- TOP BAR (Dark) --- */}
      <div className="bg-[#212529] text-gray-400 text-xs py-2 px-4 hidden md:block border-b border-gray-700">
          <div className="container mx-auto max-w-[1400px] flex justify-between items-center">
              <div className="flex gap-4">
                  <span>Tel: (01) 123-4567</span>
                  <span>Email: contacto@prime-electronics.com</span>
              </div>
              <div className="flex gap-4">
                  <span className="cursor-pointer hover:text-prime-yellow">Tiendas</span>
                  <span className="cursor-pointer hover:text-prime-yellow">Seguimiento</span>
                  <span className="cursor-pointer hover:text-prime-yellow">Español</span>
              </div>
          </div>
      </div>

      {/* --- PRIME HEADER --- */}
      <header className="bg-[#212529] py-5 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 max-w-[1400px] flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
                <div className="bg-prime-yellow text-black font-display font-bold text-2xl px-2 rounded-sm tracking-tighter">PRIME</div>
                <span className="text-2xl font-display font-bold text-white tracking-tight">Electronics</span>
            </div>

            {/* Search Bar */}
            <div className="order-3 md:order-2 w-full md:w-auto flex-1 max-w-2xl mx-auto flex h-[45px]">
                <div className="hidden md:flex items-center px-4 bg-white border-r border-gray-200 text-sm font-medium text-gray-600 rounded-l-sm whitespace-nowrap cursor-pointer hover:bg-gray-50">
                    Todas las categorías <span className="material-symbols-outlined text-[18px] ml-1">arrow_drop_down</span>
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar productos..." 
                    className="flex-1 px-4 border-none outline-none focus:ring-0 text-sm"
                />
                <button className="bg-prime-yellow hover:bg-prime-yellowHover px-6 flex items-center justify-center rounded-r-sm transition-colors">
                    <span className="material-symbols-outlined text-black">search</span>
                </button>
            </div>

            {/* Icons */}
            <div className="order-2 md:order-3 flex items-center gap-6 text-white shrink-0">
                <div className="flex flex-col items-center group cursor-pointer">
                    <span className="material-symbols-outlined group-hover:text-prime-yellow transition-colors">person</span>
                    <span className="text-[10px] uppercase font-bold hidden lg:block group-hover:text-prime-yellow">Cuenta</span>
                </div>
                <div className="flex flex-col items-center group cursor-pointer relative">
                    <span className="material-symbols-outlined group-hover:text-prime-yellow transition-colors">favorite</span>
                    <span className="absolute -top-1 -right-1 bg-prime-yellow text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
                    <span className="text-[10px] uppercase font-bold hidden lg:block group-hover:text-prime-yellow">Deseos</span>
                </div>
                <div className="flex flex-col items-center group cursor-pointer relative">
                    <span className="material-symbols-outlined group-hover:text-prime-yellow transition-colors">shopping_cart</span>
                    <span className="absolute -top-1 -right-1 bg-prime-yellow text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
                    <span className="text-[10px] uppercase font-bold hidden lg:block group-hover:text-prime-yellow">Carrito</span>
                </div>
            </div>
        </div>
      </header>

      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-gray-200 hidden md:block">
          <div className="container mx-auto px-4 max-w-[1400px]">
              <div className="flex items-center gap-8 text-sm font-bold uppercase tracking-wide text-[#333] h-12">
                  <div className="bg-prime-yellow h-full flex items-center px-6 gap-2 cursor-pointer min-w-[240px]">
                      <span className="material-symbols-outlined">menu</span>
                      <span>Comprar por Departamento</span>
                  </div>
                  <a href="#" className="hover:text-prime-yellow transition-colors">Inicio</a>
                  <a href="#" className="hover:text-prime-yellow transition-colors">Tienda</a>
                  <a href="#" className="hover:text-prime-yellow transition-colors">Laptops</a>
                  <a href="#" className="hover:text-prime-yellow transition-colors">Smartphones</a>
                  <a href="#" className="hover:text-prime-yellow transition-colors text-prime-yellow">Atención al Cliente</a>
              </div>
          </div>
      </nav>

      {/* --- BREADCRUMBS --- */}
      <div className="bg-[#F5F5F5] py-4">
          <div className="container mx-auto px-4 max-w-[1400px]">
              <div className="flex items-center text-xs text-gray-500">
                  <span className="hover:text-black cursor-pointer">Inicio</span>
                  <span className="mx-2">/</span>
                  <span className="hover:text-black cursor-pointer">Ayuda</span>
                  <span className="mx-2">/</span>
                  <span className="text-black font-medium">Libro de Reclamaciones</span>
              </div>
          </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 bg-white py-12">
        <div className="container mx-auto px-4 max-w-[1400px] flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="hidden lg:block w-1/4 space-y-6">
                <div className="bg-[#F9F9F9] p-6 rounded-sm border border-gray-100">
                    <h3 className="font-display font-bold text-lg mb-4 border-b-2 border-prime-yellow inline-block pb-1">Ayuda y Soporte</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-center justify-between cursor-pointer hover:text-prime-yellow hover:translate-x-1 transition-all">
                            <span>Estado del Pedido</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </li>
                        <li className="flex items-center justify-between cursor-pointer hover:text-prime-yellow hover:translate-x-1 transition-all">
                            <span>Envíos y Entregas</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </li>
                        <li className="flex items-center justify-between cursor-pointer hover:text-prime-yellow hover:translate-x-1 transition-all">
                            <span>Devoluciones</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </li>
                        <li className="flex items-center justify-between font-bold text-black border-l-4 border-prime-yellow pl-2 bg-white py-1">
                            <span>Libro de Reclamaciones</span>
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-[#212529] p-6 rounded-sm text-white text-center">
                    <span className="material-symbols-outlined text-4xl text-prime-yellow mb-2">headset_mic</span>
                    <h4 className="font-bold text-lg mb-2">¿Necesitas ayuda?</h4>
                    <p className="text-sm text-gray-400 mb-4">Nuestro equipo está disponible 24/7</p>
                    <p className="text-xl font-bold text-prime-yellow">(01) 123-4567</p>
                </div>
            </div>

            {/* Form Area */}
            <div className="flex-1">
                <h1 className="font-display font-bold text-3xl mb-2 text-[#212529]">Libro de Reclamaciones Virtual</h1>
                <p className="text-gray-500 mb-8">
                    Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, ponemos a su disposición este canal para el registro de quejas y reclamos.
                </p>

                <form onSubmit={handleSubmit} className="border border-gray-200 rounded-sm p-6 md:p-8 bg-white shadow-sm">
                    
                    {/* Step 1 */}
                    <div className="mb-8">
                        <h3 className="font-display font-bold text-lg text-[#212529] mb-6 flex items-center gap-2">
                            <span className="bg-prime-yellow text-black size-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            Identificación del Consumidor
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nombre Completo <span className="text-red-500">*</span></label>
                                <input required type="text" name="consumerName" value={formData.consumerName} onChange={handleChange} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm h-[45px]" placeholder="Ej. Juan Pérez" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-1">
                                    <label className="text-sm font-medium text-gray-700">Tipo Doc.</label>
                                    <select name="documentType" value={formData.documentType} onChange={handleChange} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm h-[45px]">
                                        <option>DNI</option>
                                        <option>RUC</option>
                                        <option>CE</option>
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Número <span className="text-red-500">*</span></label>
                                    <input required type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm h-[45px]" />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Dirección Domiciliaria <span className="text-red-500">*</span></label>
                                <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm h-[45px]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Teléfono / Celular <span className="text-red-500">*</span></label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm h-[45px]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Correo Electrónico <span className="text-red-500">*</span></label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm h-[45px]" />
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="mb-8 border-t border-gray-100 pt-8">
                        <h3 className="font-display font-bold text-lg text-[#212529] mb-6 flex items-center gap-2">
                            <span className="bg-prime-yellow text-black size-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            Bien Contratado
                        </h3>
                        <div className="bg-[#F9F9F9] p-6 rounded-sm border border-gray-200 mb-6">
                            <div className="flex gap-8">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="assetType" value="Producto" checked={formData.assetType === 'Producto'} onChange={handleChange} className="text-prime-yellow focus:ring-prime-yellow w-5 h-5 bg-white border-gray-300" />
                                    <span className="font-bold text-[#212529]">Producto</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="assetType" value="Servicio" checked={formData.assetType === 'Servicio'} onChange={handleChange} className="text-prime-yellow focus:ring-prime-yellow w-5 h-5 bg-white border-gray-300" />
                                    <span className="font-bold text-[#212529]">Servicio</span>
                                </label>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nombre del Producto / Servicio <span className="text-red-500">*</span></label>
                                <input required type="text" name="assetDescription" value={formData.assetDescription} onChange={handleChange} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm h-[45px]" placeholder="Ej. Smart TV 55 Pulgadas" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Monto Reclamado (S/)</label>
                                <input type="number" name="amountClaimed" value={formData.amountClaimed} onChange={handleChange} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm h-[45px]" />
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="mb-8 border-t border-gray-100 pt-8">
                        <h3 className="font-display font-bold text-lg text-[#212529] mb-6 flex items-center gap-2">
                            <span className="bg-prime-yellow text-black size-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            Detalle de Reclamación
                        </h3>
                        
                        <div className="flex gap-4 mb-6">
                            <div onClick={() => setFormData({...formData, type: 'Reclamo'})} className={`flex-1 border-2 rounded-sm p-4 cursor-pointer text-center hover:shadow-md transition-all ${formData.type === 'Reclamo' ? 'border-prime-yellow bg-yellow-50' : 'border-gray-100 bg-[#F9F9F9]'}`}>
                                <h4 className="font-bold text-[#212529] mb-1">Reclamo</h4>
                                <p className="text-xs text-gray-500">Producto defectuoso o servicio deficiente</p>
                            </div>
                             <div onClick={() => setFormData({...formData, type: 'Queja'})} className={`flex-1 border-2 rounded-sm p-4 cursor-pointer text-center hover:shadow-md transition-all ${formData.type === 'Queja' ? 'border-prime-yellow bg-yellow-50' : 'border-gray-100 bg-[#F9F9F9]'}`}>
                                <h4 className="font-bold text-[#212529] mb-1">Queja</h4>
                                <p className="text-xs text-gray-500">Malestar por atención al público</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-700">Detalle de los Hechos <span className="text-red-500">*</span></label>
                                    <button 
                                        type="button" 
                                        onClick={() => handlePolish('description')}
                                        disabled={!formData.description || isPolishing}
                                        className="text-xs bg-gray-100 hover:bg-prime-yellow hover:text-black transition-colors px-2 py-1 rounded text-gray-600 flex items-center gap-1 font-medium"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">magic_button</span>
                                        {isPolishing ? 'Mejorando...' : 'Asistente IA'}
                                    </button>
                                </div>
                                <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm p-3"></textarea>
                            </div>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-700">Pedido del Consumidor <span className="text-red-500">*</span></label>
                                    <button 
                                        type="button" 
                                        onClick={() => handlePolish('consumerRequest')}
                                        disabled={!formData.consumerRequest || isPolishing}
                                        className="text-xs bg-gray-100 hover:bg-prime-yellow hover:text-black transition-colors px-2 py-1 rounded text-gray-600 flex items-center gap-1 font-medium"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">magic_button</span>
                                        {isPolishing ? 'Mejorando...' : 'Asistente IA'}
                                    </button>
                                </div>
                                <textarea required name="consumerRequest" value={formData.consumerRequest} onChange={handleChange} rows={3} className="w-full border-gray-300 focus:border-prime-yellow focus:ring-prime-yellow rounded-sm text-sm p-3"></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 mt-8 p-4 bg-gray-50 border border-gray-100 rounded-sm">
                        <input required type="checkbox" id="terms" className="mt-1 text-prime-yellow focus:ring-prime-yellow border-gray-300 rounded-sm" />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                            Declaro ser el titular del servicio y acepto que la información consignada es verdadera. Acepto los <a href="#" className="text-black font-bold underline hover:text-prime-yellow">Términos y Condiciones</a> y las Políticas de Privacidad.
                        </label>
                    </div>

                    <div className="mt-8">
                        <button type="submit" className="w-full bg-prime-yellow hover:bg-prime-yellowHover text-black font-bold uppercase tracking-wide py-4 rounded-sm shadow-sm transition-transform active:scale-[0.99] text-sm">
                            Enviar Hoja de Reclamación
                        </button>
                    </div>

                </form>
            </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#212529] text-gray-400 pt-16 pb-8 border-t-4 border-prime-yellow">
        <div className="container mx-auto px-4 max-w-[1400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-prime-yellow text-black font-display font-bold text-xl px-2 rounded-sm">PRIME</div>
                        <span className="text-xl font-display font-bold text-white">Electronics</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-6">
                        Somos líderes en tecnología y electrónica de consumo. Comprometidos con brindarte la mejor experiencia y soporte post-venta.
                    </p>
                    <div className="flex gap-4">
                        <span className="size-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-prime-yellow hover:text-black transition-colors cursor-pointer">
                           <span className="font-bold text-xs">FB</span>
                        </span>
                        <span className="size-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-prime-yellow hover:text-black transition-colors cursor-pointer">
                           <span className="font-bold text-xs">IG</span>
                        </span>
                         <span className="size-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-prime-yellow hover:text-black transition-colors cursor-pointer">
                           <span className="font-bold text-xs">YT</span>
                        </span>
                    </div>
                </div>
                <div>
                    <h4 className="text-white font-bold uppercase mb-6">Información</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-prime-yellow transition-colors">Sobre Nosotros</a></li>
                        <li><a href="#" className="hover:text-prime-yellow transition-colors">Términos y Condiciones</a></li>
                        <li><a href="#" className="hover:text-prime-yellow transition-colors">Política de Privacidad</a></li>
                        <li><a href="#" className="hover:text-prime-yellow transition-colors text-prime-yellow">Libro de Reclamaciones</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold uppercase mb-6">Mi Cuenta</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#" className="hover:text-prime-yellow transition-colors">Historial de Pedidos</a></li>
                        <li><a href="#" className="hover:text-prime-yellow transition-colors">Lista de Deseos</a></li>
                        <li><a href="#" className="hover:text-prime-yellow transition-colors">Seguimiento</a></li>
                        <li><a href="#" className="hover:text-prime-yellow transition-colors">Ayuda</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold uppercase mb-6">Contáctanos</h4>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-prime-yellow">location_on</span>
                            <span>Av. Javier Prado Este 1234, San Isidro, Lima - Perú</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-prime-yellow">phone</span>
                            <span>(01) 123-4567</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-prime-yellow">mail</span>
                            <span>contacto@prime-electronics.com</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs">&copy; 2024 Prime Electronics. Todos los derechos reservados.</p>
                <div className="flex gap-2">
                    <div className="h-6 w-10 bg-white rounded flex items-center justify-center text-[8px] font-bold text-blue-800">VISA</div>
                    <div className="h-6 w-10 bg-white rounded flex items-center justify-center text-[8px] font-bold text-red-600">MC</div>
                    <div className="h-6 w-10 bg-white rounded flex items-center justify-center text-[8px] font-bold text-blue-400">AMEX</div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default WebComplaintForm;