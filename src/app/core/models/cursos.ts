export type TipoConcepto = 'colegiatura' | 'inscripcion' | 'material' | 'examen';

export interface PrecioItem {
  id: string;
  cursoId: string;
  concepto: string;
  detalle: string;
  tipo: TipoConcepto;
  precio: number;
  prontoPago?: number;
  orden?: number;
  activo: boolean;
}

export interface CursoPrecio {
  id: string;
  nombre: string;
  bandera: string;
  descripcion: string;
  orden?: number;
}