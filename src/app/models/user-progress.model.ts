// Respuesta de progreso de usuario
export interface UserProgressResponse {
  userId: number;
  username: string;
  preferredLanguage: string;
  overallScore: number;
  lastActivityAt?: string; // Fecha ISO
  gameSessions: GameSessionResponse[];
  lessonCompletions: LessonCompletionResponse[];
}

// Petición de sesión de juego
export interface GameSessionRequest {
  gameType: string;
  score: number;
  levelCompleted?: string;
  gameSpecificData?: string; // JSON string
}

// Respuesta de sesión de juego
export interface GameSessionResponse {
  id: number;
  gameType: string;
  score: number;
  levelCompleted?: string;
  completedAt: string;
  gameSpecificData?: string;
}

// Petición de lección completada
export interface LessonCompletionRequest {
  lessonIdentifier: string;
  score?: number;
}

// Respuesta de lección completada
export interface LessonCompletionResponse {
  id: number;
  lessonIdentifier: string;
  completedAt: string;
  score?: number;
}

// Petición para cambiar idioma preferido
export interface PreferredLanguageRequest {
  preferredLanguage: string;
}