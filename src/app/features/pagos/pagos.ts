import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ElementRef, OnInit, ViewChild, computed, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { ConceptoPago, Comprobante, DatosAlumno } from '../../core/models/pagos';
import { waUrl, mensajeComprobante } from '../../core/whatsapp';
import { jsPDF } from 'jspdf';
import { PagosService } from '../../core/services/pagos';

declare const paypal: any;

@Component({
  selector: 'app-pagos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyPipe, TitleCasePipe],
  templateUrl: './pagos.html',
  styleUrl: './pagos.scss',
})
export class Pagos implements OnInit, AfterViewInit {
  @ViewChild('paypalBox') paypalBox!: ElementRef<HTMLDivElement>;

  readonly catalogo = signal<ConceptoPago[]>([]);
  readonly seleccion = signal<Set<string>>(new Set());
  readonly prontoPago = signal(false);
  readonly horariosVigentes = signal<string[]>([]);
  readonly folioAnterior = signal('');
  readonly folioValido = signal<boolean | null>(null);
  readonly verificandoFolio = signal(false);
  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly error = signal<string | null>(null);
  readonly comprobante = signal<Comprobante | null>(null);
  private logoDataUrl: string | null = null;

  readonly sucursales = ['Jalatlaco', 'Ex Marquesado', 'Brenamiel', 'C.U.', 'Xoxocotlán'];

  readonly alumno = signal<DatosAlumno>({ nombre: '', email: '', telefono: '', sucursal: '' });

  readonly elegidos = computed(() =>
    this.catalogo().filter((c) => this.seleccion().has(c.id)),
  );
  readonly subtotal = computed(() =>
    this.elegidos().reduce((sum, c) => sum + c.precio, 0),
  );

  // Un concepto es elegible para pronto pago si tiene descuento configurado y
  // su horario tiene una semana de descuento vigente hoy.
  aplicaProntoPago(c: ConceptoPago): boolean {
    return !!c.prontoPago && c.prontoPago > 0 && c.prontoPago < c.precio &&
      !!c.horario && this.horariosVigentes().includes(c.horario);
  }

  // El botón de pronto pago se habilita solo si algún concepto elegido es elegible hoy.
  readonly prontoPagoDisponible = computed(() =>
    this.elegidos().some((c) => this.aplicaProntoPago(c)),
  );

  readonly descuento = computed(() => {
    if (!this.prontoPago() || this.folioValido() !== true) return 0;
    return this.elegidos().reduce((sum, c) => {
      if (this.aplicaProntoPago(c)) {
        return sum + (c.precio - (c.prontoPago as number));
      }
      return sum;
    }, 0);
  });
  readonly total = computed(() => Math.max(0, this.subtotal() - this.descuento()));

  readonly formValido = computed(() => {
    const a = this.alumno();
    return a.nombre.trim().length > 2 &&
      a.email.includes('@') &&
      a.telefono.length === 10 &&
      a.sucursal !== '' &&
      this.elegidos().length > 0;
  });

  constructor(
    private readonly pagos: PagosService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarLogo();
    this.pagos.semanasVigentes().subscribe({
      next: (h) => { this.horariosVigentes.set(h); this.cdr.detectChanges(); },
    });
    this.pagos.catalogo().subscribe({
      next: (res) => {
        if (res.ok) this.catalogo.set(res.data);
        else this.error.set(res.error?.message ?? 'No se pudo cargar el catálogo.');
        this.cargando.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor.');
        this.cargando.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  ngAfterViewInit(): void {
    this.esperarPayPalYMontar();
  }

  // El SDK de PayPal es un script externo asíncrono; puede no estar listo cuando
  // Angular ejecuta ngAfterViewInit. Reintentamos hasta que exista (máx ~10s).
  private esperarPayPalYMontar(intentos = 0): void {
    if (typeof paypal !== 'undefined') {
      this.montarBotonPayPal();
      return;
    }
    if (intentos >= 50) {
      this.error.set('No se pudo cargar PayPal. Revisa tu conexión y recarga la página.');
      this.cdr.detectChanges();
      return;
    }
    setTimeout(() => this.esperarPayPalYMontar(intentos + 1), 200);
  }

  soloDigitos(v: string): string {
    return v.replace(/\D/g, '').slice(0, 10);
  }

  toggle(id: string): void {
    this.seleccion.update((set) => {
      const nuevo = new Set(set);
      nuevo.has(id) ? nuevo.delete(id) : nuevo.add(id);
      return nuevo;
    });
    this.cdr.detectChanges();
  }

  togglePronto(): void {
    if (!this.prontoPagoDisponible()) {
      this.prontoPago.set(false);
      this.folioAnterior.set('');
      this.folioValido.set(null);
      this.cdr.detectChanges();
      return;
    }
    this.prontoPago.update((v) => !v);
    if (!this.prontoPago()) {
      this.folioAnterior.set('');
      this.folioValido.set(null);
    }
    this.cdr.detectChanges();
  }

  setFolio(v: string): void {
    this.folioAnterior.set(v.trim().toUpperCase());
    this.folioValido.set(null);
    this.cdr.detectChanges();
  }

  verificarFolio(): void {
    const folio = this.folioAnterior();
    if (!folio) { this.folioValido.set(null); return; }
    this.verificandoFolio.set(true);
    this.pagos.verificarFolio(folio).subscribe((valido) => {
      this.folioValido.set(valido);
      this.verificandoFolio.set(false);
      this.cdr.detectChanges();
    });
  }

  porGrupo(grupo: string): ConceptoPago[] {
    return this.catalogo().filter((c) => c.grupo === grupo);
  }

  private montarBotonPayPal(): void {
    if (typeof paypal === 'undefined') {
      return;
    }

    paypal
      .Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' },

        onClick: (_data: unknown, actions: any) => {
          if (!this.formValido()) {
            this.error.set('Completa tus datos y elige al menos un concepto.');
            this.cdr.detectChanges();
            return actions.reject();
          }
          this.error.set(null);
          return actions.resolve();
        },

        createOrder: async () => {
          this.procesando.set(true);
          this.cdr.detectChanges();
          const res = await this.pagos
            .crearOrden({
              alumno: this.alumno(),
              conceptos: [...this.seleccion()],
              prontoPago: this.prontoPago(),
              folioAnterior: this.folioValido() === true ? this.folioAnterior() : '',
            })
            .toPromise();
          if (!res?.ok) throw new Error(res?.error?.message ?? 'Error al crear la orden');
          return res.data.orderId;
        },

        onApprove: async (data: { orderID: string }) => {
          const res = await this.pagos.capturar(data.orderID).toPromise();
          this.procesando.set(false);
          if (res?.ok) {
            this.comprobante.set(res.data);
            this.error.set(null);
          } else {
            this.error.set(res?.error?.message ?? 'No se pudo confirmar el pago.');
          }
          this.cdr.detectChanges();
        },

        onCancel: () => {
          this.procesando.set(false);
          this.cdr.detectChanges();
        },

        onError: () => {
          this.procesando.set(false);
          this.error.set('Ocurrió un error con PayPal. Intenta de nuevo.');
          this.cdr.detectChanges();
        },
      })
      .render(this.paypalBox.nativeElement);
  }

  private cargarLogo(): void {
    fetch('assets/logo-emax.png')
      .then((r) => r.blob())
      .then((b) => new Promise<string>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.onerror = () => rej(new Error('logo'));
        fr.readAsDataURL(b);
      }))
      .then((d) => { this.logoDataUrl = d; })
      .catch(() => { /* si falla, el PDF sale sin logo */ });
  }

  descargarComprobante(): void {
    const comp = this.comprobante();
    if (!comp) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const M = 48;
    const R = 547;
    let y = 64;
    const fmt = (n: number) =>
      '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + comp.moneda;

    if (this.logoDataUrl) {
      try {
        doc.addImage(this.logoDataUrl, 'PNG', M, y - 6, 52, 52);
      } catch {
        /* si el formato falla, seguimos sin logo */
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('e.Max Learning Institute', M + 66, y + 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(120);
      doc.text('Comprobante de pago', M + 66, y + 33);
      doc.setTextColor(0);
      y += 70;
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('e.Max Learning Institute', M, y);
      y += 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(120);
      doc.text('Comprobante de pago', M, y);
      doc.setTextColor(0);
      y += 32;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Folio: ' + comp.folio, M, y);
    y += 20;

    // Recordatorio del folio (recuadro destacado)
    doc.setFillColor(255, 248, 225);
    doc.setDrawColor(212, 160, 23);
    doc.roundedRect(M, y, R - M, 40, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(140, 90, 0);
    doc.text('Guarda este folio.', M + 12, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Lo necesitarás para obtener el descuento de pronto pago en tu 2ª colegiatura.',
      M + 12, y + 30, { maxWidth: R - M - 24 },
    );
    doc.setTextColor(0);
    y += 58;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const dato = (etq: string, val: string) => {
      doc.setTextColor(120);
      doc.text(etq, M, y);
      doc.setTextColor(0);
      doc.text(val, M + 90, y);
      y += 18;
    };
    dato('Alumno', comp.alumno);
    dato('Sucursal', comp.sucursal);
    dato('Fecha', comp.fecha);
    y += 8;

    doc.setDrawColor(220);
    doc.line(M, y, R, y);
    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Concepto', M, y);
    doc.text('Importe', R, y, { align: 'right' });
    y += 6;
    doc.line(M, y, R, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    for (const c of comp.conceptos) {
      doc.text(c.label, M, y, { maxWidth: 360 });
      doc.text(fmt(c.precio), R, y, { align: 'right' });
      y += 18;
    }
    if (comp.descuento > 0) {
      doc.setTextColor(20, 140, 60);
      doc.text('Descuento pronto pago', M, y);
      doc.text('-' + fmt(comp.descuento), R, y, { align: 'right' });
      doc.setTextColor(0);
      y += 18;
    }
    y += 6;
    doc.line(M, y, R, y);
    y += 24;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total pagado', M, y);
    doc.text(fmt(comp.total), R, y, { align: 'right' });
    y += 36;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      'Pago procesado por PayPal. Presenta este comprobante en recepción para completar tu registro.',
      M, y, { maxWidth: R - M },
    );

    doc.save('comprobante-' + comp.folio + '.pdf');
  }

  enviarWhatsApp(): void {
    const comp = this.comprobante();
    if (!comp) return;
    const msg = mensajeComprobante({ folio: comp.folio, alumno: comp.alumno, total: comp.total, moneda: comp.moneda });
    window.open(waUrl(null, msg), '_blank');
  }

  nuevoPago(): void {
    this.comprobante.set(null);
    this.seleccion.set(new Set());
    this.prontoPago.set(false);
    this.folioAnterior.set('');
    this.folioValido.set(null);
    this.alumno.set({ nombre: '', email: '', telefono: '', sucursal: '' });
    this.cdr.detectChanges();
  }
}