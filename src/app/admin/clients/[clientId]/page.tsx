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
import Link from "next/link"
import { Bot, Plus } from "lucide-react"

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
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        {/* Client Header */}
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
              <p className="text-sm text-muted-foreground">
                Client since {format(new Date(client.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-9" asChild>
            <Link href={`/admin/chat?clientId=${client.id}`}>
              <Bot className="mr-2 h-4 w-4" />
              Chat About Client
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-card rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Total Cases</div>
            <div className="text-2xl font-bold mt-1">{client.cases.length}</div>
          </div>
          <div className="p-4 bg-card rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Documents</div>
            <div className="text-2xl font-bold mt-1">{client.documents.length}</div>
          </div>
          <div className="p-4 bg-card rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Notes</div>
            <div className="text-2xl font-bold mt-1">{client.clientNotes.length}</div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="details" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-background">
              <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
              <TabsTrigger value="cases" className="text-sm">
                Cases ({client.cases.length})
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-sm">
                Documents ({client.documents.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-sm">
                Notes ({client.clientNotes.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="details" className="space-y-6">
            <div className="max-w-2xl">
              <ClientForm 
                initialData={client} 
                clientId={client.id}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="cases">
            <ClientCases 
              clientId={client.id}
              cases={client.cases}
            />
          </TabsContent>
          
          <TabsContent value="documents">
            <ClientDocuments 
              clientId={client.id}
              documents={client.documents}
            />
          </TabsContent>
          
          <TabsContent value="notes">
            <ClientNotes 
              clientId={client.id}
              notes={client.clientNotes}
            />
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("[CLIENT_PAGE_ERROR]", error)
    notFound()
  }
} 