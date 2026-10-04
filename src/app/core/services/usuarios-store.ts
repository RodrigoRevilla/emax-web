import { signal } from '@angular/core';
import { Rol } from '../models/auth';
import { environment } from '../../../environments/environment';

export interface UsuarioFull {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  creado: string;
}

export interface ClaveMaterial {
  id: string;
  clave: string;
  descripcion: string;
  nivelId: string;
  activa: boolean;
  creada: string;
}

const API = environment.apiUrl;

function authHeaders(conJson = true): Record<string, string> {
  const token = sessionStorage.getItem('emax_token');
  return {
    ...(conJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type Res = { ok: boolean; error?: string };

class UsuariosStore {
  readonly usuarios = signal<UsuarioFull[]>([]);
  readonly claves = signal<ClaveMaterial[]>([]);
  private cargaPromise: Promise<void> | null = null;

  cargar(): Promise<void> {
    if (!this.cargaPromise) {
      this.cargaPromise = (async () => {
        await Promise.all([this.recargarUsuarios(), this.recargarClaves()]);
      })();
    }
    return this.cargaPromise;
  }

  private async recargarUsuarios(): Promise<void> {
    try {
      const res = await fetch(`${API}/usuarios`, { headers: authHeaders(false) });
      const json = await res.json();
      if (json?.ok) this.usuarios.set(json.data ?? []);
    } catch {
      /* noop */
    }
  }

  private async recargarClaves(): Promise<void> {
    try {
      const res = await fetch(`${API}/claves`, { headers: authHeaders(false) });
      const json = await res.json();
      if (json?.ok) this.claves.set(json.data ?? []);
    } catch {
      /* noop */
    }
  }

  async crearUsuario(nombre: string, email: string, password: string, rol: Rol): Promise<Res> {
    try {
      const res = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ nombre, email, password, rol }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo crear el usuario.' };
      this.usuarios.update((l) => [...l, json.data as UsuarioFull]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  async toggleActivo(id: string): Promise<Res> {
    const r = await this.enviarSimple('PATCH', `${API}/usuarios/${id}/estado`);
    if (r.ok) this.usuarios.update((l) => l.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)));
    return r;
  }

  async eliminarUsuario(id: string): Promise<Res> {
    const r = await this.enviarSimple('DELETE', `${API}/usuarios/${id}`);
    if (r.ok) this.usuarios.update((l) => l.filter((u) => u.id !== id));
    return r;
  }

  async cambiarMiPassword(actual: string, nueva: string): Promise<Res> {
    try {
      const res = await fetch(`${API}/usuarios/password`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ actual, nueva }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo cambiar la contraseña.' };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  async resetPassword(id: string, nueva: string): Promise<Res> {
    try {
      const res = await fetch(`${API}/usuarios/${id}/password`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ nueva }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo restablecer la contraseña.' };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  async crearClave(clave: string, descripcion: string, nivelId: string): Promise<Res> {
    try {
      const res = await fetch(`${API}/claves`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ clave, descripcion, nivelId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'No se pudo crear la clave.' };
      this.claves.update((l) => [...l, json.data as ClaveMaterial]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }

  async toggleClave(id: string): Promise<Res> {
    const r = await this.enviarSimple('PATCH', `${API}/claves/${id}/estado`);
    if (r.ok) this.claves.update((l) => l.map((c) => (c.id === id ? { ...c, activa: !c.activa } : c)));
    return r;
  }

  async eliminarClave(id: string): Promise<Res> {
    const r = await this.enviarSimple('DELETE', `${API}/claves/${id}`);
    if (r.ok) this.claves.update((l) => l.filter((c) => c.id !== id));
    return r;
  }

  private async enviarSimple(method: string, url: string): Promise<Res> {
    try {
      const res = await fetch(url, { method, headers: authHeaders(false) });
      const json = await res.json();
      if (!res.ok || !json?.ok) return { ok: false, error: json?.error?.message ?? 'Operación fallida.' };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Error de red.' };
    }
  }
}

const G = globalThis as unknown as { __emaxUsuarios?: UsuariosStore };
export const usuariosStore: UsuariosStore = (G.__emaxUsuarios ??= new UsuariosStore());