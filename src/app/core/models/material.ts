export type TipoMaterial = 'pdf' | 'audio' | 'video' | 'enlace';
export type Acceso = 'maestros' | 'clave';

export interface Material {
  id: string;
  titulo: string;
  tipo: TipoMaterial;
  acceso: Acceso;
  nivelId: string;
  peso?: string;
  url?: string;
  creado: string;
}

export interface Nivel {
  id: string;
  nombre: string;
}

export interface Curso {
  id: string;
  nombre: string;
  bandera: string;
  niveles: Nivel[];
}