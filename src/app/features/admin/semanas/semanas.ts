import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { semanasStore, Semana, Horario } from '../../../core/services/semanas-store';

@Component({
  selector: 'app-semanas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './semanas.html',
  styleUrl: './semanas.scss',
})
export class SemanasAdmin implements OnInit {
  private readonly store = semanasStore;

  readonly semana = computed(() =>
    this.store.semanas().filter((s) => s.horario === 'semana')
      .sort((a, b) => a.inicio.localeCompare(b.inicio)),
  );
  readonly finde = computed(() =>
    this.store.semanas().filter((s) => s.horario === 'finde')
      .sort((a, b) => a.inicio.localeCompare(b.inicio)),
  );

  readonly editando = signal<Semana | null>(null);
  readonly esNuevo = signal(false);

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.store.cargar(true);
    this.cdr.detectChanges();
  }

  nuevo(horario: Horario): void {
    this.editando.set({ id: '', horario, inicio: '', fin: '', etiqueta: '', activo: true });
    this.esNuevo.set(true);
    this.cdr.detectChanges();
  }

  editar(s: Semana): void {
    this.editando.set({ ...s });
    this.esNuevo.set(false);
    this.cdr.detectChanges();
  }

  campo<K extends keyof Semana>(clave: K, valor: Semana[K]): void {
    const s = this.editando();
    if (s) { this.editando.set({ ...s, [clave]: valor }); this.cdr.detectChanges(); }
  }

  valido(): boolean {
    const s = this.editando();
    return !!s && !!s.inicio && !!s.fin && s.fin >= s.inicio;
  }

  guardar(): void {
    const s = this.editando();
    if (!s || !this.valido()) return;
    const datos = { horario: s.horario, inicio: s.inicio, fin: s.fin, etiqueta: s.etiqueta.trim(), activo: s.activo };
    const accion = this.esNuevo() ? this.store.crear(datos) : this.store.actualizar({ ...s, ...datos });
    accion.then((res) => {
      if (res.ok) this.editando.set(null);
      else alert(res.error ?? 'No se pudo guardar.');
      this.cdr.detectChanges();
    });
  }

  cancelar(): void { this.editando.set(null); this.cdr.detectChanges(); }

  toggle(s: Semana): void {
    this.store.toggle(s.id).then(() => this.cdr.detectChanges());
  }

  eliminar(s: Semana): void {
    if (!confirm(`¿Eliminar la semana ${s.inicio} a ${s.fin}?`)) return;
    this.store.eliminar(s.id).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo eliminar.');
      this.cdr.detectChanges();
    });
  }
}