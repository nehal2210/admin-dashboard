import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCourseSentencesStore } from "@/store/courseSentencesStore"
import { X } from "lucide-react"

const voiceTypes = [
  'male_normal',
  'female_normal',
  'male_slow',
  'female_slow',
  'male_formal',
  'female_formal'
]

interface VoiceType {
  type: string;
  audioUrl: string;
}

interface FormData {
  source: {
    sentence: string;
    voiceTypes: VoiceType[];
  };
  target: {
    sentence: string;
    voiceTypes: VoiceType[];
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export function CourseSentencesForm() {
  const addCourseSentence = useCourseSentencesStore((state) => state.addCourseSentence)
  const [formData, setFormData] = useState<FormData>({
    source: {
      sentence: "",
      voiceTypes: [],
    },
    target: {
      sentence: "",
      voiceTypes: [],
    },
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleAddVoice = (language: 'source' | 'target') => {
    setFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: [
          ...prev[language].voiceTypes,
          { type: '', audioUrl: '' }
        ]
      }
    }))
  }

  const handleVoiceChange = (
    language: 'source' | 'target',
    index: number,
    field: 'type' | 'audioUrl',
    value: string
  ) => {
    // Clear error when user starts typing
    if (field === 'audioUrl') {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`${language}-${index}-audioUrl`]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: prev[language].voiceTypes.map((voice, i) =>
          i === index ? { ...voice, [field]: value } : voice
        )
      }
    }))

    // Validate URL when user finishes typing
    if (field === 'audioUrl' && value.trim() !== '') {
      if (!validateUrl(value)) {
        setErrors(prev => ({
          ...prev,
          [`${language}-${index}-audioUrl`]: 'Please enter a valid URL'
        }))
      }
    }
  }

  const handleRemoveVoice = (language: 'source' | 'target', index: number) => {
    setFormData(prev => ({
      ...prev,
      [language]: {
        ...prev[language],
        voiceTypes: prev[language].voiceTypes.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({})
    let hasErrors = false

    // Validate sentences
    if (!formData.source.sentence || !formData.target.sentence) {
      setErrors(prev => ({
        ...prev,
        sentences: "Both source and target sentences are required"
      }))
      hasErrors = true
    }

    // Validate voice types and URLs
    const allVoiceTypes = [
      ...formData.source.voiceTypes.map((v, i) => ({ ...v, language: 'source', index: i })),
      ...formData.target.voiceTypes.map((v, i) => ({ ...v, language: 'target', index: i }))
    ]

    allVoiceTypes.forEach(voice => {
      if (!voice.type) {
        setErrors(prev => ({
          ...prev,
          [`${voice.language}-${voice.index}-type`]: 'Voice type is required'
        }))
        hasErrors = true
      }
      if (!voice.audioUrl) {
        setErrors(prev => ({
          ...prev,
          [`${voice.language}-${voice.index}-audioUrl`]: 'Audio URL is required'
        }))
        hasErrors = true
      } else if (!validateUrl(voice.audioUrl)) {
        setErrors(prev => ({
          ...prev,
          [`${voice.language}-${voice.index}-audioUrl`]: 'Please enter a valid URL'
        }))
        hasErrors = true
      }
    })

    if (hasErrors) {
      return
    }

    console.log(JSON.stringify(formData, null, 2))
    addCourseSentence(formData)
    
    // Reset form
    setFormData({
      source: { sentence: "", voiceTypes: [] },
      target: { sentence: "", voiceTypes: [] },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Source Language Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Source Language</h3>
        <div>
          <Label htmlFor="sourceSentence">Sentence</Label>
          <Input
            id="sourceSentence"
            value={formData.source.sentence}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              source: { ...prev.source, sentence: e.target.value }
            }))}
            required
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleAddVoice('source')}
        >
          Add Voice Type (Source Language)
        </Button>

        {formData.source.voiceTypes.map((voice, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-4">
              <Select
                value={voice.type}
                onValueChange={(value) => handleVoiceChange('source', index, 'type', value)}
              >
                <SelectTrigger className="w-[200px]">
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
              
              <Input
                placeholder="Audio URL"
                value={voice.audioUrl}
                onChange={(e) => handleVoiceChange('source', index, 'audioUrl', e.target.value)}
                className="flex-1"
              />
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveVoice('source', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {errors[`source-${index}-audioUrl`] && (
              <p className="text-sm text-red-500">{errors[`source-${index}-audioUrl`]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Target Language Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Target Language</h3>
        <div>
          <Label htmlFor="targetSentence">Sentence</Label>
          <Input
            id="targetSentence"
            value={formData.target.sentence}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              target: { ...prev.target, sentence: e.target.value }
            }))}
            required
          />
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleAddVoice('target')}
        >
          Add Voice Type (Target Language)
        </Button>

        {formData.target.voiceTypes.map((voice, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-4">
              <Select
                value={voice.type}
                onValueChange={(value) => handleVoiceChange('target', index, 'type', value)}
              >
                <SelectTrigger className="w-[200px]">
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
              
              <Input
                placeholder="Audio URL"
                value={voice.audioUrl}
                onChange={(e) => handleVoiceChange('target', index, 'audioUrl', e.target.value)}
                className="flex-1"
              />
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveVoice('target', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {errors[`target-${index}-audioUrl`] && (
              <p className="text-sm text-red-500">{errors[`target-${index}-audioUrl`]}</p>
            )}
          </div>
        ))}
      </div>

      {errors.sentences && (
        <p className="text-sm text-red-500">{errors.sentences}</p>
      )}

      <Button type="submit">Submit</Button>
    </form>
  )
} 