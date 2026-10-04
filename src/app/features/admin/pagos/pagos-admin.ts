import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { pagosStore } from '../../../core/services/pagos-store';
import { PagoRegistro } from '../../../core/models/pago-registro';
import { waUrl, mensajeComprobante } from '../../../core/whatsapp';

@Component({
  selector: 'app-pagos-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './pagos-admin.html',
  styleUrl: './pagos-admin.scss',
})
export class PagosAdmin implements OnInit {
  readonly sucursales = ['Todas', 'Jalatlaco', 'Ex Marquesado', 'Brenamiel', 'C.U.', 'Xoxocotlán'];
  readonly filtroSucursal = signal('Todas');
  readonly mes = signal('');
  readonly busqueda = signal('');

  private readonly store = pagosStore;

  readonly lista = computed(() => {
    const s = this.filtroSucursal();
    const m = this.mes();
    const q = this.busqueda().toLowerCase().trim();
    return this.store.pagos().filter((p) =>
      (s === 'Todas' || p.sucursal === s) &&
      (m === '' || p.fecha.startsWith(m)) &&
      (q === '' ||
        p.folio.toLowerCase().includes(q) ||
        p.alumno.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)),
    );
  });

  readonly pendientes = computed(() => this.lista().filter((p) => !p.atendido).length);

  readonly totalRecaudado = computed(() =>
    this.lista().reduce((sum, p) => sum + p.total, 0),
  );

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.store.cargar();
    this.cdr.detectChanges();
  }

  setSucursal(s: string): void { this.filtroSucursal.set(s); this.cdr.detectChanges(); }
  setMes(m: string): void { this.mes.set(m); this.cdr.detectChanges(); }
  limpiarMes(): void { this.mes.set(''); this.cdr.detectChanges(); }
  setBusqueda(q: string): void { this.busqueda.set(q); this.cdr.detectChanges(); }

  whatsapp(p: PagoRegistro): void {
    const msg = 'Hola ' + p.alumno + ',\n\n' +
      mensajeComprobante({ folio: p.folio, alumno: p.alumno, total: p.total, moneda: 'MXN' });
    window.open(waUrl(p.telefono, msg), '_blank');
  }

  toggleAtendido(p: PagoRegistro): void {
    this.store.toggleAtendido(p.id, !p.atendido).then((ok) => {
      if (!ok) alert('No se pudo actualizar el estado.');
      this.cdr.detectChanges();
    });
  }

  private desglose(p: PagoRegistro) {
    const r = { inscripcion: 0, colegiatura: 0, material: 0, examen: 0 };
    for (const c of p.conceptos) {
      const l = c.label.toLowerCase();
      if (l.startsWith('inscrip') || l.includes('matrícula')) r.inscripcion += c.precio;
      else if (l.startsWith('colegiatura')) r.colegiatura += c.precio;
      else if (l.startsWith('libro') || l.includes('material')) r.material += c.precio;
      else if (l.startsWith('examen') || l.includes('toefl')) r.examen += c.precio;
      else r.colegiatura += c.precio;
    }
    return r;
  }

  exportarExcel(): void {
    const pagos = this.lista();
    if (pagos.length === 0) { alert('No hay pagos para exportar en este filtro.'); return; }

    const filas: Record<string, string | number>[] = pagos.map((p) => {
      const d = this.desglose(p);
      return {
        Folio: p.folio,
        Fecha: p.fecha,
        Alumno: p.alumno,
        Correo: p.email,
        Sucursal: p.sucursal,
        Inscripción: d.inscripcion,
        Colegiatura: d.colegiatura,
        Material: d.material,
        Examen: d.examen,
        Subtotal: p.total + p.descuento,
        Descuento: p.descuento,
        Total: p.total,
        Método: p.metodo,
      };
    });

    const suma = (k: string) =>
      filas.reduce((a, f) => a + (typeof f[k] === 'number' ? (f[k] as number) : 0), 0);

    filas.push({
      Folio: 'TOTALES', Fecha: '', Alumno: '', Correo: '', Sucursal: '',
      Inscripción: suma('Inscripción'), Colegiatura: suma('Colegiatura'),
      Material: suma('Material'), Examen: suma('Examen'),
      Subtotal: suma('Subtotal'), Descuento: suma('Descuento'), Total: suma('Total'),
      Método: '',
    });

    const ws = XLSX.utils.json_to_sheet(filas);
    ws['!cols'] = [
      { wch: 16 }, { wch: 17 }, { wch: 24 }, { wch: 26 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
      { wch: 12 }, { wch: 11 }, { wch: 12 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    const hoja = this.mes() ? 'Pagos ' + this.mes() : 'Pagos';
    XLSX.utils.book_append_sheet(wb, ws, hoja.slice(0, 31));
    const nombre = 'pagos-emax-' + (this.mes() || 'todos') +
      (this.filtroSucursal() !== 'Todas' ? '-' + this.filtroSucursal().replace(/\s+/g, '') : '') + '.xlsx';
    XLSX.writeFile(wb, nombre);
  }
}