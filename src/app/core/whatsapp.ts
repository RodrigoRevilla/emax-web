export function waUrl(telefono: string | null, mensaje: string): string {
  const texto = encodeURIComponent(mensaje);
  const tel = (telefono ?? '').replace(/\D/g, '');
  if (tel.length >= 10) {
    const conLada = tel.length === 10 ? '52' + tel : tel;
    return `https://wa.me/${conLada}?text=${texto}`;
  }
  return `https://wa.me/?text=${texto}`;
}

export function mensajeComprobante(datos: {
  folio: string; alumno: string; total: number; moneda: string;
}): string {
  return (
    `Comprobante de pago e.Max\n` +
    `Folio: ${datos.folio}\n` +
    `Alumno: ${datos.alumno}\n` +
    `Total: $${datos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${datos.moneda}\n\n` +
    `Guarda este folio: lo necesitarás para el descuento de pronto pago en tu 2ª colegiatura.`
  );
}