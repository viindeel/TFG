// src/app/models/game-content.model.ts

// Corresponde a WordItemDto del backend
export interface WordItem {
  id?: number;
  word: string;
  language: string;
  category?: string;
  difficultyLevel?: number;
  termKeyI18n?: string;
  definitionKeyI18n?: string;
  pairIdentifier?: string;
  imageUrl?: string;
  audioUrl?: string;
  relatedGameType?: string;
}

// Corresponde a CrosswordPuzzleDto del backend
export interface CrosswordPuzzle {
  id?: number;
  puzzleName: string;
  language: string;
  difficultyLevel?: number;
  theme?: string;
  gridDataJson: string; // El frontend parseará este JSON
}

// Corresponde a GameScenarioDto del backend
export interface GameScenario {
  id?: number;
  gameType: string; // "MONOPOLY_GAME", "WORK_LIFE_BALANCE_GAME"
  scenarioName: string;
  language: string;
  version?: number;
  contentDataJson: string; // El frontend parseará este JSON
}

// Para parámetros de consulta opcionales en getWordItems
export interface WordItemParams {
  language: string;
  category?: string;
  difficultyLevel?: number;
  count?: number;
}