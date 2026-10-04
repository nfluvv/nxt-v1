import { Container } from "@/shared/client/ui"
import { getTranslations } from "next-intl/server"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta")

  return {
    title: t("aboutTitle"),
  }
}

export default async function AboutPage() {
  const t = await getTranslations("about")

  return (
    <main className="py-2">
      <Container>
        <h1 className="text-3xl font-black">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </Container>
    </main>
  )
}
