import { create } from 'zustand'

interface VoiceType {
  type: string;
  audioUrl: string;
}

export interface CourseSentence {
  source: {
    sentence: string;
    voiceTypes: VoiceType[];
  };
  target: {
    sentence: string;
    voiceTypes: VoiceType[];
  };
}

interface CourseSentencesStore {
  courseSentences: CourseSentence[];
  addCourseSentence: (sentence: CourseSentence) => void;
}

export const useCourseSentencesStore = create<CourseSentencesStore>((set) => ({
  courseSentences: [],
  addCourseSentence: (sentence) =>
    set((state) => ({
      courseSentences: [...state.courseSentences, sentence],
    })),
})) 