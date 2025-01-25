"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CaseStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Case {
  id: string
  title: string
  status: CaseStatus
  updatedAt: Date
}

interface ClientCasesProps {
  clientId: string
  cases: Case[]
}

export function ClientCases({ clientId, cases }: ClientCasesProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Cases</h3>
        <Button asChild>
          <Link href={`/admin/cases/new?clientId=${clientId}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      <div className="divide-y divide-border rounded-md border">
        {cases.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No cases found
          </div>
        ) : (
          cases.map((case_) => (
            <div
              key={case_.id}
              className="flex items-center justify-between p-4"
            >
              <div className="space-y-1">
                <Link
                  href={`/admin/cases/${case_.id}`}
                  className="font-medium hover:underline"
                >
                  {case_.title}
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant={case_.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {case_.status.toLowerCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Updated {format(new Date(case_.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 