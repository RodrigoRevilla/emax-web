import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { PagosService } from '../../core/services/pagos';
import { Comprobante } from '../../core/models/pagos';
import { cargarLogoDataUrl, generarComprobantePDF } from '../../core/comprobante-pdf';

@Component({
  selector: 'app-comprobante',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './comprobante.html',
  styleUrl: './comprobante.scss',
})
export class ConsultaComprobante implements OnInit {
  readonly folio = signal('');
  readonly buscando = signal(false);
  readonly error = signal<string | null>(null);
  readonly comprobante = signal<Comprobante | null>(null);
  private logo: string | null = null;

  constructor(
    private readonly pagos: PagosService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    cargarLogoDataUrl().then((d) => { this.logo = d; });
  }

  setFolio(v: string): void {
    this.folio.set(v.trim().toUpperCase());
  }

  buscar(): void {
    const f = this.folio();
    if (!f) return;
    this.buscando.set(true);
    this.error.set(null);
    this.comprobante.set(null);
    this.pagos.consultarFolio(f).subscribe((res) => {
      this.buscando.set(false);
      if (res) this.comprobante.set(res);
      else this.error.set('No encontramos un comprobante con ese folio. Revisa que esté bien escrito.');
      this.cdr.detectChanges();
    });
  }

  descargar(): void {
    const c = this.comprobante();
    if (c) generarComprobantePDF(c, this.logo);
  }

  otro(): void {
    this.comprobante.set(null);
    this.folio.set('');
    this.error.set(null);
    this.cdr.detectChanges();
  }
}