import { Container } from "@/shared/client/ui"
import { getTranslations } from "next-intl/server";

export async function DashboardView() {
  const t = await getTranslations("dashboard")

  return (
    <main className="py-2">
      <Container>
        <div>
          <h1 className="text-3xl font-black">{t("title")}</h1>
          <p className="text-muted-foreground">{t("decription")}</p>
        </div>
      </Container>
    </main>
  )
}
