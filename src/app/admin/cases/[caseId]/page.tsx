import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CaseDetails } from "@/components/cases/case-details"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ caseId: string }> | { caseId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getCaseDetails(caseId: string, userId: string) {
  if (!caseId) {
    notFound()
  }

  const case_ = await prisma.case.findUnique({
    where: {
      id: caseId,
      userId,
    },
    include: {
      documents: true,
      notes: {
        orderBy: { createdAt: 'desc' }
      },
      tasks: {
        orderBy: { createdAt: 'desc' }
      },
      parties: true,
    },
  })

  if (!case_) {
    notFound()
  }

  return case_
}

export default async function CaseDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const resolvedParams = await params
  const caseId = String(resolvedParams.caseId)
  
  if (!caseId) {
    notFound()
  }

  try {
    const case_ = await getCaseDetails(caseId, session.user.id)
    return <CaseDetails case_={case_} />
  } catch (error) {
    console.error("[CASE_DETAILS_ERROR]", error)
    throw error
  }
} 