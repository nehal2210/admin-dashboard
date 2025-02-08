"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X, Printer, ChevronDown, ChevronUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SortableContainer } from "./sortable-container"
import type { Unit, Exercise, DraggableSection, MatchPairSection, ListenChoiceOption, ChoosePicOption } from "./types"
import { CourseWordsForm } from "./course-words-form"
import { CourseWordsView } from "./course-words-view"
import type { WordFormData } from "@/types/courseWords"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CourseSentencesForm } from "./course-sentences-form"
import { SentenceView } from "./sentence-view"

interface VoiceType {
  type: string;
  audioUrl: string;
}

export default function DynamicCourseForm() {
  const [unit, setUnit] = useState<Unit>({
    number: "",
    title: "",
    description: "",
    lessons: [],
  })
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})
  const printRef = useRef<HTMLDivElement>(null)

  const [wordFormData, setWordFormData] = useState<WordFormData>({
    source: {
      word: "",
      partOfSpeech: "",
      voiceTypes: [],
    },
    target: {
      word: "",
      partOfSpeech: "",
      voiceTypes: [],
    },
  });

  const partsOfSpeechUrdu = [
    { value: "ism", label: "اسم" },
    { value: "fail", label: "فعل" },
    { value: "sift", label: "صفت" },
    { value: "zarf", label: "ظرف" },
  ];

  const partsOfSpeechEnglish = [
    { value: "noun", label: "Noun" },
    { value: "verb", label: "Verb" },
    { value: "adjective", label: "Adjective" },
    { value: "adverb", label: "Adverb" },
  ];

  const voiceTypes = [
    'male_normal',
    'female_normal',
    'male_slow',
    'female_slow',
    'male_formal',
    'female_formal'
  ];

  const addLesson = useCallback(() => {
    setUnit((prevUnit) => ({
      ...prevUnit,
      lessons: [...prevUnit.lessons, { number: prevUnit.lessons.length + 1, exercises: [] }],
    }))
  }, [])

  const addExercise = useCallback((lessonIndex: number) => {
    setUnit((prevUnit) => {
      const newLessons = [...prevUnit.lessons]
      newLessons[lessonIndex].exercises.push({
        number: newLessons[lessonIndex].exercises.length + 1,
        type: "",
        options: Array(4).fill({ text: "", isCorrect: false }),
        draggableSections: [],
        matchPairSections: [],
        listenChoiceOptions: Array(4)
          .fill({})
          .map((_, index) => ({
            id: `listen-choice-${index}`,
            order: index + 1,
            wordEnglish: "",
            audioEnglish: "",
            isCorrect: false,
          })),
      })
      return { ...prevUnit, lessons: newLessons }
    })
  }, [])

  const removeExercise = useCallback((lessonIndex: number, exerciseIndex: number) => {
    setUnit((prevUnit) => {
      const newLessons = [...prevUnit.lessons]
      newLessons[lessonIndex].exercises.splice(exerciseIndex, 1)
      return { ...prevUnit, lessons: newLessons }
    })
  }, [])

  const handleExerciseTypeChange = useCallback((lessonIndex: number, exerciseIndex: number, value: string) => {
    setUnit((prevUnit) => {
      const newLessons = [...prevUnit.lessons]
      newLessons[lessonIndex].exercises[exerciseIndex].type = value
      if (value === "astroTrash") {
        newLessons[lessonIndex].exercises[exerciseIndex].draggableSections = []
      }
      if (value === "matchPair") {
        newLessons[lessonIndex].exercises[exerciseIndex].matchPairSections = []
        newLessons[lessonIndex].exercises[exerciseIndex].matchType = "SentToSent"
      }
      if (value === "listenChoice") {
        newLessons[lessonIndex].exercises[exerciseIndex].listenChoiceOptions = Array(4)
          .fill({})
          .map((_, index) => ({
            id: `listen-choice-${index}`,
            order: index + 1,
            wordEnglish: "",
            audioEnglish: "",
            isCorrect: false,
          }))
      }
      return { ...prevUnit, lessons: newLessons }
    })
  }, [])

  const handleExerciseFieldChange = useCallback(
    (lessonIndex: number, exerciseIndex: number, field: string, value: string) => {
      setUnit((prevUnit) => {
        const newLessons = [...prevUnit.lessons]
        newLessons[lessonIndex].exercises[exerciseIndex] = {
          ...newLessons[lessonIndex].exercises[exerciseIndex],
          [field]: value,
        }
        if (field === "sentenceEnglish") {
          newLessons[lessonIndex].exercises[exerciseIndex].draggableSections = value.split(" ").map((word, index) => ({
            id: `word-${index}`,
            order: index + 1,
            wordUrdu: "",
            wordEnglish: word,
            audioUrdu: "",
            audioEnglish: "",
          }))
        }
        return { ...prevUnit, lessons: newLessons }
      })
    },
    [],
  )

  const handleOptionChange = useCallback(
    (
      lessonIndex: number,
      exerciseIndex: number,
      optionIndex: number,
      field: "text" | "isCorrect",
      value: string | boolean,
    ) => {
      setUnit((prevUnit) => {
        const newLessons = [...prevUnit.lessons]
        const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
        if (exercise.options) {
          if (field === "isCorrect" && value === true) {
            exercise.options = exercise.options.map((option, index) => ({
              ...option,
              isCorrect: index === optionIndex,
            }))
          } else {
            exercise.options[optionIndex] = {
              ...exercise.options[optionIndex],
              [field]: value,
            }
          }
        }
        return { ...prevUnit, lessons: newLessons }
      })
    },
    [],
  )

  const handleDraggableSectionsReorder = useCallback(
    (lessonIndex: number, exerciseIndex: number, newSections: DraggableSection[]) => {
      setUnit((prevUnit) => {
        const newLessons = [...prevUnit.lessons]
        const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
        exercise.draggableSections = newSections
        return { ...prevUnit, lessons: newLessons }
      })
    },
    [],
  )

  const handleMatchPairSectionsReorder = useCallback(
    (lessonIndex: number, exerciseIndex: number, newSections: MatchPairSection[]) => {
      setUnit((prevUnit) => {
        const newLessons = [...prevUnit.lessons]
        const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
        exercise.matchPairSections = newSections
        return { ...prevUnit, lessons: newLessons }
      })
    },
    [],
  )

  const handleListenChoiceOptionsReorder = useCallback(
    (lessonIndex: number, exerciseIndex: number, newOptions: ListenChoiceOption[]) => {
      setUnit((prevUnit) => {
        const newLessons = [...prevUnit.lessons]
        const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
        exercise.listenChoiceOptions = newOptions
        return { ...prevUnit, lessons: newLessons }
      })
    },
    [],
  )

  const handleDraggableSectionChange = useCallback(
    (lessonIndex: number, exerciseIndex: number, sectionIndex: number, field: string, value: string) => {
      setUnit((prevUnit) => {
        const newLessons = [...prevUnit.lessons]
        const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
        if (exercise.draggableSections) {
          exercise.draggableSections[sectionIndex] = {
            ...exercise.draggableSections[sectionIndex],
            [field]: value,
          }
        }
        return { ...prevUnit, lessons: newLessons }
      })
    },
    [],
  )

  const handleMatchPairSectionChange = useCallback(
    (lessonIndex: number, exerciseIndex: number, sectionIndex: number, field: string, value: string) => {
      setUnit((prevUnit) => {
        const newLessons = [...prevUnit.lessons]
        const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
        if (exercise.matchPairSections) {
          exercise.matchPairSections[sectionIndex] = {
            ...exercise.matchPairSections[sectionIndex],
            [field]: value,
          }
        }
        return { ...prevUnit, lessons: newLessons }
      })
    },
    [],
  )

  const handleListenChoiceOptionChange = useCallback(
    (lessonIndex: number, exerciseIndex: number, optionIndex: number, field: string, value: string | boolean) => {
      setUnit((prevUnit) => {
        const newLessons = [...prevUnit.lessons]
        const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
        if (exercise.listenChoiceOptions) {
          if (field === "isCorrect" && value === true) {
            exercise.listenChoiceOptions = exercise.listenChoiceOptions.map((option, index) => ({
              ...option,
              isCorrect: index === optionIndex,
            }))
          } else {
            exercise.listenChoiceOptions[optionIndex] = {
              ...exercise.listenChoiceOptions[optionIndex],
              [field]: value,
            }
          }
        }
        return { ...prevUnit, lessons: newLessons }
      })
    },
    [],
  )

  const addWord = useCallback((lessonIndex: number, exerciseIndex: number) => {
    setUnit((prevUnit) => {
      const newLessons = [...prevUnit.lessons]
      const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
      if (exercise.draggableSections) {
        const newOrder = exercise.draggableSections.length + 1
        exercise.draggableSections.push({
          id: `word-${newOrder}`,
          order: newOrder,
          wordUrdu: "",
          wordEnglish: "",
        })
      }
      return { ...prevUnit, lessons: newLessons }
    })
  }, [])

  const addMatchPairSection = useCallback((lessonIndex: number, exerciseIndex: number) => {
    setUnit((prevUnit) => {
      const newLessons = [...prevUnit.lessons]
      const exercise = newLessons[lessonIndex].exercises[exerciseIndex]
      if (exercise.matchPairSections) {
        const newOrder = exercise.matchPairSections.length + 1
        exercise.matchPairSections.push({
          id: `matchpair-${newOrder}`,
          order: newOrder,
          sentenceUrdu: "",
          sentenceEnglish: "",
          audioUrdu: "",
          audioEnglish: "",
        })
      }
      return { ...prevUnit, lessons: newLessons }
    })
  }, [])

  const handleSubmit = useCallback(() => {
    console.log(JSON.stringify(unit, null, 2))
  }, [unit])

  const toggleExpand = useCallback((sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }, [])

  const handlePrint = useCallback(() => {
    if (printRef.current) {
      const content = printRef.current
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Preview</title>
              <style>
                body { font-family: Arial, sans-serif; }
                pre { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              ${content.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }, [])

  const handleAddVoice = (language: 'source' | 'target') => {
    setWordFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: [
          ...prev[language].voiceTypes,
          { type: '', audioUrl: '' }
        ]
      }
    }));
  };

  const handleVoiceChange = (
    language: 'source' | 'target',
    index: number,
    field: 'type' | 'audioUrl',
    value: string
  ) => {
    setWordFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: prev[language].voiceTypes.map((voice, i) =>
          i === index ? { ...voice, [field]: value } : voice
        )
      }
    }));
  };

  const handleSubmitWordForm = () => {
    console.log(JSON.stringify(wordFormData, null, 2));
  };

  const handleRemoveVoice = (language: 'source' | 'target', index: number) => {
    setWordFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: prev[language].voiceTypes.filter((_, i) => i !== index)
      }
    }));
  };

  const renderExercise = (exercise: Exercise, lessonIndex: number, exerciseIndex: number) => {
    return (
      <Card key={exerciseIndex}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Exercise {exercise.number}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeExercise(lessonIndex, exerciseIndex)}
            aria-label="Remove exercise"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            onValueChange={(value) => handleExerciseTypeChange(lessonIndex, exerciseIndex, value)}
            value={exercise.type}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select exercise type" />
            </SelectTrigger>
            <SelectContent>
              {["choosePic", "dragDrop", "astroTrash", "speakMatch", "listenChoice", "conversation", "matchPair"].map(
                (type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          {exercise.type === "choosePic" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor={`questionUr-${lessonIndex}-${exerciseIndex}`}>Question URL (required)</Label>
                <Input
                  id={`questionUr-${lessonIndex}-${exerciseIndex}`}
                  value={exercise.questionUr || ""}
                  onChange={(e) => handleExerciseFieldChange(lessonIndex, exerciseIndex, "questionUr", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`audioUr-${lessonIndex}-${exerciseIndex}`}>Audio URL (optional)</Label>
                <Input
                  id={`audioUr-${lessonIndex}-${exerciseIndex}`}
                  value={exercise.audioUr || ""}
                  onChange={(e) => handleExerciseFieldChange(lessonIndex, exerciseIndex, "audioUr", e.target.value)}
                />
              </div>
              {exercise.options &&
                exercise.options.map((option: ChoosePicOption, optionIndex: number) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(lessonIndex, exerciseIndex, optionIndex, "text", e.target.value)
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Select
                      value={option.isCorrect ? "true" : "false"}
                      onValueChange={(value) =>
                        handleOptionChange(lessonIndex, exerciseIndex, optionIndex, "isCorrect", value === "true")
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
            </div>
          )}

          {exercise.type === "dragDrop" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`sentenceUrdu-${lessonIndex}-${exerciseIndex}`}>Sentence Urdu (required)</Label>
                  <Input
                    id={`sentenceUrdu-${lessonIndex}-${exerciseIndex}`}
                    value={exercise.sentenceUrdu || ""}
                    onChange={(e) =>
                      handleExerciseFieldChange(lessonIndex, exerciseIndex, "sentenceUrdu", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`sentenceEnglish-${lessonIndex}-${exerciseIndex}`}>Sentence English (required)</Label>
                  <Input
                    id={`sentenceEnglish-${lessonIndex}-${exerciseIndex}`}
                    value={exercise.sentenceEnglish || ""}
                    onChange={(e) =>
                      handleExerciseFieldChange(lessonIndex, exerciseIndex, "sentenceEnglish", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`audioUrdu-${lessonIndex}-${exerciseIndex}`}>Audio Urdu URL (optional)</Label>
                  <Input
                    id={`audioUrdu-${lessonIndex}-${exerciseIndex}`}
                    value={exercise.audioUrdu || ""}
                    onChange={(e) => handleExerciseFieldChange(lessonIndex, exerciseIndex, "audioUrdu", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`audioEnglish-${lessonIndex}-${exerciseIndex}`}>Audio English URL (optional)</Label>
                  <Input
                    id={`audioEnglish-${lessonIndex}-${exerciseIndex}`}
                    value={exercise.audioEnglish || ""}
                    onChange={(e) =>
                      handleExerciseFieldChange(lessonIndex, exerciseIndex, "audioEnglish", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`imageUrl-${lessonIndex}-${exerciseIndex}`}>Image URL (optional)</Label>
                  <Input
                    id={`imageUrl-${lessonIndex}-${exerciseIndex}`}
                    value={exercise.imageUrl || ""}
                    onChange={(e) => handleExerciseFieldChange(lessonIndex, exerciseIndex, "imageUrl", e.target.value)}
                  />
                </div>
              </div>
              {exercise.draggableSections && (
                <>
                  <Label>Draggable Sections</Label>
                  <SortableContainer
                    items={exercise.draggableSections}
                    type="word"
                    onReorder={(newSections: any) => handleDraggableSectionsReorder(lessonIndex, exerciseIndex, newSections)}
                    onFieldChange={(sectionIndex: any, field: any, value: any) =>
                      handleDraggableSectionChange(lessonIndex, exerciseIndex, sectionIndex, field, value as string)
                    }
                  />
                </>
              )}
            </div>
          )}

          {exercise.type === "astroTrash" && (
            <div className="space-y-4">
              <Button onClick={() => addWord(lessonIndex, exerciseIndex)}>Add Word</Button>
              {exercise.draggableSections && (
                <>
                  <Label>Words</Label>
                  <SortableContainer
                    items={exercise.draggableSections}
                    type="word"
                    onReorder={(newSections: any) => handleDraggableSectionsReorder(lessonIndex, exerciseIndex, newSections)}
                    onFieldChange={(sectionIndex: any, field: any, value: any) =>
                      handleDraggableSectionChange(lessonIndex, exerciseIndex, sectionIndex, field, value as string)
                    }
                  />
                </>
              )}
            </div>
          )}

          {exercise.type === "speakMatch" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor={`sentenceEnglish-${lessonIndex}-${exerciseIndex}`}>Sentence English (required)</Label>
                <Input
                  id={`sentenceEnglish-${lessonIndex}-${exerciseIndex}`}
                  value={exercise.sentenceEnglish || ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(lessonIndex, exerciseIndex, "sentenceEnglish", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor={`audioEnglish-${lessonIndex}-${exerciseIndex}`}>Audio English URL (optional)</Label>
                <Input
                  id={`audioEnglish-${lessonIndex}-${exerciseIndex}`}
                  value={exercise.audioEnglish || ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(lessonIndex, exerciseIndex, "audioEnglish", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`imageUrl-${lessonIndex}-${exerciseIndex}`}>Image URL (optional)</Label>
                <Input
                  id={`imageUrl-${lessonIndex}-${exerciseIndex}`}
                  value={exercise.imageUrl || ""}
                  onChange={(e) => handleExerciseFieldChange(lessonIndex, exerciseIndex, "imageUrl", e.target.value)}
                />
              </div>
            </div>
          )}

          {exercise.type === "matchPair" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor={`matchType-${lessonIndex}-${exerciseIndex}`}>Match Type</Label>
                <Select
                  onValueChange={(value) => handleExerciseFieldChange(lessonIndex, exerciseIndex, "matchType", value)}
                  value={exercise.matchType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select match type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SentToSent">Sentence to Sentence</SelectItem>
                    <SelectItem value="ListenToSent">Listen to Sentence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => addMatchPairSection(lessonIndex, exerciseIndex)}>Add Words</Button>
              {exercise.matchPairSections && (
                <>
                  <Label>MatchPair Parts</Label>
                  <SortableContainer
                    items={exercise.matchPairSections}
                    type="matchPair"
                    onReorder={(newSections: any) => handleMatchPairSectionsReorder(lessonIndex, exerciseIndex, newSections)}
                    onFieldChange={(sectionIndex: any, field: any, value: any) =>
                      handleMatchPairSectionChange(lessonIndex, exerciseIndex, sectionIndex, field, value as string)
                    }
                  />
                </>
              )}
            </div>
          )}

          {exercise.type === "listenChoice" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor={`sentenceEnglish-${lessonIndex}-${exerciseIndex}`}>Sentence English (required)</Label>
                <Input
                  id={`sentenceEnglish-${lessonIndex}-${exerciseIndex}`}
                  value={exercise.sentenceEnglish || ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(lessonIndex, exerciseIndex, "sentenceEnglish", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor={`audioEnglish-${lessonIndex}-${exerciseIndex}`}>Audio English URL (optional)</Label>
                <Input
                  id={`audioEnglish-${lessonIndex}-${exerciseIndex}`}
                  value={exercise.audioEnglish || ""}
                  onChange={(e) =>
                    handleExerciseFieldChange(lessonIndex, exerciseIndex, "audioEnglish", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`imageUrl-${lessonIndex}-${exerciseIndex}`}>Image URL (optional)</Label>
                <Input
                  id={`imageUrl-${lessonIndex}-${exerciseIndex}`}
                  value={exercise.imageUrl || ""}
                  onChange={(e) => handleExerciseFieldChange(lessonIndex, exerciseIndex, "imageUrl", e.target.value)}
                />
              </div>
              {exercise.listenChoiceOptions && (
                <>
                  <Label>Listen Choice Options</Label>
                  <SortableContainer
                    items={exercise.listenChoiceOptions}
                    type="listenChoice"
                    onReorder={(newOptions: any) => handleListenChoiceOptionsReorder(lessonIndex, exerciseIndex, newOptions)}
                    onFieldChange={(optionIndex: any, field: any, value: any) =>
                      handleListenChoiceOptionChange(lessonIndex, exerciseIndex, optionIndex, field, value)
                    }
                  />
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderPreviewExercise = (exercise: Exercise) => {
    switch (exercise.type) {
      case "choosePic":
        return (
          <div className="space-y-2">
            <h5 className="font-semibold">Choose the correct picture</h5>
            {exercise.questionUr && <p>{exercise.questionUr}</p>}
            {exercise.audioUr && <audio src={exercise.audioUr} controls className="w-full" />}
            <div className="grid grid-cols-2 gap-2">
              {exercise.options?.map((option, index) => (
                <div key={index} className="border p-2 rounded">
                  <p>{option.text}</p>
                  {option.isCorrect && <span className="text-green-500">(Correct)</span>}
                </div>
              ))}
            </div>
          </div>
        )
      case "dragDrop":
      case "astroTrash":
        return (
          <div className="space-y-2">
            <h5 className="font-semibold">Drag and drop the correct words</h5>
            {exercise.sentenceUrdu && <p>{exercise.sentenceUrdu}</p>}
            {exercise.sentenceEnglish && <p>{exercise.sentenceEnglish}</p>}
            {exercise.audioUrdu && <audio src={exercise.audioUrdu} controls className="w-full" />}
            {exercise.audioEnglish && <audio src={exercise.audioEnglish} controls className="w-full" />}
            {exercise.imageUrl && (
              <img src={exercise.imageUrl || "/placeholder.svg"} alt="Exercise" className="max-w-full h-auto" />
            )}
            <div className="flex flex-wrap gap-2">
              {exercise.draggableSections?.map((section, index) => (
                <div key={index} className="border p-2 rounded bg-gray-100">
                  <p>{section.wordUrdu || section.wordEnglish}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case "speakMatch":
        return (
          <div className="space-y-2">
            <h5 className="font-semibold">Speak and match</h5>
            {exercise.sentenceEnglish && <p>{exercise.sentenceEnglish}</p>}
            {exercise.audioEnglish && <audio src={exercise.audioEnglish} controls className="w-full" />}
            {exercise.imageUrl && (
              <img src={exercise.imageUrl || "/placeholder.svg"} alt="Exercise" className="max-w-full h-auto" />
            )}
          </div>
        )
      case "matchPair":
        return (
          <div className="space-y-2">
            <h5 className="font-semibold">Match the pairs</h5>
            <p>Type: {exercise.matchType}</p>
            <div className="grid grid-cols-2 gap-2">
              {exercise.matchPairSections?.map((section, index) => (
                <div key={index} className="border p-2 rounded">
                  <p>{section.sentenceUrdu}</p>
                  <p>{section.sentenceEnglish}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case "listenChoice":
        return (
          <div className="space-y-2">
            <h5 className="font-semibold">Listen and choose</h5>
            {exercise.sentenceEnglish && <p>{exercise.sentenceEnglish}</p>}
            {exercise.audioEnglish && <audio src={exercise.audioEnglish} controls className="w-full" />}
            {exercise.imageUrl && (
              <img src={exercise.imageUrl || "/placeholder.svg"} alt="Exercise" className="max-w-full h-auto" />
            )}
            <div className="grid grid-cols-2 gap-2">
              {exercise.listenChoiceOptions?.map((option, index) => (
                <div key={index} className="border p-2 rounded">
                  <p>{option.wordEnglish}</p>
                  {option.isCorrect && <span className="text-green-500">(Correct)</span>}
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return <p>Unsupported exercise type: {exercise.type}</p>
    }
  }

  const [expandedLessons, setExpandedLessons] = useState<{ [key: number]: boolean }>({})

  const toggleLesson = (lessonIndex: number) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonIndex]: !prev[lessonIndex],
    }))
  }

  return (
    <div className="container mx-auto p-4 w-full">
      <Tabs defaultValue="edit">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="course-words-form">Add Course Words</TabsTrigger>
          <TabsTrigger value="course-words-view">View Course Words</TabsTrigger>
          <TabsTrigger value="course-sentences">Course Sentences</TabsTrigger>
          <TabsTrigger value="sentence-view">View Sentences</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Unit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Unit Number"
                value={unit.number}
                onChange={(e) => setUnit((prev) => ({ ...prev, number: e.target.value }))}
              />
              <Input
                placeholder="Unit Title"
                value={unit.title}
                onChange={(e) => setUnit((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Unit Description"
                value={unit.description}
                onChange={(e) => setUnit((prev) => ({ ...prev, description: e.target.value }))}
              />
              <Button onClick={addLesson}>Add Lesson</Button>

              {unit.lessons.map((lesson, lessonIndex) => (
                <Card key={lessonIndex} className="mt-4">
                  <CardHeader>
                    <CardTitle>Lesson {lesson.number}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={() => addExercise(lessonIndex)}>Create Exercise</Button>
                    {lesson.exercises.map((exercise, exerciseIndex) =>
                      renderExercise(exercise, lessonIndex, exerciseIndex),
                    )}
                  </CardContent>
                </Card>
              ))}
              <Button onClick={handleSubmit}>Save and Submit</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preview">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Course Preview</CardTitle>
              <Button onClick={handlePrint} variant="secondary" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </CardHeader>
            <CardContent>
              <div ref={printRef} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Unit {unit.number}: {unit.title}
                  </h2>
                  <p className="text-gray-600">{unit.description}</p>
                </div>
                {unit.lessons.map((lesson, lessonIndex) => (
                  <Card key={lessonIndex} className="mt-4">
                    <CardHeader className="cursor-pointer" onClick={() => toggleLesson(lessonIndex)}>
                      <div className="flex justify-between items-center">
                        <CardTitle>Lesson {lesson.number}</CardTitle>
                        {expandedLessons[lessonIndex] ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </CardHeader>
                    {expandedLessons[lessonIndex] && (
                      <CardContent>
                        {lesson.exercises.map((exercise, exerciseIndex) => (
                          <Card key={exerciseIndex} className="mt-4">
                            <CardHeader>
                              <CardTitle>Exercise {exercise.number}</CardTitle>
                            </CardHeader>
                            <CardContent>{renderPreviewExercise(exercise)}</CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="course-words-form">
          <CourseWordsForm />
        </TabsContent>
        <TabsContent value="course-words-view">
          <CourseWordsView />
        </TabsContent>
        <TabsContent value="course-sentences">
          <CourseSentencesForm />
        </TabsContent>
        <TabsContent value="sentence-view">
          <SentenceView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

