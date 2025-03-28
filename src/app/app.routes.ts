import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LeccionesComponent } from './components/lecciones/lecciones.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { PaginaNoEncontradaComponent } from './components/pagina-no-encontrada/pagina-no-encontrada.component';
import { BrainstormingLessonComponent } from './components/lessons/brainstorming-lesson/brainstorming-lesson.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'lecciones', component: LeccionesComponent },
  { path: 'lecciones/brainstorming', component: BrainstormingLessonComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: '**', component: PaginaNoEncontradaComponent }
];