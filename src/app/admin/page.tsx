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
    totalClients,
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
    prisma.client.count({
      where: { userId }
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
    totalClients,
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
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
              {session.user.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your cases and documents today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="shadow-sm" asChild>
            <Link href="/admin/cases/new">
              <Briefcase className="mr-2 h-4 w-4" />
              New Case
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="shadow-sm" asChild>
            <Link href="/admin/documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{stats.statusCounts.ACTIVE}</h3>
                  {stats.statusCounts.PENDING > 0 && (
                    <Badge variant="secondary" className="font-normal">
                      +{stats.statusCounts.PENDING} pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{stats.documentCount}</h3>
                  <span className="text-sm text-muted-foreground">total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{stats.totalClients}</h3>
                  <span className="text-sm text-muted-foreground">registered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{stats.statusCounts.CLOSED}</h3>
                  <span className="text-sm text-muted-foreground">cases</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
        {/* Case Overview */}
        <Card className="col-span-1 md:col-span-4 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Case Overview</CardTitle>
                <CardDescription>Status distribution of your cases</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8" asChild>
                <Link href="/admin/cases">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-4">
              {/* Active Cases */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Active Cases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{stats.statusCounts.ACTIVE}</span>
                    <Badge variant="secondary" className="font-normal">
                      {Math.round((stats.statusCounts.ACTIVE / Object.values(stats.statusCounts).reduce((a, b) => a + b, 0)) * 100)}%
                    </Badge>
                  </div>
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

              {/* Pending Cases */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Pending Cases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{stats.statusCounts.PENDING}</span>
                    <Badge variant="secondary" className="font-normal">
                      {Math.round((stats.statusCounts.PENDING / Object.values(stats.statusCounts).reduce((a, b) => a + b, 0)) * 100)}%
                    </Badge>
                  </div>
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

              {/* Closed Cases */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Closed Cases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{stats.statusCounts.CLOSED}</span>
                    <Badge variant="secondary" className="font-normal">
                      {Math.round((stats.statusCounts.CLOSED / Object.values(stats.statusCounts).reduce((a, b) => a + b, 0)) * 100)}%
                    </Badge>
                  </div>
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
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1 md:col-span-3 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and changes</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8" asChild>
                <Link href="/admin/documents">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-4">
              {stats.recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 group">
                  <div className="rounded-lg p-2 bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{(doc.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                    <Link href={`/admin/documents/${doc.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Your active and upcoming tasks</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8" asChild>
              <Link href="/admin/tasks">View All Tasks</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <TasksTable 
            data={stats.recentTasks}
            simplified
          />
        </CardContent>
      </Card>
    </div>
  )
} 