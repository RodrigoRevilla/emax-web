import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Bloque { tipo: 'h1' | 'h2' | 'h3' | 'p'; texto: string; }
type Doc = 'reglamento' | 'privacidad';

@Component({
  selector: 'app-legal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class Legal implements OnInit {
  readonly doc = signal<Doc>('reglamento');
  readonly cargando = signal(true);
  readonly bloques = signal<Bloque[]>([]);
  private cache: Record<string, Bloque[]> = {};

  constructor(private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargar('reglamento');
  }

  ver(d: Doc): void {
    if (d === this.doc() && this.bloques().length) return;
    this.doc.set(d);
    this.cargar(d);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private cargar(d: Doc): void {
    if (this.cache[d]) { this.bloques.set(this.cache[d]); this.cargando.set(false); this.cdr.detectChanges(); return; }
    this.cargando.set(true);
    const archivo = d === 'reglamento' ? 'assets/legal/reglamento.txt' : 'assets/legal/aviso-privacidad.txt';
    this.http.get(archivo, { responseType: 'text' }).subscribe({
      next: (txt) => {
        const b = this.parsear(txt);
        this.cache[d] = b;
        this.bloques.set(b);
        this.cargando.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.bloques.set([{ tipo: 'p', texto: 'No se pudo cargar el documento. Intenta de nuevo más tarde.' }]);
        this.cargando.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  private parsear(txt: string): Bloque[] {
    const lineas = txt.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const out: Bloque[] = [];
    for (let i = 0; i < lineas.length; i++) {
      const l = lineas[i];
      if (i === 0) { out.push({ tipo: 'h1', texto: l }); continue; }
      if (/^[IVX]+\.\s/.test(l) && l.length < 80) { out.push({ tipo: 'h2', texto: l }); continue; }
      const esHorario = /\b(am|pm)\b/i.test(l) || /\d:\d/.test(l);
      const m = l.match(/^(\d+)(\.\d+)+\.?\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]/) || l.match(/^(\d+)\.\s+[A-ZÁÉÍÓÚÑ]/);
      if (m && !esHorario && l.length < 90) {
        const puntos = ((l.match(/^\d[\d.]*/) || [''])[0].match(/\./g) || []).length;
        out.push({ tipo: puntos <= 1 ? 'h2' : 'h3', texto: l });
        continue;
      }
      out.push({ tipo: 'p', texto: l });
    }
    return out;
  }
}