"use client"

import { useState } from "react"
import { Party, PartyType } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface CasePartiesProps {
  caseId: string
  parties: Party[]
}

export function CaseParties({ caseId, parties }: CasePartiesProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "PLAINTIFF" as PartyType,
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  async function addParty(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`/api/cases/${caseId}/parties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to add party")

      setFormData({
        name: "",
        type: "PLAINTIFF",
        email: "",
        phone: "",
        address: "",
        notes: "",
      })
      router.refresh()
      toast.success("Party added successfully")
    } catch (error) {
      toast.error("Failed to add party")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Party</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addParty} className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              value={formData.type}
              onValueChange={(value) => 
                setFormData({ ...formData, type: value as PartyType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLAINTIFF">Plaintiff</SelectItem>
                <SelectItem value="DEFENDANT">Defendant</SelectItem>
                <SelectItem value="WITNESS">Witness</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
                <SelectItem value="COUNSEL">Counsel</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Textarea
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? "Adding..." : "Add Party"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {parties.map((party) => (
          <Card key={party.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{party.name}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {party.type.toLowerCase()}
                    </span>
                  </div>
                  {party.email && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Email: {party.email}
                    </p>
                  )}
                  {party.phone && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Phone: {party.phone}
                    </p>
                  )}
                  {party.address && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Address: {party.address}
                    </p>
                  )}
                  {party.notes && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                      {party.notes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {parties.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">No parties added yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 