"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DraggableSectionProps {
  id: string
  index: number
  type: "word" | "matchPair" | "listenChoice"
  fields: Record<string, string | boolean>
  onFieldChange: (field: string, value: string | boolean) => void
  className?: string
}

export function DraggableSection({ id, index, type, fields, onFieldChange, className = "" }: DraggableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-gray-100 p-2 rounded-md relative ${className} ${isDragging ? "opacity-50" : ""}`}
    >
      <div
        {...listeners}
        className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center cursor-move bg-gray-200 rounded-tr-md rounded-bl-md"
      >
        ⋮⋮
      </div>
      {type === "word" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor={`wordUrdu-${index}`} className="text-xs">
              Urdu (required)
            </Label>
            <Input
              id={`wordUrdu-${index}`}
              value={fields.wordUrdu as string}
              onChange={(e) => onFieldChange("wordUrdu", e.target.value)}
              required
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor={`wordEnglish-${index}`} className="text-xs">
              English (required)
            </Label>
            <Input
              id={`wordEnglish-${index}`}
              value={fields.wordEnglish as string}
              onChange={(e) => onFieldChange("wordEnglish", e.target.value)}
              required
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      {type === "matchPair" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor={`sentenceUrdu-${index}`} className="text-xs">
              Sentence Urdu (required)
            </Label>
            <Input
              id={`sentenceUrdu-${index}`}
              value={fields.sentenceUrdu as string}
              onChange={(e) => onFieldChange("sentenceUrdu", e.target.value)}
              required
              className="h-6 text-xs"
            />
          </div>
          <div>
            <Label htmlFor={`sentenceEnglish-${index}`} className="text-xs">
              Sentence English (required)
            </Label>
            <Input
              id={`sentenceEnglish-${index}`}
              value={fields.sentenceEnglish as string}
              onChange={(e) => onFieldChange("sentenceEnglish", e.target.value)}
              required
              className="h-6 text-xs"
            />
          </div>
          <div>
            <Label htmlFor={`audioUrdu-${index}`} className="text-xs">
              Audio Urdu URL (optional)
            </Label>
            <Input
              id={`audioUrdu-${index}`}
              value={fields.audioUrdu as string}
              onChange={(e) => onFieldChange("audioUrdu", e.target.value)}
              className="h-6 text-xs"
            />
          </div>
          <div>
            <Label htmlFor={`audioEnglish-${index}`} className="text-xs">
              Audio English URL (optional)
            </Label>
            <Input
              id={`audioEnglish-${index}`}
              value={fields.audioEnglish as string}
              onChange={(e) => onFieldChange("audioEnglish", e.target.value)}
              className="h-6 text-xs"
            />
          </div>
        </div>
      )}

      {type === "listenChoice" && (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor={`wordEnglish-${index}`} className="text-xs">
              Word English (required)
            </Label>
            <Input
              id={`wordEnglish-${index}`}
              value={fields.wordEnglish as string}
              onChange={(e) => onFieldChange("wordEnglish", e.target.value)}
              required
              className="h-6 text-xs"
            />
          </div>
          <div>
            <Label htmlFor={`audioEnglish-${index}`} className="text-xs">
              Audio English URL (optional)
            </Label>
            <Input
              id={`audioEnglish-${index}`}
              value={fields.audioEnglish as string}
              onChange={(e) => onFieldChange("audioEnglish", e.target.value)}
              className="h-6 text-xs"
            />
          </div>
          <div>
            <Label htmlFor={`isCorrect-${index}`} className="text-xs">
              Is Correct
            </Label>
            <select
              id={`isCorrect-${index}`}
              value={fields.isCorrect ? "true" : "false"}
              onChange={(e) => onFieldChange("isCorrect", e.target.value === "true")}
              className="w-full h-6 text-xs rounded-md border border-input bg-background px-3"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

