import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ClientsTable } from "@/components/clients/clients-table"

async function getClients(userId: string) {
  const clients = await prisma.client.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: {
          cases: true,
          documents: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return clients
}

export default async function ClientsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const clients = await getClients(session.user.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client relationships
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>

      <ClientsTable data={clients} />
    </div>
  )
}
