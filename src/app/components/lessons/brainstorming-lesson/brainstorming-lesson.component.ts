import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgClass, NgIf, isPlatformBrowser } from '@angular/common'; // Importa isPlatformBrowser
import { Router } from '@angular/router'; // No necesitas RouterModule aquí si no usas sus directivas
import { Subscription, interval, forkJoin } from 'rxjs'; // Importa forkJoin
import { TranslateService, TranslateModule } from '@ngx-translate/core';

export interface BrainstormingMatch {
  termKey: string;
  definitionKey: string;
}

@Component({
  selector: 'app-brainstorming-lesson',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, TranslateModule], // Quita RouterModule si no usas directivas de router en el HTML
  templateUrl: './brainstorming-lesson.component.html',
  styleUrls: ['./brainstorming-lesson.component.scss'] // Corregido a styleUrls
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
  currentLang = '';

  private countdownSubscription: Subscription | undefined;
  private langChangeSubscription: Subscription | undefined; // Para desuscribirse

  constructor(
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef, // Para forzar detección de cambios si es necesario
    @Inject(PLATFORM_ID) private platformId: Object // Para lógica específica de plataforma si fuera necesario
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
    // Escuchar cambios de idioma
    this.langChangeSubscription = this.translate.onLangChange.subscribe(event => {
        console.log(`Brainstorming: Language changed to ${event.lang}, preparing data...`);
        this.currentLang = event.lang;
        this.prepareGameDataAsync(); // Usar método async
    });
    // Cargar datos iniciales para el idioma actual/preferido
    this.loadLanguagePreference();
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar memory leaks
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.langChangeSubscription) {
        this.langChangeSubscription.unsubscribe();
    }
  }

  loadLanguagePreference() {
    // Solo acceder a localStorage en el navegador
    let preferredLanguage = 'en'; // Default language
    if (isPlatformBrowser(this.platformId)) {
        preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    }
    // 'use' devuelve un Observable que completa cuando las traducciones están listas
    this.translate.use(preferredLanguage).subscribe(() => {
        console.log(`Brainstorming: Initial language set to ${preferredLanguage}, preparing data...`);
        this.currentLang = preferredLanguage;
        this.prepareGameDataAsync(); // Cargar datos después de establecer idioma
    });
  }

  changeLanguage(lang: string) {
    // 'use' gestiona la carga del nuevo idioma
    this.translate.use(lang); // onLangChange se disparará y llamará a prepareGameDataAsync
    if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('preferredLanguage', lang);
    }
  }

  // Renombrado para indicar que es asíncrono
  prepareGameDataAsync() {
    const termKeys = this.originalMatches.map(match => match.termKey);
    const definitionKeys = this.originalMatches.map(match => match.definitionKey);
    const allKeys = [...termKeys, ...definitionKeys];

    // Usar translate.get()
    this.translate.get(allKeys).subscribe((translations: { [key: string]: string }) => {
      console.log("Brainstorming: Translations received.");

      // Mapear usando las traducciones obtenidas
      this.brainstormingMatches = this.originalMatches.map(match => ({
        term: translations[match.termKey] || match.termKey, // Fallback a la clave
        definition: translations[match.definitionKey] || match.definitionKey // Fallback a la clave
      }));

      // Mezclar y preparar estado inicial del juego
      this.brainstormingMatches = this.shuffleArray(this.brainstormingMatches);
      this.shuffledDefinitions = this.shuffleArray(this.brainstormingMatches.map(match => match.definition));
      this.resetGameState(); // Función para reiniciar el estado

      this.cdr.detectChanges(); // Notificar a Angular que los datos han cambiado
      console.log("Brainstorming: Game data prepared.");
    }, error => {
         console.error("Brainstorming: Error getting translations", error);
         // Manejar error: mostrar datos con claves?
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
      if (this.countdownSubscription) { // Detener contador si estaba activo
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
    if (!this.isAlreadyMatched(term, null) && !this.isGameOver) {
      this.selectedTerm = term;
      this.selectedDefinition = '';
      this.feedbackMessage = ''; // Limpiar mensaje previo
    }
  }

  selectDefinition(definition: string) {
    if (!this.isAlreadyMatched(null, definition) && !this.isGameOver) {
      if (this.selectedTerm) {
        this.selectedDefinition = definition;
        this.checkMatch();
      } else {
        // Usar get para el mensaje asíncrono
        this.translate.get('SELECT_PRINCIPLE_FIRST').subscribe((res: string) => {
             this.feedbackMessage = res || 'Please select a principle first.'; // Fallback
             this.cdr.detectChanges(); // Actualizar vista
        });
      }
    }
  }

  checkMatch() {
    if (this.selectedTerm && this.selectedDefinition) {
        // Busca el match usando los datos ya traducidos y almacenados
        const correctMatchData = this.brainstormingMatches.find(bm => bm.term === this.selectedTerm);

        if (correctMatchData && correctMatchData.definition === this.selectedDefinition) {
            // --- CORRECTO ---
            this.matchedPairs.push({ term: this.selectedTerm, definition: this.selectedDefinition });

            // Usar forkJoin para obtener múltiples traducciones si es necesario
            forkJoin({
                msg: this.translate.get('CORRECT_MATCH', { term: this.selectedTerm, definition: this.selectedDefinition })
            }).subscribe(results => {
                this.feedbackMessage = results.msg || `Correct: ${this.selectedTerm}`; // Fallback
                this.cdr.detectChanges();
            });

            if (this.matchedPairs.length === this.originalMatches.length) {
                this.isGameOver = true;
                this.showCongratulationsPopup();
            }
        } else {
            // --- INCORRECTO ---
            this.translate.get('INCORRECT_MATCH').subscribe((res: string) => {
                this.feedbackMessage = res || 'Incorrect! Try again.'; // Fallback
                this.cdr.detectChanges();
            });
        }
        // Limpiar selección después de verificar
        this.selectedTerm = '';
        this.selectedDefinition = '';
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

  showCongratulationsPopup() {
    this.showCongratulations = true;
    this.countdown = 3; // Reiniciar cuenta atrás
     if (this.countdownSubscription) { // Cancelar anterior si existiera
        this.countdownSubscription.unsubscribe();
     }
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.countdown > 0) {
         this.countdown--;
         this.cdr.detectChanges(); // Actualizar vista del contador
      }
      if (this.countdown === 0) {
        this.closeCongratulationsPopup(); // Llama a cerrar cuando llega a 0
      }
    });
  }

  closeCongratulationsPopup() {
    this.showCongratulations = false;
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = undefined; // Limpiar referencia
    }
    // No reiniciar countdown aquí, ya se reinicia al mostrar o preparar juego
  }

  goToLecciones() {
     if (this.countdownSubscription) { // Asegurarse de parar contador al navegar
        this.countdownSubscription.unsubscribe();
        this.countdownSubscription = undefined;
     }
    this.router.navigate(['/lecciones']);
  }
}