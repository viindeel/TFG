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
import { CrucigramaComponent } from './components/lessons/crucigrama/crucigrama.component';
import { MemoramaIdiomasComponent } from './components/lessons/memorama-idiomas/memorama-idiomas.component';
import { QuickTranslationGameComponent } from './components/lessons/quick-translation-game/quick-translation-game.component';
import { SopaDeLetrasComponent } from './components/lessons/sopa-de-letras/sopa-de-letras.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'lecciones', component: LeccionesComponent, canActivate: [authGuard] }, // Añadir guard de autenticación para que no puedan acceder sin iniciar sesión
  { path: 'lecciones/brainstorming', component: BrainstormingLessonComponent, canActivate: [authGuard]  },
  { path: 'lecciones/phrasal-verb-factory', component: PhrasalVerbFactoryComponent, canActivate: [authGuard] },
  {path: 'lecciones/monopoly-game', component: MonopolyGameComponent, canActivate: [authGuard]},
  {path: 'lecciones/work-life-balance', component: WorkLifeBalanceGameComponent, canActivate: [authGuard]},
  {path: 'lecciones/crucigrama', component: CrucigramaComponent, canActivate: [authGuard]},
  {path: 'lecciones/sopa-de-letras', component: SopaDeLetrasComponent, canActivate: [authGuard]},
  {path: 'lecciones/memorama-idiomas', component: MemoramaIdiomasComponent, canActivate: [authGuard]},
  {path: 'lecciones/quick-translation', component: QuickTranslationGameComponent, canActivate: [authGuard]},
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', component: PaginaNoEncontradaComponent }
];