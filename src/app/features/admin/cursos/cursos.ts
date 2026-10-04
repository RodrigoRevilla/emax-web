import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CursosService } from '../../../core/services/cursos';
import { CursoPrecio, PrecioItem, TipoConcepto } from '../../../core/models/cursos';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cursos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './cursos.html',
  styleUrl: './cursos.scss',
})
export class CursosAdmin implements OnInit {
  readonly cursoActivo = signal<string>('');
  readonly editando = signal<PrecioItem | null>(null);
  readonly cursoEditando = signal<CursoPrecio | null>(null);

  readonly tipos: TipoConcepto[] = ['colegiatura', 'inscripcion', 'material', 'examen'];

  readonly preciosCurso = computed(() => {
    this.cursos.precios();
    return this.cursos.preciosDe(this.cursoActivo());
  });

  constructor(
    private readonly cursos: CursosService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cursos.cargarTodo().subscribe((lista) => {
      if (lista.length && !this.cursoActivo()) {
        this.cursoActivo.set(lista[0].id);
      }
      this.cdr.detectChanges();
    });
  }

  get listaCursos() { return this.cursos.cursos(); }

  seleccionar(id: string): void {
    this.cursoActivo.set(id);
    this.editando.set(null);
    this.cdr.detectChanges();
  }

  nuevoCurso(): void {
    this.cursoEditando.set(this.cursos.nuevoCurso());
    this.editando.set(null);
    this.cdr.detectChanges();
  }

  editarCurso(): void {
    const actual = this.listaCursos.find((c) => c.id === this.cursoActivo());
    if (actual) {
      this.cursoEditando.set({ ...actual });
      this.editando.set(null);
      this.cdr.detectChanges();
    }
  }

  cancelarCurso(): void {
    this.cursoEditando.set(null);
    this.cdr.detectChanges();
  }

  guardarCurso(): void {
    const c = this.cursoEditando();
    if (!c || c.nombre.trim().length < 2) return;
    this.cursos.guardarCurso(c).subscribe((saved) => {
      if (!this.cursoActivo()) this.cursoActivo.set(saved.id);
      else if (!c.id) this.cursoActivo.set(saved.id); 
      this.cursoEditando.set(null);
      this.cdr.detectChanges();
    });
  }

  eliminarCurso(): void {
    const actual = this.listaCursos.find((c) => c.id === this.cursoActivo());
    if (!actual) return;
    if (!confirm(`¿Eliminar el curso "${actual.nombre}" y todos sus conceptos?`)) return;
    this.cursos.eliminarCurso(actual.id).subscribe(() => {
      const restantes = this.listaCursos;
      this.cursoActivo.set(restantes.length ? restantes[0].id : '');
      this.cdr.detectChanges();
    });
  }

  campoCurso<K extends keyof CursoPrecio>(clave: K, valor: CursoPrecio[K]): void {
    const actual = this.cursoEditando();
    if (actual) this.cursoEditando.set({ ...actual, [clave]: valor });
  }

  editar(p: PrecioItem): void {
    this.editando.set({ ...p });
    this.cursoEditando.set(null);
    this.cdr.detectChanges();
  }

  nuevo(): void {
    this.editando.set(this.cursos.nuevoPrecio(this.cursoActivo()));
    this.cursoEditando.set(null);
    this.cdr.detectChanges();
  }

  cancelar(): void {
    this.editando.set(null);
    this.cdr.detectChanges();
  }

guardar(): void {
    const item = this.editando();
    if (!item || item.concepto.trim().length < 2 || item.precio < 0) return;

    const payload: PrecioItem = {
      id: item.id ?? '',
      cursoId: item.cursoId || this.cursoActivo(),
      concepto: item.concepto.trim(),
      detalle: item.detalle ?? '',
      tipo: item.tipo,
      precio: Number(item.precio) || 0,
      prontoPago: Number(item.prontoPago) || 0,
      orden: Number(item.orden) || 0,
      activo: item.activo ?? true,
    };
    console.log('POST /precios payload =>', JSON.stringify(payload));

    this.cursos.guardarPrecio(payload).subscribe({
      next: () => {
        this.editando.set(null);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar concepto:', err?.error);
        alert(err?.error?.error?.message ?? 'No se pudo guardar el concepto.');
      },
    });
  }

  eliminar(p: PrecioItem): void {
    if (confirm(`¿Eliminar "${p.concepto}"?`)) {
      this.cursos.eliminarPrecio(p.id).subscribe(() => this.cdr.detectChanges());
    }
  }

  toggle(p: PrecioItem): void {
    this.cursos.toggleActivo(p.id).subscribe(() => this.cdr.detectChanges());
  }

  campo<K extends keyof PrecioItem>(clave: K, valor: PrecioItem[K]): void {
    const actual = this.editando();
    if (actual) this.editando.set({ ...actual, [clave]: valor });
  }
}