import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Envelope } from '../models/api';
import { CursoPrecio, PrecioItem } from '../models/cursos';

@Injectable({ providedIn: 'root' })
export class CursosService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  readonly cursos = signal<CursoPrecio[]>([]);
  readonly precios = signal<PrecioItem[]>([]);

  cargarTodo(): Observable<CursoPrecio[]> {
    this.http
      .get<Envelope<PrecioItem[]>>(`${this.base}/precios/gestion`)
      .pipe(map((r) => r.data ?? []))
      .subscribe((lista) => this.precios.set(lista));

    return this.http.get<Envelope<CursoPrecio[]>>(`${this.base}/cursos/gestion`).pipe(
      map((r) => r.data ?? []),
      tap((lista) => this.cursos.set(lista)),
    );
  }

  nuevoCurso(): CursoPrecio {
    return { id: '', nombre: '', bandera: '', descripcion: '', orden: this.cursos().length + 1 };
  }

  guardarCurso(c: CursoPrecio): Observable<CursoPrecio> {
    const body = {
      nombre: c.nombre,
      bandera: c.bandera,
      descripcion: c.descripcion,
      orden: c.orden ?? 0,
    };
    const req = c.id
      ? this.http.patch<Envelope<CursoPrecio>>(`${this.base}/cursos/${c.id}`, body)
      : this.http.post<Envelope<CursoPrecio>>(`${this.base}/cursos`, body);
    return req.pipe(
      map((r) => r.data),
      tap((saved) => this.upsertCurso(saved)),
    );
  }

  eliminarCurso(id: string): Observable<void> {
    return this.http.delete<Envelope<{ id: string }>>(`${this.base}/cursos/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        this.cursos.update((l) => l.filter((c) => c.id !== id));
        this.precios.update((l) => l.filter((p) => p.cursoId !== id)); 
      }),
    );
  }

  private upsertCurso(saved: CursoPrecio): void {
    this.cursos.update((l) => {
      const i = l.findIndex((c) => c.id === saved.id);
      if (i === -1) return [...l, saved];
      const copia = [...l];
      copia[i] = saved;
      return copia;
    });
  }

  preciosDe(cursoId: string): PrecioItem[] {
    return this.precios().filter((p) => p.cursoId === cursoId);
  }

  nuevoPrecio(cursoId: string): PrecioItem {
    return { id: '', cursoId, concepto: '', detalle: '', tipo: 'colegiatura', precio: 0, activo: true };
  }

guardarPrecio(item: PrecioItem): Observable<PrecioItem> {
    const body = {
      cursoId: item.cursoId,
      concepto: item.concepto,
      detalle: item.detalle ?? '',
      tipo: item.tipo,
      precio: Number(item.precio) || 0,
      prontoPago: Number(item.prontoPago) || 0,
      orden: Number(item.orden) || 0,
      activo: item.activo ?? true,
    };
    const req = item.id
      ? this.http.patch<Envelope<PrecioItem>>(`${this.base}/precios/${item.id}`, body)
      : this.http.post<Envelope<PrecioItem>>(`${this.base}/precios`, body);
    return req.pipe(
      map((r) => r.data),
      tap((saved) => this.upsertPrecio(saved)),
    );
  }

  eliminarPrecio(id: string): Observable<void> {
    return this.http.delete<Envelope<{ id: string }>>(`${this.base}/precios/${id}`).pipe(
      map(() => void 0),
      tap(() => this.precios.update((l) => l.filter((p) => p.id !== id))),
    );
  }

  toggleActivo(id: string): Observable<PrecioItem> {
    return this.http.patch<Envelope<PrecioItem>>(`${this.base}/precios/${id}/estado`, {}).pipe(
      map((r) => r.data),
      tap((saved) => this.upsertPrecio(saved)),
    );
  }

  private upsertPrecio(saved: PrecioItem): void {
    this.precios.update((l) => {
      const i = l.findIndex((p) => p.id === saved.id);
      if (i === -1) return [...l, saved];
      const copia = [...l];
      copia[i] = saved;
      return copia;
    });
  }
}