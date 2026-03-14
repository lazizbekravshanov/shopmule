'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  MessageSquare,
  Wrench,
  Package,
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
  Search,
  AlertCircle,
  RefreshCw,
  ImagePlus,
  Mic,
  MicOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MuleIcon } from '@/components/ui/mule-logo'

const quickActions = [
  { icon: TrendingUp, label: "What's happening?", prompt: "What's going on in the shop today? Give me the rundown." },
  { icon: Calendar, label: "Today's schedule", prompt: "Show me today's schedule - who's working on what?" },
  { icon: Package, label: 'Low stock', prompt: 'What parts are running low?' },
  { icon: Search, label: 'Find something', prompt: 'I need to find...' },
]

const examplePrompts = [
  "Find John's truck",
  "How many jobs in progress?",
  "Create a work order for oil change",
  "What should I focus on today?",
  "Show pending estimates",
  "Check brake pads inventory",
]

interface QueuedImage {
  base64: string
  mediaType: string
  preview: string // object URL for thumbnail
  file: File
}

// Web Speech API types (not all browsers declare these globally)
type SpeechRecognitionType = {
  new (): {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((event: Event & { results: SpeechRecognitionResultList }) => void) | null
    onerror: (() => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
  }
}
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType
    webkitSpeechRecognition: SpeechRecognitionType
  }
}

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [queuedImages, setQueuedImages] = useState<QueuedImage[]>([])
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null)

  const { messages, sendMessage, regenerate, status, error } = useChat({
    id: 'shopmule-copilot',
    transport: new TextStreamChatTransport({
      api: '/api/ai/chat',
      credentials: 'include',
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Image attachment handler
  const handleImageSelect = useCallback((files: FileList | null) => {
    if (!files) return
    const newImages: QueuedImage[] = []
    const maxImages = 3 - queuedImages.length // Max 3 images per message

    for (let i = 0; i < Math.min(files.length, maxImages); i++) {
      const file = files[i]
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) continue

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        setQueuedImages(prev => [...prev, {
          base64,
          mediaType: file.type,
          preview: URL.createObjectURL(file),
          file,
        }])
      }
      reader.readAsDataURL(file)
    }
  }, [queuedImages.length])

  const removeQueuedImage = (index: number) => {
    setQueuedImages(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  // Voice input handler
  const toggleVoice = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInputValue(transcript)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }, [isListening])

  const hasSpeechRecognition = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputValue.trim() && queuedImages.length === 0) || isLoading) return

    // Stop voice if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    const message = inputValue.trim()
    setInputValue('')

    if (queuedImages.length > 0) {
      // Build multipart content with text + file parts (SDK converts to provider format)
      const parts: Array<{ type: 'text'; text: string } | { type: 'file'; mediaType: string; url: string }> = []
      if (message) {
        parts.push({ type: 'text', text: message })
      }
      for (const img of queuedImages) {
        parts.push({
          type: 'file',
          mediaType: img.mediaType,
          url: `data:${img.mediaType};base64,${img.base64}`,
        })
      }
      if (!message) {
        parts.push({ type: 'text', text: "What's in this image?" })
      }
      // Clean up previews
      queuedImages.forEach(img => URL.revokeObjectURL(img.preview))
      setQueuedImages([])
      await sendMessage({ parts })
    } else {
      await sendMessage({ text: message })
    }
  }

  const handleQuickAction = async (prompt: string) => {
    if (prompt === 'I need to find...') {
      setInputValue(prompt)
      inputRef.current?.focus()
      return
    }
    setInputValue('')
    await sendMessage({ text: prompt })
  }

  // Floating button when closed
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-neutral-900 hover:bg-neutral-800 shadow-lg z-50 group"
        title="Open Mule AI Assistant"
      >
        <MuleIcon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 w-[400px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 z-50 flex flex-col transition-all duration-300",
        isMinimized ? "h-16" : "h-[650px]"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 cursor-pointer",
          "bg-neutral-900 dark:bg-neutral-950 rounded-t-2xl"
        )}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-neutral-800 flex items-center justify-center">
            <MuleIcon className="h-5 w-5 text-[#ee7a14]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Mule</h3>
            <p className="text-xs text-neutral-400">
              {isLoading ? 'Thinking...' : 'Your shop assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {error.message || 'Something went wrong'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => regenerate()}
                  className="gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try again
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="space-y-6">
                {/* Welcome */}
                <div className="text-center py-4">
                  <div className="h-16 w-16 rounded-2xl bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                    <MuleIcon className="h-8 w-8 text-[#ee7a14]" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white text-lg">Hey there, boss!</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-[280px] mx-auto">
                    I&apos;m Mule - your shop assistant. I can look up customers, check inventory, manage work orders, and more.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-left group"
                    >
                      <action.icon className="h-4 w-4 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:scale-110 transition-transform" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* Example prompts */}
                <div className="pt-2">
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-2 px-1">Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {examplePrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleQuickAction(prompt)}
                        className="px-3 py-1.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
                        <MuleIcon className="h-4 w-4 text-[#ee7a14]" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[85%]",
                        message.role === 'user'
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.parts?.map((part, i) => {
                          if (part.type === 'text') {
                            return <span key={i}>{part.text}</span>
                          }
                          const friendlyNames: Record<string, string> = {
                            searchCustomers: 'Searching customers',
                            searchVehicles: 'Looking up vehicles',
                            getDashboardStats: 'Checking shop stats',
                            getWorkOrders: 'Finding work orders',
                            createWorkOrder: 'Creating work order',
                            updateWorkOrderStatus: 'Updating status',
                            checkInventory: 'Checking inventory',
                            getTodaysSchedule: 'Getting schedule',
                            getRecommendations: 'Analyzing shop data',
                            quickSearch: 'Searching...',
                          }
                          const toolName = ('toolName' in part ? (part.toolName as string) : part.type.replace('tool-', ''))
                          if (friendlyNames[toolName]) {
                            return (
                              <div key={i} className="flex items-center gap-2 my-2 py-2 px-3 rounded-lg bg-white/50 dark:bg-neutral-700/50 text-xs text-neutral-600 dark:text-neutral-400">
                                <Loader2 className="h-3 w-3 animate-spin text-neutral-500" />
                                <span>{friendlyNames[toolName]}</span>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                      <MuleIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-2xl"
          >
            {/* Queued image thumbnails */}
            {queuedImages.length > 0 && (
              <div className="flex gap-2 mb-2">
                {queuedImages.map((img, i) => (
                  <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    <img src={img.preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeQueuedImage(i)}
                      className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files)}
            />

            <div className="flex gap-2">
              {/* Image attach button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || queuedImages.length >= 3}
                title="Attach image"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>

              {/* Voice input button */}
              {hasSpeechRecognition && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 w-10 p-0 shrink-0",
                    isListening
                      ? "text-red-500 hover:text-red-600 animate-pulse"
                      : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  )}
                  onClick={toggleVoice}
                  disabled={isLoading}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}

              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                className="flex-1 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl focus:ring-[#ee7a14]/30 focus:border-[#ee7a14]"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || (!inputValue.trim() && queuedImages.length === 0)}
                className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl px-4 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 text-center">
              Powered by Claude AI
            </p>
          </form>
        </>
      )}
    </div>
  )
}
