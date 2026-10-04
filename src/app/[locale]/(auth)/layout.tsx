import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getCurrentUser } from "@/entities/user/api/queries"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (session?.user) {
    const user = await getCurrentUser()
    redirect(user?.username ? `/u/${user.username}` : "/settings")
  }

  return <>{children}</>
}
