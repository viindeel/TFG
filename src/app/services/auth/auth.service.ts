// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { User } from '../../models/user';
import { Role } from '../../models/role';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl + '/api/users';
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {
    this.loadCurrentUser();
  }

  loadCurrentUser(): User | null {
    const token = this.tokenService.getAccessToken();
    if (token) {
      const decodedToken = this.tokenService.decodeToken(token); // Usa decodeToken de TokenService
      if (decodedToken) {
        const roles = Array.isArray(decodedToken.role) ? decodedToken.role : [decodedToken.role]; // Asegúrate de que roles sea un array

        const user = new User(
          decodedToken.id || 0,
          decodedToken.sub || '',
          decodedToken.email || '',
          roles,
          decodedToken.firstName || '',
          decodedToken.lastName || '',
          decodedToken.address || ''
        );
        console.log("AuthService - loadCurrentUser - Usuario cargado:", user);
        this.currentUserSubject.next(user);
        return user;
      } else {
        console.log("AuthService - loadCurrentUser - Token inválido.");
        this.logout();
        return null;
      }
    } else {
      console.log("AuthService - loadCurrentUser - No hay token en el almacenamiento local.");
      return null;
    }
  }

  logout(): void {
    this.tokenService.removeToken();
    this.currentUserSubject.next(null);
    console.log("AuthService - logout - Sesión cerrada");
  }

  private handleError(error: any) {
    console.error("AuthService - handleError:", error);
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.status === 403) {
        errorMessage = "No tienes permiso para realizar esta acción.";
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getAccessToken();
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.hasRole(roleName) : false;
  }
}