import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgClass, NgIf, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval, forkJoin } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

// Importa MatSnackBar y MatSnackBarModule
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface BrainstormingMatch {
  termKey: string;
  definitionKey: string;
}

@Component({
  selector: 'app-brainstorming-lesson',
  standalone: true,
  imports: [
    NgFor,
    NgClass,
    NgIf,
    TranslateModule,
    MatSnackBarModule // <--- AÑADIDO MatSnackBarModule
  ],
  templateUrl: './brainstorming-lesson.component.html',
  styleUrls: ['./brainstorming-lesson.component.scss']
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
  feedbackMessage: string = ''; // Lo mantenemos por si quieres usarlo junto con el snackbar
  matchedPairs: { term: string; definition: string }[] = [];
  isGameOver: boolean = false;
  countdown: number = 3;
  showCongratulations: boolean = false;
  currentLang = '';

  // Para el feedback visual de selección incorrecta en los items
  lastIncorrectTerm: string = '';
  lastIncorrectDefinition: string = '';
  incorrectFeedbackTimeout: any;

  private countdownSubscription: Subscription | undefined;
  private langChangeSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private _snackBar: MatSnackBar // <--- Inyectado MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
    this.langChangeSubscription = this.translate.onLangChange.subscribe(event => {
      console.log(`Brainstorming: Language changed to ${event.lang}, preparing data...`);
      this.currentLang = event.lang;
      this.prepareGameDataAsync();
    });
    this.loadLanguagePreference();
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
    if (this.incorrectFeedbackTimeout) { // Limpiar timeout si el componente se destruye
        clearTimeout(this.incorrectFeedbackTimeout);
    }
  }

  loadLanguagePreference() {
    let preferredLanguage = 'en';
    if (isPlatformBrowser(this.platformId)) {
      preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    }
    this.translate.use(preferredLanguage).subscribe(() => {
      console.log(`Brainstorming: Initial language set to ${preferredLanguage}, preparing data...`);
      this.currentLang = preferredLanguage;
      this.prepareGameDataAsync();
    });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('preferredLanguage', lang);
    }
  }

  prepareGameDataAsync() {
    const termKeys = this.originalMatches.map(match => match.termKey);
    const definitionKeys = this.originalMatches.map(match => match.definitionKey);
    const allKeys = [...termKeys, ...definitionKeys];

    this.translate.get(allKeys).subscribe((translations: { [key: string]: string }) => {
      console.log("Brainstorming: Translations received.");
      this.brainstormingMatches = this.originalMatches.map(match => ({
        term: translations[match.termKey] || match.termKey,
        definition: translations[match.definitionKey] || match.definitionKey
      }));
      this.brainstormingMatches = this.shuffleArray(this.brainstormingMatches);
      this.shuffledDefinitions = this.shuffleArray(this.brainstormingMatches.map(match => match.definition));
      this.resetGameState();
      this.cdr.detectChanges();
      console.log("Brainstorming: Game data prepared.");
    }, error => {
      console.error("Brainstorming: Error getting translations", error);
      this.brainstormingMatches = this.shuffleArray(this.originalMatches.map(match => ({ term: match.termKey, definition: match.definitionKey })));
      this.shuffledDefinitions = this.shuffleArray(this.brainstormingMatches.map(match => match.definition));
      this.resetGameState();
      this.cdr.detectChanges();
    });
  }

  resetGameState() {
    this.selectedTerm = '';
    this.selectedDefinition = '';
    this.feedbackMessage = '';
    this.matchedPairs = [];
    this.isGameOver = false;
    this.showCongratulations = false;
    this.countdown = 3;
    this.clearIncorrectSelectionFeedback(); // Asegurar que se limpia el feedback de error
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = undefined;
    }
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  selectTerm(term: string) {
    if (this.isGameOver || this.isAlreadyMatched(term, null) ) return;

    this.clearIncorrectSelectionFeedback(); // Limpiar feedback de error anterior
    this.selectedTerm = term;
    this.selectedDefinition = ''; // Resetear definición si se selecciona un nuevo término
    // this.feedbackMessage = ''; // Limpiar mensaje de feedback en HTML si no se usa el snackbar para esto
    this.cdr.detectChanges();
  }

  selectDefinition(definition: string) {
    if (this.isGameOver || this.isAlreadyMatched(null, definition) || !this.selectedTerm) {
      if (!this.selectedTerm && !this.isGameOver) {
        // Usar MatSnackBar si no hay término seleccionado
        this.translate.get('SELECT_PRINCIPLE_FIRST').subscribe((res: string) => {
          this._snackBar.open(res || 'Please select a principle first.', 
                              this.translate.instant('SNACKBAR.DISMISS'), {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snackbar-warning'] // Una clase para aviso
          });
        });
      }
      return;
    }
    this.clearIncorrectSelectionFeedback(); // Limpiar feedback de error anterior
    this.selectedDefinition = definition;
    this.checkMatch();
    this.cdr.detectChanges();
  }

  checkMatch() {
    if (this.selectedTerm && this.selectedDefinition) {
      const correctMatchData = this.brainstormingMatches.find(bm => bm.term === this.selectedTerm);

      let snackBarMessageKey: string;
      let snackBarActionKey: string = 'SNACKBAR.DISMISS';
      let panelClass: string[];
      // Opcional: Mensaje para el feedback en el HTML
      let htmlFeedbackKey: string = '';
      let htmlFeedbackParams: any = {};


      if (correctMatchData && correctMatchData.definition === this.selectedDefinition) {
        this.matchedPairs.push({ term: this.selectedTerm, definition: this.selectedDefinition });

        snackBarMessageKey = 'SNACKBAR.CORRECT_MATCH';
        panelClass = ['snackbar-correct'];
        // htmlFeedbackKey = 'CORRECT_MATCH'; // Si quieres usar el feedback en HTML también
        // htmlFeedbackParams = { term: this.selectedTerm, definition: this.selectedDefinition };

        if (this.matchedPairs.length === this.originalMatches.length) {
          this.isGameOver = true;
          // Retrasar el popup de felicitaciones para que el snackbar se vea
          setTimeout(() => this.showCongratulationsPopup(), 1500);
        }
      } else {
        this.lastIncorrectTerm = this.selectedTerm;
        this.lastIncorrectDefinition = this.selectedDefinition;

        snackBarMessageKey = 'SNACKBAR.INCORRECT_MATCH';
        panelClass = ['snackbar-incorrect'];
        // htmlFeedbackKey = 'INCORRECT_MATCH'; // Si quieres usar el feedback en HTML también

        if (this.incorrectFeedbackTimeout) clearTimeout(this.incorrectFeedbackTimeout);
        this.incorrectFeedbackTimeout = setTimeout(() => {
          this.clearIncorrectSelectionFeedback();
          this.cdr.detectChanges();
        }, 1500); // Duración del temblor visual en los items
      }

      // Mostrar MatSnackBar
      forkJoin({
        message: this.translate.get(snackBarMessageKey, { term: this.selectedTerm }), // Simplificado para solo mostrar el término
        action: this.translate.get(snackBarActionKey)
      }).subscribe(translations => {
        this._snackBar.open(translations.message, translations.action, {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: panelClass
        });
      });

      // (Opcional) Actualizar feedbackMessage para el HTML
      if (htmlFeedbackKey) {
        this.translate.get(htmlFeedbackKey, htmlFeedbackParams).subscribe((res: string) => {
          this.feedbackMessage = res;
          this.cdr.detectChanges();
        });
      } else {
        this.feedbackMessage = ''; // Limpiar si solo usamos snackbar para este feedback
      }

      // No limpiar selectedTerm/Definition inmediatamente si fue incorrecto y queremos que tiemblen.
      // Se limpiarán con el timeout de clearIncorrectSelectionFeedback o en la siguiente selección.
      // Si el match fue correcto, sí podemos limpiarlos porque ya no se interactuará con ellos.
      if (panelClass.includes('snackbar-correct')) {
          this.selectedTerm = '';
          this.selectedDefinition = '';
      }
      this.cdr.detectChanges();
    }
  }

  isAlreadyMatched(term: string | null, definition: string | null): boolean {
    if (term) {
      return this.matchedPairs.some(pair => pair.term === term);
    } else if (definition) {
      return this.matchedPairs.some(pair => pair.definition === definition);
    }
    return false;
  }

  // --- Funciones para el feedback visual de selección incorrecta ---
  clearIncorrectSelectionFeedback() {
    if (this.lastIncorrectTerm || this.lastIncorrectDefinition) { // Solo limpiar si había algo
        this.lastIncorrectTerm = '';
        this.lastIncorrectDefinition = '';
        this.selectedTerm = ''; // Limpiar selección actual también para resetear visualmente
        this.selectedDefinition = '';
        this.cdr.detectChanges(); // Forzar actualización de la vista
    }
    if (this.incorrectFeedbackTimeout) {
      clearTimeout(this.incorrectFeedbackTimeout);
      this.incorrectFeedbackTimeout = null;
    }
  }

  isTermIncorrectlySelected(term: string): boolean {
    return this.lastIncorrectTerm === term;
  }

  isDefinitionIncorrectlySelected(definition: string): boolean {
    return this.lastIncorrectDefinition === definition;
  }
  // --- Fin funciones feedback visual ---

  showCongratulationsPopup() {
    this.showCongratulations = true;
    this.countdown = 3;
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.cdr.detectChanges();
      }
      if (this.countdown === 0) {
        this.closeCongratulationsPopup();
      }
    });
  }

  closeCongratulationsPopup() {
    this.showCongratulations = false;
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = undefined;
    }
  }

  goToLecciones() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = undefined;
    }
    this.router.navigate(['/lecciones']);
  }
}