export interface VoiceType {
  type: string;
  audioUrl: string;
  characterId: number;
}

export interface WordLanguageData {
  word: string;
  partOfSpeech: string;
  voiceTypes: VoiceType[];
  languageId?: number;
}

export interface WordFormData {
  source: WordLanguageData;
  target: WordLanguageData;
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