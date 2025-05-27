import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PalabraCrucigrama {
  palabra: string;
  pista_es: string;
  pista_en: string;
  pista_de: string;
  pista_it: string;
  fila: number;
  columna: number;
  orientacion: 'horizontal' | 'vertical';
}

@Component({
  selector: 'app-crucigrama',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crucigrama.component.html',
  styleUrls: ['./crucigrama.component.scss']
})
export class CrucigramaComponent implements OnInit {
  idiomaSeleccionado: string = 'es';
  palabrasOriginales: PalabraCrucigrama[] = [
    { palabra: 'SIETE', pista_es: 'Número después del seis', pista_en: 'Number after six', pista_de: 'Zahl nach sechs', pista_it: 'Numero dopo il sei', fila: 0, columna: 0, orientacion: 'horizontal' },
    { palabra: 'DOS', pista_es: 'Número entre uno y tres', pista_en: 'Number between one and three', pista_de: 'Zahl zwischen eins und drei', pista_it: 'Numero tra uno e tre', fila: 2, columna: 0, orientacion: 'horizontal' },
    { palabra: 'UNO', pista_es: 'Primer número', pista_en: 'First number', pista_de: 'Erste Zahl', pista_it: 'Primo numero', fila: 0, columna: 6, orientacion: 'vertical' },
    { palabra: 'SEIS', pista_es: 'Número antes del siete', pista_en: 'Number before seven', pista_de: 'Zahl vor sieben', pista_it: 'Numero prima del sette', fila: 1, columna: 0, orientacion: 'vertical' },
    { palabra: 'OCHO', pista_es: 'Número después del siete', pista_en: 'Number after seven', pista_de: 'Zahl nach sieben', pista_it: 'Numero dopo il sette', fila: 2, columna: 2, orientacion: 'vertical' },
    { palabra: 'NUEVE', pista_es: 'Número antes del diez', pista_en: 'Number before ten', pista_de: 'Zahl vor zehn', pista_it: 'Numero prima del dieci', fila: 0, columna: 8, orientacion: 'horizontal' },
    { palabra: 'TRES', pista_es: 'Número después del dos', pista_en: 'Number after two', pista_de: 'Zahl nach zwei', pista_it: 'Numero dopo il due', fila: 4, columna: 0, orientacion: 'horizontal' },
    { palabra: 'CUATRO', pista_es: 'Número después del tres', pista_en: 'Number after three', pista_de: 'Zahl nach drei', pista_it: 'Numero dopo il tre', fila: 2, columna: 9, orientacion: 'vertical' },
    { palabra: 'CINCO', pista_es: 'Número entre cuatro y seis', pista_en: 'Number between four and six', pista_de: 'Zahl zwischen vier und sechs', pista_it: 'Numero tra quattro e sei', fila: 0, columna: 9, orientacion: 'horizontal' },
    { palabra: 'DIEZ', pista_es: 'Número después del nueve', pista_en: 'Number after nine', pista_de: 'Zahl nach neun', pista_it: 'Numero dopo il nove', fila: 6, columna: 10, orientacion: 'vertical' }
  ];
  palabras: PalabraCrucigrama[] = []; // Este array contendrá las palabras aleatorias para el juego actual
  filasMaximas: number = 10;
  columnasMaximas: number = 12;
  cuadricula: (string | null)[][] = [];
  respuestasUsuario: { [key: string]: string[] } = {};
  mensaje: string = '';
  numeroPalabrasAleatorias: number = 6;

  ngOnInit(): void {
    this.seleccionarPalabrasAleatorias();
    this.inicializarCuadriculaConEspacios();
    this.inicializarRespuestasUsuario();
    console.log('Palabras cargadas en ngOnInit:', this.palabras);
  }

  seleccionarPalabrasAleatorias(): void {
    const palabrasAleatorias: PalabraCrucigrama[] = [];
    const palabrasDisponibles = [...this.palabrasOriginales]; // Creamos una copia para no modificar el original

    for (let i = 0; i < Math.min(this.numeroPalabrasAleatorias, palabrasDisponibles.length); i++) {
      const indiceAleatorio = Math.floor(Math.random() * palabrasDisponibles.length);
      palabrasAleatorias.push(palabrasDisponibles.splice(indiceAleatorio, 1)[0]);
    }
    this.palabras = palabrasAleatorias;
  }

  inicializarCuadriculaConEspacios(): void {
    this.cuadricula = Array(this.filasMaximas).fill(null).map(() => Array(this.columnasMaximas).fill(null));
    this.palabras.forEach((palabra, index) => {
      for (let i = 0; i < palabra.palabra.length; i++) {
        let r = palabra.fila;
        let c = palabra.columna;
        if (palabra.orientacion === 'horizontal') {
          c += i;
        } else {
          r += i;
        }
        if (r >= 0 && r < this.filasMaximas && c >= 0 && c < this.columnasMaximas) {
          this.cuadricula[r][c] = '';
        }
      }
    });
  }

  inicializarRespuestasUsuario(): void {
    this.palabras.forEach(palabra => {
      const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
      this.respuestasUsuario[clave] = Array(palabra.palabra.length).fill('');
    });
  }

  obtenerPista(palabra: PalabraCrucigrama): string {
    switch (this.idiomaSeleccionado) {
      case 'en':
        return palabra.pista_en;
      case 'de':
        return palabra.pista_de;
      case 'it':
        return palabra.pista_it;
      default:
        return palabra.pista_es;
    }
  }

  obtenerValorCeldaEstilizada(fila: number, columna: number): string {
    if (this.cuadricula[fila] && this.cuadricula[fila][columna] !== null) {
      for (const palabra of this.palabras) {
        let r = palabra.fila;
        let c = palabra.columna;
        if (palabra.orientacion === 'horizontal' && fila === r && columna >= c && columna < c + palabra.palabra.length) {
          const indice = columna - c;
          const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
          return this.respuestasUsuario[clave]?.[indice] || '';
        } else if (palabra.orientacion === 'vertical' && columna === c && fila >= r && fila < r + palabra.palabra.length) {
          const indice = fila - r;
          const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
          return this.respuestasUsuario[clave]?.[indice] || '';
        }
      }
    }
    return '';
  }

  esCeldaActiva(fila: number, columna: number): boolean {
    return this.cuadricula[fila] && this.cuadricula[fila][columna] !== null;
  }

  actualizarInputCeldaEstilizada(fila: number, columna: number, event: any): void {
    const value = event.target.value.toUpperCase();
    for (const palabra of this.palabras) {
      let r = palabra.fila;
      let c = palabra.columna;
      let indice;
      if (palabra.orientacion === 'horizontal' && fila === r && columna >= c && columna < c + palabra.palabra.length) {
        indice = columna - c;
      } else if (palabra.orientacion === 'vertical' && columna === c && fila >= r && fila < r + palabra.palabra.length) {
        indice = fila - r;
      }
      if (indice !== undefined) {
        const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
        if (this.respuestasUsuario[clave] && indice >= 0 && indice < this.respuestasUsuario[clave].length) {
          this.respuestasUsuario[clave][indice] = value;
        }
        return;
      }
    }
  }

  mostrarNumeroPista(fila: number, columna: number): number | undefined {
    const palabraEncontrada = this.palabras.find(palabra => palabra.fila === fila && palabra.columna === columna);
    return palabraEncontrada ? this.palabras.indexOf(palabraEncontrada) + 1 : undefined;
  }

  comprobarRespuestas(): void {
    let todasCorrectas = true;
    for (const palabra of this.palabras) {
      const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
      const respuestaUsuario = this.respuestasUsuario[clave]?.join('');
      if (respuestaUsuario !== palabra.palabra) {
        todasCorrectas = false;
        break;
      }
    }

    this.mensaje = todasCorrectas ? '¡Felicidades! ¡Has resuelto el crucigrama!' : 'Sigue intentándolo. Algunas respuestas son incorrectas.';
  }

  reiniciarCrucigrama(): void {
    this.seleccionarPalabrasAleatorias(); // Volvemos a seleccionar palabras aleatorias al reiniciar
    this.inicializarCuadriculaConEspacios();
    this.inicializarRespuestasUsuario();
    this.mensaje = '';
  }

  cambiarIdioma(idioma: string): void {
    this.idiomaSeleccionado = idioma;
  }
}