// src/app/app.component.ts
import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core'; // Añade HostListener y ElementRef
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Palabras al Poder';
  isLoggedIn: boolean = false;
  username: string | null = null;
  private authSubscription: Subscription;

  isDropdownOpen: boolean = false; // Nueva propiedad para el estado del desplegable

  // Inyecta ElementRef para detectar clics fuera del desplegable
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private elementRef: ElementRef // Inyecta ElementRef
  ) {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user ? user.username : null;
      if (!this.isLoggedIn) {
        this.isDropdownOpen = false; // Cierra el desplegable si el usuario cierra sesión
      }
      console.log(`Auth state updated: isLoggedIn=${this.isLoggedIn}, username=${this.username}`);
    });
  }

  ngOnInit(): void {
    // Lógica de inicialización
  }

  ngOnDestroy(): void {
    console.log("AppComponent - ngOnDestroy - Unsubscribing authSubscription.");
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  irAlRegistro(): void {
    this.router.navigate(['/registro']);
  }

  irAlLogin(): void {
    this.router.navigate(['/login']);
  }

  // Método para mostrar/ocultar el desplegable
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Método para cerrar el desplegable (útil si navegas desde un ítem del menú)
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // Método para cerrar sesión y también cerrar el desplegable
  logoutAndCloseDropdown(): void {
    console.log("AppComponent - logoutAndCloseDropdown - Calling AuthService logout.");
    this.authService.logout();
    this.closeDropdown(); // Cierra el desplegable
    this.router.navigate(['/']);
  }

  // Escucha los clics en todo el documento para cerrar el desplegable si se hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Comprueba si el clic fue fuera del contenedor del desplegable
    // y si el desplegable está abierto.
    // '.user-dropdown' es la clase que le dimos al div contenedor en el HTML.
    if (this.isDropdownOpen && !this.elementRef.nativeElement.querySelector('.user-dropdown').contains(event.target)) {
      this.closeDropdown();
    }
  }
}