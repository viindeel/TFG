import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-lecciones',
  standalone: true,
  imports: [RouterModule, RouterLink],
  templateUrl: './lecciones.component.html',
  styleUrl: './lecciones.component.scss'
})
export class LeccionesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}