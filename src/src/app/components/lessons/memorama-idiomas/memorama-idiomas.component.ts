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
  styleUrl: './memorama-idiomas.component.scss'
})
export class MemoramaIdiomasComponent implements OnInit {
  availableLanguages = ['es', 'en', 'it', 'de'];
  selectedLanguages: string[] = ['es', 'en'];
  languageWords: LanguageWords = {
    es: ['ALGORITMO', 'RED', 'DATO', 'NUBE', 'CÓDIGO', 'SERVIDOR', 'CLIENTE', 'BASE DE DATOS'],
    en: ['ALGORITHM', 'NETWORK', 'DATA', 'CLOUD', 'CODE', 'SERVER', 'CLIENT', 'DATABASE'],
    it: ['ALGORITMO', 'RETE', 'DATO', 'NUVOLA', 'CODICE', 'SERVER', 'CLIENTE', 'DATABASE'],
    de: ['ALGORITHMUS', 'NETZWERK', 'DATEN', 'CLOUD', 'CODE', 'SERVER', 'CLIENT', 'DATENBANK']
  };
  cards: Card[] = [];
  flippedCards: Card[] = [];
  matchesFound: number = 0;
  totalPairs: number = 0;
  canFlip: boolean = true;
  gameOver: boolean = false;

  ngOnInit(): void {
    this.setupGame();
  }

  setupGame(): void {
    this.gameOver = false;
    this.matchesFound = 0;
    this.flippedCards = [];
    this.cards = this.createCards(this.selectedLanguages[0], this.selectedLanguages[1], 6);
    this.totalPairs = this.cards.length / 2;
    this.canFlip = true;
  }

  createCards(lang1: string, lang2: string, pairs: number): Card[] {
    // Selecciona palabras aleatorias y crea pares con un id de pareja
    const words1 = this.shuffleArray(this.languageWords[lang1]).slice(0, pairs);
    const words2 = this.languageWords[lang2];
    const cards: Card[] = [];
    for (let i = 0; i < words1.length; i++) {
      const word1 = words1[i];
      const word2 = words2[i];
      cards.push({
        id: cards.length,
        word: word1,
        language: lang1,
        pairId: i,
        isFlipped: false,
        isMatched: false
      });
      cards.push({
        id: cards.length,
        word: word2,
        language: lang2,
        pairId: i,
        isFlipped: false,
        isMatched: false
      });
    }
    return this.shuffleArray(cards);
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

    if (card1.pairId === card2.pairId && card1.language !== card2.language) {
      // Es pareja
      card1.isMatched = true;
      card2.isMatched = true;
      this.matchesFound++;
      this.flippedCards = [];
      this.canFlip = true;
      if (this.matchesFound === this.totalPairs) {
        this.gameOver = true;
      }
    } else {
      // No es pareja
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        this.flippedCards = [];
        this.canFlip = true;
      }, 1000);
    }
  }
}