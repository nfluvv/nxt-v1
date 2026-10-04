import { AvatarUploader } from "@/features/update-avatar"
import { UpdateNameForm } from "@/features/update-name"
import { UpdateUsernameForm } from "@/features/update-username"
import { DeleteAccountDialog } from "@/features/delete-account"
import { ConnectedAccounts } from "./ConnectedAccounts"

import { SettingsRow } from "./SettingsRow"
import { SettingsSection } from "./SettingsSection"
import { useTranslations } from "next-intl"
import type { User } from "@/entities/user"

type ProfileSettingsProps = {
  user: User
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const t = useTranslations("userSettings")
  const connectedProviders = new Set(
    user.accounts.map((account) => account.provider)
  )

  return (
    <div className="space-y-6">
      <SettingsSection title={t("profile")} description={t("profileDesc")}>
        <SettingsRow title={t("avatarTitle")} description={t("avatarDesc")}>
          <AvatarUploader
            currentImage={user.image}
            fallback={((user.name ?? user.email) ?? "").charAt(0).toUpperCase()}
          />
        </SettingsRow>

        <SettingsRow title={t("nameTitle")} description={t("nameDesc")}>
          <UpdateNameForm defaultName={user.name ?? ""} />
        </SettingsRow>

        <SettingsRow title={t("usernameTitle")} description={t("usernameDesc")}>
          <UpdateUsernameForm defaultUsername={user.username ?? ""} />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title={t("connectionsTitle")}
        description={t("connectionsDesc")}
      >
        <ConnectedAccounts
          google={connectedProviders.has("google")}
          github={connectedProviders.has("github")}
        />
      </SettingsSection>

      <SettingsSection
        title={t("dangerZoneTitle")}
        description={t("dangerZoneDesc")}
      >
        <SettingsRow
          title={t("deleteAccountTitle")}
          description={t("deleteAccountDesc")}
          destructive
        >
          <DeleteAccountDialog />
        </SettingsRow>
      </SettingsSection>
    </div>
  )
}