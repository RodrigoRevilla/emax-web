import { signal } from '@angular/core';
import { PagoRegistro } from '../models/pago-registro';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

function authHeaders(conJson = false): Record<string, string> {
  const token = sessionStorage.getItem('emax_token');
  return {
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function mapPago(d: any): PagoRegistro {
  return {
    id: d.id,
    folio: d.folio,
    alumno: d.alumno?.nombre ?? '',
    email: d.alumno?.email ?? '',
    telefono: d.alumno?.telefono ?? '',
    sucursal: d.alumno?.sucursal ?? '',
    conceptos: (d.conceptos ?? []).map((c: any) => ({ label: c.label, precio: c.precio })),
    descuento: d.descuento ?? 0,
    total: d.total ?? 0,
    metodo: 'PayPal',
    fecha: (d.creado ?? '').replace('T', ' ').slice(0, 16),
    atendido: d.atendido === true,
  };
}

class PagosStore {
  readonly pagos = signal<PagoRegistro[]>([]);
  private cargaPromise: Promise<void> | null = null;

  cargar(forzar = false): Promise<void> {
    if (forzar) this.cargaPromise = null;
    if (!this.cargaPromise) {
      this.cargaPromise = (async () => {
        try {
          const res = await fetch(`${API}/pagos/gestion?estado=capturada`, { headers: authHeaders() });
          const json = await res.json();
          if (json?.ok) this.pagos.set((json.data ?? []).map(mapPago));
        } catch {
          /* noop */
        }
      })();
    }
    return this.cargaPromise;
  }

  async toggleAtendido(id: string, atendido: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${API}/pagos/gestion/${id}/atendido`, {
        method: 'PATCH',
        headers: authHeaders(true),
        body: JSON.stringify({ atendido }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) return false;
      this.pagos.update((l) => l.map((p) => (p.id === id ? { ...p, atendido } : p)));
      return true;
    } catch {
      return false;
    }
  }
}

const G = globalThis as unknown as { __emaxPagos?: PagosStore };
export const pagosStore: PagosStore = (G.__emaxPagos ??= new PagosStore());