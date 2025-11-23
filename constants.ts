import { Complaint } from "./types";

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "LR-2024-0001",
    year: 2024,
    correlative: 1,
    date: "2024-03-24",
    status: "Pendiente",
    
    consumerName: "Juan Pérez Toledo",
    documentType: "DNI",
    documentNumber: "45892133",
    email: "juan.perez@email.com",
    phone: "987654321",
    address: "Av. Larco 123, Miraflores, Lima",
    isMinor: false,

    assetType: "Servicio",
    assetDescription: "Servicio de Internet Fibra Óptica 200mbps",
    amountClaimed: 129.90,

    type: "Reclamo",
    title: "Interrupción del servicio de internet",
    description: "Mi conexión de fibra óptica se cae cada 10 minutos. He intentado reiniciar el router múltiples veces pero el problema persiste. Solicito visita técnica urgente.",
    consumerRequest: "Solicito la reparación inmediata del servicio y el reintegro por los días sin servicio.",
  },
  {
    id: "LR-2024-0002",
    year: 2024,
    correlative: 2,
    date: "2024-03-22",
    status: "En Proceso",
    
    consumerName: "Empresa de Transportes S.A.C.",
    documentType: "RUC",
    documentNumber: "20100200300",
    email: "admin@transportes.com",
    phone: "01-444-5555",
    address: "Jr. Los Sauces 444, San Isidro",
    isMinor: false,

    assetType: "Producto",
    assetDescription: "Lote de Laptops Lenovo Thinkpad",
    amountClaimed: 4500.00,

    type: "Reclamo",
    title: "Cobro indebido en facturación",
    description: "Me cobraron S/4500 en lugar de los S/4000 acordados por el descuento de volumen. Solicito la devolución del excedente.",
    consumerRequest: "Emisión de Nota de Crédito por S/500.",
  },
  {
    id: "LR-2024-0003",
    year: 2024,
    correlative: 3,
    date: "2024-03-20",
    status: "Resuelto",
    
    consumerName: "María Gonzalez",
    documentType: "CE",
    documentNumber: "00029384",
    email: "maria.g@email.com",
    phone: "999888777",
    address: "Calle Las Begonias 100",
    isMinor: false,

    assetType: "Servicio",
    assetDescription: "Atención en Plataforma Telefónica",
    amountClaimed: 0,

    type: "Queja",
    title: "Mala atención en plataforma telefónica",
    description: "El agente que me atendió fue descortés y no resolvió mi duda sobre la cobertura.",
    consumerRequest: "Solicito una disculpa formal y capacitación al personal.",
    
    companyResponse: "Lamentamos el inconveniente. Hemos tomado medidas correctivas con el personal y le ofrecemos 1 mes de descuento.",
    resolutionDate: "2024-03-25"
  }
];