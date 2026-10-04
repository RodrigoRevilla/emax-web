import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { usuariosStore, UsuarioFull } from '../../../core/services/usuarios-store';
import { Rol } from '../../../core/models/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  private readonly store = usuariosStore;

  get usuarios() { return this.store.usuarios(); }
  get claves() { return this.store.claves(); }

  readonly tab = signal<'usuarios' | 'claves'>('usuarios');

  readonly uNombre = signal('');
  readonly uEmail = signal('');
  readonly uPass = signal('');
  readonly uRol = signal<Rol>('maestro');
  readonly formUsuario = signal(false);

  readonly cClave = signal('');
  readonly cDesc = signal('');
  readonly cNivel = signal('en-kidz');
  readonly formClave = signal(false);

  readonly formPassword = signal(false);
  readonly pActual = signal('');
  readonly pNueva = signal('');
  readonly pConfirm = signal('');

  readonly niveles = [
    { id: 'en-kidz', nombre: 'Inglés · KIDZ' },
    { id: 'en-children', nombre: 'Inglés · CHILDREN' },
    { id: 'en-teens', nombre: 'Inglés · TEENS' },
    { id: 'en-intensive', nombre: 'Inglés · INTENSIVE' },
    { id: 'fr-delf', nombre: 'Francés · DELF' },
    { id: 'es-ele', nombre: 'Español · ELE' },
  ];

  constructor(private readonly cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.store.cargar();
    this.cdr.detectChanges();
  }

  setTab(t: 'usuarios' | 'claves'): void { this.tab.set(t); this.cdr.detectChanges(); }

  guardarUsuario(): void {
    if (this.uNombre().trim().length < 2 || !this.uEmail().includes('@') || this.uPass().length < 4) return;
    this.store.crearUsuario(this.uNombre().trim(), this.uEmail().trim(), this.uPass(), this.uRol()).then((res) => {
      if (res.ok) {
        this.uNombre.set(''); this.uEmail.set(''); this.uPass.set(''); this.uRol.set('maestro');
        this.formUsuario.set(false);
      } else {
        alert(res.error ?? 'No se pudo crear el usuario.');
      }
      this.cdr.detectChanges();
    });
  }

  toggleU(u: UsuarioFull): void {
    this.store.toggleActivo(u.id).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo actualizar.');
      this.cdr.detectChanges();
    });
  }

  borrarU(u: UsuarioFull): void {
    if (!confirm(`¿Eliminar a ${u.nombre}?`)) return;
    this.store.eliminarUsuario(u.id).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo eliminar.');
      this.cdr.detectChanges();
    });
  }

  cambiarMiPassword(): void {
    const actual = this.pActual();
    const nueva = this.pNueva();
    if (nueva.length < 8) { alert('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    if (nueva !== this.pConfirm()) { alert('La confirmación no coincide.'); return; }
    this.store.cambiarMiPassword(actual, nueva).then((res) => {
      if (res.ok) {
        alert('Contraseña actualizada.');
        this.pActual.set(''); this.pNueva.set(''); this.pConfirm.set('');
        this.formPassword.set(false);
      } else {
        alert(res.error ?? 'No se pudo cambiar la contraseña.');
      }
      this.cdr.detectChanges();
    });
  }

  resetearPassword(u: UsuarioFull): void {
    const nueva = prompt(`Nueva contraseña para ${u.nombre} (mínimo 8 caracteres):`);
    if (nueva == null) return;
    if (nueva.length < 8) { alert('Mínimo 8 caracteres.'); return; }
    this.store.resetPassword(u.id, nueva).then((res) => {
      if (res.ok) alert(`Contraseña de ${u.nombre} restablecida.`);
      else alert(res.error ?? 'No se pudo restablecer.');
      this.cdr.detectChanges();
    });
  }

  guardarClave(): void {
    if (this.cClave().trim().length < 3) return;
    this.store.crearClave(this.cClave().trim().toUpperCase(), this.cDesc().trim(), this.cNivel()).then((res) => {
      if (res.ok) {
        this.cClave.set(''); this.cDesc.set(''); this.cNivel.set('en-kidz');
        this.formClave.set(false);
      } else {
        alert(res.error ?? 'No se pudo crear la clave.');
      }
      this.cdr.detectChanges();
    });
  }

  toggleC(id: string): void {
    this.store.toggleClave(id).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo actualizar.');
      this.cdr.detectChanges();
    });
  }

  borrarC(id: string): void {
    if (!confirm('¿Eliminar esta clave?')) return;
    this.store.eliminarClave(id).then((res) => {
      if (!res.ok) alert(res.error ?? 'No se pudo eliminar.');
      this.cdr.detectChanges();
    });
  }

  nombreNivel(id: string): string {
    return this.niveles.find((n) => n.id === id)?.nombre ?? id;
  }
}