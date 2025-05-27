import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LanguageWords {
  [key: string]: string[];
}

interface FlatGridCell {
  letter: string;
  rowIndex: number;
  colIndex: number;
  isSelected?: boolean;
  isFound?: boolean; // Asegúrate de que esta propiedad exista en tu interfaz
}

@Component({
  selector: 'app-sopa-de-letras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sopa-de-letras.component.html',
  styleUrl: './sopa-de-letras.component.scss'
})
export class SopaDeLetrasComponent implements OnInit {
  availableLanguages = ['es', 'en', 'it', 'de'];
  currentLanguage: string = 'es';
  languageWords: LanguageWords = {
    es: ['GATO', 'PERRO', 'CASA', 'SOL', 'LUNA'],
    en: ['CAT', 'DOG', 'HOUSE', 'SUN', 'MOON'],
    it: ['GATTO', 'CANE', 'CASA', 'SOLE', 'LUNA'],
    de: ['KATZE', 'HUND', 'HAUS', 'SONNE', 'MOND']
  };
  wordsToFind: string[] = this.languageWords[this.currentLanguage];
  gridSize: number = 10;
  grid: string[][] = [];
  flatGrid: FlatGridCell[] = []; // Usamos la interfaz FlatGridCell
  selectedLetters: { row: number; col: number; letter: string }[] = [];
  foundWords: string[] = [];
  message: string = '';
  selectedCells: Set<string> = new Set<string>();

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.generateGrid();
    this.generateFlatGrid();
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.wordsToFind = this.languageWords[this.currentLanguage];
    this.foundWords = []; // Resetear palabras encontradas al cambiar de idioma
    this.message = ''; // Resetear mensaje
    this.clearGrid();
    this.generateGrid();
    this.generateFlatGrid();
  }

  clearGrid(): void {
    this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(''));
    this.flatGrid = [];
  }

  generateGrid(): void {
    this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(''));
    this.placeWords();
    this.fillEmptySpaces();
    console.log('Grid generado:', this.grid);
  }

  generateFlatGrid(): void {
    this.flatGrid = [];
    this.grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        this.flatGrid.push({ letter, rowIndex, colIndex, isFound: false }); // Inicializamos isFound en false
      });
    });
    console.log('Flat Grid generado:', this.flatGrid);
  }

  placeWords(): void {
    this.wordsToFind.forEach(word => {
      const direction = Math.random() < 0.25 ? 'horizontal' : (Math.random() < 0.5 ? 'vertical' : (Math.random() < 0.75 ? 'diagonal-down' : 'diagonal-up'));
      let row: number, col: number;
      let placed = false;

      for (let attempts = 0; attempts < 100; attempts++) {
        row = Math.floor(Math.random() * this.gridSize);
        col = Math.floor(Math.random() * this.gridSize);

        if (this.canPlaceWord(word, row, col, direction)) {
          this.placeWordInGrid(word, row, col, direction);
          placed = true;
          break;
        }
      }
      if (!placed) {
        console.warn(`No se pudo colocar la palabra: ${word}`);
      }
    });
  }

  canPlaceWord(word: string, row: number, col: number, direction: 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up'): boolean {
    if (direction === 'horizontal') {
      if (col + word.length > this.gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (this.grid[row][col + i] !== '' && this.grid[row][col + i] !== word[i]) return false;
      }
    } else if (direction === 'vertical') {
      if (row + word.length > this.gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (this.grid[row + i][col] !== '' && this.grid[row + i][col] !== word[i]) return false;
      }
    } else if (direction === 'diagonal-down') {
      if (row + word.length > this.gridSize || col + word.length > this.gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (this.grid[row + i][col + i] !== '' && this.grid[row + i][col + i] !== word[i]) return false;
      }
    } else if (direction === 'diagonal-up') {
      if (row - word.length < -1 || col + word.length > this.gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (this.grid[row - i][col + i] !== '' && this.grid[row - i][col + i] !== word[i]) return false;
      }
    }
    return true;
  }

  placeWordInGrid(word: string, row: number, col: number, direction: 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up'): void {
    if (direction === 'horizontal') {
      for (let i = 0; i < word.length; i++) {
        this.grid[row][col + i] = word[i];
      }
    } else if (direction === 'vertical') {
      for (let i = 0; i < word.length; i++) {
        this.grid[row + i][col] = word[i];
      }
    } else if (direction === 'diagonal-down') {
      for (let i = 0; i < word.length; i++) {
        this.grid[row + i][col + i] = word[i];
      }
    } else if (direction === 'diagonal-up') {
      for (let i = 0; i < word.length; i++) {
        this.grid[row - i][col + i] = word[i];
      }
    }
  }

  fillEmptySpaces(): void {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] === '') {
          this.grid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }

  selectLetter(rowIndex: number, colIndex: number): void {
    this.flatGrid = this.flatGrid.map(cell => {
      if (cell.rowIndex === rowIndex && cell.colIndex === colIndex) {
        return { ...cell, isSelected: !cell.isSelected };
      }
      return cell;
    });

    const selected = this.flatGrid.filter(cell => cell.isSelected);
    this.selectedLetters = selected.map(cell => ({ row: cell.rowIndex, col: cell.colIndex, letter: cell.letter }));
    this.selectedCells = new Set(selected.map(cell => `${cell.rowIndex}-${cell.colIndex}`));

    this.checkWord();
  }

  isSelected(rowIndex: number, colIndex: number): boolean {
    return this.flatGrid.some(cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex && cell.isSelected);
  }

  isFound(rowIndex: number, colIndex: number): boolean {
    return this.flatGrid.find(cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex)?.isFound || false;
  }

  getWordCoordinates(word: string): { row: number; col: number }[] {
    const coordinates: { row: number; col: number }[] = [];
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        // Check horizontal
        if (c + word.length <= this.gridSize && this.grid[r].slice(c, c + word.length).join('') === word) {
          for (let i = 0; i < word.length; i++) coordinates.push({ row: r, col: c + i });
          return coordinates;
        }
        // Check vertical
        if (r + word.length <= this.gridSize) {
          let verticalWord = '';
          for (let i = 0; i < word.length; i++) verticalWord += this.grid[r + i][c];
          if (verticalWord === word) {
            for (let i = 0; i < word.length; i++) coordinates.push({ row: r + i, col: c });
            return coordinates;
          }
        }
        // Check diagonal down
        if (r + word.length <= this.gridSize && c + word.length <= this.gridSize) {
          let diagonalWord = '';
          for (let i = 0; i < word.length; i++) diagonalWord += this.grid[r + i][c + i];
          if (diagonalWord === word) {
            for (let i = 0; i < word.length; i++) coordinates.push({ row: r + i, col: c + i });
            return coordinates;
          }
        }
        // Check diagonal up
        if (r - word.length >= -1 && c + word.length <= this.gridSize) {
          let diagonalWord = '';
          for (let i = 0; i < word.length; i++) diagonalWord += this.grid[r - i][c + i];
          if (diagonalWord === word) {
            for (let i = 0; i < word.length; i++) coordinates.push({ row: r - i, col: c + i });
            return coordinates;
          }
        }
      }
    }
    return coordinates;
  }

  checkWord(): void {
    if (this.selectedLetters.length >= 1) {
      const selectedWord = this.selectedLetters
        .sort((a, b) => {
          if (a.row !== b.row) return a.row - b.row;
          return a.col - b.col;
        })
        .map(item => item.letter)
        .join('');

      if (this.wordsToFind.includes(selectedWord) && !this.foundWords.includes(selectedWord)) {
        this.foundWords.push(selectedWord);
        this.message = `¡Encontraste la palabra: ${selectedWord}!`;
        this.highlightFoundWordOnGrid(selectedWord);
        this.clearSelectionVisual();
      } else {
        const reversedWord = [...this.selectedLetters].reverse()
          .sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            return a.col - b.col;
          })
          .map(item => item.letter)
          .join('');
        if (this.wordsToFind.includes(reversedWord) && !this.foundWords.includes(reversedWord)) {
          this.foundWords.push(reversedWord);
          this.message = `¡Encontraste la palabra: ${reversedWord}!`;
          this.highlightFoundWordOnGrid(reversedWord);
          this.clearSelectionVisual();
        } else {
          this.message = '';
        }
      }
    }
    if (this.foundWords.length === this.wordsToFind.length) {
      this.message = '¡Felicidades! ¡Encontraste todas las palabras!';
    }
  }

  highlightFoundWordOnGrid(word: string): void {
    const coordinates = this.getWordCoordinates(word);
    this.flatGrid = this.flatGrid.map(cell => {
      const isPartOfNewFoundWord = coordinates.some(coord => coord.row === cell.rowIndex && coord.col === cell.colIndex);
      return { ...cell, isFound: cell.isFound || isPartOfNewFoundWord };
    });
  }

  clearSelection(): void {
    this.flatGrid = this.flatGrid.map(cell => ({ ...cell, isSelected: false }));
    this.selectedLetters = [];
    this.selectedCells = new Set<string>();
  }

  clearSelectionVisual(): void {
    this.flatGrid = this.flatGrid.map(cell => ({ ...cell, isSelected: false }));
  }
}