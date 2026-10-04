export type Rol = 'admin' | 'maestro' | 'alumno';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}