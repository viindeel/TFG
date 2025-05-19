// src/app/services/auth/token.service.ts
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly ACCESS_TOKEN_KEY: string = 'palabras_al_poder_token'; // Nombre más específico

  constructor(
    private cookieService: CookieService,
  ) { }

  // Modificado para guardar solo el accessToken
  saveAccessToken(token: string): void {
    this.cookieService.set(this.ACCESS_TOKEN_KEY, token, {
      path: "/",
      secure: environment.tokenSecure, // Asume que tienes esta variable en environment.ts
      sameSite: "Strict"
      // Considera añadir 'expires' para la cookie si el token tiene expiración
    });
  }

  getAccessToken(): string {
    return this.cookieService.get(this.ACCESS_TOKEN_KEY);
  }

  removeToken(): void {
    this.cookieService.delete(this.ACCESS_TOKEN_KEY, '/', '', environment.tokenSecure, 'Strict');
  }

  decodeToken(token: string): any {
    try {
      return jwt_decode.jwtDecode(token);
    } catch (Error) {
      console.error("Error decodificando el token:", Error);
      return null;
    }
  }
}