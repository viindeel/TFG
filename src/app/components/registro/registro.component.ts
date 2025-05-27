import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatSnackBar } from '@angular/material/snack-bar'; // Usaremos MatSnackBar
import { Router } from '@angular/router';
 import { CredentialsService } from '../../services/auth/credentials.service';
 import { UserInterface } from '../../services/auth/interfaces';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './registro.component.html',       
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {

  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private credentialsService: CredentialsService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      roleName: ['CLIENT', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
  }


  submit() {
    if (this.registerForm.invalid) {
      return;
    }

    const registerData = this.registerForm.value;
    console.log('Datos de registro:', registerData);

  
    this.credentialsService.register(registerData as UserInterface).subscribe({
      next: (data) => {
        console.log('Registro exitoso:', data);
        this.snackBar.open('Registro completado con éxito. ¡Bienvenido!', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: err => {
        console.error('Error durante el registro:', err);
        let message = 'Ha ocurrido un error durante el registro. Inténtelo de nuevo.';
        if (err?.error) {
          message = err.error;
        }
        this.snackBar.open('Error de registro', message, {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

}