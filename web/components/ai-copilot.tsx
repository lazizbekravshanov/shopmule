'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
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
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const quickActions = [
  { icon: TrendingUp, label: 'Get recommendations', prompt: 'What should I focus on today? Give me your recommendations.' },
  { icon: Wrench, label: 'Pending work orders', prompt: 'Show me all pending work orders' },
  { icon: Package, label: 'Low stock items', prompt: 'Check inventory for low stock items' },
  { icon: Users, label: 'Dashboard stats', prompt: 'Give me a summary of the dashboard stats' },
]

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    chatId: 'shopmule-copilot',
    api: '/api/ai/chat',
    fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    await sendMessage({ content: message })
  }

  const handleQuickAction = async (prompt: string) => {
    setInputValue('')
    await sendMessage({ content: prompt })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary-600 hover:bg-primary-700 shadow-lg z-50"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 flex flex-col transition-all duration-200",
        isMinimized ? "h-14" : "h-[600px]"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50 rounded-t-xl cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-neutral-900">ShopMule AI</h3>
            <p className="text-xs text-neutral-500">Your shop assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
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
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="font-medium text-neutral-900">How can I help?</h4>
                  <p className="text-sm text-neutral-500 mt-1">
                    I can help you manage work orders, check inventory, and more.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                    >
                      <action.icon className="h-4 w-4 text-primary-600" />
                      <span className="text-sm text-neutral-700">{action.label}</span>
                    </button>
                  ))}
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
                      <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%]",
                        message.role === 'user'
                          ? "bg-primary-600 text-white"
                          : "bg-neutral-100 text-neutral-900"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.parts?.map((part, i) => {
                          if (part.type === 'text') {
                            return <span key={i}>{part.text}</span>
                          }
                          if (part.type === 'tool-invocation') {
                            return (
                              <div key={i} className="text-xs text-neutral-500 flex items-center gap-1 my-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Running: {part.toolInvocation.toolName}
                              </div>
                            )
                          }
                          return null
                        }) || message.content}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-neutral-600" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-neutral-100 rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-neutral-200"
          >
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
