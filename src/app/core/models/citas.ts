export type EstadoCita = 'pendiente' | 'confirmada' | 'atendida' | 'cancelada';

export interface Cita {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  sucursal: string;
  curso: string;
  fecha: string; 
  hora: string;    
  mensaje: string;
  estado: EstadoCita;
  creada: string;
}