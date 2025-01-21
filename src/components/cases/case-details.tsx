"use client"

import { Case, Document, Note, Party, Task } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseForm } from "./case-form"
import { CaseDocuments } from "./case-documents"
import { CaseNotes } from "./case-notes"
import { CaseTasks } from "./case-tasks"
import { CaseParties } from "./case-parties"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface CaseDetailsProps {
  case_: Case & {
    documents: Document[]
    notes: Note[]
    tasks: Task[]
    parties: Party[]
  }
}

export function CaseDetails({ case_ }: CaseDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{case_.title}</h2>
        <p className="text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(case_.updatedAt), { addSuffix: true })}
        </p>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseForm
                initialData={{
                  title: case_.title,
                  description: case_.description || "",
                  status: case_.status,
                }}
                caseId={case_.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <CaseDocuments caseId={case_.id} documents={case_.documents} />
        </TabsContent>

        <TabsContent value="notes">
          <CaseNotes caseId={case_.id} notes={case_.notes} />
        </TabsContent>

        <TabsContent value="tasks">
          <CaseTasks caseId={case_.id} tasks={case_.tasks} />
        </TabsContent>

        <TabsContent value="parties">
          <CaseParties caseId={case_.id} parties={case_.parties} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 