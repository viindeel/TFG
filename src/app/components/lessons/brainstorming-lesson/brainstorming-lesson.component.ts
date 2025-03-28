import { NgFor, NgClass, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

export interface BrainstormingMatch {
  termKey: string;
  definitionKey: string;
}

@Component({
  selector: 'app-brainstorming-lesson',
  standalone: true,
  imports: [RouterModule, NgFor, NgClass, NgIf, TranslateModule],
  templateUrl: './brainstorming-lesson.component.html',
  styleUrl: './brainstorming-lesson.component.scss'
})
export class BrainstormingLessonComponent implements OnInit, OnDestroy {
  originalMatches: BrainstormingMatch[] = [
    { termKey: 'TERM_GENERATE_IDEAS', definitionKey: 'DEFINITION_GENERATE_IDEAS' },
    { termKey: 'TERM_NO_JUDGE_IDEAS', definitionKey: 'DEFINITION_NO_JUDGE_IDEAS' },
    { termKey: 'TERM_ENCOURAGE_WILD_IDEAS', definitionKey: 'DEFINITION_ENCOURAGE_WILD_IDEAS' },
    { termKey: 'TERM_BUILD_ON_OTHERS_IDEAS', definitionKey: 'DEFINITION_BUILD_ON_OTHERS_IDEAS' }
  ];

  brainstormingMatches: { term: string; definition: string }[] = [];
  shuffledDefinitions: string[] = [];
  selectedTerm: string = ''; 
  selectedDefinition: string = ''; 
  feedbackMessage: string = '';
  matchedPairs: { term: string; definition: string }[] = [];
  isGameOver: boolean = false;
  countdown: number = 3;
  showCongratulations: boolean = false;
  private countdownSubscription: Subscription | undefined;

  constructor(private router: Router, private translate: TranslateService) { }

  ngOnInit(): void {
    this.loadLanguagePreference();
    this.translateTermsAndDefinitions();  // Aseguramos que solo se inicialicen las traducciones en este punto.
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  loadLanguagePreference() {
    const storedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    this.translate.use(storedLanguage);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('preferredLanguage', lang);
    this.translateTermsAndDefinitions();
  }

  translateTermsAndDefinitions() {
    this.brainstormingMatches = this.shuffleArray(this.originalMatches.map(match => ({
      term: this.translate.instant(match.termKey) as string ?? '',
      definition: this.translate.instant(match.definitionKey) as string ?? ''
    })));

    this.shuffledDefinitions = this.shuffleArray(this.brainstormingMatches.map(match => match.definition));
  }

  shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  selectTerm(term: string) {
    if (!this.isAlreadyMatched(term, null) && !this.isGameOver) {
      this.selectedTerm = term;
      this.selectedDefinition = '';
      this.feedbackMessage = '';
    }
  }

  selectDefinition(definition: string) {
    if (!this.isAlreadyMatched(null, definition) && !this.isGameOver) {
      if (this.selectedTerm) {
        this.selectedDefinition = definition;
        this.checkMatch();
      } else {
        this.feedbackMessage = this.translate.instant('SELECT_PRINCIPLE_FIRST') as string ?? '';
      }
    }
  }

  checkMatch() {
    if (this.selectedTerm && this.selectedDefinition) {
      const correctMatch = this.originalMatches.find(match => 
        (this.translate.instant(match.termKey) as string ?? '') === this.selectedTerm
      );

      if (correctMatch) {
        const correctDefinition = this.translate.instant(correctMatch.definitionKey) as string ?? '';
        if (correctDefinition === this.selectedDefinition) {
          this.feedbackMessage = this.translate.instant('CORRECT_MATCH', { term: this.selectedTerm, definition: this.selectedDefinition }) as string ?? '';
          this.matchedPairs.push({ term: this.selectedTerm, definition: this.selectedDefinition });

          if (this.matchedPairs.length === this.originalMatches.length) {
            this.isGameOver = true;
            this.showCongratulationsPopup();
          }
        } else {
          this.feedbackMessage = this.translate.instant('INCORRECT_MATCH') as string ?? '';
        }
      }

      this.selectedTerm = '';
      this.selectedDefinition = '';
    }
  }

  isAlreadyMatched(term: string | null, definition: string | null): boolean {
    return term ? this.matchedPairs.some(pair => pair.term === term) : this.matchedPairs.some(pair => pair.definition === definition);
  }

  showCongratulationsPopup() {
    this.showCongratulations = true;
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.closeCongratulationsPopup();
      }
    });
  }

  closeCongratulationsPopup() {
    this.showCongratulations = false;
    this.countdown = 3;
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  goToLecciones() {
    this.router.navigate(['/lecciones']);
  }
}
