import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { CaseForm } from "@/components/cases/case-form"
import { CaseDocuments } from "@/components/cases/case-documents"
import { CaseNotes } from "@/components/cases/case-notes"
import { CaseTasks } from "@/components/cases/case-tasks"
import { CaseParties } from "@/components/cases/case-parties"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Bot, FileText, MessageSquare, CheckSquare, Users, Clock } from "lucide-react"

async function getCaseDetails(caseId: string, userId: string) {
  if (!caseId) notFound()

  const case_ = await prisma.case.findUnique({
    where: {
      id: caseId,
      userId,
    },
    include: {
      client: true,
      documents: {
        orderBy: { updatedAt: 'desc' },
      },
      notes: {
        orderBy: { createdAt: 'desc' },
      },
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
      parties: true,
    },
  })

  if (!case_) notFound()
  return case_
}

export default async function CasePage({ params }: { params: { caseId: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  try {
    const case_ = await getCaseDetails(params.caseId, session.user.id)
    
    // Calculate stats
    const completedTasks = case_.tasks.filter(t => t.status === 'COMPLETED').length
    const taskProgress = Math.round((completedTasks / case_.tasks.length) * 100) || 0
    
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8">
        {/* Enhanced Case Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary">
                {case_.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{case_.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Opened {format(new Date(case_.createdAt), 'MMMM d, yyyy')}
                </span>
                {case_.client && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Link 
                      href={`/admin/clients/${case_.client.id}`}
                      className="text-sm hover:underline"
                    >
                      {case_.client.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link href={`/admin/chat?caseId=${case_.id}`}>
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{completedTasks}/{case_.tasks.length}</span>
                    <Badge variant="secondary" className="ml-1">
                      {taskProgress}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  <span className="text-2xl font-bold">{case_.documents.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Parties</p>
                  <span className="text-2xl font-bold">{case_.parties.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <span className="text-2xl font-bold">{case_.notes.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="mt-6">
          <Tabs defaultValue="details" className="w-full">
            <div className="border-b px-4">
              <TabsList className="bg-transparent h-14">
                <TabsTrigger value="details" className="data-[state=active]:bg-background">
                  Details
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-background">
                  Documents ({case_.documents.length})
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-background">
                  Notes ({case_.notes.length})
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-background">
                  Tasks ({case_.tasks.length})
                </TabsTrigger>
                <TabsTrigger value="parties" className="data-[state=active]:bg-background">
                  Parties ({case_.parties.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="details" className="mt-0">
                <div className="max-w-3xl mx-auto">
                  <CaseForm 
                    initialData={{
                      title: case_.title,
                      description: case_.description || "",
                      status: case_.status,
                    }}
                    caseId={case_.id}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-0">
                <CaseDocuments 
                  caseId={case_.id}
                  documents={case_.documents}
                />
              </TabsContent>
              
              <TabsContent value="notes" className="mt-0">
                <CaseNotes 
                  caseId={case_.id}
                  notes={case_.notes}
                />
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-0">
                <CaseTasks 
                  caseId={case_.id}
                  tasks={case_.tasks}
                />
              </TabsContent>
              
              <TabsContent value="parties" className="mt-0">
                <CaseParties 
                  caseId={case_.id}
                  parties={case_.parties}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("[CASE_PAGE_ERROR]", error)
    throw error
  }
} 