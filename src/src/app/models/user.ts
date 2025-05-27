import { Role } from './role';

export class User {
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public roles: string[],
    public firstName: string,
    public lastName: string,
    public address: string
  ) {}

  hasRole(roleName: string): boolean {
    return this.roles.includes(roleName);
  }
}