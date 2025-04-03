import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule, NgFor, NgClass, isPlatformBrowser } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Subscription, forkJoin } from 'rxjs';

// Declarar anime globalmente para usar su tipo si es necesario, o simplemente usar 'any' más adelante
declare let anime: any;

// --- Interfaces ---
interface PhrasalVerbItem {
  id: string;
  verbKey: string;
  definitionKey: string;
}
interface DefinitionTarget {
  id: number;
  targetVerbId: string;
  definitionText: string;
  droppedVerb: VerbOption | null;
  isCorrect: boolean | null;
}
interface VerbOption {
  id: string;
  verbText: string;
}
// --- Fin Interfaces ---

@Component({
  selector: 'app-phrasal-verb-factory',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgClass, // Necesario para los botones de idioma activos
    DragDropModule,
    TranslateModule
  ],
  templateUrl: './phrasal-verb-factory.component.html',
  styleUrls: ['./phrasal-verb-factory.component.scss']
})
export class PhrasalVerbFactoryComponent implements OnInit, OnDestroy {

  // Referencias a los elementos DOM para animación
  @ViewChildren('dropZone') dropZoneElements!: QueryList<ElementRef>;

  // Datos base del juego
  phrasalVerbsData: PhrasalVerbItem[] = [
    { id: 'DEAL_WITH', verbKey: 'PHRASAL_VERBS.DEAL_WITH', definitionKey: 'DEFINITIONS.DEAL_WITH' },
    { id: 'SHUT_DOWN', verbKey: 'PHRASAL_VERBS.SHUT_DOWN', definitionKey: 'DEFINITIONS.SHUT_DOWN' },
    { id: 'COME_TOGETHER', verbKey: 'PHRASAL_VERBS.COME_TOGETHER', definitionKey: 'DEFINITIONS.COME_TOGETHER' },
    { id: 'END_UP', verbKey: 'PHRASAL_VERBS.END_UP', definitionKey: 'DEFINITIONS.END_UP' },
    { id: 'THROW_UP', verbKey: 'PHRASAL_VERBS.THROW_UP', definitionKey: 'DEFINITIONS.THROW_UP' },
    { id: 'DAWN_ON', verbKey: 'PHRASAL_VERBS.DAWN_ON', definitionKey: 'DEFINITIONS.DAWN_ON' },
  ];

  // Estado dinámico del juego
  definitions: DefinitionTarget[] = [];
  verbOptions: VerbOption[] = [];
  matchedCount = 0;
  totalVerbs = this.phrasalVerbsData.length;
  currentLang = 'es'; // Idioma actual, por defecto 'es' (español)

  private langChangeSubscription: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Obtener idioma inicial
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'es';
    console.log(`PhrasalVerbFactory: Initial language is ${this.currentLang}`);

    // Suscribirse a cambios futuros de idioma
    this.langChangeSubscription = this.translate.onLangChange.subscribe(event => {
        console.log(`PhrasalVerbFactory: Language changed via event to ${event.lang}, preparing data...`);
        this.currentLang = event.lang; // Actualizar idioma actual
        this.prepareGameDataAsync(); // Recargar datos para el nuevo idioma
    });

    // Lógica para la carga inicial de datos
     this.loadInitialData();
  }

  ngOnDestroy(): void {
    // Limpiar suscripción
    if (this.langChangeSubscription) {
        this.langChangeSubscription.unsubscribe();
    }
  }

  loadInitialData(): void {
     // Comprobar si las traducciones para el idioma actual ya están cargadas
     if (this.translate.store.translations[this.currentLang]) {
        console.log(`PhrasalVerbFactory: Initial translations for ${this.currentLang} found, preparing data...`);
        this.prepareGameDataAsync();
     } else if (isPlatformBrowser(this.platformId)) {
        // Si no están cargadas y estamos en el navegador, intentar cargarlas con use()
        // onLangChange se encargará de llamar a prepareGameDataAsync cuando estén listas
        console.log(`PhrasalVerbFactory: Initial translations for ${this.currentLang} not found, calling use()...`);
        this.translate.use(this.currentLang).subscribe({
            // next:() => {}, // No necesita hacer nada aquí, onLangChange actúa
            error: (err) => console.error(`PhrasalVerbFactory: Error explicitly calling use(${this.currentLang})`, err)
        });
     } else {
         // En SSR, si no están cargadas (posible si el ServerLoader falla o no está), advertir.
         console.warn(`PhrasalVerbFactory: Running on server, initial translations for ${this.currentLang} not found. Attempting to prepare data anyway.`);
         this.prepareGameDataAsync(); // Intentar cargar de todas formas
     }
  }

  changeLanguage(lang: string): void {
    if (lang === this.currentLang) {
        return; // Evitar recargas innecesarias
    }
    console.log(`PhrasalVerbFactory: Changing language to ${lang}...`);
    // translate.use carga el idioma Y dispara onLangChange si tiene éxito
    this.translate.use(lang);
    // Guardar preferencia en localStorage (solo navegador)
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('preferredLanguage', lang);
      } catch (e) {
        console.error("Error saving language to localStorage", e);
      }
    }
  }

  prepareGameDataAsync(): void {
    this.matchedCount = 0; // Reiniciar contador
    const verbKeys = this.phrasalVerbsData.map(item => item.verbKey);
    const definitionKeys = this.phrasalVerbsData.map(item => item.definitionKey);
    const allKeys = [...verbKeys, ...definitionKeys];

    this.translate.get(allKeys).subscribe((translations: { [key: string]: string }) => {
        console.log("PhrasalVerbFactory: Translations received for prepareGameDataAsync.");
        const currentDefinitions: DefinitionTarget[] = [];
        const currentVerbOptions: VerbOption[] = [];

        this.phrasalVerbsData.forEach((item, index) => {
            currentDefinitions.push({
                id: index,
                targetVerbId: item.id,
                definitionText: translations[item.definitionKey] || `[!${item.definitionKey}!]`, // Fallback con marcador
                droppedVerb: null,
                isCorrect: null
            });
            currentVerbOptions.push({
                id: item.id,
                verbText: translations[item.verbKey] || `[!${item.verbKey}!]` // Fallback con marcador
            });
        });

        this.definitions = this.shuffleArray(currentDefinitions);
        this.verbOptions = this.shuffleArray(currentVerbOptions);
        this.cdr.detectChanges(); // Forzar actualización de la vista
        console.log("PhrasalVerbFactory: Game data prepared and shuffled.");
    }, error => {
        console.error("PhrasalVerbFactory: Error getting translations", error);
        // Fallback si falla la carga: usar claves
        this.definitions = this.shuffleArray(this.phrasalVerbsData.map((item, index) => ({ id: index, targetVerbId: item.id, definitionText: item.definitionKey, droppedVerb: null, isCorrect: null })));
        this.verbOptions = this.shuffleArray(this.phrasalVerbsData.map(item => ({ id: item.id, verbText: item.verbKey })));
        this.cdr.detectChanges();
    });
  }

  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  drop(event: CdkDragDrop<any>): void {
    const definitionContainer = event.container.data as DefinitionTarget;
    const verbItem = event.item?.data as VerbOption;

    // Comprobar si se soltó en una zona de definición válida
    // y si el item arrastrado tiene los datos esperados
    if (definitionContainer?.targetVerbId && verbItem?.id) {

        // Evitar acción si la zona ya está resuelta correctamente
        if (definitionContainer.droppedVerb && definitionContainer.isCorrect) {
          return;
        }

        // Comprobar si es el match correcto
        if (verbItem.id === definitionContainer.targetVerbId) {
            // --- CORRECTO ---
            const verbIndex = this.verbOptions.findIndex(v => v.id === verbItem.id);
            if (verbIndex > -1) {
                 // Mover el item de la lista de opciones al target
                 const [movedVerb] = this.verbOptions.splice(verbIndex, 1);
                 definitionContainer.droppedVerb = movedVerb;
            } else {
                 // Si no está en opciones (ya se había movido?), asignarlo directamente
                 definitionContainer.droppedVerb = verbItem;
            }
            definitionContainer.isCorrect = true;
            this.matchedCount++;
            this.showFeedback(true);

            // Animar la zona de drop correcta
            const dropZoneElement = this.dropZoneElements.find((el, index) => index === definitionContainer.id)?.nativeElement;
            if (dropZoneElement) {
                this.animateSuccess(dropZoneElement);
            }

            // Comprobar si se completó el juego
            if (this.matchedCount === this.totalVerbs) {
                this.showGameComplete();
            }
        } else {
            // --- INCORRECTO ---
            definitionContainer.isCorrect = false;
            // No asignamos el verbo incorrecto a la zona (definitionContainer.droppedVerb = null;)
            // Simplemente mostramos feedback
            this.showFeedback(false);
            // Podrías añadir animación de error si quieres
        }
        this.cdr.detectChanges(); // Actualizar la vista

    } else if (event.previousContainer !== event.container) {
        // Se soltó fuera de una zona válida (CDK lo devolverá si no hubo transferencia)
        console.log("Invalid drop location");
    }
    // Si se suelta en la misma lista de origen, CDK maneja el reordenamiento
  }

  // Devuelve true si la zona ya tiene un verbo correcto asignado
  isDropZoneDisabled(definition: DefinitionTarget): boolean {
    return !!definition.droppedVerb && !!definition.isCorrect;
  }

  showFeedback(isCorrect: boolean): void {
    const titleKey = isCorrect ? 'FEEDBACK.CORRECT_TITLE' : 'FEEDBACK.INCORRECT_TITLE';
    const textKey = isCorrect ? 'FEEDBACK.CORRECT_TEXT' : 'FEEDBACK.INCORRECT_TEXT';

    forkJoin({
        title: this.translate.get(titleKey),
        text: this.translate.get(textKey)
    }).subscribe(results => {
        Swal.fire({
            icon: isCorrect ? 'success' : 'error',
            title: results.title || (isCorrect ? 'Correct!' : 'Incorrect'),
            text: results.text || (isCorrect ? 'Good job!' : 'Try again!'),
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
    });
  }

  showGameComplete(): void {
     forkJoin({
        title: this.translate.get('FEEDBACK.GAME_COMPLETE_TITLE'),
        text: this.translate.get('FEEDBACK.GAME_COMPLETE_TEXT'),
        btn: this.translate.get('FEEDBACK.GAME_COMPLETE_BUTTON')
     }).subscribe(results => {
        Swal.fire({
            icon: 'success',
            title: results.title || 'Well Done!',
            text: results.text || 'You matched all the phrasal verbs!',
            confirmButtonText: results.btn || 'Play Again'
        }).then((result) => {
            if (result.isConfirmed) {
                this.prepareGameDataAsync(); // Reiniciar juego
            }
        });
     });
  }

  async animateSuccess(element: HTMLElement): Promise<void> {
    // Ejecutar solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      try {
        const anime = (await import('animejs/lib/anime.es.js')).default;
        anime({
          targets: element,
          scale: [1, 1.05, 1], // Pulso más sutil
          duration: 300,
          easing: 'easeOutExpo',
          // Usar clases CSS podría ser más limpio que cambiar backgroundColor directamente
          // element.classList.add('correct-flash');
          // setTimeout(() => element.classList.remove('correct-flash'), 300);
           backgroundColor: [
                { value: '#d4edda', duration: 150 }, // Verde claro rápido
                { value: '#f9f9f9', duration: 150, delay: 50 } // Volver al fondo original
            ]
        });
      } catch (error) {
        console.error("Error loading or using animejs:", error);
        // Fallback simple con clase CSS
        element.classList.add('animate-success-fallback');
        setTimeout(() => element.classList.remove('animate-success-fallback'), 400);
      }
    }
  }
} // Fin de la clase PhrasalVerbFactoryComponent