import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { citasStore } from '../../core/services/citas';

@Component({
  selector: 'app-agenda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda {
  readonly sucursales = ['Jalatlaco', 'Ex Marquesado', 'Brenamiel', 'C.U.', 'Xoxocotlán'];
  readonly cursos = ['Inglés', 'Francés', 'Español'];
  readonly horas = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00'];

  readonly f = signal({
    nombre: '', telefono: '', email: '',
    sucursal: '', curso: '', fecha: '', hora: '', mensaje: '',
  });

  readonly enviada = signal(false);
  readonly folio = signal('');
  readonly hoy = new Date().toISOString().slice(0, 10);
  readonly maxFecha = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  })();

  readonly avisoFecha = computed(() => {
    const v = this.f().fecha;
    if (!v) return '';
    const d = new Date(v + 'T00:00:00');
    if (isNaN(d.getTime())) return 'Esa fecha no es válida, revísala.';
    const dia = d.getDay();
    if (dia === 0 || dia === 6) return 'Solo agendamos de lunes a viernes. Elige un día entre semana.';
    if (v < this.hoy) return 'Elige una fecha de hoy en adelante.';
    return '';
  });

  readonly valido = computed(() => {
    const v = this.f();
    return v.nombre.trim().length > 2 && v.telefono.length === 10 &&
      v.sucursal !== '' && v.curso !== '' && v.fecha !== '' && v.hora !== '' &&
      this.avisoFecha() === '';
  });

  private readonly citas = citasStore;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  set<K extends keyof ReturnType<typeof this.f>>(clave: K, valor: string): void {
    this.f.set({ ...this.f(), [clave]: valor });
    this.cdr.detectChanges();
  }

  soloDigitos(v: string): string {
    return v.replace(/\D/g, '').slice(0, 10);
  }

  enviar(): void {
    if (!this.valido()) return;
    this.citas.agendar(this.f()).then((res) => {
      if (!res.ok || !res.cita) {
        alert(res.error ?? 'No se pudo enviar la cita. Intenta de nuevo.');
        return;
      }
      this.folio.set('CITA-' + res.cita.id.toUpperCase());
      this.enviada.set(true);
      this.cdr.detectChanges();
    });
  }

  otra(): void {
    this.f.set({ nombre: '', telefono: '', email: '', sucursal: '', curso: '', fecha: '', hora: '', mensaje: '' });
    this.enviada.set(false);
    this.cdr.detectChanges();
  }
}