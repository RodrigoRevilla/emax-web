import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { descuentosStore, Descuento, TipoDescuento } from '../../../core/services/descuentos-store';

@Component({
  selector: 'app-descuentos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './descuentos.html',
  styleUrl: './descuentos.scss',
})
export class DescuentosAdmin implements OnInit {
  private readonly store = descuentosStore;

  get descuentos() { return this.store.descuentos(); }

  readonly editando = signal<Descuento | null>(null);
  readonly esNuevo = signal(false);

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.store.cargar();
    this.cdr.detectChanges();
  }

  nuevo(): void {
    this.editando.set({ id: '', nombre: '', descripcion: '', tipo: 'monto', valor: 0, activo: true, creado: '' });
    this.esNuevo.set(true);
    this.cdr.detectChanges();
  }

  editar(d: Descuento): void {
    this.editando.set({ ...d });
    this.esNuevo.set(false);
    this.cdr.detectChanges();
  }

  campo<K extends keyof Descuento>(clave: K, valor: Descuento[K]): void {
    const d = this.editando();
    if (d) { this.editando.set({ ...d, [clave]: valor }); this.cdr.detectChanges(); }
  }

  guardar(): void {
    const d = this.editando();
    if (!d || d.nombre.trim().length < 2 || d.valor < 0) return;
    const accion = this.esNuevo()
      ? this.store.crear(d.nombre.trim(), d.descripcion.trim(), d.tipo, d.valor)
      : this.store.actualizar({ ...d, nombre: d.nombre.trim(), descripcion: d.descripcion.trim() });
    accion.then((res) => {
      if (res.ok) this.editando.set(null);
      else alert(res.error ?? 'No se pudo guardar.');
      this.cdr.detectChanges();
    });
  }

  cancelar(): void { this.editando.set(null); this.cdr.detectChanges(); }

  toggle(d: Descuento): void {
    this.store.toggle(d.id).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo cambiar el estado.');
      this.cdr.detectChanges();
    });
  }

  eliminar(d: Descuento): void {
    if (!confirm(`¿Eliminar el descuento "${d.nombre}"?`)) return;
    this.store.eliminar(d.id).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo eliminar.');
      this.cdr.detectChanges();
    });
  }
}