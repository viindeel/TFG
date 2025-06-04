import { RoleName } from "../../models/role-name.enum";

export interface UserInterface {
  id: number;
  username: string;
  email: string;
  roleName: RoleName;
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
  password?: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  address: string;
  roleName: string;
}

export interface LoginResponse {
  token: string;
  user?: UserInterface;
}