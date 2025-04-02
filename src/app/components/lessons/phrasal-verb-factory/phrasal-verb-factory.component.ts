import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule, NgFor, NgClass, isPlatformBrowser } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Subscription, forkJoin } from 'rxjs'; // Importa Subscription y forkJoin

// Declarar anime globalmente
declare let anime: any;

// ... (Interfaces: PhrasalVerbItem, DefinitionTarget, VerbOption) ...
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


@Component({
  selector: 'app-phrasal-verb-factory',
  standalone: true,
  imports: [ CommonModule, NgFor, DragDropModule, TranslateModule ],
  templateUrl: './phrasal-verb-factory.component.html',
  styleUrls: ['./phrasal-verb-factory.component.scss']
})
export class PhrasalVerbFactoryComponent implements OnInit, OnDestroy {

  @ViewChildren('dropZone') dropZoneElements!: QueryList<ElementRef>;

  phrasalVerbsData: PhrasalVerbItem[] = [
    { id: 'DEAL_WITH', verbKey: 'PHRASAL_VERBS.DEAL_WITH', definitionKey: 'DEFINITIONS.DEAL_WITH' },
    { id: 'SHUT_DOWN', verbKey: 'PHRASAL_VERBS.SHUT_DOWN', definitionKey: 'DEFINITIONS.SHUT_DOWN' },
    { id: 'COME_TOGETHER', verbKey: 'PHRASAL_VERBS.COME_TOGETHER', definitionKey: 'DEFINITIONS.COME_TOGETHER' },
    { id: 'END_UP', verbKey: 'PHRASAL_VERBS.END_UP', definitionKey: 'DEFINITIONS.END_UP' },
    { id: 'THROW_UP', verbKey: 'PHRASAL_VERBS.THROW_UP', definitionKey: 'DEFINITIONS.THROW_UP' },
    { id: 'DAWN_ON', verbKey: 'PHRASAL_VERBS.DAWN_ON', definitionKey: 'DEFINITIONS.DAWN_ON' },
  ];

  definitions: DefinitionTarget[] = [];
  verbOptions: VerbOption[] = [];
  matchedCount = 0;
  totalVerbs = this.phrasalVerbsData.length;
  currentLang = '';

  private langChangeSubscription: Subscription | undefined; // Para desuscribirse

  constructor(
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'es';
    // Escuchar cambios y recargar datos
    this.langChangeSubscription = this.translate.onLangChange.subscribe(event => {
        console.log(`PhrasalVerbFactory: Language changed to ${event.lang}, preparing data...`);
        this.currentLang = event.lang;
        this.prepareGameDataAsync(); // Usar método async
    });

    // Cargar datos iniciales (comprobar si ya están o esperar a 'use')
     if (this.translate.store.translations[this.currentLang]) {
        console.log(`PhrasalVerbFactory: Initial translations for ${this.currentLang} found, preparing data...`);
        this.prepareGameDataAsync(); // Si las traducciones ya están, cargar datos
     } else if (isPlatformBrowser(this.platformId)) {
        // Solo llamar a 'use' en el navegador si no están cargadas
        console.log(`PhrasalVerbFactory: Initial translations for ${this.currentLang} not found, calling use()...`);
        this.translate.use(this.currentLang).subscribe(() => {
             console.log(`PhrasalVerbFactory: Translations loaded after use(${this.currentLang}), preparing data...`);
             this.prepareGameDataAsync();
        }, error => console.error(`PhrasalVerbFactory: Error calling use(${this.currentLang})`, error));
     } else {
        // En el servidor, si las traducciones no están, probablemente no funcionará bien
        // Podrías intentar precargarlas en el servidor de otra manera o mostrar estado de carga
         console.warn(`PhrasalVerbFactory: Running on server, initial translations for ${this.currentLang} not found.`);
         // Igualmente intentamos cargar, por si acaso el loader funciona en server
         this.prepareGameDataAsync();
     }
  }

   ngOnDestroy(): void {
    // Desuscribirse
    if (this.langChangeSubscription) {
        this.langChangeSubscription.unsubscribe();
    }
  }


  // Renombrado para indicar que es asíncrono
  prepareGameDataAsync(): void {
    this.matchedCount = 0;
    const verbKeys = this.phrasalVerbsData.map(item => item.verbKey);
    const definitionKeys = this.phrasalVerbsData.map(item => item.definitionKey);
    const allKeys = [...verbKeys, ...definitionKeys];

    // Usar translate.get()
    this.translate.get(allKeys).subscribe((translations: { [key: string]: string }) => {
        console.log("PhrasalVerbFactory: Translations received.");
        const currentDefinitions: DefinitionTarget[] = [];
        const currentVerbOptions: VerbOption[] = [];

        this.phrasalVerbsData.forEach((item, index) => {
            currentDefinitions.push({
                id: index,
                targetVerbId: item.id,
                definitionText: translations[item.definitionKey] || item.definitionKey, // Fallback
                droppedVerb: null,
                isCorrect: null
            });
            currentVerbOptions.push({
                id: item.id,
                verbText: translations[item.verbKey] || item.verbKey // Fallback
            });
        });

        // Asignar y mezclar
        this.definitions = this.shuffleArray(currentDefinitions);
        this.verbOptions = this.shuffleArray(currentVerbOptions);
        this.cdr.detectChanges(); // Notificar cambios
        console.log("PhrasalVerbFactory: Game data prepared.");
    }, error => {
        console.error("PhrasalVerbFactory: Error getting translations", error);
        // Fallback en caso de error
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
    const containerData = event.container.data;
    const itemData = event.item?.data;

    // Comprobar si estamos soltando en una zona de definición válida
    // y si el item arrastrado es un VerbOption válido
    if (containerData?.targetVerbId && itemData?.id && typeof itemData.id === 'string') {
        const definitionTarget = containerData as DefinitionTarget;
        const droppedVerb = itemData as VerbOption;

        // Si ya está correcto, no hacer nada
        if (definitionTarget.droppedVerb && definitionTarget.isCorrect) {
          return;
        }

        // Comprobar match
        if (droppedVerb.id === definitionTarget.targetVerbId) {
            // CORRECTO
            const verbIndexInOptions = this.verbOptions.findIndex(v => v.id === droppedVerb.id);
            if (verbIndexInOptions > -1) {
                 const [movedVerb] = this.verbOptions.splice(verbIndexInOptions, 1);
                 definitionTarget.droppedVerb = movedVerb;
            } else {
                 // Si no estaba en opciones (quizás ya se soltó antes incorrectamente?), asignarlo
                 definitionTarget.droppedVerb = droppedVerb;
            }
            definitionTarget.isCorrect = true;
            this.matchedCount++;
            this.showFeedback(true);
            // Animar elemento correcto
            const dropZoneElement = this.dropZoneElements.find((el, index) => index === definitionTarget.id)?.nativeElement;
            if (dropZoneElement) {
                this.animateSuccess(dropZoneElement);
            }
            // Comprobar fin de juego
            if (this.matchedCount === this.totalVerbs) {
                this.showGameComplete();
            }
        } else {
            // INCORRECTO
            definitionTarget.isCorrect = false;
             // No movemos el verbo incorrecto a la zona, solo mostramos feedback
            this.showFeedback(false);
            // Podríamos añadir animación de error al dropZoneElement si quisiéramos
        }
        this.cdr.detectChanges();

    } else if (event.previousContainer !== event.container) {
         // Se soltó en un lugar inválido (ni definición ni lista original)
         // O el item no era válido
         console.log("Invalid drop location or item data");
         // Aquí NO movemos el item, CDK lo devolverá a su sitio si no se llama a transferArrayItem/moveItemInArray
    }
     // Si event.previousContainer === event.container, CDK maneja el reordenamiento dentro de la misma lista
     // Si quisiéramos permitir devolver verbos a la lista de opciones, necesitaríamos más lógica aquí
  }

  isDropZoneDisabled(definition: DefinitionTarget): boolean {
    return !!definition.droppedVerb && !!definition.isCorrect;
  }

  // --- Feedback y Animaciones (usando get asíncrono) ---
  showFeedback(isCorrect: boolean): void {
    const titleKey = isCorrect ? 'FEEDBACK.CORRECT_TITLE' : 'FEEDBACK.INCORRECT_TITLE';
    const textKey = isCorrect ? 'FEEDBACK.CORRECT_TEXT' : 'FEEDBACK.INCORRECT_TEXT';

    forkJoin({
        title: this.translate.get(titleKey),
        text: this.translate.get(textKey)
    }).subscribe(results => {
        Swal.fire({
            icon: isCorrect ? 'success' : 'error',
            title: results.title || (isCorrect ? 'Correct!' : 'Incorrect'), // Fallback
            text: results.text || (isCorrect ? 'Good job!' : 'Try again!'),   // Fallback
            toast: true,
            position: 'top-end',
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
            title: results.title || 'Well Done!', // Fallback
            text: results.text || 'You matched all the phrasal verbs!', // Fallback
            confirmButtonText: results.btn || 'Play Again' // Fallback
        }).then((result) => {
            // Solo reiniciar si se pulsa el botón (o si se cierra, según se quiera)
            if (result.isConfirmed) {
                this.prepareGameDataAsync(); // Reiniciar juego
            }
        });
     });
  }

  async animateSuccess(element: HTMLElement): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const anime = (await import('animejs/lib/anime.es.js')).default;
        anime({
          targets: element,
          scale: [1, 1.1, 1],
          duration: 400,
          easing: 'easeOutExpo',
          backgroundColor: ['#ffffff', '#d4edda', '#ffffff']
        });
      } catch (error) {
        console.error("Error loading or using animejs:", error);
        element.classList.add('animate-success-fallback');
        setTimeout(() => element.classList.remove('animate-success-fallback'), 400);
      }
    }
  }
}