import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
// Quitamos provideRouter y routes de aquí, ya que vienen de appConfig
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { appConfig } from './app/app.config'; // <--- Importa la configuración base
import { mergeApplicationConfig } from '@angular/core'; // <--- Importa la función para fusionar

// Fusiona la configuración base (appConfig) con los providers específicos del navegador
const browserAppConfig = mergeApplicationConfig(appConfig, {
  providers: [
      importProvidersFrom(BrowserAnimationsModule), // Mantenemos este específico del navegador
      provideToastr({ // Puedes añadir configuración específica de Toastr aquí
          timeOut: 3000,
          positionClass: 'toast-top-right',
          preventDuplicates: true,
        })
  ]
});

// Arranca la aplicación usando la configuración fusionada
bootstrapApplication(AppComponent, browserAppConfig) // <--- Usa browserAppConfig
  .catch(err => console.error(err));