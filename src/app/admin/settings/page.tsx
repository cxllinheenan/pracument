import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/settings/profile-form"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="border rounded-lg p-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Your Profile</h4>
            <ProfileForm 
              initialName={session.user.name ?? null}
              userEmail={session.user.email ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 