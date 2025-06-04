import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit {

  showVideoModal: boolean = false;

  sanitizedVideoUrl: SafeResourceUrl | undefined;

  private videoPath: string = 'assets/videos/video_tfg.mp4';

  constructor(private snackBar: MatSnackBar, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoPath);

    this.snackBar.open('¡Bienvenido a Palabras al poder! ¿Cúanto serás capaz de aprender? ', 'Cerrar', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['welcome-snackbar']
    });
  }

  openVideo(): void {
    this.showVideoModal = true;
  }

  closeVideo(): void {
    this.showVideoModal = false;
  }
}