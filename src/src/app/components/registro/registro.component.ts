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
    private credentialsService: CredentialsService, // Descomentar cuando crees el servicio
    private snackBar: MatSnackBar, // Usamos MatSnackBar
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
    console.log('Datos de registro:', registerData); // Por ahora, solo mostramos los datos en la consola

  
    this.credentialsService.register(registerData as UserInterface).subscribe({
      next: (data) => {
        console.log('Registro exitoso:', data);
        this.snackBar.open('Registro completado con éxito. ¡Bienvenido!', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/login']); // Redirigir a la página de login
      },
      error: err => {
        console.error('Error durante el registro:', err);
        let message = 'Ha ocurrido un error durante el registro. Inténtelo de nuevo.';
        if (err?.error) {
          message = err.error; // Puedes intentar mostrar un mensaje de error más específico del backend
        }
        this.snackBar.open('Error de registro', message, {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });

    // Por ahora, como no tenemos backend, simulamos un registro exitoso después de 1 segundo
    this.snackBar.open('Intentando registrar usuario...', 'Espere', { duration: 1000 });
    setTimeout(() => {
      this.snackBar.open('¡Simulación de registro exitosa!', 'Cerrar', { duration: 2000 });
      this.router.navigate(['/login']); // Redirigimos a la página de login como ejemplo
    }, 1500);
  }

}