import { OAuthButtons } from "./oauth-buttons"

export function LoginForm() {
  return (
    <div className="flex flex-col gap-6">
      <OAuthButtons />
    </div>
  )
}