// app/app.routes.ts
import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component'; // Asegúrate de crear estos componentes
import { LeccionesComponent } from './components/lecciones/lecciones.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { PaginaNoEncontradaComponent } from './components/pagina-no-encontrada/pagina-no-encontrada.component';
import { BrainstormingLessonComponent } from './components/lessons/brainstorming-lesson/brainstorming-lesson.component'; // Importa el nuevo componente
import { EquilibrioVidaLaboralComponent } from './components/lessons/equilibrio-vida-laboral/equilibrio-vida-laboral.component';
import { MonopoliosLessonComponent } from './components/lessons/monopolios-lesson/monopolios-lesson.component';


export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'lecciones', component: LeccionesComponent },
  { path: 'lecciones/brainstorming', component: BrainstormingLessonComponent }, // Nueva ruta
  { path: 'lecciones/monopolios', component: MonopoliosLessonComponent }, // Nueva ruta
  { path: 'lecciones/equilibrio-vida-laboral', component: EquilibrioVidaLaboralComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' }, // Esta línea asegura que la ruta '' redirija a '/inicio'
  { path: '**', component: PaginaNoEncontradaComponent } // Ruta para cualquier otra URL
];