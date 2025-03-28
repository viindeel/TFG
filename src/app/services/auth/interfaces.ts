// src/app/auth/interfaces.ts
//Ya no se usa, import { User } from '../models/user'; // ¡Usamos la CLASE User, no la interfaz!

import { RoleName } from "../../models/role-name.enum";

// Interfaz para el usuario, si el backend lo manda en la respuesta al loguearse
//Si no, no es necesaria.
export interface UserInterface {  // Si decides usar UserInterface en lugar de User, ¡úsala consistentemente!
  id: number;
  username: string;
  email: string;
  roleName: RoleName; // <-- Usar enum
  firstName: string;
  lastName: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para el login
export type LoginInterface = Pick<UserInterface, "username"> & { password?: string; };

// Interfaz para el registro
export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;  //La contraseña es opcional
  confirmPassword?: string; // No se envía al backend
  firstName: string;
  lastName: string;
  address: string;
  roleName: string; //Se envia como string, y debe coincidir con los valores de RoleName
}

//  ¡AQUÍ! Define la interfaz LoginResponse
export interface LoginResponse {
  token: string;
  user?: UserInterface; // Opcional, si usas UserInterface, o la clase User, si decides usarla.
}