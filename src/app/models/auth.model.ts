import { RoleName } from './role-name.enum';

// Petición de login
export interface LoginRequest {
  username?: string;
  password?: string;
}

// Respuesta de login del backend
export interface AuthLoginResponse {
  token: string;
  username: string;
  role: RoleName;
  email?: string;
  firstName?: string;
  lastName?: string;
}

// Petición de registro
export interface RegisterRequest {
  username?: string;
  password?: string;
  roleName?: RoleName;
  firstName?: string;
  lastName?: string;
  address?: string;
}

// Respuesta de usuario tras registro
export interface UserBackendResponse {
    id: number;
    username: string;
    role: { roleName: RoleName };
}