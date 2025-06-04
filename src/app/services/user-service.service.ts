import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }
  getUserProfile(): Observable<UserProfile> {
    //  HAZ LA PETICIÓN HTTP REAL
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      catchError(this.handleError<UserProfile>('getUserProfile'))
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {

    return this.http.put<any>(`${this.apiUrl}/change-password`, { currentPassword, newPassword }).pipe(
      catchError(this.handleError<any>('changePassword'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}