import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // Usaremos MatSnackBar en lugar de PopupService

// Importa tus interfaces y servicios si ya los tienes o los vas a crear
// import { CredentialsService } from '../../services/auth/credentials.service';
// import { TokenService } from '../../services/auth/token.service';
// import { UserStateService } from '../../services/auth/user-state.service';
// import { LoginInterface } from '../../services/auth/interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    // private credentialsService: CredentialsService, // Descomentar cuando crees el servicio
    // private tokenService: TokenService, // Descomentar cuando crees el servicio
    private router: Router,
    private snackBar: MatSnackBar // Usamos MatSnackBar
    // private userStateService: UserStateService, // Descomentar cuando crees el servicio
    // private popupService: PopupService // Ya no lo usaremos
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      return;
    }

    const loginData = this.loginForm.value;
    console.log('Datos de login:', loginData); // Por ahora, solo mostramos los datos en la consola

    // Cuando tengas tu servicio de autenticación (credentialsService), descomenta el siguiente bloque y adapta la lógica
    /*
    this.credentialsService.login(loginData as LoginInterface).subscribe({
      next: (data) => {
        this.snackBar.open('Cargando...', 'Espere', { duration: 1500 });

        setTimeout(() => {
          // Aquí guardarías los tokens y el estado del usuario (con tokenService y userStateService)
          console.log('Login exitoso:', data);
          this.snackBar.open('¡Bienvenido!', 'Cerrar', { duration: 2000 });
          // Redirigir según el rol (ADMIN o CLIENT)
          if (data.role === "ADMIN") this.router.navigate(['/app/control-panel']); // Ajusta la ruta
          if (data.role === "CLIENT") this.router.navigate(['/']); // Ajusta la ruta
        }, 1500);
      },
      error: err => {
        let message;
        if (err.error == "Invalid password") {
          message = "Contraseña incorrecta, inténtelo de nuevo.";
        }
        else if (err.error == "User not found") {
          message = "El usuario no existe. Compruebe los datos o regístrese en la plataforma";
        }
        else {
          message = err.error;
        }
        this.snackBar.open('Ups, ha ocurrido un error', message, {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
    */

    // Por ahora, como no tenemos backend, simulamos un login exitoso después de 1 segundo
    this.snackBar.open('Intentando iniciar sesión...', 'Espere', { duration: 1000 });
    setTimeout(() => {
      this.snackBar.open('¡Simulación de inicio de sesión exitosa!', 'Cerrar', { duration: 2000 });
      this.router.navigate(['/inicio']); // Redirigimos al inicio como ejemplo
    }, 1500);
  }

}