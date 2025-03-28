import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Palabras al Poder';

  constructor(private snackBar: MatSnackBar) {}

  mostrarNotificacion() {
    this.snackBar.open('¡Hola desde MatSnackBar!', 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }
}
