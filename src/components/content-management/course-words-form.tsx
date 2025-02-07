import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useCourseWordsStore } from "@/store/courseWordsStore"
import type { WordFormData } from "@/types/courseWords"

interface VoiceType {
  type: string;
  audioUrl: string;
}

export function CourseWordsForm() {
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

  const addCourseWord = useCourseWordsStore(state => state.addCourseWord)

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

  const handleRemoveVoice = (language: 'source' | 'target', index: number) => {
    setWordFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: prev[language].voiceTypes.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmitWordForm = () => {
    addCourseWord(wordFormData)
    setWordFormData({
      source: { word: "", partOfSpeech: "", voiceTypes: [] },
      target: { word: "", partOfSpeech: "", voiceTypes: [] }
    })
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Words Form</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Language Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Source Language</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceWord">Word</Label>
              <Input
                id="sourceWord"
                value={wordFormData.source.word}
                onChange={(e) => setWordFormData(prev => ({
                  ...prev,
                  source: { ...prev.source, word: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourcePartOfSpeech">Part of Speech</Label>
              <Select
                value={wordFormData.source.partOfSpeech}
                onValueChange={(value) => setWordFormData(prev => ({
                  ...prev,
                  source: { ...prev.source, partOfSpeech: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select part of speech" />
                </SelectTrigger>
                <SelectContent>
                  {partsOfSpeechUrdu.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => handleAddVoice('source')}
          >
            Add Voice
          </Button>

          {wordFormData.source.voiceTypes.map((voice, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 border p-4 rounded-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => handleRemoveVoice('source', index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <Label>Voice Type</Label>
                <Select
                  value={voice.type}
                  onValueChange={(value) => handleVoiceChange('source', index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice type" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audio URL</Label>
                <Input
                  value={voice.audioUrl}
                  onChange={(e) => handleVoiceChange('source', index, 'audioUrl', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Target Language Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Target Language</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetWord">Word</Label>
              <Input
                id="targetWord"
                value={wordFormData.target.word}
                onChange={(e) => setWordFormData(prev => ({
                  ...prev,
                  target: { ...prev.target, word: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPartOfSpeech">Part of Speech</Label>
              <Select
                value={wordFormData.target.partOfSpeech}
                onValueChange={(value) => setWordFormData(prev => ({
                  ...prev,
                  target: { ...prev.target, partOfSpeech: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select part of speech" />
                </SelectTrigger>
                <SelectContent>
                  {partsOfSpeechEnglish.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => handleAddVoice('target')}
          >
            Add Voice
          </Button>

          {wordFormData.target.voiceTypes.map((voice, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 border p-4 rounded-md relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => handleRemoveVoice('target', index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <Label>Voice Type</Label>
                <Select
                  value={voice.type}
                  onValueChange={(value) => handleVoiceChange('target', index, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice type" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audio URL</Label>
                <Input
                  value={voice.audioUrl}
                  onChange={(e) => handleVoiceChange('target', index, 'audioUrl', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmitWordForm} className="w-full">
          Submit
        </Button>
      </CardContent>
    </Card>
  );
} 