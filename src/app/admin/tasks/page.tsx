import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TasksTable } from "@/components/tasks/tasks-table"

async function getTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
    },
    include: {
      case: {
        select: {
          title: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return tasks
}

export default async function TasksPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const tasks = await getTasks(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">
          Manage all your tasks across cases
        </p>
      </div>

      <TasksTable data={tasks} />
    </div>
  )
} 