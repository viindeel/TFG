import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Importa RouterLink


@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink], // Añade RouterLink a los imports
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.snackBar.open('¡Bienvenido a Palabras al poder! ¿Cúanto serás capaz de aprender? ', 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
      });
  }
}