// src/app/services/user-progress.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Ajusta si tu ruta es diferente
import {
  UserProgressResponse,
  GameSessionRequest,
  GameSessionResponse,
  LessonCompletionRequest,
  LessonCompletionResponse,
  PreferredLanguageRequest
} from '../models/user-progress.model'; // Ajusta si tu ruta es diferente

@Injectable({
  providedIn: 'root'
})
export class UserProgressService {
  private apiUrl = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) { }

  getUserProgress(): Observable<UserProgressResponse> {
    return this.http.get<UserProgressResponse>(this.apiUrl);
  }

  updatePreferredLanguage(languageData: PreferredLanguageRequest): Observable<UserProgressResponse> {
    return this.http.put<UserProgressResponse>(`${this.apiUrl}/language`, languageData);
  }

  logGameSession(sessionData: GameSessionRequest): Observable<GameSessionResponse> {
    return this.http.post<GameSessionResponse>(`${this.apiUrl}/game-session`, sessionData);
  }

  getUserGameHistory(gameType: string): Observable<GameSessionResponse[]> {
    return this.http.get<GameSessionResponse[]>(`<span class="math-inline">\{this\.apiUrl\}/game\-session/</span>{gameType}`);
  }

  logLessonCompletion(completionData: LessonCompletionRequest): Observable<LessonCompletionResponse> {
    return this.http.post<LessonCompletionResponse>(`${this.apiUrl}/lesson-completion`, completionData);
  }
}