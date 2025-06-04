import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LanguageWords {
  [key: string]: string[];
}

interface Card {
  id: number;
  word: string;
  language: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

@Component({
  selector: 'app-memorama-idiomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './memorama-idiomas.component.html',
  styleUrls: ['./memorama-idiomas.component.scss']
})
export class MemoramaIdiomasComponent implements OnInit {
  availableLanguages = ['es', 'en', 'it', 'de'];
  selectedLanguages: string[] = ['es', 'en'];
  languageWords: LanguageWords = {
    es: ['ALGORITMO', 'RED', 'DATO', 'NUBE', 'CÓDIGO', 'SERVIDOR', 'CLIENTE', 'BASE DE DATOS', 'INTERFAZ', 'COMPILADOR'],
    en: ['ALGORITHM', 'NETWORK', 'DATA', 'CLOUD', 'CODE', 'SERVER', 'CLIENT', 'DATABASE', 'INTERFACE', 'COMPILER'],
    it: ['ALGORITMO', 'RETE', 'DATO', 'NUVOLA', 'CODICE', 'SERVER', 'CLIENTE', 'DATABASE', 'INTERFACCIA', 'COMPILATORE'],
    de: ['ALGORITHMUS', 'NETZWERK', 'DATEN', 'CLOUD', 'CODE', 'SERVER', 'CLIENT', 'DATENBANK', 'SCHNITTSTELLE', 'COMPILER']
  };
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matchesFound: number = 0;
  totalPairs: number = 0;
  canFlip: boolean = true;
  gameOver: boolean = false;
  numberOfPairsToPlay: number = 6;

  ngOnInit(): void {
    this.setupGame();
  }

  setupGame(): void {
    this.gameOver = false;
    this.matchesFound = 0;
    this.flippedCards = [];
    // Pasamos el número de pares deseados
    this.cards = this.createCards(this.selectedLanguages[0], this.selectedLanguages[1], this.numberOfPairsToPlay);
    this.totalPairs = this.numberOfPairsToPlay;
    this.canFlip = true;
  }

  createCards(lang1: string, lang2: string, numPairs: number): Card[] {
    const lang1Words = this.languageWords[lang1];
    const lang2Words = this.languageWords[lang2];
    const createdCards: Card[] = [];

    // Generar una lista de índices disponibles (0, 1, 2, ...)
    const availableIndices = lang1Words.map((_, i) => i);

    // Barajar estos índices y tomar los primeros 'numPairs'
    const chosenIndices = this.shuffleArray(availableIndices).slice(0, numPairs);

    for (let i = 0; i < chosenIndices.length; i++) {
      const originalWordIndex = chosenIndices[i]; // Este es el índice en las listas de palabras originales

      const word1 = lang1Words[originalWordIndex];
      const word2 = lang2Words[originalWordIndex]; // La palabra traducida correspondiente

      // Crear tarjeta para el idioma 1
      createdCards.push({
        id: createdCards.length, // ID único para la tarjeta
        word: word1,
        language: lang1,
        pairId: originalWordIndex, // Usar el índice original como ID de par para consistencia
        isFlipped: false,
        isMatched: false
      });
      // Crear tarjeta para el idioma 2
      createdCards.push({
        id: createdCards.length, // ID único para la tarjeta
        word: word2,
        language: lang2,
        pairId: originalWordIndex, // Mismo ID de par
        isFlipped: false,
        isMatched: false
      });
    }
    // Barajar el array final de tarjetas antes de devolverlo
    return this.shuffleArray(createdCards);
  }

  shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length;
    let randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  startGame(): void {
    // Validar que se hayan seleccionado dos idiomas diferentes
    if (this.selectedLanguages[0] === this.selectedLanguages[1]) {
        alert("Por favor, selecciona dos idiomas diferentes.");
        return;
    }
    this.setupGame();
  }

  flipCard(card: Card): void {
    if (!this.canFlip || card.isFlipped || card.isMatched || this.flippedCards.length === 2) {
      return;
    }

    card.isFlipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.canFlip = false;
      this.checkMatch();
    }
  }

  checkMatch(): void {
    const [card1, card2] = this.flippedCards;

    // La condición clave es que tengan el mismo pairId pero diferente idioma
    if (card1.pairId === card2.pairId && card1.language !== card2.language) {
      card1.isMatched = true;
      card2.isMatched = true;
      this.matchesFound++;
      this.flippedCards = [];
      this.canFlip = true;
      if (this.matchesFound === this.totalPairs) {
        this.gameOver = true;
      }
    } else {
      // No es pareja, se vuelven a voltear después de un tiempo
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedCards = [];
        this.canFlip = true;
      }, 1000); // 1 segundo para memorizar
    }
  }
}