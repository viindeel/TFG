import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { TokenService } from '../../services/auth/token.service';

// Protege rutas comprobando si el token existe y es válido
export const authGuard: CanActivateFn = (route, state) => {

  const tokenService = inject(TokenService);
  const router = inject(Router);

  const accessToken = tokenService.getAccessToken();

  // Si no hay token, redirige a login
  if (!accessToken) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const decodedToken: JwtPayload = jwtDecode(accessToken);

    // Si el token está expirado, lo elimina y redirige a login
    if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
      tokenService.removeToken();
      router.navigate(['/login']);
      return false;
    }
    return true; // Token válido, permite acceso

  } catch (error) {
    // Si el token es inválido, lo elimina y redirige a login
    console.error('Error al decodificar el token:', error);
    tokenService.removeToken();
    router.navigate(['/login']);
    return false;
  }
};