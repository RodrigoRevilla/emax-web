import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { citasStore } from '../../../core/services/citas';
import { Cita, EstadoCita } from '../../../core/models/citas';

type Rango = 'hoy' | 'semana' | 'todas';

@Component({
  selector: 'app-citas-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './citas.html',
  styleUrl: './citas.scss',
})
export class CitasAdmin implements OnInit {
  readonly filtro = signal<EstadoCita | 'todas'>('todas');
  readonly rango = signal<Rango>('semana');
  readonly filtroSucursal = signal('Todas');
  readonly estados: EstadoCita[] = ['pendiente', 'confirmada', 'atendida', 'cancelada'];
  readonly sucursales = ['Todas', 'Jalatlaco', 'Ex Marquesado', 'Brenamiel', 'C.U.', 'Xoxocotlán'];

  private readonly citas = citasStore;

  private hoyStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private finSemanaStr(): string {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private enRango(c: Cita): boolean {
    const r = this.rango();
    if (r === 'todas') return true;
    const hoy = this.hoyStr();
    if (r === 'hoy') return c.fecha === hoy;
    return c.fecha >= hoy && c.fecha <= this.finSemanaStr();
  }

  readonly lista = computed(() => {
    const f = this.filtro();
    const s = this.filtroSucursal();
    return this.citas.citas()
      .filter((c) =>
        (f === 'todas' || c.estado === f) &&
        (s === 'Todas' || c.sucursal === s) &&
        this.enRango(c),
      )
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  });

  readonly hoyCount = computed(() => {
    const hoy = this.hoyStr();
    return this.citas.citas().filter((c) => c.fecha === hoy && c.estado !== 'cancelada').length;
  });

  readonly conteos = computed(() => {
    const todas = this.citas.citas();
    return {
      todas: todas.length,
      pendiente: todas.filter((c) => c.estado === 'pendiente').length,
      confirmada: todas.filter((c) => c.estado === 'confirmada').length,
      atendida: todas.filter((c) => c.estado === 'atendida').length,
      cancelada: todas.filter((c) => c.estado === 'cancelada').length,
    };
  });

  readonly etiquetas: Record<EstadoCita, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    atendida: 'Atendida',
    cancelada: 'No asistió',
  };

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.citas.cargar();
    this.cdr.detectChanges();
  }

  setFiltro(f: EstadoCita | 'todas'): void { this.filtro.set(f); this.cdr.detectChanges(); }
  setRango(r: Rango): void { this.rango.set(r); this.cdr.detectChanges(); }
  setSucursal(s: string): void { this.filtroSucursal.set(s); this.cdr.detectChanges(); }

  cambiar(c: Cita, estado: EstadoCita): void {
    this.citas.cambiarEstado(c.id, estado).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo cambiar el estado.');
      this.cdr.detectChanges();
    });
  }

  eliminar(c: Cita): void {
    if (!confirm(`¿Eliminar la cita de ${c.nombre}? Esta acción no se puede deshacer.`)) return;
    this.citas.eliminar(c.id).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo eliminar.');
      this.cdr.detectChanges();
    });
  }
}