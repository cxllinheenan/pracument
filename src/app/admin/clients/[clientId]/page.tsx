import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ClientForm } from "@/components/clients/client-form"
import { ClientCases } from "@/components/clients/client-cases"
import { ClientDocuments } from "@/components/clients/client-documents"
import { ClientNotes } from "@/components/clients/client-notes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Bot, Plus, FileText, Scale, MessageSquare, Clock, ArrowUpRight } from "lucide-react"

async function getClient(clientId: string, userId: string) {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      userId,
    },
    include: {
      cases: {
        orderBy: { updatedAt: 'desc' },
      },
      documents: {
        orderBy: { updatedAt: 'desc' },
      },
      clientNotes: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  })

  if (!client) notFound()

  return client
}

// Update the interface for the page props
interface PageProps {
  params: Promise<{ clientId: string }> | { clientId: string }
}

export default async function ClientPage({ params }: PageProps) {
  // Await both the params and auth session
  const [resolvedParams, session] = await Promise.all([
    Promise.resolve(params),
    auth()
  ])

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Use the resolved clientId
  const clientId = String(resolvedParams.clientId)
  
  if (!clientId) {
    notFound()
  }

  try {
    const client = await getClient(clientId, session.user.id)
    
    // Calculate additional stats
    const activeCases = client.cases.filter(c => c.status === 'ACTIVE').length
    const casePercentage = Math.round((activeCases / client.cases.length) * 100) || 0
    
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8">
        {/* Enhanced Client Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Client since {format(new Date(client.createdAt), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link href={`/admin/chat?clientId=${client.id}`}>
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant
              </Link>
            </Button>
            <Button size="sm" className="h-9" asChild>
              <Link href={`/admin/cases/new?clientId=${client.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                New Case
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{activeCases}</span>
                    {casePercentage > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {casePercentage}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  <span className="text-2xl font-bold">{client.documents.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <span className="text-2xl font-bold">{client.clientNotes.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Card className="mt-6">
          <Tabs defaultValue="details" className="w-full">
            <div className="border-b px-4">
              <TabsList className="bg-transparent h-14">
                <TabsTrigger value="details" className="data-[state=active]:bg-background">
                  Details
                </TabsTrigger>
                <TabsTrigger value="cases" className="data-[state=active]:bg-background">
                  Cases ({client.cases.length})
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-background">
                  Documents ({client.documents.length})
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-background">
                  Notes ({client.clientNotes.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="details" className="mt-0">
                <div className="max-w-3xl mx-auto">
                  <ClientForm 
                    initialData={client} 
                    clientId={client.id}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="cases" className="mt-0">
                <ClientCases 
                  clientId={client.id}
                  cases={client.cases}
                />
              </TabsContent>
              
              <TabsContent value="documents" className="mt-0">
                <ClientDocuments 
                  clientId={client.id}
                  documents={client.documents}
                />
              </TabsContent>
              
              <TabsContent value="notes" className="mt-0">
                <ClientNotes 
                  clientId={client.id}
                  notes={client.clientNotes}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("[CLIENT_PAGE_ERROR]", error)
    notFound()
  }
} 