export interface VoiceType {
  characterId: number;
  audioUrl: string;
}

export interface SentenceData {
  sentence: string;
  voiceTypes: VoiceType[];
}

export interface CreateSentenceRequest {
  source: SentenceData;
  target: SentenceData;
}

export interface SentenceResponse {
  source: SentenceData;
  target: SentenceData;
} 