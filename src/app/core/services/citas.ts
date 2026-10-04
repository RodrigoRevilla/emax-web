import { Injectable, signal } from '@angular/core';
import { Cita, EstadoCita } from '../models/citas';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

function authHeaders(conJson = true): Record<string, string> {
  const token = sessionStorage.getItem('emax_token');
  return {
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

@Injectable()
export class CitasService {
  readonly citas = signal<Cita[]>([]);
  private cargaPromise: Promise<void> | null = null;

  cargar(): Promise<void> {
    if (!this.cargaPromise) {
      this.cargaPromise = (async () => {
        try {
          const res = await fetch(`${API}/citas`, { headers: authHeaders(false) });
          const json = await res.json();
          if (json?.ok) this.citas.set(json.data ?? []);
        } catch {
          /* noop */
        }
      })();
    }
    return this.cargaPromise;
  }

  async agendar(
    datos: Omit<Cita, 'id' | 'estado' | 'creada'>,
  ): Promise<{ ok: boolean; cita?: Cita; error?: string }> {
    try {
      const res = await fetch(`${API}/citas`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          nombre: datos.nombre,
          telefono: datos.telefono,
          email: datos.email,
          sucursal: datos.sucursal,
          curso: datos.curso,
          fecha: datos.fecha,
          hora: datos.hora,
          mensaje: datos.mensaje,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        return { ok: false, error: json?.error?.message ?? 'No se pudo enviar la cita.' };
      }
      const cita = json.data as Cita;
      this.citas.update((l) => [cita, ...l]);
      return { ok: true, cita };
    } catch {
      return { ok: false, error: 'No se pudo conectar con el servidor.' };
    }
  }

  async cambiarEstado(id: string, estado: EstadoCita): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${API}/citas/${id}/estado`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ estado }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo cambiar el estado.' };
      const upd = json.data as Cita;
      this.citas.update((l) => l.map((c) => (c.id === upd.id ? upd : c)));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  async eliminar(id: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(`${API}/citas/${id}`, { method: 'DELETE', headers: authHeaders(false) });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo eliminar.' };
      this.citas.update((l) => l.filter((c) => c.id !== id));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }
}

const G = globalThis as unknown as { __emaxCitas?: CitasService };
export const citasStore: CitasService = (G.__emaxCitas ??= new CitasService());