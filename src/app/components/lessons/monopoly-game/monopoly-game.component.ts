import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, NgClass, isPlatformBrowser } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js/auto';
import Swal from 'sweetalert2';
import { Subscription, forkJoin, interval, timer } from 'rxjs';
import { take } from 'rxjs/operators';


interface MonopolyScenario {
  id: number;
  textKey: string;
  type: 'good' | 'bad' | 'neutral';
  effect: { [companyIndex: number]: number };
}

@Component({
  selector: 'app-monopoly-game',
  standalone: true,
  imports: [CommonModule, NgClass, TranslateModule],
  templateUrl: './monopoly-game.component.html',
  styleUrls: ['./monopoly-game.component.scss']
})
export class MonopolyGameComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('marketShareCanvas') marketShareCanvas!: ElementRef<HTMLCanvasElement>;
  marketShareChart: Chart | null = null;

  // Datos y etiquetas para el gráfico
  companyLabelsKeys: string[] = ['Tu Empresa', 'Competidor A', 'Competidor B', 'Otros'];
  companyLabels: string[] = [...this.companyLabelsKeys];
  marketShares: number[] = [40, 30, 20, 10];

  allScenarios: MonopolyScenario[] = [
    { id: 1, textKey: 'SCENARIOS.MONOPOLY.BUYOUT', type: 'bad', effect: { 0: +15, 1: -10, 2: -5 } },
    { id: 2, textKey: 'SCENARIOS.MONOPOLY.INNOVATION', type: 'good', effect: { 0: +5, 1: -2, 2: -2, 3: -1 } },
    { id: 3, textKey: 'SCENARIOS.MONOPOLY.PRICE_FIXING', type: 'bad', effect: { 1: -10, 2: -10, 0: +5 } }, // Penalización a otros, bonus pequeño a "ti" por no participar?
    { id: 4, textKey: 'SCENARIOS.MONOPOLY.PREDATORY_PRICING', type: 'bad', effect: { 0: +10, 1: -15 } },
    { id: 5, textKey: 'SCENARIOS.MONOPOLY.NEW_ENTRY', type: 'good', effect: { 3: +8, 0: -3, 1: -3, 2: -2 } },
    { id: 6, textKey: 'SCENARIOS.MONOPOLY.LOBBYING', type: 'bad', effect: { 0: +5, 3: -5 } }, // Ganas influencia, perjudica a 'Otros'/sociedad
    { id: 7, textKey: 'SCENARIOS.MONOPOLY.PATENT_TROLL', type: 'bad', effect: { 0: +8, 3: -8 } }, // Ganas de demandas, perjudica innovación ('Otros')
    { id: 8, textKey: 'SCENARIOS.MONOPOLY.OPEN_SOURCE', type: 'good', effect: { 0: +3, 1: +1, 2: +1, 3: +1 } }, // Beneficio pequeño para todos
    { id: 9, textKey: 'SCENARIOS.MONOPOLY.GREEN_INVEST', type: 'good', effect: { 0: +4, 3: -1 } }, // Mejora imagen propia, coste pequeño a 'Otros'? O neutral?
    { id: 10, textKey: 'SCENARIOS.MONOPOLY.PRIVACY_FINE', type: 'neutral', effect: { 0: -10, 3: +5, 1: +2, 2: +3 } } // Malo para ti, bueno para otros
  ];
  currentScenario: MonopolyScenario | null = null;
  currentScenarioText: string = '';

  // Estado del juego
  playerScore: number = 0;
  timeLeft: number = 0;
  readonly reactionTime: number = 8;
  gameActive: boolean = false; // Empieza inactivo
  scenarioCount: number = 0; // Contador de escenarios
  readonly maxScenarios: number = 10; // Límite de escenarios
  gameResult: { winner: string, playerRank: number, finalScore: number } | null = null; // Resultado final

  private timerSubscription: Subscription | undefined;
  private langChangeSubscription: Subscription | undefined;
  currentLang: string = 'en';

  constructor(
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
        Chart.register(...registerables);
    }

    // Forzar carga inicial en inglés
    this.currentLang = 'en';
    this.translate.use('en').subscribe({ // Forzar la carga del inglés
        next: () => {
            console.log("MonopolyGame: Forced English language loaded.");
            this.loadInitialData(); // Cargar etiquetas AHORA que inglés está listo
            // Suscribirse a cambios futuros DESPUÉS de forzar el inicial
            this.subscribeToLangChanges();
        },
        error: (err) => {
            console.error("MonopolyGame: Error forcing English language:", err);
            // Si falla, intentar cargar datos igualmente y suscribirse
            this.loadInitialData();
            this.subscribeToLangChanges();
        }
    });
  }

  // Suscripción separada para que no se llame antes de la carga inicial forzada
  subscribeToLangChanges() {
      this.langChangeSubscription = this.translate.onLangChange.subscribe(event => {
          if (this.currentLang === event.lang) return; // Evitar recarga si ya estamos en él
          console.log(`MonopolyGame: Language changed via event to ${event.lang}, reloading labels/scenario...`);
          this.currentLang = event.lang;
          this.loadInitialData(); // Recargar etiquetas del gráfico en nuevo idioma
          this.translateCurrentScenario(); // Retraducir escenario si el juego está activo
      });
  }


  ngAfterViewInit(): void {
    console.log("MonopolyGame: ngAfterViewInit completed.");
    // Gráfico se inicializa en startGame después de que el canvas es visible
  }

  ngOnDestroy(): void {
    console.log('MonopolyGame: ngOnDestroy called. Unsubscribing...');
    this.timerSubscription?.unsubscribe();
    this.langChangeSubscription?.unsubscribe();
    // Destruir gráfico al salir del componente
    if (isPlatformBrowser(this.platformId)) {
      this.marketShareChart?.destroy();
      this.marketShareChart = null;
    }
  }

  loadInitialData() {
    // Traducir etiquetas del gráfico
    const companyLabelTranslationKeys = this.companyLabelsKeys.map(l => `COMPANIES.${l.replace(/\s+/g, '_').toUpperCase()}`);
    this.translate.get(companyLabelTranslationKeys).subscribe(translations => {
        this.companyLabels = this.companyLabelsKeys.map(l => {
            const key = `COMPANIES.${l.replace(/\s+/g, '_').toUpperCase()}`;
            return translations[key] || l;
        });
        // Si el gráfico ya existe, actualizar etiquetas (necesario por si cambia idioma y recarga)
        if (this.marketShareChart) {
            this.marketShareChart.data.labels = this.companyLabels;
            this.marketShareChart.update('none');
        }
   });
    console.log("MonopolyGame: Initial data structure ready. Waiting for Start button.");
  }

  startGame() {
    console.log("MonopolyGame: Starting game (or Play Again)!");

    // Destruir gráfico anterior si existe
    if (isPlatformBrowser(this.platformId)) {
         if (this.marketShareChart) {
             this.marketShareChart.destroy(); // Destruir instancia Chart.js
             this.marketShareChart = null;    // Poner la variable a null
             console.log("MonopolyGame: Previous chart instance destroyed for restart.");
         }
    }

    // Resetear estado del juego
    this.playerScore = 0;
    this.scenarioCount = 0;
    this.gameResult = null;
    this.gameActive = true; // Marcar como activo
    this.marketShares = [40, 30, 20, 10]; // Resetear cuotas

    // Forzar detección para que Angular renderice el div con *ngIf="gameActive" y cree el <canvas>
    this.cdr.detectChanges();

    // Usar setTimeout para asegurar que el canvas existe en el DOM antes de inicializar
    setTimeout(() => {
        if (this.gameActive && isPlatformBrowser(this.platformId)) {
            // Inicializar el gráfico AHORA
            // Como this.marketShareChart es null, esta llamada creará la instancia
            this.initializeChart();
        }
    }, 0); // Timeout 0 ejecuta esto en el siguiente ciclo de eventos, después del renderizado

    this.nextScenario(); // Lanzar el primer escenario
  }

  initializeChart(): void {
    // Comprobación extra por seguridad
    if (this.marketShareChart || !isPlatformBrowser(this.platformId)) {
         return;
    }
    console.log("MonopolyGame: Initializing chart...");

    if (this.marketShareCanvas && this.marketShareCanvas.nativeElement) {
      const context = this.marketShareCanvas.nativeElement.getContext('2d');
      if (context) {
        // Configuración del gráfico
        const chartData: ChartData = {
            labels: this.companyLabels,
            datasets: [{
                label: this.translate.instant('MONOPOLY_GAME.MARKET_SHARE'),
                data: this.marketShares,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)', 'rgba(153, 102, 255, 0.7)'
                 ],
                 borderColor: '#fff', borderWidth: 1
            }]
        };
        const chartConfig: ChartConfiguration = {
          type: 'pie', data: chartData,
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: function(context) {
                      let label = context.label || ''; if (label) { label += ': '; }
                      if (context.parsed !== null) { label += context.parsed + '%'; } return label;
                  }
                }
              }
            }
          }
        };
        // Crear la nueva instancia
        this.marketShareChart = new Chart(context, chartConfig);
        console.log("MonopolyGame: Chart initialized successfully.");
      } else { console.error("MonopolyGame: Could not get 2D context."); }
    } else { console.error("MonopolyGame: Chart canvas element not found in initializeChart!"); }
  }

  updateChart(): void {
    if (!this.marketShareChart || !isPlatformBrowser(this.platformId)) return;

    // Normalizar cuotas
    const sum = this.marketShares.reduce((a, b) => Math.max(0, a) + Math.max(0, b), 0);
    if (sum > 0) {
        this.marketShares = this.marketShares.map(share => Math.max(0, Math.round((share / sum) * 100)));
        const finalSum = this.marketShares.reduce((a,b) => a+b, 0);
        if(finalSum !== 100 && this.marketShares.length > 0) { this.marketShares[this.marketShares.length - 1] += (100 - finalSum); }
    } else { this.marketShares.fill(100 / this.marketShares.length); }

    // Actualizar gráfico
    this.marketShareChart.data.labels = this.companyLabels;
    this.marketShareChart.data.datasets[0].data = this.marketShares;
    this.marketShareChart.update('none');
  }

  nextScenario(): void {
    if (!this.gameActive) return;
    this.timerSubscription?.unsubscribe();

    if (this.scenarioCount >= this.maxScenarios) { this.endGame(); return; }
    this.scenarioCount++;

    this.currentScenario = null;
    this.translate.get('MONOPOLY_GAME.LOADING_SCENARIO').subscribe(text => {
         this.currentScenarioText = text || '...'; this.cdr.detectChanges();
    });

    timer(500).subscribe(() => {
      if (!this.gameActive) return;
      const randomIndex = Math.floor(Math.random() * this.allScenarios.length);
      this.currentScenario = this.allScenarios[randomIndex];
      this.translateCurrentScenario();
    });
  }

  translateCurrentScenario() {
    if (this.currentScenario) {
      this.translate.get(this.currentScenario.textKey).subscribe({
        next: (translation: string) => {
          this.currentScenarioText = translation || `[!${this.currentScenario?.textKey}!]`;
          this.startTimer(); this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Error translating scenario:", error);
          this.currentScenarioText = `[!${this.currentScenario?.textKey}!]`;
          this.startTimer(); this.cdr.detectChanges();
        }
    });
    } else { this.currentScenarioText = ''; this.cdr.detectChanges(); }
  }

  startTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.timeLeft = this.reactionTime;
    this.cdr.detectChanges();
    this.timerSubscription = interval(1000).pipe(take(this.reactionTime + 1)).subscribe({
        next: () => { if (this.timeLeft > 0) { this.timeLeft--; this.cdr.detectChanges(); } },
        complete: () => { if (this.timeLeft <= 0 && this.gameActive && this.currentScenario) { this.timeRanOut(); } }
      });
  }

  playerAction(action: 'allow' | 'bust'): void {
    if (!this.currentScenario || !this.gameActive || this.timeLeft <= 0) return;
    this.timerSubscription?.unsubscribe();
    let correct = ((action === 'bust' && this.currentScenario.type === 'bad') || (action === 'allow' && this.currentScenario.type !== 'bad'));
    if (correct) {
      this.playerScore += 100 + this.timeLeft * 10; this.showFeedback(true, '¡Acción Correcta!');
      Object.entries(this.currentScenario.effect).forEach(([i, change]) => { const index = parseInt(i, 10); if (this.marketShares[index] !== undefined) this.marketShares[index] += change; });
    } else {
      this.playerScore -= 50; this.showFeedback(false, '¡Acción Incorrecta!');
    }
    this.updateChart();
    this.nextScenario();
  }

  timeRanOut(): void {
    if (!this.gameActive) return;
    console.log('Time ran out!'); this.playerScore -= 25;
    this.showFeedback(false, '¡Tiempo Agotado!');
    this.nextScenario();
  }

  endGame(): void {
    console.log("MonopolyGame: Ending game!"); this.gameActive = false;
    this.timerSubscription?.unsubscribe(); this.currentScenario = null; this.currentScenarioText = '';

    let maxShare = -1, winnerIndex = -1;
    this.marketShares.forEach((share, index) => { if (share > maxShare) { maxShare = share; winnerIndex = index; } });
    const winnerLabel = (winnerIndex !== -1) ? this.companyLabels[winnerIndex] : 'N/A';
    const playerScore = this.marketShares[0]; let rank = 1;
    for (let i = 1; i < this.marketShares.length; i++) { if (this.marketShares[i] > playerScore) rank++; }

    this.gameResult = { winner: winnerLabel, playerRank: rank, finalScore: this.playerScore };
    console.log("Game Result:", this.gameResult);
    this.cdr.detectChanges();
  }

  showFeedback(isCorrect: boolean, defaultTitle: string): void {
     const titleKey = isCorrect ? 'FEEDBACK.CORRECT_TITLE' : 'FEEDBACK.INCORRECT_TITLE';
     this.translate.get(titleKey).subscribe(title => {
        Swal.fire({ icon: isCorrect ? 'success' : 'error', title: title || defaultTitle, toast: true, position: 'top', showConfirmButton: false, timer: 1000, timerProgressBar: false });
     });
  }

  changeLanguage(lang: string): void {
    if (lang === this.currentLang) return;
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) { try { localStorage.setItem('preferredLanguage', lang); } catch (e) {} }
  }

}