import { Injectable, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';   // <-- fase admin
import { SiteContent } from '../models/content';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly API = '/api/v1';

  readonly content = signal<SiteContent>(SEED);

}

const SEED: SiteContent = {
nav: [
    { label: 'Sucursales', anchor: 'campus' },
    { label: 'Método',     anchor: 'metodo' },
    { label: 'Programas',  anchor: 'programas' },
    { label: 'Alumnos',    anchor: 'testimonios' },
    { label: 'Contacto',   anchor: 'contacto' },
  ],
  hero: {
    kicker: 'e.Max Learning Institute · Oaxaca, México',
    title: 'Expand your world!',
    titleAccent: 'Learn languages!',
    subtitle: 'Inglés, español y francés  con metodología comunicativa y el estándar MCER, desde el corazón de Oaxaca.',
    ctaPrimary: 'Escríbenos',
    ctaSecondary: 'Conoce el método',
    video: 'assets/videoprueba.mp4',
  },
stats: [
    { value: '5',        label: 'sucursales en Oaxaca' },
    { value: 'A1–C2',    label: 'todos los niveles MCER' },
    { value: '8–17',     label: 'alumnos por grupo' },
    { value: '100%',     label: 'inglés americano' },
  ],
campus: {
    eyebrow: 'Sucursales',
    title: 'Aprendemos en toda la ciudad',
    lede: 'Cuatro sucursales en Oaxaca de Juárez, todas con el mismo Emax Method y la misma calidez. Haz clic en una sede para ver sus fotos y datos de contacto.',
    branches: [
      {
        name: 'Jalatlaco',
        cover: 'assets/jalatlaco/entrada.jpg',
        photos: [
          'assets/jalatlaco/entrada.jpg',
          'assets/jalatlaco/entrada2.jpg',
          'assets/jalatlaco/patio.jpg',
          'assets/jalatlaco/esquina.jpg',
        ],
        address: 'Hidalgo esq. 5 de Mayo #104, Barrio de Jalatlaco, Oaxaca de Juárez.',
        phone: '951 206 22 58',
        whatsapp: '529513216491',
        hours: ['Lun–Vie 7:30–20:00', 'Sáb 8:00–20:00', 'Dom 8:30–14:30'],
      },
      {
        name: 'Ex Marquesado',
        cover: 'assets/exmar/entrada.jpg',
        photos: [
          'assets/exmar/entrada.jpg',
          'assets/exmar/edificio.jpg',
          'assets/exmar/recepcion.jpg',
        ],
        address: 'Niños Héroes 405, Col. Ex Marquesado, Oaxaca de Juárez (cerca del panteón).',
        phone: '951 514 24 05',
        whatsapp: '529513957129',
        hours: ['Lun–Vie 7:30–19:00', 'Sáb 8:00–14:30'],
      },
      {
        name: 'Brenamiel',
        cover: 'assets/brenamiel/entrada.jpg',
        photos: [
          'assets/brenamiel/entrada.jpg',
          'assets/brenamiel/patio.jpg',
          'assets/brenamiel/recepcion.jpg',
          'assets/brenamiel/pasillo.jpg',
        ],
        address: 'Camino a San Jacinto Amilpas #111, a un costado de las canchas de tenis. Cuenta con estacionamiento.',
        phone: '951 163 09 59',
        whatsapp: '522291750057',
        hours: ['Lun–Vie 7:00–20:00', 'Sáb 8:00–14:30'],
      },
      {
        name: 'C.U.',
        cover: 'assets/cu/entrada.jpg',
        photos: [
          'assets/cu/entrada.jpg',
          'assets/cu/patio.jpg',
          'assets/cu/curso.jpg',
        ],
        address: 'Huerto Los Laureles #201, Fracc. Trinidad de las Huertas, Oaxaca.',
        phone: '951 206 68 05 / 951 206 35 18',
        whatsapp: '529513676631',
        hours: ['Lun–Vie 8:00–20:00', 'Sáb 8:00–14:00'],
      },
{
        name: 'Xoxocotlán',
        cover: 'assets/xoxo/entrada.jpg',
        photos: ['assets/xoxo/entrada.jpg', 'assets/xoxo/fachada.jpg'],
        address: 'Calle Aldama #19, Santa Cruz Xoxocotlán, Oaxaca.',   
        phone: '951 111 91 24',                                        
        whatsapp: '9511119124',                                       
        hours: ['Lun–Vie 7:00–7:00', 'Sáb 8:00–14:30'],               
      },
    ],
  },
method: {
    eyebrow: 'Metodología',
    title: 'El Emax Method',
    lede: 'Make learning easy, effective and fun. Un método propio, enfocado en que aprendas inglés americano y lo uses desde el primer día.',
    cards: [
      { title: 'Enfoque comunicativo', body: 'Clases pensadas para que hables desde el inicio. La gramática es una herramienta, no el objetivo: practicas situaciones reales en cada sesión.' },
      { title: 'Inglés americano', body: 'Profesores capacitados en el Emax Method, con dominio avanzado del idioma y formación pedagógica especializada.' },
      { title: 'Clase de prueba gratuita', body: 'Prueba una clase sin costo antes de inscribirte y comprueba tú mismo cómo se siente aprender con nosotros.' },
      { title: 'Avance por niveles', body: 'Sistema por niveles del A1 al C2 con evaluación de ubicación gratuita, para que empieces justo donde te corresponde.' },
    ],
    mcer: 'Nuestros valores: Grit, Growth and Community. Y una meta clara — tener un impacto positivo en tu futuro.',
  },
programs: {
    eyebrow: 'Oferta académica',
    title: 'Programas por edad',
    lede: 'Todos nuestros programas de inglés siguen el Emax Method y se organizan por edad, del A1 al C2. También ofrecemos francés y español como lengua extranjera.',
    items: [
      { id: 'en', flag: '🇺🇸', name: 'Inglés', body: 'Inglés americano para todas las edades, organizado en cuatro programas: KIDZ (3 a 7 años), CHILDREN (8 a 10), TEENS (11 a 13) e INTENSIVE (14 años en adelante). Cada uno con su propio ritmo y preparación hacia certificaciones TOEFL.', tags: ['KIDZ 3–7', 'CHILDREN 8–10', 'TEENS 11–13', 'INTENSIVE 14+'] },
      { id: 'fr', flag: '🇫🇷', name: 'Francés', body: 'Curso de preparación para el examen DELF, disponible en horario de domingo. Ideal si buscas una segunda lengua con enfoque en la certificación internacional francesa.', tags: ['Domingos', 'Preparación DELF', '14+'] },
      { id: 'es', flag: '🇲🇽', name: 'Español', body: 'Español como lengua extranjera en clases especiales, con preparación para el examen de español. Disponible en la sucursal de Jalatlaco.', tags: ['Lengua extranjera', 'Clases especiales'] },
    ],
  },
certifications: {
    eyebrow: 'Reconocimientos',
    title: 'Certificaciones',
    lede: 'Acreditamos tu avance a distintos niveles, desde una constancia interna hasta certificaciones con validez oficial e internacional.',
    items: [
      { badge: 'Emax', name: 'Constancia interna', body: 'Disponible en todos los niveles bajo solicitud. Acredita tu avance dentro del sistema Emax.', scope: 'Todos los niveles' },
      { badge: 'SEP', name: 'Diploma SEP', body: 'Reconocimiento oficial de la Secretaría de Educación Pública al completar el programa. Para mayores de 15 años.', scope: 'Oficial · Nacional' },
      { badge: 'TOEFL', name: 'Certificación TOEFL', body: 'Preparación y aplicación del examen TOEFL en los niveles correspondientes. Válido para admisiones y trabajo.', scope: 'Inglés · Internacional' },
    ],
  },
  testimonials: {
    eyebrow: 'Alumnos',
    title: 'Lo que dicen nuestros alumnos',
    items: [
      { quote: 'En e.Max no solo aprendí inglés — aprendí a pensar en inglés. El ambiente del campus y los maestros hacen que cada clase se sienta como una conversación real, no como una lección.', author: 'María González', meta: 'Diseñadora gráfica · 28 años · Nivel B2' },
      { quote: 'Llevaba años queriendo aprender francés y nunca encontraba tiempo. El horario flexible de e.Max me permitió combinarlo con la universidad. En 8 meses ya puedo mantener conversaciones fluidas.', author: 'Javier Ruiz', meta: 'Estudiante universitario · 21 años · Nivel B1 Francés' },
      { quote: 'Mi empresa requería inglés de negocios y yo venía de cero. El programa corporativo de e.Max fue exactamente lo que necesitaba: práctico, directo y con seguimiento real de mis avances.', author: 'Diana Morales', meta: 'Gerente Comercial · 44 años · Inglés Empresarial' },
    ],
  },
contact: {
    eyebrow: 'Encuéntranos',
    title: 'Visítanos en Oaxaca',
    info: {
      address: ['Hidalgo esq. 5 de Mayo #104', 'Barrio de Jalatlaco, Oaxaca de Juárez, Oax.'],
      phone: '951 205 7369',
      hours: ['Lunes a viernes: 7:30 – 20:00 h', 'Sábados: 8:00 – 20:00 h', 'Domingos: 8:30 – 14:30 h'],
      whatsapp: '529514582210',
    },
  },
faq: {
    eyebrow: 'Respuestas',
    title: 'Preguntas frecuentes',
    items: [
      { q: '¿Cuánto dura cada nivel?', a: 'Entre semana, cada nivel dura 4 semanas. En modalidad sabatina o dominical, entre 5 y 6 semanas según el programa.' },
      { q: '¿Qué modalidades manejan?', a: 'Presencial en nuestras cuatro sucursales, en línea por Zoom para clases especiales, y clases particulares uno a uno con horario flexible.' },
      { q: '¿Necesito conocimientos previos?', a: 'No. Tenemos programas desde los 3 años y desde el nivel básico (A1). Si no empiezas desde el nivel 1, aplicamos una evaluación de ubicación gratuita.' },
      { q: '¿Hay clase de prueba?', a: 'Sí, ofrecemos una clase de prueba gratuita por estudiante para que conozcas el método antes de inscribirte.' },
      { q: '¿Qué idioma de inglés enseñan?', a: 'Inglés americano, con el Emax Method: un enfoque propio diseñado para que aprender sea fácil, efectivo y divertido.' },
      { q: '¿Qué certificaciones ofrecen?', a: 'Constancia interna en todos los niveles, Diploma SEP con validez oficial, y certificación TOEFL con reconocimiento internacional.' },
    ],
  },
urgency: {
    kicker: 'Clase de prueba gratuita',
    title: 'Prueba una clase sin costo antes de inscribirte',
    body: 'Conoce el Emax Method en cualquiera de nuestras sucursales. Agenda tu clase de prueba gratuita y da el primer paso hacia el dominio del inglés.',
    cta: 'Agendar clase de prueba',
  },
};
