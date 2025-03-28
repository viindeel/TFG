import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {

  private readonly USER_KEY = "tienda_online";

  constructor() { }

  save(username: string, role: string): void  {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify({username, role}));
  }

  getUsername(): string | null {
    const session = JSON.parse(<string>sessionStorage.getItem(this.USER_KEY));
    if (!session) {
      return null;
    }

    return session.username;
  }

  getRole(): string | null {
    const session = JSON.parse(<string>sessionStorage.getItem(this.USER_KEY));
    if (!session) {
      return null;
    }

    return session.role;
  }

  removeSession(): void {
    sessionStorage.removeItem(this.USER_KEY);
  }

}
