import { DashboardView } from "@/views/dashboard"
import { getTranslations } from "next-intl/server"
import { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta")

  return {
    title: t("dashboardTitle"),
  }
}

export default DashboardView
