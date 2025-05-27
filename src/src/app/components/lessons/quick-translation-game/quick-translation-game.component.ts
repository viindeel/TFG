import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs'; // Importar interval y Subscription
import { takeWhile } from 'rxjs/operators'; // Importar takeWhile

interface WordPair {
  [key: string]: string; // e.g., { es: 'GATO', en: 'CAT' }
}

@Component({
  selector: 'app-quick-translation-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-translation-game.component.html',
  styleUrls: ['./quick-translation-game.component.scss']
})
export class QuickTranslationGameComponent implements OnInit, OnDestroy {
  availableLanguages = ['es', 'en', 'it', 'de'];
  selectedSourceLanguage: string = 'es';
  selectedTargetLanguage: string = 'en';

  // Un diccionario más robusto para que las palabras tengan equivalentes
  // Se asume que las palabras en la misma posición en el array de cada idioma se corresponden
    languageDictionary: { [key: string]: string[] } = {
    es: [
      'VARIABLE', 'FUNCIÓN', 'BUCLE', 'OBJETO', 'CLASE',
      'ARREGLO', 'COMPILADOR', 'INTERFAZ', 'HERENCIA', 'SINTAXIS'
    ],
    en: [
      'VARIABLE', 'FUNCTION', 'LOOP', 'OBJECT', 'CLASS',
      'ARRAY', 'COMPILER', 'INTERFACE', 'INHERITANCE', 'SYNTAX'
    ],
    it: [
      'VARIABILE', 'FUNZIONE', 'CICLO', 'OGGETTO', 'CLASSE',
      'ARRAY', 'COMPILATORE', 'INTERFACCIA', 'EREDITARIETÀ', 'SINTASSI'
    ],
    de: [
      'VARIABLE', 'FUNKTION', 'SCHLEIFE', 'OBJEKT', 'KLASSE',
      'ARRAY', 'KOMPILER', 'SCHNITTSTELLE', 'VERERBUNG', 'SYNTAX'
    ]
  };

  wordPairs: WordPair[] = []; // Pares de palabras para el juego
  currentWordPair: WordPair | null = null;
  currentSourceWord: string = '';
  userTranslation: string = '';
  feedbackMessage: string = '';
  feedbackClass: string = ''; // 'correct' o 'incorrect'

  score: number = 0;
  timeLeft: number = 10; // Segundos por palabra
  timerSubscription: Subscription | undefined;
  gameStarted: boolean = false;
  gameOver: boolean = false;
  totalWordsToPlay: number = 10; // Cuántas palabras se mostrarán en total
  wordsPlayed: number = 0;
  inputDisabled: boolean = false; // <-- Propiedad para controlar si el input está deshabilitado

  ngOnInit(): void {
    // Inicialización al cargar el componente
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startGame(): void {
    this.score = 0;
    this.wordsPlayed = 0;
    this.gameOver = false;
    this.gameStarted = true;
    this.feedbackMessage = '';
    this.userTranslation = '';
    this.inputDisabled = false; // <-- Habilitar el input al inicio del juego
    this.generateWordPairs();
    this.nextWord();
  }

  generateWordPairs(): void {
    const sourceWords = this.languageDictionary[this.selectedSourceLanguage];
    const targetWords = this.languageDictionary[this.selectedTargetLanguage];

    if (!sourceWords || !targetWords || sourceWords.length !== targetWords.length) {
      console.error('Los diccionarios de idiomas no están configurados correctamente o no tienen el mismo tamaño.');
      this.wordPairs = [];
      return;
    }

    this.wordPairs = [];
    // Crear pares basados en la posición en el array (asumiendo que son traducciones directas)
    for (let i = 0; i < sourceWords.length; i++) {
      this.wordPairs.push({
        [this.selectedSourceLanguage]: sourceWords[i],
        [this.selectedTargetLanguage]: targetWords[i]
      });
    }

    // Mezclar y tomar un número limitado de pares
    this.wordPairs = this.shuffleArray(this.wordPairs).slice(0, this.totalWordsToPlay);
  }

  nextWord(): void {
    this.stopTimer();
    if (this.wordsPlayed >= this.totalWordsToPlay) {
      this.endGame();
      return;
    }

    this.currentWordPair = this.wordPairs[this.wordsPlayed];
    if (this.currentWordPair) {
      this.currentSourceWord = this.currentWordPair[this.selectedSourceLanguage];
      this.timeLeft = 10; // Reiniciar tiempo
      this.userTranslation = ''; // Limpiar campo de traducción
      this.feedbackMessage = '';
      this.feedbackClass = '';
      this.inputDisabled = false; // <-- Habilitar input para la nueva palabra
      this.startTimer();
    } else {
      this.endGame(); // En caso de que no haya más palabras
    }
  }

  startTimer(): void {
    this.stopTimer(); // Asegurarse de que no haya múltiples timers
    this.timerSubscription = interval(1000).pipe(
      takeWhile(() => this.timeLeft >= 0 && this.gameStarted)
    ).subscribe(() => {
      this.timeLeft--;
      if (this.timeLeft < 0) {
        this.checkTranslation(true); // Se acabó el tiempo
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  checkTranslation(timedOut: boolean = false): void {
    this.stopTimer();
    this.inputDisabled = true; // <-- Deshabilitar input mientras se procesa la traducción
    this.wordsPlayed++;

    if (!this.currentWordPair) {
      this.feedbackMessage = 'Error: No hay palabra actual.';
      this.feedbackClass = 'incorrect';
      setTimeout(() => {
        this.nextWord();
        // nextWord ya maneja this.inputDisabled = false;
      }, 1500);
      return;
    }

    const correctTranslation = this.currentWordPair[this.selectedTargetLanguage].toLowerCase().trim();
    const userAttempt = this.userTranslation.toLowerCase().trim();

    if (timedOut) {
      this.feedbackMessage = `¡Tiempo agotado! La traducción correcta era: ${correctTranslation.toUpperCase()}`;
      this.feedbackClass = 'incorrect';
    } else if (userAttempt === correctTranslation) {
      this.feedbackMessage = '¡Correcto!';
      this.feedbackClass = 'correct';
      this.score++;
    } else {
      this.feedbackMessage = `¡Incorrecto! La traducción correcta era: ${correctTranslation.toUpperCase()}`;
      this.feedbackClass = 'incorrect';
    }

    setTimeout(() => {
      this.nextWord();
      // nextWord ya maneja this.inputDisabled = false;
    }, 1500); // Esperar un poco antes de la siguiente palabra
  }

  endGame(): void {
    this.gameStarted = false;
    this.gameOver = true;
    this.stopTimer();
    this.inputDisabled = true; // <-- Deshabilitar input al final del juego
  }

  // Utilidad para mezclar arrays
  shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }
}