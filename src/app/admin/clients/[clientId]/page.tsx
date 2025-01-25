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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>
            <div className="flex items-center gap-2">
              <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {client.status.toLowerCase()}
              </Badge>
              {client.company && (
                <p className="text-sm text-muted-foreground">
                  {client.company}
                </p>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Client since {format(new Date(client.createdAt), 'MMM d, yyyy')}
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="cases">
              Cases ({client.cases.length})
            </TabsTrigger>
            <TabsTrigger value="documents">
              Documents ({client.documents.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notes ({client.clientNotes.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
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