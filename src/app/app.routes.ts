import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LeccionesComponent } from './components/lecciones/lecciones.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { PaginaNoEncontradaComponent } from './components/pagina-no-encontrada/pagina-no-encontrada.component';
import { BrainstormingLessonComponent } from './components/lessons/brainstorming-lesson/brainstorming-lesson.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { PhrasalVerbFactoryComponent } from './components/lessons/phrasal-verb-factory/phrasal-verb-factory.component';
import { MonopolyGameComponent } from './components/lessons/monopoly-game/monopoly-game.component';
import { WorkLifeBalanceGameComponent } from './components/lessons/work-life-balance-game/work-life-balance-game.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'lecciones', component: LeccionesComponent },
  { path: 'lecciones/brainstorming', component: BrainstormingLessonComponent },
  { path: 'lecciones/phrasal-verb-factory', component: PhrasalVerbFactoryComponent }, // <-- Añadir ruta
  {path: 'lecciones/monopoly-game', component: MonopolyGameComponent}, // <-- Añadir ruta
  {path: 'lecciones/work-life-balance', component: WorkLifeBalanceGameComponent}, // <-- Añadir ruta
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', component: PaginaNoEncontradaComponent }
];