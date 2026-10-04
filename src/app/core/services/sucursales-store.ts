import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Sede {
  id: string;
  name: string;
  cover: string;
  photos: string[];
  address: string;
  phone: string;
  whatsapp: string;
  hours: string[];
}

const API = environment.apiUrl;

class SucursalesStore {
  readonly sedes = signal<Sede[]>([]);
  private cargaPromise: Promise<void> | null = null;

  constructor() {
    void this.cargar();
  }

  cargar(): Promise<void> {
    if (!this.cargaPromise) {
      this.cargaPromise = (async () => {
        try {
          const res = await fetch(`${API}/sucursales`);
          const json = await res.json();
          if (json?.ok) this.sedes.set(json.data ?? []);
        } catch {
        }
      })();
    }
    return this.cargaPromise;
  }

  async guardar(sede: Sede): Promise<{ ok: boolean; error?: string }> {
    const token = sessionStorage.getItem('emax_token');
    try {
      const res = await fetch(`${API}/sucursales/${sede.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: sede.name,
          address: sede.address,
          phone: sede.phone,
          whatsapp: sede.whatsapp,
          hours: sede.hours,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        return { ok: false, error: json?.error?.message ?? 'No se pudo guardar.' };
      }
      const saved = json.data as Sede;
      this.sedes.update((l) => l.map((s) => (s.id === saved.id ? saved : s)));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }
}

const G = globalThis as unknown as { __emaxSucursales?: SucursalesStore };
export const sucursalesStore: SucursalesStore = (G.__emaxSucursales ??= new SucursalesStore());