"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CaseStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClientCaseForm } from "./client-case-form"

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
  const [isCreating, setIsCreating] = useState(false)

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium">Cases</h3>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Case
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

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
          </DialogHeader>
          <ClientCaseForm 
            clientId={clientId} 
            onSuccess={() => setIsCreating(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  )
} 