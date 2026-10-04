import { ChangeDetectionStrategy, ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface MaterialAlumno {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  url: string;
  peso: string;
}

function formatBytes(n?: number): string {
  if (!n || n <= 0) return '';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0, x = n;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(x < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

@Component({
  selector: 'app-alumnos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './alumnos.html',
  styleUrl: './alumnos.scss',
})
export class Alumnos {
  private readonly base = environment.apiUrl;

  readonly clave = signal('');
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly acceso = signal(false);
  readonly materiales = signal<MaterialAlumno[]>([]);
  private claveOk = '';

  constructor(private readonly cdr: ChangeDetectorRef) {}

  setClave(v: string): void { this.clave.set(v.trim().toUpperCase()); this.error.set(null); }

  async entrar(): Promise<void> {
    const c = this.clave();
    if (!c) return;
    this.cargando.set(true);
    this.error.set(null);
    try {
      const res = await fetch(`${this.base}/material/acceso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: c }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        this.error.set(json?.error?.message ?? 'La clave no es válida o está inactiva.');
        this.cargando.set(false);
        this.cdr.detectChanges();
        return;
      }
      const lista: MaterialAlumno[] = (json.data?.material ?? []).map((d: any) => ({
        id: d.id,
        titulo: d.titulo,
        descripcion: d.descripcion ?? '',
        tipo: d.tipo,
        url: d.url ?? '',
        peso: d.tipo === 'enlace' ? '' : formatBytes(d.tamano),
      }));
      this.claveOk = c;
      this.materiales.set(lista);
      this.acceso.set(true);
    } catch {
      this.error.set('No se pudo conectar. Revisa tu internet e intenta de nuevo.');
    }
    this.cargando.set(false);
    this.cdr.detectChanges();
  }

  abrir(m: MaterialAlumno): void {
    if (m.tipo === 'enlace' && m.url) {
      window.open(m.url, '_blank');
    } else {
      const url = `${this.base}/material/${m.id}/descargar?clave=${encodeURIComponent(this.claveOk)}`;
      window.open(url, '_blank');
    }
  }

  icono(tipo: string): string {
    switch (tipo) {
      case 'pdf': return '📄';
      case 'audio': return '🎧';
      case 'video': return '🎬';
      case 'enlace': return '🔗';
      default: return '📁';
    }
  }

  salir(): void {
    this.acceso.set(false);
    this.materiales.set([]);
    this.clave.set('');
    this.claveOk = '';
    this.cdr.detectChanges();
  }
}