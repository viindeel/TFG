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
  gridDataJson: string; // El frontend parsea este JSON
}

// Corresponde a GameScenarioDto del backend
export interface GameScenario {
  id?: number;
  gameType: string; // Tipo de juego
  scenarioName: string;
  language: string;
  version?: number;
  contentDataJson: string; // El frontend parsea este JSON
}

// Parámetros opcionales para consultar WordItems
export interface WordItemParams {
  language: string;
  category?: string;
  difficultyLevel?: number;
  count?: number;
}