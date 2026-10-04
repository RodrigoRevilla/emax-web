import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { MaterialService } from '../../../core/services/material';
import { Acceso, Material, TipoMaterial } from '../../../core/models/material';

@Component({
  selector: 'app-material',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './material.html',
  styleUrl: './material.scss',
})
export class MaterialAdmin implements OnInit {
  readonly nivelActivo = signal<string>('en-kidz');
  readonly mostrarForm = signal(false);
  readonly fTitulo = signal('');
  readonly fTipo = signal<TipoMaterial>('pdf');
  readonly fAcceso = signal<Acceso>('maestros');
  readonly fUrl = signal('');
  readonly fArchivo = signal<File | null>(null);
  readonly subiendo = signal(false);

  readonly esAdmin = computed(() => this.auth.sesion()?.rol === 'admin');

  readonly materialesNivel = computed(() => {
    this.material.materiales();
    return this.material.materialesDe(this.nivelActivo());
  });

  constructor(
    private readonly material: MaterialService,
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.material.cargar().subscribe(() => this.cdr.detectChanges());
  }

  get cursos() { return this.material.cursos(); }

  seleccionarNivel(id: string): void {
    this.nivelActivo.set(id);
    this.mostrarForm.set(false);
    this.cdr.detectChanges();
  }

  icono(tipo: TipoMaterial): string {
    return { pdf: '📄', audio: '🎧', video: '🎬', enlace: '🔗' }[tipo];
  }

  onArchivo(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.fArchivo.set(input.files && input.files.length ? input.files[0] : null);
  }

  guardar(): void {
    const titulo = this.fTitulo().trim();
    if (titulo.length < 3) { alert('El título debe tener al menos 3 caracteres.'); return; }
    const tipo = this.fTipo();
    this.subiendo.set(true);

    const done = () => { this.resetForm(); this.subiendo.set(false); this.cdr.detectChanges(); };
    const fail = (e: any) => {
      alert(e?.error?.error?.message ?? 'No se pudo guardar el material.');
      this.subiendo.set(false);
      this.cdr.detectChanges();
    };

    if (tipo === 'enlace') {
      const url = this.fUrl().trim();
      if (!url) { alert('Ingresa la URL del enlace.'); this.subiendo.set(false); return; }
      this.material.subirEnlace(titulo, this.fAcceso(), this.nivelActivo(), url).subscribe({ next: done, error: fail });
    } else {
      const file = this.fArchivo();
      if (!file) { alert('Selecciona un archivo.'); this.subiendo.set(false); return; }
      this.material.subirArchivo(titulo, tipo, this.fAcceso(), this.nivelActivo(), file).subscribe({ next: done, error: fail });
    }
  }

  private resetForm(): void {
    this.fTitulo.set('');
    this.fTipo.set('pdf');
    this.fAcceso.set('maestros');
    this.fUrl.set('');
    this.fArchivo.set(null);
    this.mostrarForm.set(false);
  }

  borrar(m: Material): void {
    if (!confirm(`¿Eliminar "${m.titulo}"?`)) return;
    this.material.eliminar(m.id).subscribe({
      next: () => this.cdr.detectChanges(),
      error: () => { alert('No se pudo eliminar.'); this.cdr.detectChanges(); },
    });
  }

  ver(m: Material): void {
    if (m.tipo === 'enlace') {
      if (m.url) window.open(m.url, '_blank');
      return;
    }
    this.material.descargar(m.id).subscribe({
      next: (blob) => {
        const u = URL.createObjectURL(blob);
        window.open(u, '_blank');
        setTimeout(() => URL.revokeObjectURL(u), 60000);
      },
      error: () => alert('No se pudo abrir el archivo.'),
    });
  }
}