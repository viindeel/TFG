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
import { authGuard } from './guards/auth/auth.guard';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'lecciones', component: LeccionesComponent, canActivate: [authGuard] }, // Añadir guardia de autenticación para que no puedan acceder sin iniciar sesión
  { path: 'lecciones/brainstorming', component: BrainstormingLessonComponent, canActivate: [authGuard]  },
  { path: 'lecciones/phrasal-verb-factory', component: PhrasalVerbFactoryComponent, canActivate: [authGuard] },
  {path: 'lecciones/monopoly-game', component: MonopolyGameComponent, canActivate: [authGuard]},
  {path: 'lecciones/work-life-balance', component: WorkLifeBalanceGameComponent, canActivate: [authGuard]},
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', component: PaginaNoEncontradaComponent }
];