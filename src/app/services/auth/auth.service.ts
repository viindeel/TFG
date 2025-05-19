// src/app/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { User } from '../../models/user'; // Asegúrate que la ruta y el modelo User son correctos
// import { Role } from '../../models/role'; // Si tienes un modelo Role

// Define una interfaz para la respuesta del login del backend
export interface BackendLoginResponse {
  token: string;
  username: string;
  role: string; // Asumiendo que RoleName del backend (ADMIN, CLIENT) viene como string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private apiUrl = environment.apiUrl + '/api/users'; // Ya no se usa directamente aquí para login
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient, // Lo mantenemos por si AuthService necesita otras llamadas directas
    private tokenService: TokenService,
  ) {
    // Inicializa currentUserSubject con null o intentando cargar el usuario actual
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.loadCurrentUserOnAppInit(); // Renombrado para claridad
  }

  // Cambia el nombre para indicar que se ejecuta al inicio
  private loadCurrentUserOnAppInit(): void {
    const token = this.tokenService.getAccessToken();
    if (token) {
      const decodedToken = this.tokenService.decodeToken(token);
      if (decodedToken && !this.isTokenExpired(decodedToken)) { // Añade chequeo de expiración
        // El backend en LoginResponse devuelve username y role.
        // El token tiene 'sub' (username) y 'role'.
        const user = new User(
          decodedToken.id || Date.now(), // Si el token no tiene id, genera uno temporal o maneja de otra forma
          decodedToken.sub, // 'sub' es el nombre de usuario en el token JWT estándar
          decodedToken.email || '',
          [decodedToken.role], // El token tiene un claim 'role' como string, lo ponemos en un array
          decodedToken.firstName || '',
          decodedToken.lastName || '',
          decodedToken.address || ''
        );
        console.log("AuthService - loadCurrentUserOnAppInit - Usuario cargado desde token:", user);
        this.currentUserSubject.next(user);
      } else {
        console.log("AuthService - loadCurrentUserOnAppInit - Token inválido o expirado.");
        this.logout(); // Limpia si el token no es válido o expiró
      }
    } else {
      console.log("AuthService - loadCurrentUserOnAppInit - No hay token.");
      this.currentUserSubject.next(null); // Asegura que es null si no hay token
    }
  }

  // Nuevo método para manejar la respuesta del login
  public processLoginResponse(response: BackendLoginResponse): void {
    this.tokenService.saveAccessToken(response.token);
    const decodedToken = this.tokenService.decodeToken(response.token);

    if (decodedToken && !this.isTokenExpired(decodedToken)) {
      // Puedes usar 'response.username' y 'response.role' directamente si confías más en ellos
      // que en el contenido del token, aunque idealmente deberían coincidir.
      // El token es autocontenido y puede ser la fuente principal.
      const user = new User(
        decodedToken.id || Date.now(),
        decodedToken.sub, // Username del token
        decodedToken.email || '',
        [decodedToken.role], // Rol del token
        decodedToken.firstName || '',
        decodedToken.lastName || '',
        decodedToken.address || ''
      );
      console.log("AuthService - processLoginResponse - Usuario establecido:", user);
      this.currentUserSubject.next(user);

      // Considera si UserStateService sigue siendo necesario.
      // Si tu User model en el frontend es lo que usas, y se construye desde el token,
      // UserStateService (sessionStorage) podría ser redundante.
      // Si decides mantenerlo:
      // this.userStateService.save(user.username, user.roles[0] as string); // Asumiendo que User tiene 'roles' como array
    } else {
      console.error("AuthService - processLoginResponse - El token recibido es inválido o expirado.");
      // Manejar este caso improbable, quizás forzando un logout
      this.logout();
    }
  }

  logout(): void {
    this.tokenService.removeToken();
    this.currentUserSubject.next(null);
    // Si usas UserStateService:
    // this.userStateService.removeSession();
    console.log("AuthService - logout - Sesión cerrada");
  }

  isAuthenticated(): boolean {
    const token = this.tokenService.getAccessToken();
    if (!token) return false;
    const decoded = this.tokenService.decodeToken(token);
    return decoded && !this.isTokenExpired(decoded);
  }

  // Chequeo de expiración del token
  private isTokenExpired(decodedToken: any): boolean {
    if (!decodedToken || !decodedToken.exp) {
      return true; // Si no hay 'exp', considerarlo expirado o inválido
    }
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);
    return expirationDate.valueOf() < new Date().valueOf();
  }

  // hasRole se basa en el currentUserSubject
  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    // Asume que tu modelo User tiene una propiedad 'roles' (array de strings) o un método hasRole.
    // Si User tiene 'roles' como array de strings:
    return user ? user.roles.includes(roleName) : false;
    // Si User tiene un método user.hasRole(roleName):
    // return user ? user.hasRole(roleName) : false;
  }
}