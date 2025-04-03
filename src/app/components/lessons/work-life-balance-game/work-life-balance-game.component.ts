import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, NgClass, isPlatformBrowser } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'; // Asegúrate que CdkDragDrop se importa
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Subscription, Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

// Imports de ELF
import { createStore, withProps, select } from '@ngneat/elf';
import { withEntities, selectAllEntities, setEntities, addEntities, deleteEntities, updateEntities } from '@ngneat/elf-entities';

// --- Interfaces ---
export interface WorkLifeState {
  energy: number;
  stress: number;
  currentDay: number;
  maxDays: number;
  workTasksCompleted: number;
  workTasksRequired: number;
  gameOver: boolean;
  gameMessageKey: string | null;
}

export interface TaskItem {
  id: number;
  nameKey: string;
  nameText?: string;
  category: 'work' | 'personal' | 'rest';
  energyEffect: number;
  stressEffect: number;
}
// --- Fin Interfaces ---

// --- Configuración del Store de ELF ---
const initialState: WorkLifeState = {
  energy: 75, stress: 25, currentDay: 1, maxDays: 5,
  workTasksCompleted: 0, workTasksRequired: 5,
  gameOver: false, gameMessageKey: null
};

const workLifeStore = createStore( { name: 'workLife' }, withProps<WorkLifeState>(initialState) );
const tasksRepository = createStore( { name: 'tasks' }, withEntities<TaskItem>() );
// --- Fin Configuración ELF ---


@Component({
  selector: 'app-work-life-balance-game',
  standalone: true,
  imports: [ CommonModule, NgClass, DragDropModule, TranslateModule ],
  templateUrl: './work-life-balance-game.component.html',
  styleUrls: ['./work-life-balance-game.component.scss']
})
export class WorkLifeBalanceGameComponent implements OnInit, OnDestroy {

  // --- Observables del Estado ELF ---
  energy$: Observable<number> = workLifeStore.pipe(select(state => state.energy));
  stress$: Observable<number> = workLifeStore.pipe(select(state => state.stress));
  workTasksCompleted$: Observable<number> = workLifeStore.pipe(select(state => state.workTasksCompleted));
  gameOver$: Observable<boolean> = workLifeStore.pipe(select(state => state.gameOver));
  gameMessageKey$: Observable<string | null> = workLifeStore.pipe(select(state => state.gameMessageKey));
  availableTasks$: Observable<TaskItem[]> = tasksRepository.pipe(selectAllEntities());
  // --- Fin Observables ---

  // Propiedades
  maxDays = initialState.maxDays;
  workTasksRequired = initialState.workTasksRequired;
  currentLang: string = 'en';
  gameStarted: boolean = false;

  baseTasks: Omit<TaskItem, 'id' | 'nameText'>[] = [
      { nameKey: 'TASKS.WLB.REPORT', category: 'work', energyEffect: -20, stressEffect: +25 },
      { nameKey: 'TASKS.WLB.MEETING', category: 'work', energyEffect: -10, stressEffect: +15 },
      { nameKey: 'TASKS.WLB.EMAILS', category: 'work', energyEffect: -5, stressEffect: +5 },
      { nameKey: 'TASKS.WLB.PROJECT_PLAN', category: 'work', energyEffect: -15, stressEffect: +20 },
      { nameKey: 'TASKS.WLB.CODE_REVIEW', category: 'work', energyEffect: -10, stressEffect: +10 },
      { nameKey: 'TASKS.WLB.CLIENT_CALL', category: 'work', energyEffect: -15, stressEffect: +20 },
      { nameKey: 'TASKS.WLB.GYM', category: 'personal', energyEffect: +10, stressEffect: -15 },
      { nameKey: 'TASKS.WLB.FAMILY_DINNER', category: 'personal', energyEffect: +5, stressEffect: -10 },
      { nameKey: 'TASKS.WLB.HOBBY', category: 'personal', energyEffect: +15, stressEffect: -20 },
      { nameKey: 'TASKS.WLB.GROCERIES', category: 'personal', energyEffect: -5, stressEffect: +5 },
      { nameKey: 'TASKS.WLB.SLEEP', category: 'rest', energyEffect: +30, stressEffect: -30 },
      { nameKey: 'TASKS.WLB.RELAX', category: 'rest', energyEffect: +10, stressEffect: -15 },
      { nameKey: 'TASKS.WLB.SHORT_BREAK', category: 'rest', energyEffect: +5, stressEffect: -5 },
  ];
  // Usamos un array simple para las tareas del día, gestionado localmente
  // (El HTML necesita asegurar que pasa un array a cdkDropListData con ?? [])
  dayTasks: { [day: number]: TaskItem[] } = {};

  private langChangeSubscription: Subscription | undefined;

  constructor(
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.currentLang = 'en'; // Forzar inglés como idioma inicial
    this.translate.use('en').subscribe({
        next: () => {
            console.log("WorkLifeBalanceGame: Forced English language loaded.");
            this.loadAndSetTasks(); // Cargar etiquetas después de asegurarnos de que inglés está listo
            this.subscribeToLangChanges(); // Suscribirnos a cambios después de la carga inicial
        },
        error: (err) => {
            console.error("WorkLifeBalanceGame: Error forcing English language:", err);
            this.loadAndSetTasks(); // Intentar cargar tareas aunque falle el cambio de idioma
            this.subscribeToLangChanges(); // Asegurar suscripción a cambios de idioma
        }
    });
    this.initializeDayTasks(); // Inicializar arrays de tareas diarias
}

// Método separado para suscribirse a cambios de idioma después de la carga inicial
subscribeToLangChanges() {
    this.langChangeSubscription = this.translate.onLangChange.subscribe(event => {
        if (this.currentLang === event.lang) return; // Evitar recarga si ya estamos en ese idioma
        console.log(`WorkLifeBalanceGame: Language changed via event to ${event.lang}, reloading tasks...`);
        this.currentLang = event.lang;
        this.loadAndSetTasks(); // Recargar etiquetas de tareas en el nuevo idioma
    });
}


  ngOnDestroy(): void {
    this.langChangeSubscription?.unsubscribe();
  }

  initializeDayTasks(): void {
      this.dayTasks = {}; // Limpiar por si acaso
      for(let i=1; i <= this.maxDays; i++) { this.dayTasks[i] = []; }
  }

  loadAndSetTasks(): void {
    const taskKeys = this.baseTasks.map(t => t.nameKey);
    this.translate.get(taskKeys).subscribe({
        next: (translations) => {
          const initialTasks: TaskItem[] = this.baseTasks.map((task, index) => ({
            ...task,
            id: index + 1,
            nameText: translations[task.nameKey] || `[!${task.nameKey}!]`
          }));
          tasksRepository.update(setEntities(initialTasks));
          console.log('WorkLifeBalanceGame: Tasks loaded/reloaded in repository.');
        },
        error: (err) => console.error("Error loading task translations:", err)
    });
  }

  startGame(): void {
    console.log('WorkLifeBalanceGame: Starting game...');
    this.gameStarted = true;
    workLifeStore.update(() => initialState);
    this.loadAndSetTasks();
    this.initializeDayTasks(); // Asegurar que los arrays de días están listos
    this.cdr.detectChanges();
  }

  // ===============================================================
  // MÉTODO drop() CON LA CORRECCIÓN EN LA FIRMA: CdkDragDrop<any>
  // ===============================================================
  drop(event: CdkDragDrop<any>): void {
    // Ya no se necesita: const targetListData = event.container.data;
    // Ya no se necesita: const sourceListData = event.previousContainer.data;
    const targetListId = event.container.id;
    const sourceListId = event.previousContainer.id;
    const task = event.item.data as TaskItem; // El item siempre debería ser TaskItem

    console.log(`Drop event: Task ${task?.id} from ${sourceListId} to ${targetListId}`);

    // Comprobaciones básicas
    if (!this.gameStarted || workLifeStore.getValue().gameOver || !task?.id) {
        console.warn("Game not active or invalid task data.");
        return;
    }

    if (event.previousContainer === event.container) {
        // Mover dentro de la misma lista (reordenar)
        if (targetListId.startsWith('day-')) {
             const targetDay = parseInt(targetListId.split('-')[1], 10);
             if (this.dayTasks[targetDay]) {
                moveItemInArray(this.dayTasks[targetDay], event.previousIndex, event.currentIndex);
             }
        } else {
             console.log("Reordering in available list not handled.");
             // Si availableTasks$ es el source, no podemos modificarlo directamente
        }
    } else {
        // Mover ENTRE listas

        let energyChange = 0;
        let stressChange = 0;
        let workTaskChange = 0;

        if (sourceListId === 'available-tasks' && targetListId.startsWith('day-')) {
            // --- Moviendo a un día ---
            const targetDay = parseInt(targetListId.split('-')[1], 10);

            // Comprobación de seguridad para dayTasks[targetDay]
            if (!this.dayTasks[targetDay]) { this.dayTasks[targetDay] = []; }

            // --- Validaciones (Ejemplo) ---
            // if (this.dayTasks[targetDay].length >= 3) { console.warn(`Day ${targetDay} is full`); Swal.fire(...); return; }

            energyChange = task.energyEffect;
            stressChange = task.stressEffect;
            workTaskChange = (task.category === 'work' ? 1 : 0);

            // Actualizar Repositorio Elf (quitar de disponibles)
            tasksRepository.update(deleteEntities(task.id));
            // Añadir a la lista local del día en la posición correcta
            this.dayTasks[targetDay].splice(event.currentIndex, 0, task);

            console.log(`Task ${task.id} moved to ${targetListId}.`);

        } else if (targetListId === 'available-tasks' && sourceListId.startsWith('day-')) {
            // --- Devolviendo a disponibles ---
            const sourceDay = parseInt(sourceListId.split('-')[1], 10);

            // Comprobación de seguridad
            if (!this.dayTasks[sourceDay]) { console.error(`Source list for ${sourceListId} not found!`); return; }

            energyChange = -task.energyEffect; // Revertir
            stressChange = -task.stressEffect; // Revertir
            workTaskChange = -(task.category === 'work' ? 1 : 0); // Revertir

            // Quitar de la lista local del día (¡OJO! Necesitamos el índice *original*)
            const taskIndexInSourceDay = this.dayTasks[sourceDay].findIndex(t => t.id === task.id);
            if (taskIndexInSourceDay > -1) {
                 this.dayTasks[sourceDay].splice(taskIndexInSourceDay, 1);
            }
            // Añadir de nuevo al repositorio Elf (aparecerá en availableTasks$ automáticamente)
            tasksRepository.update(addEntities(task));

            console.log(`Task ${task.id} returned to available.`);

        } else {
             console.warn("Invalid drop movement between lists.");
             return; // Salir si el movimiento no es válido
        }

        // --- Aplicar Efectos al Store si hubo movimiento válido ---
        workLifeStore.update(state => ({
            ...state,
            energy: Math.max(0, state.energy + energyChange),
            stress: Math.min(100, Math.max(0, state.stress + stressChange)),
            workTasksCompleted: Math.max(0, state.workTasksCompleted + workTaskChange) // Evitar negativos
        }));
        console.log(`State updated: E=${workLifeStore.getValue().energy}, S=${workLifeStore.getValue().stress}, WC=${workLifeStore.getValue().workTasksCompleted}`);
        this.checkEndConditions();
    }
    // Notificar cambios
    this.cdr.detectChanges();
  }
  // ===============================================================
  // FIN MÉTODO drop() CORREGIDO
  // ===============================================================


  checkEndConditions(): void {
     const state = workLifeStore.getValue();
     let newGameOver = state.gameOver;
     let newMessageKey: string | null = state.gameMessageKey;
     if (!newGameOver) {
         if (state.energy <= 0) { newGameOver = true; newMessageKey = 'WLB_GAME.LOSE_ENERGY'; }
         else if (state.stress >= 100) { newGameOver = true; newMessageKey = 'WLB_GAME.LOSE_STRESS'; }
         else if (state.workTasksCompleted >= state.workTasksRequired) { newGameOver = true; newMessageKey = 'WLB_GAME.WIN'; }
     }
     if (newGameOver && !state.gameOver) {
         workLifeStore.update(s => ({ ...s, gameOver: true, gameMessageKey: newMessageKey }));
         if (newMessageKey) { this.showFinalMessage(newMessageKey); }
     }
  }

  showFinalMessage(messageKey: string): void {
      forkJoin({
          title: this.translate.get(workLifeStore.getValue().energy <= 0 || workLifeStore.getValue().stress >= 100 ? 'FEEDBACK.GAME_OVER_TITLE' : 'FEEDBACK.GAME_COMPLETE_TITLE'),
          text: this.translate.get(messageKey),
          button: this.translate.get('FEEDBACK.GAME_COMPLETE_BUTTON')
      }).subscribe(results => {
          Swal.fire({
              icon: workLifeStore.getValue().energy <= 0 || workLifeStore.getValue().stress >= 100 ? 'error' : 'success',
              title: results.title || 'Game Over', text: results.text || 'Result...',
              confirmButtonText: results.button || 'OK'
          }).then((result) => {
              if (result.isConfirmed) { this.gameStarted = false; this.cdr.detectChanges(); }
          });
      });
  }

  // Helper para conectar listas de drop en HTML
  get dayDropLists(): string[] {
      return Array.from({ length: this.maxDays }, (_, i) => `day-${i + 1}`);
  }

  changeLanguage(lang: string): void {
    if (lang === this.currentLang) return;
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) { try { localStorage.setItem('preferredLanguage', lang); } catch (e) {} }
  }

} // Fin de la clase