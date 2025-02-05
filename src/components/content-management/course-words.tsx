"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface CourseWord {
  source: {
    word: string
    partOfSpeech: string
    voiceTypes: Array<{ type: string; audioUrl: string }>
  }
  target: {
    word: string
    partOfSpeech: string
    voiceTypes: Array<{ type: string; audioUrl: string }>
  }
}

export default function CourseWords() {
  const [courseWord, setCourseWord] = useState<CourseWord>({
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
  })

  const handleWordChange = (language: "source" | "target", field: string, value: string) => {
    setCourseWord((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        [field]: value,
      },
    }))
  }

  const addVoice = (language: "source" | "target") => {
    setCourseWord((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: [
          ...prev[language].voiceTypes,
          {
            type: "",
            audioUrl: "",
          },
        ],
      },
    }))
  }

  const handleVoiceChange = (language: "source" | "target", index: number, field: string, value: string) => {
    setCourseWord((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: prev[language].voiceTypes.map((voice, i) =>
          i === index ? { ...voice, [field]: value } : voice
        ),
      },
    }))
  }

  const removeVoice = (language: "source" | "target", index: number) => {
    setCourseWord((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: prev[language].voiceTypes.filter((_, i) => i !== index),
      },
    }))
  }

  const handleSubmit = () => {
    console.log(JSON.stringify(courseWord, null, 2))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Words</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Language Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Source Language (Urdu)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Word</Label>
              <Input
                value={courseWord.source.word}
                onChange={(e) => handleWordChange("source", "word", e.target.value)}
                placeholder="Enter word in Urdu"
              />
            </div>
            <div>
              <Label>Part of Speech</Label>
              <Select
                value={courseWord.source.partOfSpeech}
                onValueChange={(value) => handleWordChange("source", "partOfSpeech", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select part of speech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="اسم">اسم</SelectItem>
                  <SelectItem value="فعل">فعل</SelectItem>
                  <SelectItem value="صفت">صفت</SelectItem>
                  <SelectItem value="حرف">حرف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => addVoice("source")}>Add Source Voice</Button>
          {courseWord.source.voiceTypes.map((voice, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Label>Voice Type</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={voice.type}
                    onValueChange={(value) => handleVoiceChange("source", index, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['male_normal', 'female_normal', 'male_slow', 'female_slow', 'male_formal', 'female_formal']
                        .map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="relative">
                <Label>Audio URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={voice.audioUrl}
                    onChange={(e) => handleVoiceChange("source", index, "audioUrl", e.target.value)}
                    placeholder="Enter audio URL"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVoice("source", index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Target Language Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Target Language (English)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Word</Label>
              <Input
                value={courseWord.target.word}
                onChange={(e) => handleWordChange("target", "word", e.target.value)}
                placeholder="Enter word in English"
              />
            </div>
            <div>
              <Label>Part of Speech</Label>
              <Select
                value={courseWord.target.partOfSpeech}
                onValueChange={(value) => handleWordChange("target", "partOfSpeech", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select part of speech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noun">Noun</SelectItem>
                  <SelectItem value="verb">Verb</SelectItem>
                  <SelectItem value="adjective">Adjective</SelectItem>
                  <SelectItem value="preposition">Preposition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => addVoice("target")}>Add Target Voice</Button>
          {courseWord.target.voiceTypes.map((voice, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Label>Voice Type</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={voice.type}
                    onValueChange={(value) => handleVoiceChange("target", index, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['male_normal', 'female_normal', 'male_slow', 'female_slow', 'male_formal', 'female_formal']
                        .map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="relative">
                <Label>Audio URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={voice.audioUrl}
                    onChange={(e) => handleVoiceChange("target", index, "audioUrl", e.target.value)}
                    placeholder="Enter audio URL"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVoice("target", index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit}>Submit</Button>
      </CardContent>
    </Card>
  )
}