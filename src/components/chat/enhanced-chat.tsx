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
import { Case, Document, Client } from "@prisma/client"
import { 
  Send, 
  Bot, 
  User, 
  Briefcase,
  FileText,
  PanelRightOpen,
  RefreshCcw,
  XCircle,
  Copy,
  Settings
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface EnhancedChatProps {
  cases?: Case[]
  documents?: Document[]
  clients?: Client[]
  initialClientId?: string
  userId: string
}

export function EnhancedChat({ 
  cases = [], 
  documents = [], 
  clients = [],
  initialClientId,
  userId 
}: EnhancedChatProps) {
  const [selectedCase, setSelectedCase] = useState<Case>()
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([])
  const [selectedClient, setSelectedClient] = useState<Client>()
  
  useEffect(() => {
    if (initialClientId) {
      const client = clients.find(c => c.id === initialClientId)
      if (client) setSelectedClient(client)
    }
  }, [initialClientId, clients])
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    id: `legal-chat-${userId}`,
    body: {
      caseId: selectedCase?.id,
      clientId: selectedClient?.id,
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

  useEffect(() => {
    const chatHistory = localStorage.getItem(`legal-chat-${userId}`)
    if (!chatHistory) {
      localStorage.removeItem('legal-chat')
    }
  }, [userId])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="relative flex flex-col h-full bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pracument AI</h2>
            <p className="text-sm text-muted-foreground">Legal Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => reload()}
            disabled={isLoading || messages.length <= 1}
            className="h-9 w-9"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Context
                {(selectedCase || selectedClient || selectedDocuments.length > 0) && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDocuments.length + (selectedCase ? 1 : 0) + (selectedClient ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-full p-0">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle>Chat Settings</SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-4 space-y-6">
                  {/* Selected Context Display */}
                  {(selectedCase || selectedClient || selectedDocuments.length > 0) && (
                    <div className="p-4 border rounded-lg space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Active Context</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedClient && (
                          <Badge variant="secondary" className="gap-1.5">
                            <User className="h-3 w-3" />
                            {selectedClient.name}
                            <XCircle 
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                              onClick={() => setSelectedClient(undefined)}
                            />
                          </Badge>
                        )}
                        {selectedCase && (
                          <Badge variant="secondary" className="gap-1.5">
                            <Briefcase className="h-3 w-3" />
                            {selectedCase.title}
                            <XCircle 
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                              onClick={() => setSelectedCase(undefined)}
                            />
                          </Badge>
                        )}
                        {selectedDocuments.map(doc => (
                          <Badge key={doc.id} variant="secondary" className="gap-1.5">
                            <FileText className="h-3 w-3" />
                            {doc.name}
                            <XCircle 
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                              onClick={() => setSelectedDocuments(prev => 
                                prev.filter(d => d.id !== doc.id)
                              )}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Tabs defaultValue="clients" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="clients">Clients</TabsTrigger>
                      <TabsTrigger value="cases">Cases</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>
                    
                    <div className="space-y-4">
                      <TabsContent value="clients" className="m-0">
                        {clients?.length ? (
                          clients.map(client => (
                            <Button
                              key={client.id}
                              variant={selectedClient?.id === client.id ? "default" : "outline"}
                              className="w-full justify-start gap-2"
                              onClick={() => setSelectedClient(
                                selectedClient?.id === client.id ? undefined : client
                              )}
                            >
                              <User className="h-4 w-4" />
                              <div className="flex-1 text-left">
                                <div className="font-medium">{client.name}</div>
                                {client.company && (
                                  <div className="text-xs text-muted-foreground">
                                    {client.company}
                                  </div>
                                )}
                              </div>
                            </Button>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            No clients available
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="cases" className="m-0">
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

                      <TabsContent value="documents" className="m-0">
                        {documents?.length ? (
                          <div className="space-y-2">
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
                                <div className="flex-1 text-left truncate">
                                  <div className="font-medium truncate">{doc.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {(doc.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            No documents available
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-6"
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "group flex items-start gap-3 px-4",
              message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
            )}
          >
            <div 
              className={cn(
                "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full",
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
              "flex flex-col gap-2 max-w-[80%]",
              message.role === 'assistant' ? 'items-start' : 'items-end'
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-2",
                message.role === 'assistant' 
                  ? "bg-muted" 
                  : "bg-primary text-primary-foreground"
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MemoizedMarkdown id={message.id} content={message.content} />
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  navigator.clipboard.writeText(message.content)
                  toast({
                    title: "Copied",
                    description: "Message copied to clipboard"
                  })
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground px-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/10 border-t-primary" />
            <span>AI is thinking...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-4 mx-4 rounded-lg bg-destructive/10">
            <XCircle className="h-4 w-4" />
            <p>An error occurred. Please try again.</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 md:p-6">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-5xl mx-auto">
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
            className="min-h-[56px] max-h-[200px] resize-none"
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
            className="h-[56px] w-[56px] shrink-0"
            disabled={isLoading || !input.trim()}
          >
            <Send className={cn(
              "h-5 w-5",
              isLoading && "animate-pulse"
            )} />
          </Button>
        </form>
      </div>
    </div>
  )
} 