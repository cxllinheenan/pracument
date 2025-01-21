import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { Briefcase, Plus, Clock, Users, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

async function getCases(userId: string) {
  return await prisma.case.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          tasks: true,
          documents: true,
          parties: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export default async function CasesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const cases = await getCases(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
          <p className="text-muted-foreground mt-2">
            Manage your legal cases and associated documents
          </p>
        </div>
        <Link href="/admin/cases/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((case_) => (
          <Link href={`/admin/cases/${case_.id}`} key={case_.id}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {case_.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    case_.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    case_.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {case_.status.toLowerCase()}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {case_.description || 'No description provided'}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(case_.updatedAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{case_._count.parties} parties</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                <div className="flex flex-col p-2 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="font-medium">{case_._count.tasks}</span>
                </div>
                <div className="flex flex-col p-2 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Documents</span>
                  <span className="font-medium">{case_._count.documents}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {cases.length === 0 && (
          <Card className="p-6 col-span-full">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">No Cases Yet</h3>
            </div>
            <p className="text-muted-foreground">
              Create your first case to start managing your legal matters.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
} 