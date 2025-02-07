import { create } from 'zustand'
import type { WordFormData } from '../types/courseWords'

interface CourseWordsStore {
  courseWords: WordFormData[]
  addCourseWord: (word: WordFormData) => void
}

export const useCourseWordsStore = create<CourseWordsStore>((set) => ({
  courseWords: [],
  addCourseWord: (word) => 
    set((state) => ({ 
      courseWords: [...state.courseWords, { ...word, id: state.courseWords.length + 1 }] 
    })),
})) 