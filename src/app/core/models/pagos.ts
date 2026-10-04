export interface Envelope<T> {
  ok: boolean;
  data: T;
  error?: { code: string; message: string };
}

export interface ConceptoPago {
  id: string;
  grupo: 'inscripcion' | 'colegiatura' | 'material' | 'examen';
  label: string;
  detalle: string;
  precio: number;
  prontoPago?: number;
  horario?: string;
}

export interface DatosAlumno {
  nombre: string;
  email: string;
  telefono: string;
  sucursal: string;
}

export interface SolicitudOrden {
  alumno: DatosAlumno;
  conceptos: string[];
  prontoPago: boolean;
  folioAnterior?: string;
}

export interface Comprobante {
  folio: string;
  orderId: string;
  alumno: string;
  sucursal: string;
  conceptos: { label: string; precio: number }[];
  descuento: number;
  total: number;
  moneda: string;
  fecha: string;
}