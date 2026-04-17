import { redirect } from "next/navigation"

export default function Home() {
  // Simple redirect to dashboard
  // Middleware should handle the actual auth check
  redirect("/dashboard")
}
