export type ComplaintStatus = 'Pendiente' | 'En Proceso' | 'Resuelto' | 'Anulado';
export type ComplaintType = 'Reclamo' | 'Queja';
export type DocumentType = 'DNI' | 'RUC' | 'CE' | 'Pasaporte';
export type AssetType = 'Producto' | 'Servicio';

export interface Complaint {
  id: string;
  year: number;
  correlative: number;
  date: string;
  status: ComplaintStatus;
  
  // 1. Identificación del Consumidor
  consumerName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  isMinor: boolean;
  guardianName?: string;

  // 2. Identificación del Bien Contratado
  assetType: AssetType;
  assetDescription: string; // Name of product or service
  amountClaimed?: number;

  // 3. Detalle de la Reclamación
  type: ComplaintType;
  title: string; // Summary (Asunto)
  description: string; // Detalle de los hechos
  consumerRequest: string; // Pedido del consumidor
  
  // Internal / Resolution
  companyResponse?: string;
  resolutionDate?: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}