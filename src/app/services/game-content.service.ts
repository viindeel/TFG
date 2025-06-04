import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WordItem, CrosswordPuzzle, GameScenario, WordItemParams } from '../models/game-content.model';

@Injectable({
  providedIn: 'root'
})
export class GameContentService {
  private apiUrl = `${environment.apiUrl}/content`;

  constructor(private http: HttpClient) { }

  getWordItems(params: WordItemParams): Observable<WordItem[]> {
    let httpParams = new HttpParams().set('language', params.language);
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.difficultyLevel !== undefined) {
      httpParams = httpParams.set('difficultyLevel', params.difficultyLevel.toString());
    }
    if (params.count !== undefined) {
      httpParams = httpParams.set('count', params.count.toString());
    }
    return this.http.get<WordItem[]>(`${this.apiUrl}/words`, { params: httpParams });
  }

  getCrosswordPuzzle(puzzleName: string, language: string): Observable<CrosswordPuzzle> {
    const params = new HttpParams().set('language', language);
    return this.http.get<CrosswordPuzzle>(`<span class="math-inline">\{this\.apiUrl\}/crossword/</span>{puzzleName}`, { params });
  }

  getGameScenario(gameType: string, scenarioName: string, language: string): Observable<GameScenario> {
    const params = new HttpParams().set('language', language);
    return this.http.get<GameScenario>(`<span class="math-inline">\{this\.apiUrl\}/scenario/</span>{gameType}/${scenarioName}`, { params });
  }

  // --- Métodos para Administradores (requieren rol ADMIN y token JWT) ---
  addWordItem(wordItemData: WordItem): Observable<WordItem> {
    return this.http.post<WordItem>(`${this.apiUrl}/words`, wordItemData);
  }

  // Para POST
  addCrosswordPuzzle(puzzleData: Omit<CrosswordPuzzle, 'id'>): Observable<CrosswordPuzzle> {
    return this.http.post<CrosswordPuzzle>(`${this.apiUrl}/crossword`, puzzleData);
  }

  addGameScenario(scenarioData: Omit<GameScenario, 'id'>): Observable<GameScenario> {
    return this.http.post<GameScenario>(`${this.apiUrl}/scenario`, scenarioData);
  }
}