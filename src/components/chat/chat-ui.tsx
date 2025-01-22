"use client"

import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2, RefreshCcw, XCircle, MoreHorizontal } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef } from "react"
import { MemoizedMarkdown } from '@/components/ui/memoized-markdown'
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Separate input component to prevent unnecessary re-renders
const MessageInput = () => {
  const { input, handleSubmit, handleInputChange, isLoading } = useChat({
    id: 'legal-chat',
  })

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2 items-center">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything about your legal documents..."
          className="min-h-[44px] max-h-[44px] resize-none"
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
          variant="default"
          className="h-[44px] w-[44px] shrink-0"
          disabled={isLoading || !input.trim()}
        >
          <Send className={cn(
            "h-4 w-4",
            isLoading && "animate-pulse"
          )} />
        </Button>
      </div>
    </form>
  )
}

export function ChatUI() {
  const { messages, isLoading, error, reload } = useChat({
    id: 'legal-chat',
    experimental_throttle: 50,
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to Pracument AI\n\nI\'m your dedicated legal assistant, ready to help with document management and research. How can I assist you today?\n\n📄 Document Analysis & Review\n📚 Legal Research & Citations\n📋 Case Management Support\n✍️ Contract Analysis & Drafting'
      }
    ]
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full relative bg-background rounded-lg border">
      {/* Header - Fixed height */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pracument AI</h2>
            <Badge variant="secondary" className="text-xs font-normal">
              Legal Assistant
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => reload()}
            disabled={isLoading || messages.length <= 1}
            className="h-8 w-8"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
              <DropdownMenuItem>Export Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages - Add min-height to ensure consistent sizing */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 px-4"
      >
        <div className="py-4 space-y-6 min-h-[400px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 min-h-[48px]",
                message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
              )}
            >
              <div 
                className={cn(
                  "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg",
                  message.role === 'assistant' 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className={cn(
                "flex-1 rounded-lg p-4",
                message.role === 'assistant' 
                  ? "bg-muted/50" 
                  : "bg-primary/5"
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MemoizedMarkdown id={message.id} content={message.content} />
                </div>
              </div>
            </div>
          ))}
          
          {/* Improve loading state to match message layout */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/10 border-t-primary" />
                  <div className="h-4 w-32 animate-pulse bg-muted-foreground/10 rounded" />
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-2 rounded-lg bg-destructive/10">
              <XCircle className="h-4 w-4" />
              <p>An error occurred. Please try again.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input - Fixed height */}
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <MessageInput />
      </div>
    </div>
  )
}