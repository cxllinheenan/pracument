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
  BarChart3
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getDashboardStats(userId: string) {
  const [
    documentCount,
    activeCases,
    recentCase,
    caseStats,
    totalParties
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
        title: true,
        updatedAt: true,
        status: true
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
    totalParties
  }
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { 
    documentCount, 
    activeCases, 
    recentCase,
    statusCounts,
    totalParties
  } = await getDashboardStats(session.user.id)

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases}</div>
            <p className="text-xs text-muted-foreground">
              {activeCases === 1 ? 'Case' : 'Cases'} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
            <p className="text-xs text-muted-foreground">
              {documentCount === 1 ? 'Document' : 'Documents'} uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parties</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParties}</div>
            <p className="text-xs text-muted-foreground">
              Across all cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Case Status</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.CLOSED}</div>
            <p className="text-xs text-muted-foreground">
              Cases completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Case Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Active</span>
                  <span className="ml-auto font-bold">{statusCounts.ACTIVE}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                  <span className="ml-auto font-bold">{statusCounts.PENDING}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Closed</span>
                  <span className="ml-auto font-bold">{statusCounts.CLOSED}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Archived</span>
                  <span className="ml-auto font-bold">{statusCounts.ARCHIVED}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCase ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Latest Update</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{recentCase.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(recentCase.updatedAt), { addSuffix: true })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      recentCase.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      recentCase.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {recentCase.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 