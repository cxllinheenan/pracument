import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  Plus, 
  FileText, 
  Users, 
  CheckSquare,
  Clock,
  ArrowUpRight
} from "lucide-react"
import { CasesTable } from "@/components/cases/cases-table"

async function getCases(userId: string) {
  const [cases, stats] = await Promise.all([
    prisma.case.findMany({
      where: { userId },
      include: {
        client: true,
        _count: {
          select: {
            documents: true,
            notes: true,
            tasks: true,
            parties: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.case.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    })
  ])

  return { cases, stats }
}

export default async function CasesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { cases, stats } = await getCases(session.user.id)
  
  const activeCases = stats.find(s => s.status === 'ACTIVE')?._count ?? 0
  const totalCases = stats.reduce((acc, curr) => acc + curr._count, 0)
  const totalTasks = cases.reduce((acc, curr) => acc + curr._count.tasks, 0)
  const completedTasks = cases.reduce((acc, curr) => acc + (curr._count.tasks || 0), 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cases</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track your legal cases
          </p>
        </div>
        <Button size="sm" className="h-9" asChild>
          <Link href="/admin/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="group p-6 bg-card hover:bg-accent/5 rounded-xl border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-muted-foreground">Total Cases</div>
              <div className="text-2xl font-bold">{totalCases}</div>
            </div>
          </div>
        </div>
        
        <div className="group p-6 bg-card hover:bg-accent/5 rounded-xl border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-muted-foreground">Active Cases</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{activeCases}</span>
                <Badge variant="secondary" className="ml-1 shadow-sm">
                  {Math.round((activeCases / totalCases) * 100)}% Active
                </Badge>
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
                {cases.reduce((acc, curr) => acc + curr._count.documents, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="group p-6 bg-card hover:bg-accent/5 rounded-xl border shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-muted-foreground">Active Tasks</div>
              <div className="text-2xl font-bold">{totalTasks}</div>
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
          <CasesTable data={cases} />
        </div>
      </div>
    </div>
  )
} 