import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { sucursalesStore, Sede } from '../../../core/services/sucursales-store';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.scss',
})
export class SucursalesAdmin implements OnInit {
  private readonly store = sucursalesStore;

  get sedes() { return this.store.sedes(); }

  readonly editando = signal<Sede | null>(null);
  readonly guardado = signal(false);

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.store.cargar();
    this.cdr.detectChanges();
  }

  editar(s: Sede): void {
    this.editando.set({ ...s, hours: [...s.hours], photos: [...s.photos] });
    this.guardado.set(false);
    this.cdr.detectChanges();
  }

  campo<K extends keyof Sede>(clave: K, valor: Sede[K]): void {
    const s = this.editando();
    if (s) { this.editando.set({ ...s, [clave]: valor }); this.cdr.detectChanges(); }
  }

  horariosTexto(): string {
    return this.editando()?.hours.join('\n') ?? '';
  }
  setHorarios(valor: string): void {
    const hours = valor.split('\n').map((h) => h.trim()).filter(Boolean);
    this.campo('hours', hours);
  }

  guardar(): void {
    const s = this.editando();
    if (!s || s.name.trim().length < 2) return;
    this.store.guardar(s).then((res) => {
      if (res.ok) {
        this.editando.set(null);
        this.guardado.set(true);
      } else {
        alert(res.error ?? 'No se pudo guardar.');
      }
      this.cdr.detectChanges();
    });
  }

  cancelar(): void { this.editando.set(null); this.cdr.detectChanges(); }
}