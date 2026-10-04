import { jsPDF } from 'jspdf';
import { Comprobante } from './models/pagos';

export function cargarLogoDataUrl(): Promise<string | null> {
  return fetch('assets/logo-emax.png')
    .then((r) => r.blob())
    .then((b) => new Promise<string | null>((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.onerror = () => res(null);
      fr.readAsDataURL(b);
    }))
    .catch(() => null);
}

export function generarComprobantePDF(comp: Comprobante, logoDataUrl: string | null): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const M = 48;
  const R = 547;
  let y = 64;
  const fmt = (n: number) =>
    '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + comp.moneda;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', M, y - 6, 52, 52);
    } catch {
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