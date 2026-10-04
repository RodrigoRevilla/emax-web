import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type TipoDescuento = 'monto' | 'porcentaje';

export interface Descuento {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoDescuento;
  valor: number;
  activo: boolean;
  creado: string;
}

const API = environment.apiUrl;

function authHeaders(conJson = true): Record<string, string> {
  const token = sessionStorage.getItem('emax_token');
  return {
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

class DescuentosStore {
  readonly descuentos = signal<Descuento[]>([]);
  private cargaPromise: Promise<void> | null = null;

  cargar(): Promise<void> {
    if (!this.cargaPromise) {
      this.cargaPromise = (async () => {
        try {
          const res = await fetch(`${API}/descuentos/gestion`, { headers: authHeaders(false) });
          const json = await res.json();
          if (json?.ok) this.descuentos.set(json.data ?? []);
        } catch {
          /* noop */
        }
      })();
    }
    return this.cargaPromise;
  }

  async crear(
    nombre: string,
    descripcion: string,
    tipo: TipoDescuento,
    valor: number,
  ): Promise<{ ok: boolean; error?: string }> {
    return this.enviar('POST', `${API}/descuentos`, { nombre, descripcion, tipo, valor }, (saved) =>
      this.descuentos.update((l) => [...l, saved]),
    );
  }

  async actualizar(d: Descuento): Promise<{ ok: boolean; error?: string }> {
    const body = { nombre: d.nombre, descripcion: d.descripcion, tipo: d.tipo, valor: d.valor };
    return this.enviar('PATCH', `${API}/descuentos/${d.id}`, body, (saved) => this.reemplazar(saved));
  }

  async toggle(id: string): Promise<{ ok: boolean; error?: string }> {
    return this.enviar('PATCH', `${API}/descuentos/${id}/estado`, null, (saved) => this.reemplazar(saved));
  }

  async eliminar(id: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${API}/descuentos/${id}`, { method: 'DELETE', headers: authHeaders(false) });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo eliminar.' };
      this.descuentos.update((l) => l.filter((d) => d.id !== id));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  private async enviar(
    method: string,
    url: string,
    body: unknown,
    onOk: (saved: Descuento) => void,
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: body === null ? undefined : JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo guardar.' };
      onOk(json.data as Descuento);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  private reemplazar(saved: Descuento): void {
    this.descuentos.update((l) => l.map((d) => (d.id === saved.id ? saved : d)));
  }
}

const G = globalThis as unknown as { __emaxDescuentos?: DescuentosStore };
export const descuentosStore: DescuentosStore = (G.__emaxDescuentos ??= new DescuentosStore());