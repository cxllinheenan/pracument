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
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Users,
  Clock
} from "lucide-react"

interface CaseDetailsProps {
  case_: Case & {
    documents: Document[]
    notes: Note[]
    tasks: Task[]
    parties: Party[]
  }
}

export function CaseDetails({ case_ }: CaseDetailsProps) {
  const stats = [
    {
      title: "Documents",
      value: case_.documents.length,
      icon: FileText,
      color: "text-blue-500"
    },
    {
      title: "Notes",
      value: case_.notes.length,
      icon: MessageSquare,
      color: "text-green-500"
    },
    {
      title: "Tasks",
      value: case_.tasks.length,
      icon: CheckSquare,
      color: "text-yellow-500"
    },
    {
      title: "Parties",
      value: case_.parties.length,
      icon: Users,
      color: "text-purple-500"
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{case_.title}</h2>
            <Badge variant={
              case_.status === 'ACTIVE' ? 'default' :
              case_.status === 'PENDING' ? 'secondary' :
              case_.status === 'CLOSED' ? 'destructive' : 
              'outline'
            }>
              {case_.status.toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Last updated {formatDistanceToNow(new Date(case_.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                Total {stat.title.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="parties"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                Parties
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="details" className="mt-0 border-0 p-0">
                <div className="space-y-4">
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
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0 border-0 p-0">
                <CaseDocuments caseId={case_.id} documents={case_.documents} />
              </TabsContent>

              <TabsContent value="notes" className="mt-0 border-0 p-0">
                <CaseNotes caseId={case_.id} notes={case_.notes} />
              </TabsContent>

              <TabsContent value="tasks" className="mt-0 border-0 p-0">
                <CaseTasks caseId={case_.id} tasks={case_.tasks} />
              </TabsContent>

              <TabsContent value="parties" className="mt-0 border-0 p-0">
                <CaseParties caseId={case_.id} parties={case_.parties} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 