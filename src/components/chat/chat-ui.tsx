"use client"

import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef } from "react"

export function ChatUI() {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading,
    error
  } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your legal AI assistant. How can I help you today?'
      }
    ]
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4 space-y-4 border rounded-t-lg"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
              {message.role === 'assistant' ? (
                <Bot className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4 text-primary" />
              )}
            </div>
            <Card className={`flex-1 p-3 ${
              message.role === 'assistant' ? 'bg-muted' : 'bg-primary/10'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <Card className="p-3 bg-destructive/10 text-destructive">
            <p className="text-sm">An error occurred. Please try again.</p>
          </Card>
        )}
      </ScrollArea>
      <form 
        onSubmit={handleSubmit} 
        className="p-4 border rounded-b-lg bg-background"
      >
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 min-h-[60px] max-h-[180px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
} 