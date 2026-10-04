export interface PagoRegistro {
  id: string;
  folio: string;
  alumno: string;
  email: string;
  telefono: string;
  sucursal: string;
  conceptos: { label: string; precio: number }[];
  descuento: number;
  total: number;
  metodo: 'PayPal' | 'Demo';
  fecha: string;
  atendido: boolean;
}