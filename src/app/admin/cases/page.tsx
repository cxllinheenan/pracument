import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Briefcase, 
  Plus, 
  FileText, 
  Users, 
  CheckSquare,
  ArrowUpDown,
  Search
} from "lucide-react"
import { CasesTable } from "@/components/cases/cases-table"

async function getCases(userId: string) {
  const cases = await prisma.case.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: {
          documents: true,
          notes: true,
          tasks: true,
          parties: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return cases
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
          <p className="text-muted-foreground">
            Manage your legal cases
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      <CasesTable data={cases} />
    </div>
  )
} 