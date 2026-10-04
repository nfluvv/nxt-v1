import { Link } from "@/shared/i18n/navigation"

import { getCurrentUser } from "@/entities/user/api/queries"
import { ThemeToggle } from "@/features/toggle-theme"
import { LanguageSwitcher } from "@/features/switch-locale"
import { siteConfig } from "@/shared/client/config/site"
import { buttonVariants, Container } from "@/shared/client/ui"
import { getTranslations } from "next-intl/server"
import { UserMenu } from "./UserMenu"
import { DesktopNav, MobileNav, type NavItem } from "./HeaderNav"

export async function Header() {
  const user = await getCurrentUser()
  const t = await getTranslations("Auth")
  const tNav = await getTranslations("Nav")

  const navItems: NavItem[] = [
    { href: "/", label: tNav("home") },
    { href: "/pricing", label: tNav("pricing") },
    { href: "/about", label: tNav("about") },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <Container className="grid h-14 grid-cols-[auto_1fr] items-center gap-x-4 sm:h-16 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <Link
            href={siteConfig.routes.home}
            className="font-display shrink-0 text-base font-semibold sm:text-lg"
          >
            {siteConfig.name}
          </Link>
        </div>


        <DesktopNav items={navItems} />

        <div className="flex items-center justify-self-end gap-1 sm:gap-2">
          <ThemeToggle />
          <LanguageSwitcher />

          <div className="mx-1 h-5 w-px bg-border sm:mx-2" />

          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href={siteConfig.routes.login}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {t("login")}
            </Link>
          )}

          <MobileNav items={navItems} label={tNav("menu")} />
        </div>
      </Container>
    </header>
  )
}