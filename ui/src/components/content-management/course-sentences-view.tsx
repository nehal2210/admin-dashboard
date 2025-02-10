import { useCourseSentencesStore } from "@/store/courseSentencesStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

const voiceTypes = [
  'male_normal',
  'female_normal',
  'male_slow',
  'female_slow',
  'male_formal',
  'female_formal'
]

interface AudioPlayerProps {
  url: string;
}

function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState('0:00')
  const [currentTime, setCurrentTime] = useState('0:00')
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleTimeUpdate = () => {
        const current = audio.currentTime
        const minutes = Math.floor(current / 60)
        const seconds = Math.floor(current % 60)
        setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        setProgress((current / audio.duration) * 100)
      }

      audio.addEventListener('loadedmetadata', () => {
        const minutes = Math.floor(audio.duration / 60)
        const seconds = Math.floor(audio.duration % 60)
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      })

      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setProgress(0)
        setCurrentTime('0:00')
      })

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [])

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

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    if (audioRef.current) {
      const seekTime = (newTime / 100) * audioRef.current.duration
      audioRef.current.currentTime = seekTime
    }
  }

  const handleSkip = (direction: 'forward' | 'backward') => {
    if (audioRef.current) {
      const skipAmount = 5 // seconds
      const newTime = direction === 'forward' 
        ? audioRef.current.currentTime + skipAmount 
        : audioRef.current.currentTime - skipAmount
      audioRef.current.currentTime = Math.max(0, Math.min(newTime, audioRef.current.duration))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-2">
      <div className="flex flex-col gap-3 w-full max-w-[300px] rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSkip('backward')}
              className="h-8 w-8 hover:scale-110 transition-transform"
              title="Skip backward 5 seconds"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className={cn(
                "h-8 w-8 hover:scale-110 transition-transform",
                isPlaying && "text-primary"
              )}
            >
              {isPlaying ? 
                <Pause className="h-4 w-4 animate-pulse" /> : 
                <Play className="h-4 w-4" />
              }
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSkip('forward')}
              className="h-8 w-8 hover:scale-110 transition-transform"
              title="Skip forward 5 seconds"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 group">
            <Volume2 className="h-4 w-4 group-hover:text-primary transition-colors" />
            <div className="relative">
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={(value) => {
                  setVolume(value[0])
                  if (audioRef.current) audioRef.current.volume = value[0]
                }}
                className="w-20 group-hover:bg-primary/20 transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8 tabular-nums">
            {currentTime}
          </span>
          <div className="relative flex-1 group">
            <Slider
              value={[progress]}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              className="group-hover:bg-primary/20 transition-colors"
            />
            <div 
              className="absolute bottom-full mb-1 left-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
            >
              <span className="text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded">
                {currentTime}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground w-8 tabular-nums">
            {duration}
          </span>
          <audio ref={audioRef} src={url} />
        </div>
      </div>
    </div>
  )
}

export function CourseSentencesView() {
  const courseSentences = useCourseSentencesStore((state) => state.courseSentences)

  const getAudioUrlByType = (voiceTypes: Array<{ type: string; audioUrl: string }>, type: string) => {
    const voice = voiceTypes.find(v => v.type === type)
    return voice?.audioUrl || ''
  }

  return (
    <div className="space-y-8">
      {/* Source Language Table */}
      <Card>
        <CardHeader>
          <CardTitle>Source Language Sentences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="min-w-[200px]">Sentence</TableHead>
                  {voiceTypes.map(type => (
                    <TableHead key={type} className="min-w-[250px]">audio_{type}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseSentences.map((sentence, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{sentence.source.sentence}</TableCell>
                    {voiceTypes.map(type => (
                      <TableCell key={type}>
                        {getAudioUrlByType(sentence.source.voiceTypes, type) && (
                          <AudioPlayer url={getAudioUrlByType(sentence.source.voiceTypes, type)} />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Target Language Table */}
      <Card>
        <CardHeader>
          <CardTitle>Target Language Sentences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="min-w-[200px]">Sentence</TableHead>
                  {voiceTypes.map(type => (
                    <TableHead key={type} className="min-w-[250px]">audio_{type}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseSentences.map((sentence, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{sentence.target.sentence}</TableCell>
                    {voiceTypes.map(type => (
                      <TableCell key={type}>
                        {getAudioUrlByType(sentence.target.voiceTypes, type) && (
                          <AudioPlayer url={getAudioUrlByType(sentence.target.voiceTypes, type)} />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}