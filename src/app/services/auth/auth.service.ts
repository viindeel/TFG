// src/app/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { User } from '../../models/user';

export interface BackendLoginResponse {
  token: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient, 
    private tokenService: TokenService,
  ) {
    // Inicializa currentUserSubject con null o intentando cargar el usuario actual
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.loadCurrentUserOnAppInit();
  }

   // Carga usuario desde token al iniciar
  private loadCurrentUserOnAppInit(): void {
    const token = this.tokenService.getAccessToken();
    if (token) {
      const decodedToken = this.tokenService.decodeToken(token);
      if (decodedToken && !this.isTokenExpired(decodedToken)) { // Añade chequeo de expiración
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

    // Guarda token y usuario tras login
  public processLoginResponse(response: BackendLoginResponse): void {
    this.tokenService.saveAccessToken(response.token);
    const decodedToken = this.tokenService.decodeToken(response.token);

    if (decodedToken && !this.isTokenExpired(decodedToken)) {
      const user = new User(
        decodedToken.id || Date.now(),
        decodedToken.sub,
        decodedToken.email || '',
        [decodedToken.role],
        decodedToken.firstName || '',
        decodedToken.lastName || '',
        decodedToken.address || ''
      );
      console.log("AuthService - processLoginResponse - Usuario establecido:", user);
      this.currentUserSubject.next(user);
    } else {
      console.error("AuthService - processLoginResponse - El token recibido es inválido o expirado.");
      this.logout();
    }
  }

  // Elimina token y usuario
  logout(): void {
    this.tokenService.removeToken();
    this.currentUserSubject.next(null);

    console.log("AuthService - logout - Sesión cerrada");
  }

    // Devuelve true si hay token válido
  isAuthenticated(): boolean {
    const token = this.tokenService.getAccessToken();
    if (!token) return false;
    const decoded = this.tokenService.decodeToken(token);
    return decoded && !this.isTokenExpired(decoded);
  }

   // Comprueba expiración del token
  private isTokenExpired(decodedToken: any): boolean {
    if (!decodedToken || !decodedToken.exp) {
      return true;
    }
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);
    return expirationDate.valueOf() < new Date().valueOf();
  }

  // Comprueba si el usuario tiene el rol dado
  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(roleName) : false;

  }
}