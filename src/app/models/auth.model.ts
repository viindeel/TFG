// src/app/models/auth.model.ts
import { RoleName } from './role-name.enum';

export interface LoginRequest {
  username?: string;
  password?: string;
}

// Esta interfaz coincide con BackendLoginResponse de tu AuthService existente
// y también con el LoginResponse DTO del backend que diseñamos.
export interface AuthLoginResponse {
  token: string;
  username: string;
  role: RoleName; // Usamos tu enum directamente
  // Podrías añadir otros campos que el token o la respuesta de login contengan
  // como email, firstName, etc., si están disponibles y son útiles aquí.
  // Por ejemplo, si tu token JWT decodificado tiene estos campos:
  email?: string;
  firstName?: string;
  lastName?: string;
  // id?: number; // El backend LoginResponse DTO no lo tiene, pero el token sí podría
}

export interface RegisterRequest {
  username?: string;
  password?: string;
  roleName?: RoleName;
  firstName?: string;
  lastName?: string;
  address?: string;
  // email?: string; // Tu User.ts tiene email. Si el formulario de registro lo pide y el backend lo acepta.
}

// Respuesta esperada del backend al registrar (basada en tu User DTO del backend)
export interface UserBackendResponse {
    id: number;
    username: string;
    role: { roleName: RoleName }; // El backend User tiene un objeto Role
    // email?: string;
    // firstName?: string;
    // lastName?: string;
    // address?: string;
}