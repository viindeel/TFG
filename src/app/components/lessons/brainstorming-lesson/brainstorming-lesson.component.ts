import { NgFor, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface BrainstormingMatch {
  term: string;
  definition: string;
}

@Component({
  selector: 'app-brainstorming-lesson',
  standalone: true,
  imports: [RouterModule, NgFor, NgClass],
  templateUrl: './brainstorming-lesson.component.html',
  styleUrl: './brainstorming-lesson.component.scss'
})
export class BrainstormingLessonComponent implements OnInit {
  brainstormingMatches: BrainstormingMatch []= [
    {
      term: 'Generar tantas ideas como sea posible',
      definition: 'El objetivo principal es la cantidad, no la calidad. Anima a todos a compartir cualquier idea que se les ocurra, sin importar lo descabellada que parezca.'
    },
    {
      term: 'No juzgar las ideas',
      definition: 'Durante la fase inicial, todas las ideas son bienvenidas. Evita las críticas y los juicios para fomentar un ambiente creativo y libre.'
    },
    {
      term: 'Fomentar ideas descabelladas',
      definition: 'Las ideas que parecen extrañas o imposibles a menudo pueden ser el punto de partida para soluciones innovadoras. ¡Anima a pensar fuera de la caja!'
    },
    {
      term: 'Construir sobre las ideas de otros',
      definition: 'Los participantes deben escuchar atentamente las ideas de los demás y tratar de mejorarlas o combinarlas para crear nuevas ideas.'
    }
  ];

  shuffledDefinitions: string[] = [];
  selectedTerm: string | null = null;
  selectedDefinition: string | null = null;
  feedbackMessage: string = '';
  matchedPairs: { term: string; definition: string }[] = [];

  ngOnInit(): void {
    this.shuffledDefinitions = this.shuffleArray(this.brainstormingMatches.map(match => match.definition));
  }

  shuffleArray(array: any): any{
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  selectTerm(term: string) {
    if (!this.isAlreadyMatched(term, null)) { // No permitir seleccionar términos ya emparejados
      this.selectedTerm = term;
      this.selectedDefinition = null; // Reset definition on new term selection
      this.feedbackMessage = ''; // Clear previous feedback
    }
  }

  selectDefinition(definition: string) {
    if (!this.isAlreadyMatched(null, definition)) { // No permitir seleccionar definiciones ya emparejadas
      if (this.selectedTerm) {
        this.selectedDefinition = definition;
        this.checkMatch();
      } else {
        this.feedbackMessage = 'Por favor, selecciona un principio primero.';
      }
    }
  }

  checkMatch() {
    if (this.selectedTerm && this.selectedDefinition) {
      const correctMatch = this.brainstormingMatches.find(match => match.term === this.selectedTerm);
      if (correctMatch && correctMatch.definition === this.selectedDefinition) {
        this.feedbackMessage = `¡Correcto! "${this.selectedTerm}" coincide con "${this.selectedDefinition}".`;
        this.matchedPairs.push({ term: this.selectedTerm, definition: this.selectedDefinition });
      } else {
        this.feedbackMessage = `¡Incorrecto! Inténtalo de nuevo.`;
      }
      this.selectedTerm = null; // Reset selections after checking
      this.selectedDefinition = null;
    }
  }

  isAlreadyMatched(term: string | null, definition: string | null): boolean {
    if (term) {
      return this.matchedPairs.some(pair => pair.term === term);
    }
    if (definition) {
      return this.matchedPairs.some(pair => pair.definition === definition);
    }
    return false;
  }
}