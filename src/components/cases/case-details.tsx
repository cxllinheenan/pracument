"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Case, Document, Note, Task, Party } from "@prisma/client"
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

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "PENDING", "CLOSED", "ARCHIVED"]),
})

type FormValues = z.infer<typeof formSchema>

interface CaseDetailsProps {
  case_: Case & {
    documents: Document[]
    notes: Note[]
    tasks: Task[]
    parties: Party[]
  }
}

export function CaseDetails({ case_ }: CaseDetailsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: case_.title,
      description: case_.description || "",
      status: case_.status,
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/cases/${case_.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update case")
      }

      toast.success("Case updated successfully")
      router.refresh()
    } catch (error) {
      console.error("[CASE_UPDATE_ERROR]", error)
      toast.error("Failed to update case")
    } finally {
      setIsLoading(false)
    }
  }

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
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="max-w-xl" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      className="max-w-xl resize-none" 
                                      rows={4}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="max-w-xl">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="ACTIVE">Active</SelectItem>
                                      <SelectItem value="PENDING">Pending</SelectItem>
                                      <SelectItem value="CLOSED">Closed</SelectItem>
                                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex items-center gap-4">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={() => form.reset()}
                              disabled={isLoading}
                            >
                              Reset
                            </Button>
                          </div>
                        </form>
                      </Form>
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