import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Users, ArrowUpRight, Building2, FileText } from "lucide-react"
import { ClientsTable } from "@/components/clients/clients-table"
import { Badge } from "@/components/ui/badge"

async function getClients(userId: string) {
  const [clients, stats, documentCount] = await Promise.all([
    prisma.client.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            cases: true,
            documents: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.client.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    }),
    prisma.document.count({
      where: { userId }
    })
  ])

  return { clients, stats, documentCount }
}

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { clients, stats, documentCount } = await getClients(session.user.id)

  const activeClients = stats.find(s => s.status === 'ACTIVE')?._count ?? 0
  const totalClients = stats.reduce((acc, curr) => acc + curr._count, 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-sm text-muted-foreground">
            Manage your client relationships and cases
          </p>
        </div>
        <Button size="sm" className="h-9" asChild>
          <Link href="/admin/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="group p-6 bg-card hover:bg-accent/5 rounded-xl border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-muted-foreground">Total Clients</div>
              <div className="text-2xl font-bold">{totalClients}</div>
            </div>
          </div>
        </div>
        <div className="group p-6 bg-card hover:bg-accent/5 rounded-xl border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-muted-foreground">Active Clients</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{activeClients}</span>
                <Badge variant="secondary" className="ml-1 shadow-sm">
                  {Math.round((activeClients / totalClients) * 100)}% Active
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="group p-6 bg-card hover:bg-accent/5 rounded-xl border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-muted-foreground">Companies</div>
              <div className="text-2xl font-bold">
                {clients.filter(c => c.company).length}
              </div>
            </div>
          </div>
        </div>
        <div className="group p-6 bg-card hover:bg-accent/5 rounded-xl border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-muted-foreground">Documents</div>
              <div className="text-2xl font-bold">
                {clients.reduce((acc, curr) => acc + curr._count.documents, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-muted/40 rounded-lg">
        <span className="text-sm font-medium text-muted-foreground mr-2">Status Distribution:</span>
        {stats.map((stat) => (
          <Badge 
            key={stat.status} 
            variant={stat.status === 'ACTIVE' ? 'default' : 'secondary'}
            className="h-7 px-3 shadow-sm hover:shadow-md transition-all cursor-default"
          >
            {stat.status.toLowerCase()}: {stat._count}
          </Badge>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-2">
          <ClientsTable data={clients} />
        </div>
      </div>
    </div>
  )
}
