export type ChoosePicOption = {
    text: string
    isCorrect: boolean
  }
  
  export type DraggableSection = {
    id: string
    order: number
    wordUrdu: string
    wordEnglish: string
    audioUrdu?: string
    audioEnglish?: string
  }
  
  export type MatchPairSection = {
    id: string
    order: number
    sentenceUrdu: string
    sentenceEnglish: string
    audioUrdu?: string
    audioEnglish?: string
  }
  
  export type ListenChoiceOption = {
    id: string
    order: number
    wordEnglish: string
    audioEnglish?: string
    isCorrect: boolean
  }
  
  export type Exercise = {
    number: number
    type: string
    questionUr?: string
    audioUr?: string
    options?: ChoosePicOption[]
    sentenceUrdu?: string
    sentenceEnglish?: string
    audioUrdu?: string
    audioEnglish?: string
    imageUrl?: string
    draggableSections?: DraggableSection[]
    matchPairSections?: MatchPairSection[]
    matchType?: "SentToSent" | "ListenToSent"
    listenChoiceOptions?: ListenChoiceOption[]
  }
  
  export type Lesson = {
    number: number
    exercises: Exercise[]
  }
  
  export type Unit = {
    number: string
    title: string
    description: string
    lessons: Lesson[]
  }
  
  