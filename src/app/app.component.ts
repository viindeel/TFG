import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
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

  isDropdownOpen: boolean = false; 


 // Suscribe a cambios de usuario autenticado
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private elementRef: ElementRef
  ) {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user ? user.username : null;
      if (!this.isLoggedIn) {
        this.isDropdownOpen = false;
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

   // Abre/cierra el menú de usuario
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

   // Cierra el menú de usuario
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // Cierra sesión y el menú
  logoutAndCloseDropdown(): void {
    console.log("AppComponent - logoutAndCloseDropdown - Calling AuthService logout.");
    this.authService.logout();
    this.closeDropdown();
    this.router.navigate(['/']);
  }

   // Cierra el menú si se hace clic fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen && !this.elementRef.nativeElement.querySelector('.user-dropdown').contains(event.target)) {
      this.closeDropdown();
    }
  }
}