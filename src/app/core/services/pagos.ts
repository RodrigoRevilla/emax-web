import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ConceptoPago, Comprobante, Envelope, SolicitudOrden } from '../models/pagos';

function mapConcepto(d: any): ConceptoPago {
  return {
    id: d.id,
    grupo: d.tipo,
    label: d.concepto,
    detalle: d.detalle ?? '',
    precio: d.precio,
    prontoPago: d.prontoPago,
    horario: d.horario ?? '',
  };
}

function mapComprobante(pago: any): Comprobante {
  return {
    folio: pago?.folio ?? '',
    orderId: pago?.ordenPaypal ?? '',
    alumno: pago?.alumno?.nombre ?? '',
    sucursal: pago?.alumno?.sucursal ?? '',
    conceptos: (pago?.conceptos ?? []).map((c: any) => ({ label: c.label, precio: c.precio })),
    descuento: pago?.descuento ?? 0,
    total: pago?.total ?? 0,
    moneda: pago?.moneda ?? 'MXN',
    fecha: new Date(pago?.creado ?? Date.now()).toLocaleDateString('es-MX'),
  };
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  catalogo(): Observable<Envelope<ConceptoPago[]>> {
    return this.http.get<Envelope<any[]>>(`${this.base}/precios`).pipe(
      map((r) => ({ ok: r.ok, data: (r.data ?? []).map(mapConcepto), error: r.error })),
      catchError(() => of({ ok: false, data: [] as ConceptoPago[], error: { code: 'RED', message: 'No se pudo cargar el catálogo.' } })),
    );
  }

  semanasVigentes(): Observable<string[]> {
    return this.http.get<Envelope<{ horarios: string[] }>>(`${this.base}/semanas/vigentes`).pipe(
      map((r) => r.data?.horarios ?? []),
      catchError(() => of([] as string[])),
    );
  }

  consultarFolio(folio: string): Observable<Comprobante | null> {
    return this.http.get<Envelope<any>>(`${this.base}/pagos/folio/${encodeURIComponent(folio)}`).pipe(
      map((r) => (r.ok ? mapComprobante(r.data) : null)),
      catchError(() => of(null)),
    );
  }

  verificarFolio(folio: string): Observable<boolean> {
    return this.http.get<Envelope<{ valido: boolean }>>(`${this.base}/pagos/verificar-folio`, {
      params: { folio },
    }).pipe(
      map((r) => r.data?.valido === true),
      catchError(() => of(false)),
    );
  }

  crearOrden(payload: SolicitudOrden): Observable<Envelope<{ orderId: string }>> {
    return this.http
      .post<Envelope<any>>(`${this.base}/pagos/orden`, {
        alumno: payload.alumno,
        conceptos: payload.conceptos,
        prontoPago: payload.prontoPago,
        folioAnterior: payload.folioAnterior ?? '',
      })
      .pipe(
        map((r) => ({ ok: r.ok, data: { orderId: r.data?.pago?.ordenPaypal ?? '' }, error: r.error })),
        catchError((e) => of({ ok: false, data: { orderId: '' }, error: e?.error?.error ?? { code: 'RED', message: 'No se pudo crear la orden.' } })),
      );
  }

  capturar(orderId: string): Observable<Envelope<Comprobante>> {
    return this.http.post<Envelope<any>>(`${this.base}/pagos/${orderId}/capturar`, {}).pipe(
      map((r) => ({ ok: r.ok, data: mapComprobante(r.data), error: r.error })),
      catchError((e) => of({ ok: false, data: {} as Comprobante, error: e?.error?.error ?? { code: 'RED', message: 'No se pudo capturar el pago.' } })),
    );
  }
}