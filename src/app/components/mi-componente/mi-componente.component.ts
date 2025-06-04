// app/components/mi-componente.component.ts
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, CommonModule],
  template: `
    <button mat-raised-button color="primary">Botón Primario</button>
    <mat-card>
      <mat-card-title>Título de la Tarjeta</mat-card-title>
      <mat-card-content>Contenido de la Tarjeta.</mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./mi-componente.component.scss']
})
export class MiComponente { }