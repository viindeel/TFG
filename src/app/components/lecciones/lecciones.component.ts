import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importa RouterModule

@Component({
  selector: 'app-lecciones', // O el selector que tengas
  standalone: true,
  imports: [RouterModule], // Añade RouterModule a los imports
  templateUrl: './lecciones.component.html',
  styleUrl: './lecciones.component.scss'
})
export class LeccionesComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}