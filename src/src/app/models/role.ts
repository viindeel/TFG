// src/app/models/role.ts
import { RoleName } from './role-name.enum'; // Asegúrate de que la ruta es correcta

export interface Role {
  id: number;
  name: RoleName; //  ¡AÑADE ESTO!  Debe ser del tipo RoleName (o string, si *realmente* quieres)
}