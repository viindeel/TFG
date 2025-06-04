import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly ACCESS_TOKEN_KEY: string = 'palabras_al_poder_token'; 

  constructor(
    private cookieService: CookieService,
  ) { }

  // Guarda el accessToken en cookie segura
  saveAccessToken(token: string): void {
    this.cookieService.set(this.ACCESS_TOKEN_KEY, token, {
      path: "/",
      secure: environment.tokenSecure,
      sameSite: "Strict"
    });
  }

  // Obtiene el accessToken de la cookie
  getAccessToken(): string {
    return this.cookieService.get(this.ACCESS_TOKEN_KEY);
  }

   // Elimina el accessToken de la cookie
  removeToken(): void {
    this.cookieService.delete(this.ACCESS_TOKEN_KEY, '/', '', environment.tokenSecure, 'Strict');
  }

    // Decodifica el JWT
  decodeToken(token: string): any {
    try {
      return jwt_decode.jwtDecode(token);
    } catch (Error) {
      console.error("Error decodificando el token:", Error);
      return null;
    }
  }
}