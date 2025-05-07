// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // Importa OnInit y OnDestroy
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router'; // Importa Router
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar'; // Mantén si lo usas
import { Subscription } from 'rxjs'; // Importa Subscription
import { AuthService } from './services/auth/auth.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    // Asegúrate de que cualquier otro componente standalone usado directamente en app.component.html esté importado aquí
  ],
  templateUrl: './app.component.html', // La ruta a tu archivo HTML principal
  styleUrls: ['./app.component.scss'],
})
// Implementa OnInit y OnDestroy
export class AppComponent implements OnInit, OnDestroy {
  title = 'Palabras al Poder';

  // Propiedades para manejar el estado de autenticación y el nombre de usuario
  isLoggedIn: boolean = false;
  username: string | null = null;

  // Suscripción para gestionar la limpieza al destruir el componente
  private authSubscription: Subscription;

  // Inyecta Router, MatSnackBar y AuthService
  constructor(
    private router: Router, // Inyecta Router
    private snackBar: MatSnackBar, // Mantén si lo usas
    private authService: AuthService // Inyecta el AuthService
  ) {
    // **Suscripción al estado de autenticación**
    // Se hace en el constructor para que empiece a escuchar los cambios tan pronto como el servicio esté disponible.
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user; // true si user no es null/undefined, false en caso contrario
      this.username = user ? user.username : null; // Guarda el nombre de usuario o null
      console.log(`Auth state updated: isLoggedIn=${this.isLoggedIn}, username=${this.username}`); // Opcional: para depuración
      // No necesitas cdr.detectChanges() en componentes standalone a menos que haya lógica asíncrona compleja fuera de observables
    });
  }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    // Lógica adicional de inicialización si es necesaria.
    // La suscripción principal ya está en el constructor.
  }

  // Método que se ejecuta al destruir el componente para limpiar suscripciones
  ngOnDestroy(): void {
    console.log("AppComponent - ngOnDestroy - Unsubscribing authSubscription."); // Opcional: para depuración
    // Es crucial desuscribirse para evitar fugas de memoria
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Métodos de navegación (adaptados de tu header-cliente)
  irAlRegistro(): void {
    this.router.navigate(['/registro']);
  }

  irAlLogin(): void {
    // Opcional: guardar la URL actual antes de ir a login para redirigir de vuelta después
    // sessionStorage.setItem('returnUrl', this.router.url); // Descomenta si necesitas esta funcionalidad
    this.router.navigate(['/login']);
  }

  // Método para cerrar sesión
  logout(): void {
    console.log("AppComponent - logout - Calling AuthService logout."); // Opcional: para depuración
    this.authService.logout(); // Llama al método logout del AuthService
    this.router.navigate(['/']); // Redirige a la página de inicio después de cerrar sesión
    // Si tu header original tenía un menú desplegable para el usuario logueado,
    // aquí podrías añadir lógica para cerrarlo si fuera necesario.
  }

  // Si tu header original tenía lógica adicional (ej: carrito), adáptala aquí si app.component la maneja.
  // updateCartItemCount(): void { ... }

}