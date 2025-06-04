import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CredentialsService } from '../../services/auth/credentials.service';
import { AuthService, BackendLoginResponse }
  from '../../services/auth/auth.service';
import { LoginInterface } from '../../services/auth/interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private credentialsService: CredentialsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      this.snackBar.open('Por favor, completa todos los campos.', 'Cerrar', { duration: 3000 });
      return;
    }

    const loginData = this.loginForm.value as LoginInterface;


    this.credentialsService.login(loginData).subscribe({
      next: (response: BackendLoginResponse) => {
        console.log('Login exitoso:', response);

        // AuthService se encarga de guardar token y actualizar el estado del usuario
        this.authService.processLoginResponse(response);

        this.snackBar.open(`¡Bienvenido, ${response.username}!`, 'Cerrar', { duration: 3000 });

        // Redirigir según el rol. El app.component reaccionará al cambio en currentUser$ aun que aqui tenemos la misma
        if (response.role === "ADMIN") {
          this.router.navigate(['/']); // O a una ruta específica de admin
        } else if (response.role === "CLIENT") {
          this.router.navigate(['/']); // O a una ruta específica de cliente
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        let message;
        // El backend devuelve el mensaje de error directamente en err.error para los casos de "Invalid password" y "User not found"
        if (err.status === 401 || err.status === 400) { // Errores comunes de credenciales
            message = err.error || "Credenciales incorrectas o usuario no encontrado.";
        } else if (err.error && typeof err.error === 'string') {
            message = err.error;
        }
         else {
          message = "Error desconocido al intentar iniciar sesión. Inténtalo más tarde.";
        }
        console.error("Error en login:", err);
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}