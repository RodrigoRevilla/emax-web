import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { pagosStore } from '../../../core/services/pagos-store';
import { citasStore } from '../../../core/services/citas';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly pagos = pagosStore;
  private readonly citas = citasStore;
  readonly listo = signal(false);

  private hoyStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  private mesStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  readonly ingresosMes = computed(() =>
    this.pagos.pagos().filter((p) => p.fecha.startsWith(this.mesStr())).reduce((s, p) => s + p.total, 0),
  );
  readonly pagosHoy = computed(() =>
    this.pagos.pagos().filter((p) => p.fecha.startsWith(this.hoyStr())),
  );
  readonly ingresosHoy = computed(() => this.pagosHoy().reduce((s, p) => s + p.total, 0));
  readonly totalRecaudado = computed(() => this.pagos.pagos().reduce((s, p) => s + p.total, 0));
  readonly alumnosPagaron = computed(() => this.pagos.pagos().length);
  readonly pagosSinRegistrar = computed(() => this.pagos.pagos().filter((p) => !p.atendido).length);

  readonly citasHoy = computed(() =>
    this.citas.citas().filter((c) => c.fecha === this.hoyStr() && c.estado !== 'cancelada'),
  );
  readonly citasPorConfirmar = computed(() =>
    this.citas.citas().filter((c) => c.estado === 'pendiente' && c.fecha >= this.hoyStr()).length,
  );
  readonly proximasCitas = computed(() =>
    this.citas.citas()
      .filter((c) => c.fecha >= this.hoyStr() && c.estado !== 'cancelada')
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
      .slice(0, 5),
  );
  readonly ultimosPagos = computed(() => this.pagos.pagos().slice(0, 5));

  private conPct(items: { label: string; valor: number }[]) {
    const max = Math.max(1, ...items.map((i) => i.valor));
    return items.map((i) => ({ ...i, pct: Math.round((i.valor / max) * 100) }));
  }

  readonly ingresosPorMes = computed(() => {
    const m3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const now = new Date();
    const items: { label: string; valor: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const valor = this.pagos.pagos().filter((p) => p.fecha.startsWith(key)).reduce((s, p) => s + p.total, 0);
      items.push({ label: m3[d.getMonth()], valor });
    }
    return this.conPct(items);
  });

  readonly ingresosPorSucursal = computed(() => {
    const sucs = ['Jalatlaco', 'Ex Marquesado', 'Brenamiel', 'C.U.', 'Xoxocotlán'];
    return this.conPct(sucs.map((s) => ({
      label: s,
      valor: this.pagos.pagos().filter((p) => p.sucursal === s).reduce((a, p) => a + p.total, 0),
    })));
  });

  readonly ingresosPorConcepto = computed(() => {
    const acc: Record<string, number> = { Inscripción: 0, Colegiatura: 0, Material: 0, Examen: 0 };
    for (const p of this.pagos.pagos()) {
      for (const c of p.conceptos) {
        const l = c.label.toLowerCase();
        if (l.startsWith('inscrip') || l.includes('matrícula')) acc['Inscripción'] += c.precio;
        else if (l.startsWith('colegiatura')) acc['Colegiatura'] += c.precio;
        else if (l.startsWith('libro') || l.includes('material')) acc['Material'] += c.precio;
        else if (l.startsWith('examen') || l.includes('toefl')) acc['Examen'] += c.precio;
        else acc['Colegiatura'] += c.precio;
      }
    }
    return this.conPct(Object.entries(acc).map(([label, valor]) => ({ label, valor })));
  });

  readonly hayIngresos = computed(() => this.totalRecaudado() > 0);

  readonly nombreMes = computed(() => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses[new Date().getMonth()];
  });

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.pagos.cargar(true), this.citas.cargar()]);
    this.listo.set(true);
    this.cdr.detectChanges();
  }
}