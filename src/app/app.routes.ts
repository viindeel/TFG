// app/app.routes.ts
import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component'; // Asegúrate de crear estos componentes
import { LeccionesComponent } from './components/lecciones/lecciones.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { PaginaNoEncontradaComponent } from './components/pagina-no-encontrada/pagina-no-encontrada.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'lecciones', component: LeccionesComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: '', redirectTo: '/inicio', pathMatch: 'full' }, // Esta línea asegura que la ruta '' redirija a '/inicio'
  { path: '**', component: PaginaNoEncontradaComponent } // Ruta para cualquier otra URL
];