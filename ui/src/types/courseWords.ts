export interface VoiceType {
  type: string;
  audioUrl: string;
}

export interface LanguageWord {
  word: string;
  partOfSpeech: string;
  voiceTypes: VoiceType[];
}

export interface WordFormData {
  id?: number;
  source: LanguageWord;
  target: LanguageWord;
} 