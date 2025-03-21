import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr'; // Importa provideToastr
import { routes } from './app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    provideToastr() // Añade provideToastr a los providers
  ]
}).catch(err => console.error(err));