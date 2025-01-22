"use client"

import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MemoizedMarkdown } from '@/components/ui/memoized-markdown'
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Case, Document } from "@prisma/client"
import { 
  Send, 
  Bot, 
  User, 
  Briefcase,
  FileText,
  PanelRightOpen,
  RefreshCcw,
  XCircle,
  Download,
  Copy,
  MoreHorizontal 
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface EnhancedChatProps {
  cases?: Case[]
  documents?: Document[]
}

// Message input with context selector
const MessageInput = ({ 
  selectedCase,
  selectedDocuments 
}: { 
  selectedCase?: Case
  selectedDocuments?: Document[] 
}) => {
  const { input, handleSubmit, handleInputChange, isLoading } = useChat({
    id: 'legal-chat',
    body: {
      caseId: selectedCase?.id,
      documentIds: selectedDocuments?.map(d => d.id)
    },
    onError: (error) => {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {(selectedCase || selectedDocuments?.length) && (
          <div className="flex gap-2 flex-wrap">
            {selectedCase && (
              <Badge variant="outline" className="gap-1.5">
                <Briefcase className="h-3 w-3" />
                {selectedCase.title}
              </Badge>
            )}
            {selectedDocuments?.map(doc => (
              <Badge key={doc.id} variant="outline" className="gap-1.5">
                <FileText className="h-3 w-3" />
                {doc.name}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-start">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder={
              selectedCase 
                ? `Ask about case "${selectedCase.title}"...`
                : selectedDocuments?.length
                ? "Ask about the selected documents..."
                : "Ask me anything about your legal matters..."
            }
            className="min-h-[80px] max-h-[160px]"
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
            className="h-10 w-10"
            disabled={isLoading || !input.trim()}
          >
            <Send className={cn(
              "h-4 w-4",
              isLoading && "animate-pulse"
            )} />
          </Button>
        </div>
      </div>
    </form>
  )
}

export function EnhancedChat({ cases = [], documents = [] }: EnhancedChatProps) {
  const [selectedCase, setSelectedCase] = useState<Case>()
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([])
  
  const { messages, isLoading, error, reload } = useChat({
    id: 'legal-chat',
    experimental_throttle: 50,
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to Pracument AI\n\nI\'m your dedicated legal assistant, ready to help with your cases and documents. To get started:\n\n📁 Select a case or documents for context\n💬 Ask questions about specific matters\n📝 Get help with analysis and drafting'
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
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <PanelRightOpen className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Context Selection</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="cases" className="mt-4">
                  <TabsList>
                    <TabsTrigger value="cases">Cases</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cases" className="mt-4">
                    <div className="space-y-4">
                      {cases.map(case_ => (
                        <Button
                          key={case_.id}
                          variant={selectedCase?.id === case_.id ? "default" : "outline"}
                          className="w-full justify-start gap-2"
                          onClick={() => setSelectedCase(
                            selectedCase?.id === case_.id ? undefined : case_
                          )}
                        >
                          <Briefcase className="h-4 w-4" />
                          {case_.title}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="documents" className="mt-4">
                    <div className="space-y-4">
                      {documents.map(doc => (
                        <Button
                          key={doc.id}
                          variant={selectedDocuments.some(d => d.id === doc.id) ? "default" : "outline"}
                          className="w-full justify-start gap-2"
                          onClick={() => setSelectedDocuments(prev => 
                            prev.some(d => d.id === doc.id)
                              ? prev.filter(d => d.id !== doc.id)
                              : [...prev, doc]
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          {doc.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className="p-4 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "group flex items-start gap-3",
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
                <div className="flex-1 space-y-2">
                  <div className={cn(
                    "rounded-lg p-4",
                    message.role === 'assistant' 
                      ? "bg-muted/50" 
                      : "bg-primary/5"
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MemoizedMarkdown id={message.id} content={message.content} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => navigator.clipboard.writeText(message.content)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
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

        {/* Input Area */}
        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <MessageInput 
            selectedCase={selectedCase}
            selectedDocuments={selectedDocuments}
          />
        </div>
      </div>
    </div>
  )
} 