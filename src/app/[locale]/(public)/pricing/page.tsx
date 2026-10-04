import { Container } from "@/shared/client/ui"
import { getTranslations } from "next-intl/server"

export default async function PricingPage() {
  const t = await getTranslations("pricing")

  return (
    <main className="py-2">
      <Container>
        <h1 className="text-3xl font-black">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </Container>
    </main>
  )
}
