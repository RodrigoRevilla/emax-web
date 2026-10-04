import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Envelope } from '../models/api';
import { Acceso, Curso, Material, TipoMaterial } from '../models/material';

const CURSOS_DEMO: Curso[] = [
  {
    id: 'en', nombre: 'Inglés', bandera: '🇺🇸',
    niveles: [
      { id: 'en-kidz', nombre: 'KIDZ (3–7)' },
      { id: 'en-children', nombre: 'CHILDREN (8–10)' },
      { id: 'en-teens', nombre: 'TEENS (11–13)' },
      { id: 'en-intensive', nombre: 'INTENSIVE (14+)' },
    ],
  },
  {
    id: 'fr', nombre: 'Francés', bandera: '🇫🇷',
    niveles: [{ id: 'fr-delf', nombre: 'Preparación DELF' }],
  },
  {
    id: 'es', nombre: 'Español', bandera: '🇲🇽',
    niveles: [{ id: 'es-ele', nombre: 'Español lengua extranjera' }],
  },
];

function formatBytes(n?: number): string {
  if (!n || n <= 0) return '—';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let x = n;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(x < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

function mapMaterial(d: any): Material {
  return {
    id: d.id,
    titulo: d.titulo,
    tipo: d.tipo as TipoMaterial,
    acceso: d.acceso as Acceso,
    nivelId: d.nivelId,
    peso: d.tipo === 'enlace' ? undefined : formatBytes(d.tamano),
    url: d.url || undefined,
    creado: (d.creado ?? '').slice(0, 10),
  };
}

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  readonly cursos = signal<Curso[]>(CURSOS_DEMO);
  readonly materiales = signal<Material[]>([]);

  cargar(): Observable<Material[]> {
    return this.http.get<Envelope<any[]>>(`${this.base}/material`).pipe(
      map((r) => (r.data ?? []).map(mapMaterial)),
      tap((l) => this.materiales.set(l)),
    );
  }

  materialesDe(nivelId: string): Material[] {
    return this.materiales().filter((m) => m.nivelId === nivelId);
  }

  subirArchivo(titulo: string, tipo: TipoMaterial, acceso: Acceso, nivelId: string, file: File): Observable<Material> {
    const fd = new FormData();
    fd.append('titulo', titulo);
    fd.append('nivelId', nivelId);
    fd.append('tipo', tipo);
    fd.append('acceso', acceso);
    fd.append('archivo', file);
    return this.http.post<Envelope<any>>(`${this.base}/material`, fd).pipe(
      map((r) => mapMaterial(r.data)),
      tap((m) => this.materiales.update((l) => [m, ...l])),
    );
  }

  subirEnlace(titulo: string, acceso: Acceso, nivelId: string, url: string): Observable<Material> {
    const fd = new FormData();
    fd.append('titulo', titulo);
    fd.append('nivelId', nivelId);
    fd.append('tipo', 'enlace');
    fd.append('acceso', acceso);
    fd.append('url', url);
    return this.http.post<Envelope<any>>(`${this.base}/material`, fd).pipe(
      map((r) => mapMaterial(r.data)),
      tap((m) => this.materiales.update((l) => [m, ...l])),
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<Envelope<any>>(`${this.base}/material/${id}`).pipe(
      map(() => void 0),
      tap(() => this.materiales.update((l) => l.filter((m) => m.id !== id))),
    );
  }

  descargar(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/material/${id}/archivo`, { responseType: 'blob' });
  }
}