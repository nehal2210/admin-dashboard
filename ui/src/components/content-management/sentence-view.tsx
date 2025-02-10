import { useRef, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCourseSentencesStore } from "@/store/courseSentencesStore"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const VOICE_TYPES = [
  'male_normal',
  'female_normal',
  'male_slow',
  'female_slow',
  'male_formal',
  'female_formal'
] as const

interface AudioPlayerProps {
  audioUrl: string;
}

function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const duration = audioRef.current.duration
      const progress = (current / duration) * 100
      setProgress(progress)
      setCurrentTime(current)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = (x / rect.width) * 100
      const time = (percentage / 100) * audioRef.current.duration
      audioRef.current.currentTime = time
      setProgress(percentage)
      setCurrentTime(time)
    }
  }

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full shrink-0"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-grow space-y-1">
          <div 
            ref={progressBarRef}
            className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div
              className="absolute h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute h-3 w-3 bg-primary rounded-full -top-[3px]"
              style={{ 
                left: `${progress}%`,
                transform: 'translateX(-50%)',
                transition: 'left 0.1s linear'
              }}
            />
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      </div>
    </Card>
  )
}

export function SentenceView() {
  const courseSentences = useCourseSentencesStore((state) => state.courseSentences)

  const renderAudioCell = (voiceTypes: { type: string; audioUrl: string }[], voiceType: string) => {
    const voice = voiceTypes.find(v => v.type === voiceType)
    return voice?.audioUrl ? (
      <AudioPlayer audioUrl={voice.audioUrl} />
    ) : (
      <div className="text-gray-400 text-sm">No audio</div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Source Language Table */}
      <div className="rounded-lg border">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Source Language Sentences</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[200px]">Sentence</TableHead>
              {VOICE_TYPES.map((type) => (
                <TableHead key={type} className="min-w-[200px]">
                  {`Audio (${type})`}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseSentences.map((sentence, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{sentence.source.sentence}</TableCell>
                {VOICE_TYPES.map((type) => (
                  <TableCell key={type}>
                    {renderAudioCell(sentence.source.voiceTypes, type)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Target Language Table */}
      <div className="rounded-lg border">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Target Language Sentences</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[200px]">Sentence</TableHead>
              {VOICE_TYPES.map((type) => (
                <TableHead key={type} className="min-w-[200px]">
                  {`Audio (${type})`}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseSentences.map((sentence, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{sentence.target.sentence}</TableCell>
                {VOICE_TYPES.map((type) => (
                  <TableCell key={type}>
                    {renderAudioCell(sentence.target.voiceTypes, type)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 