import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type Horario = 'semana' | 'finde';

export interface Semana {
  id: string;
  horario: Horario;
  inicio: string;
  fin: string;
  etiqueta: string;
  activo: boolean;
  creado?: string;
}

const API = environment.apiUrl;

function authHeaders(conJson = true): Record<string, string> {
  const token = sessionStorage.getItem('emax_token');
  return {
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

class SemanasStore {
  readonly semanas = signal<Semana[]>([]);
  private cargaPromise: Promise<void> | null = null;

  cargar(forzar = false): Promise<void> {
    if (forzar) this.cargaPromise = null;
    if (!this.cargaPromise) {
      this.cargaPromise = (async () => {
        try {
          const res = await fetch(`${API}/semanas`, { headers: authHeaders(false) });
          const json = await res.json();
          if (json?.ok) this.semanas.set(json.data ?? []);
        } catch {
          /* noop */
        }
      })();
    }
    return this.cargaPromise;
  }

  async crear(s: Omit<Semana, 'id' | 'creado'>): Promise<{ ok: boolean; error?: string }> {
    return this.enviar('POST', `${API}/semanas`, this.body(s), (saved) =>
      this.semanas.update((l) => [...l, saved]),
    );
  }

  async actualizar(s: Semana): Promise<{ ok: boolean; error?: string }> {
    return this.enviar('PATCH', `${API}/semanas/${s.id}`, this.body(s), (saved) => this.reemplazar(saved));
  }

  async toggle(id: string): Promise<{ ok: boolean; error?: string }> {
    return this.enviar('PATCH', `${API}/semanas/${id}/estado`, null, (saved) => this.reemplazar(saved));
  }

  async eliminar(id: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${API}/semanas/${id}`, { method: 'DELETE', headers: authHeaders(false) });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo eliminar.' };
      this.semanas.update((l) => l.filter((s) => s.id !== id));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  private body(s: Omit<Semana, 'id' | 'creado'> | Semana) {
    return { horario: s.horario, inicio: s.inicio, fin: s.fin, etiqueta: s.etiqueta, activo: s.activo };
  }

  private async enviar(
    method: string,
    url: string,
    body: unknown,
    onOk: (saved: Semana) => void,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: body === null ? undefined : JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo guardar.' };
      onOk(json.data as Semana);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  private reemplazar(saved: Semana): void {
    this.semanas.update((l) => l.map((s) => (s.id === saved.id ? saved : s)));
  }
}

const G = globalThis as unknown as { __emaxSemanas?: SemanasStore };
export const semanasStore: SemanasStore = (G.__emaxSemanas ??= new SemanasStore());