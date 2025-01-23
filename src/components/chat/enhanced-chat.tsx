"use client"

import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MemoizedMarkdown } from '@/components/ui/memoized-markdown'
import { cn } from "@/lib/utils"
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
  Copy
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface EnhancedChatProps {
  cases?: Case[]
  documents?: Document[]
}

export function EnhancedChat({ cases = [], documents = [] }: EnhancedChatProps) {
  const [selectedCase, setSelectedCase] = useState<Case>()
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([])
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    id: 'legal-chat',
    body: {
      caseId: selectedCase?.id,
      documentIds: selectedDocuments?.map(d => d.id)
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to Pracument AI\n\nI\'m your dedicated legal assistant, ready to help with your cases and documents. To get started:\n\n📁 Select a case or documents for context\n💬 Ask questions about specific matters\n📝 Get help with analysis and drafting'
      }
    ]
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
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
              <Button variant="outline" size="sm" className="gap-2">
                <PanelRightOpen className="h-4 w-4" />
                Context
                {(selectedCase || selectedDocuments.length > 0) && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDocuments.length + (selectedCase ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Select Context</SheetTitle>
              </SheetHeader>
              
              {/* Selected Context Display */}
              {(selectedCase || selectedDocuments.length > 0) && (
                <div className="mt-4 p-4 border rounded-lg space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Selected Context</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase && (
                      <Badge variant="secondary" className="gap-1.5">
                        <Briefcase className="h-3 w-3" />
                        {selectedCase.title}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => setSelectedCase(undefined)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {selectedDocuments.map(doc => (
                      <Badge key={doc.id} variant="secondary" className="gap-1.5">
                        <FileText className="h-3 w-3" />
                        {doc.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => setSelectedDocuments(prev => 
                            prev.filter(d => d.id !== doc.id)
                          )}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Tabs defaultValue="cases" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cases">Cases</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cases" className="mt-4 space-y-4">
                  {cases?.length ? (
                    cases.map(case_ => (
                      <Button
                        key={case_.id}
                        variant={selectedCase?.id === case_.id ? "default" : "outline"}
                        className="w-full justify-start gap-2"
                        onClick={() => setSelectedCase(
                          selectedCase?.id === case_.id ? undefined : case_
                        )}
                      >
                        <Briefcase className="h-4 w-4" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{case_.title}</div>
                          {case_.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {case_.description}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No cases available
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="documents" className="mt-4 space-y-4">
                  {documents?.length ? (
                    documents.map(doc => (
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
                        <div className="flex-1 text-left">
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(doc.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No documents available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {/* Selected Context Display in Chat */}
        {(selectedCase || selectedDocuments.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            {selectedCase && (
              <Badge variant="secondary" className="gap-1.5">
                <Briefcase className="h-3 w-3" />
                {selectedCase.title}
              </Badge>
            )}
            {selectedDocuments.map(doc => (
              <Badge key={doc.id} variant="secondary" className="gap-1.5">
                <FileText className="h-3 w-3" />
                {doc.name}
              </Badge>
            ))}
          </div>
        )}

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
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigator.clipboard.writeText(message.content)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/10 border-t-primary" />
            <span>AI is thinking...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-2 rounded-lg bg-destructive/10">
            <XCircle className="h-4 w-4" />
            <p>An error occurred. Please try again.</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder={
              selectedCase 
                ? `Ask about case "${selectedCase.title}"...`
                : selectedDocuments.length
                ? "Ask about the selected documents..."
                : "Type your message..."
            }
            className="min-h-[60px] max-h-[180px]"
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
            className="h-[60px] w-[60px]"
            disabled={isLoading || !input.trim()}
          >
            <Send className={cn(
              "h-4 w-4",
              isLoading && "animate-pulse"
            )} />
          </Button>
        </form>
      </div>
    </div>
  )
} 