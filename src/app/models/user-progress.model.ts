// src/app/models/user-progress.model.ts

// Corresponde a UserProgressResponseDto del backend
export interface UserProgressResponse {
  userId: number;
  username: string;
  preferredLanguage: string;
  overallScore: number;
  lastActivityAt?: string; // Las fechas suelen venir como string ISO
  gameSessions: GameSessionResponse[];
  lessonCompletions: LessonCompletionResponse[];
}

// Corresponde a GameSessionRequestDto del backend
export interface GameSessionRequest {
  gameType: string;
  score: number;
  levelCompleted?: string;
  gameSpecificData?: string; // JSON como string
}

// Corresponde a GameSessionResponseDto del backend
export interface GameSessionResponse {
  id: number;
  gameType: string;
  score: number;
  levelCompleted?: string;
  completedAt: string;
  gameSpecificData?: string;
}

// Corresponde a LessonCompletionRequestDto del backend
export interface LessonCompletionRequest {
  lessonIdentifier: string;
  score?: number;
}

// Corresponde a LessonCompletionResponseDto del backend
export interface LessonCompletionResponse {
  id: number;
  lessonIdentifier: string;
  completedAt: string;
  score?: number;
}

// Corresponde a PreferredLanguageDto del backend
export interface PreferredLanguageRequest {
  preferredLanguage: string;
}