import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PalabraCrucigrama {
  palabra_es: string;
  palabra_en: string;
  palabra_it: string;
  palabra_de: string;
  pista_es: string;
  pista_en: string;
  pista_it: string;
  pista_de: string;
  fila: number;
  columna: number;
  orientacion: 'horizontal' | 'vertical';
  palabraActual?: string;
}

@Component({
  selector: 'app-crucigrama',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crucigrama.component.html',
  styleUrls: ['./crucigrama.component.scss']
})
export class CrucigramaComponent implements OnInit {
  idiomaSeleccionado: string = 'de';
  availableLanguages = ['en', 'it', 'de'];

  palabrasOriginales: PalabraCrucigrama[] = [
    { palabra_es: 'SIETE', palabra_en: 'SEVEN', palabra_it: 'SETTE', palabra_de: 'SIEBEN', pista_es: 'Número después del seis', pista_en: 'Number after six', pista_de: 'Zahl nach sechs', pista_it: 'Numero dopo il sei', fila: 0, columna: 0, orientacion: 'horizontal' },
    { palabra_es: 'DOS', palabra_en: 'TWO', palabra_it: 'DUE', palabra_de: 'ZWEI', pista_es: 'Número entre uno y tres', pista_en: 'Number between one and three', pista_de: 'Zahl zwischen eins und drei', pista_it: 'Numero tra uno e tre', fila: 2, columna: 0, orientacion: 'horizontal' },
    { palabra_es: 'UNO', palabra_en: 'ONE', palabra_it: 'UNO', palabra_de: 'EINS', pista_es: 'Primer número', pista_en: 'First number', pista_de: 'Erste Zahl', pista_it: 'Primo numero', fila: 0, columna: 6, orientacion: 'vertical' },
    { palabra_es: 'SEIS', palabra_en: 'SIX', palabra_it: 'SEI', palabra_de: 'SECHS', pista_es: 'Número antes del siete', pista_en: 'Number before seven', pista_de: 'Zahl vor sieben', pista_it: 'Numero prima del sette', fila: 1, columna: 0, orientacion: 'vertical' },
    { palabra_es: 'OCHO', palabra_en: 'EIGHT', palabra_it: 'OTTO', palabra_de: 'ACHT', pista_es: 'Número después del siete', pista_en: 'Number after seven', pista_de: 'Zahl nach sieben', pista_it: 'Numero dopo il sette', fila: 2, columna: 2, orientacion: 'vertical' },
    { palabra_es: 'NUEVE', palabra_en: 'NINE', palabra_it: 'NOVE', palabra_de: 'NEUN', pista_es: 'Número antes del diez', pista_en: 'Number before ten', pista_de: 'Zahl vor zehn', pista_it: 'Numero prima del dieci', fila: 0, columna: 8, orientacion: 'horizontal' },
    { palabra_es: 'TRES', palabra_en: 'THREE', palabra_it: 'TRE', palabra_de: 'DREI', pista_es: 'Número después del dos', pista_en: 'Number after two', pista_de: 'Zahl nach zwei', pista_it: 'Numero dopo il due', fila: 4, columna: 0, orientacion: 'horizontal' },
    { palabra_es: 'CUATRO', palabra_en: 'FOUR', palabra_it: 'QUATTRO', palabra_de: 'VIER', pista_es: 'Número después del tres', pista_en: 'Number after three', pista_de: 'Zahl nach drei', pista_it: 'Numero dopo il tre', fila: 2, columna: 9, orientacion: 'vertical' },
    { palabra_es: 'CINCO', palabra_en: 'FIVE', palabra_it: 'CINQUE', palabra_de: 'FUENF', pista_es: 'Número entre cuatro y seis', pista_en: 'Number between four and six', pista_de: 'Zahl zwischen vier und sechs', pista_it: 'Numero tra quattro e sei', fila: 0, columna: 9, orientacion: 'horizontal' },
    { palabra_es: 'DIEZ', palabra_en: 'TEN', palabra_it: 'DIECI', palabra_de: 'ZEHN', pista_es: 'Número después del nueve', pista_en: 'Number after nine', pista_de: 'Zahl nach neun', pista_it: 'Numero dopo il nove', fila: 6, columna: 10, orientacion: 'vertical' }
  ];

  palabras: PalabraCrucigrama[] = [];
  filasMaximas: number = 10;
  columnasMaximas: number = 12;
  cuadricula: (string | null)[][] = [];
  respuestasUsuario: { [key: string]: string[] } = {};
  mensaje: string = '';
  numeroPalabrasAleatorias: number = 6;

  ngOnInit(): void {
    this.startGame();
  }

  // Inicia el juego seleccionando palabras sin solapamientos
  startGame(): void {
    this.seleccionarPalabrasSinSolape();
    this.inicializarCuadriculaConEspacios();
    this.inicializarRespuestasUsuario();
    this.mensaje = '';
  }

  // Devuelve la palabra en el idioma seleccionado
  obtenerPalabraSegunIdioma(palabraOriginal: PalabraCrucigrama): string {
    switch (this.idiomaSeleccionado) {
      case 'en': return palabraOriginal.palabra_en;
      case 'it': return palabraOriginal.palabra_it;
      case 'de': return palabraOriginal.palabra_de;
      case 'es':
      default:
        return palabraOriginal.palabra_es;
    }
  }

  // Selecciona palabras aleatorias que NO se solapan nunca
  seleccionarPalabrasSinSolape(): void {
    const palabrasDisponibles = [...this.palabrasOriginales];
    const seleccionadas: PalabraCrucigrama[] = [];
    let intentos = 0;

    while (seleccionadas.length < this.numeroPalabrasAleatorias && palabrasDisponibles.length > 0 && intentos < 100) {
      const idx = Math.floor(Math.random() * palabrasDisponibles.length);
      const candidata = palabrasDisponibles.splice(idx, 1)[0];
      const palabraActual = this.obtenerPalabraSegunIdioma(candidata).toUpperCase();

      // Comprobar si se solapa con alguna ya seleccionada
      let solapa = false;
      for (const ya of seleccionadas) {
        const yaPalabra = this.obtenerPalabraSegunIdioma(ya).toUpperCase();
        const coordsCandidata = this.obtenerCoordenadasPalabra(candidata.fila, candidata.columna, palabraActual.length, candidata.orientacion);
        const coordsYa = this.obtenerCoordenadasPalabra(ya.fila, ya.columna, yaPalabra.length, ya.orientacion);

        // Si alguna coordenada coincide, hay solape
        if (coordsCandidata.some(coord => coordsYa.some(c2 => c2[0] === coord[0] && c2[1] === coord[1]))) {
          solapa = true;
          break;
        }
      }
      if (!solapa) {
        seleccionadas.push({ ...candidata, palabraActual });
      }
      intentos++;
    }
    this.palabras = seleccionadas;
  }

  // Devuelve todas las coordenadas ocupadas por una palabra
  obtenerCoordenadasPalabra(fila: number, columna: number, longitud: number, orientacion: 'horizontal' | 'vertical'): [number, number][] {
    const coords: [number, number][] = [];
    for (let i = 0; i < longitud; i++) {
      coords.push(orientacion === 'horizontal' ? [fila, columna + i] : [fila + i, columna]);
    }
    return coords;
  }

  // Inicializa la cuadrícula solo con espacios para las palabras seleccionadas
  inicializarCuadriculaConEspacios(): void {
    this.cuadricula = Array(this.filasMaximas).fill(null).map(() => Array(this.columnasMaximas).fill(null));
    this.palabras.forEach(palabra => {
      if (!palabra.palabraActual) return;
      for (let i = 0; i < palabra.palabraActual.length; i++) {
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

  // Inicializa las respuestas del usuario
  inicializarRespuestasUsuario(): void {
    this.respuestasUsuario = {};
    this.palabras.forEach(palabra => {
      if (!palabra.palabraActual) return;
      const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
      this.respuestasUsuario[clave] = Array(palabra.palabraActual.length).fill('');
    });
  }

  // Devuelve la pista en el idioma seleccionado
  obtenerPista(palabra: PalabraCrucigrama): string {
    switch (this.idiomaSeleccionado) {
      case 'en': return palabra.pista_en;
      case 'de': return palabra.pista_de;
      case 'it': return palabra.pista_it;
      default: return palabra.pista_es;
    }
  }

  // Devuelve el valor de la celda en la cuadrícula
  obtenerValorCeldaEstilizada(fila: number, columna: number): string {
    if (this.cuadricula[fila] && this.cuadricula[fila][columna] !== null) {
      for (const palabra of this.palabras) {
        if (!palabra.palabraActual) continue;
        let r = palabra.fila;
        let c = palabra.columna;
        if (palabra.orientacion === 'horizontal' && fila === r && columna >= c && columna < c + palabra.palabraActual.length) {
          const indice = columna - c;
          const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
          return this.respuestasUsuario[clave]?.[indice] || '';
        } else if (palabra.orientacion === 'vertical' && columna === c && fila >= r && fila < r + palabra.palabraActual.length) {
          const indice = fila - r;
          const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
          return this.respuestasUsuario[clave]?.[indice] || '';
        }
      }
    }
    return '';
  }

  // Solo permite escribir en celdas activas
  esCeldaActiva(fila: number, columna: number): boolean {
    return this.cuadricula[fila] && this.cuadricula[fila][columna] !== null;
  }

  // Actualiza la respuesta del usuario y mueve el foco
  actualizarInputCeldaEstilizada(fila: number, columna: number, event: any): void {
    const value = event.target.value.toUpperCase();
    for (const palabra of this.palabras) {
      if (!palabra.palabraActual) continue;
      let r = palabra.fila;
      let c = palabra.columna;
      let indice: number | undefined;

      if (palabra.orientacion === 'horizontal' && fila === r && columna >= c && columna < c + palabra.palabraActual.length) {
        indice = columna - c;
      } else if (palabra.orientacion === 'vertical' && columna === c && fila >= r && fila < r + palabra.palabraActual.length) {
        indice = fila - r;
      }

      if (indice !== undefined) {
        const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
        if (this.respuestasUsuario[clave] && indice >= 0 && indice < this.respuestasUsuario[clave].length) {
          this.respuestasUsuario[clave][indice] = value;
        }
        setTimeout(() => this.moverFoco(palabra, indice!, fila, columna, event.target), 0);
        return;
      }
    }
  }

  // Mueve el foco al siguiente input de la palabra
  moverFoco(palabra: PalabraCrucigrama, indiceActual: number, filaActual: number, columnaActual: number, inputActual: HTMLInputElement): void {
    if (!palabra.palabraActual) return;

    let proximaFila = filaActual;
    let proximaColumna = columnaActual;

    if (palabra.orientacion === 'horizontal') {
      if (indiceActual < palabra.palabraActual.length - 1) {
        proximaColumna++;
      }
    } else {
      if (indiceActual < palabra.palabraActual.length - 1) {
        proximaFila++;
      }
    }

    if (proximaFila !== filaActual || proximaColumna !== columnaActual) {
      const proximoInput = document.querySelector(`input[data-fila="${proximaFila}"][data-columna="${proximaColumna}"]`) as HTMLInputElement;
      if (proximoInput) {
        proximoInput.focus();
        proximoInput.select();
      }
    }
  }

  // Muestra el número de pista si la celda es inicio de palabra
  mostrarNumeroPista(fila: number, columna: number): number | undefined {
    const palabraEncontrada = this.palabras.find(palabra => palabra.fila === fila && palabra.columna === columna);
    return palabraEncontrada ? this.palabras.indexOf(palabraEncontrada) + 1 : undefined;
  }

  // Comprueba si todas las respuestas son correctas
  comprobarRespuestas(): void {
    let todasCorrectas = true;
    for (const palabra of this.palabras) {
      if (!palabra.palabraActual) {
        todasCorrectas = false;
        break;
      }
      const clave = `${palabra.fila}-${palabra.columna}-${palabra.orientacion}`;
      const respuestaUsuario = this.respuestasUsuario[clave]?.join('').toUpperCase();
      if (respuestaUsuario !== palabra.palabraActual.toUpperCase()) {
        todasCorrectas = false;
        break;
      }
    }
    this.mensaje = todasCorrectas ? '¡Felicidades! ¡Has resuelto el crucigrama!' : 'Sigue intentándolo. Algunas respuestas son incorrectas.';
  }

  // Reinicia el crucigrama
  reiniciarCrucigrama(): void {
    this.startGame();
  }

  // Cambia el idioma y reinicia el juego
  cambiarIdioma(idioma: string): void {
    this.idiomaSeleccionado = idioma;
    this.startGame();
  }
}