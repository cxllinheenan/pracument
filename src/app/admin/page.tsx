import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { 
  FileText, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Folder,
  Scale
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TasksTable } from "@/components/tasks/tasks-table"

async function getDashboardStats(userId: string) {
  const [
    documentCount,
    activeCases,
    recentCase,
    caseStats,
    totalParties,
    recentDocuments,
    recentTasks
  ] = await Promise.all([
    prisma.document.count({
      where: { userId }
    }),
    prisma.case.count({
      where: { 
        userId,
        status: "ACTIVE"
      }
    }),
    prisma.case.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        status: true,
        description: true
      }
    }),
    prisma.case.groupBy({
      by: ['status'],
      where: { userId },
      _count: true
    }),
    prisma.party.count({
      where: {
        case: {
          userId
        }
      }
    }),
    // Get 5 most recent documents
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
        size: true
      }
    }),
    prisma.task.findMany({
      where: {
        userId,
        status: {
          in: ['TODO', 'IN_PROGRESS']
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        case: {
          select: {
            title: true,
            status: true,
          },
        },
      },
    })
  ])

  const statusCounts = {
    ACTIVE: 0,
    PENDING: 0,
    CLOSED: 0,
    ARCHIVED: 0,
    ...Object.fromEntries(
      caseStats.map(stat => [stat.status, stat._count])
    )
  }

  return { 
    documentCount, 
    activeCases, 
    recentCase,
    statusCounts,
    totalParties,
    recentDocuments,
    recentTasks
  }
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const stats = await getDashboardStats(session.user.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/admin/cases/new">
              <Briefcase className="mr-2 h-4 w-4" />
              New Case
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats - Made more compact */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">{stats.statusCounts.ACTIVE}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.statusCounts.PENDING} pending
                </p>
              </div>
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">{stats.documentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Across all cases
                </p>
              </div>
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm font-medium">Parties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">{stats.totalParties}</div>
                <p className="text-xs text-muted-foreground">
                  Total involved parties
                </p>
              </div>
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <Scale className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm font-medium">Case Completion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">{stats.statusCounts.CLOSED}</div>
                <p className="text-xs text-muted-foreground">
                  Cases completed
                </p>
              </div>
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-7">
        {/* Case Overview - More compact */}
        <Card className="col-span-1 md:col-span-4 shadow-sm">
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">Case Overview</CardTitle>
            <CardDescription className="text-xs">Current case status distribution</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                    <span className="font-bold">{stats.statusCounts.ACTIVE}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all" 
                      style={{ 
                        width: `${(stats.statusCounts.ACTIVE / Object.values(stats.statusCounts).reduce((a, b) => a + b, 0)) * 100}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="font-bold">{stats.statusCounts.PENDING}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all" 
                      style={{ 
                        width: `${(stats.statusCounts.PENDING / Object.values(stats.statusCounts).reduce((a, b) => a + b, 0)) * 100}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Closed</span>
                    </div>
                    <span className="font-bold">{stats.statusCounts.CLOSED}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all" 
                      style={{ 
                        width: `${(stats.statusCounts.CLOSED / Object.values(stats.statusCounts).reduce((a, b) => a + b, 0)) * 100}%` 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - More compact */}
        <Card className="col-span-1 md:col-span-3 shadow-sm">
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <CardDescription className="text-xs">Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            <div className="space-y-4">
              {stats.recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-start gap-3">
                  <div className="rounded-full p-1.5 bg-primary/10">
                    <FileText className="h-3 w-3 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{(doc.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table - More compact */}
      <Card className="shadow-sm">
        <CardHeader className="py-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Recent Tasks</CardTitle>
            <CardDescription className="text-xs">Your active and upcoming tasks</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="h-8">
            <Link href="/admin/tasks">
              View All Tasks
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="py-2">
          <TasksTable 
            data={stats.recentTasks}
            simplified
          />
        </CardContent>
      </Card>
    </div>
  )
} 