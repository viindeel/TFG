// src/app/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { TokenService } from '../../services/auth/token.service';

export const authGuard: CanActivateFn = (route, state) => {

  const tokenService = inject(TokenService);
  const router = inject(Router);

  const accessToken = tokenService.getAccessToken();

  if (!accessToken) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const decodedToken: JwtPayload = jwtDecode(accessToken);

    if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
      tokenService.removeToken();
      router.navigate(['/login']);
      return false;
    }
    return true;

  } catch (error) {
    console.error('Error al decodificar el token:', error);
    tokenService.removeToken();
    router.navigate(['/login']);
    return false;
  }
};