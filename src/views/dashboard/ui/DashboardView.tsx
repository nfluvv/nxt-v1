import { Container } from "@/shared/client/ui"
import { WalletBalance } from "@/entities/wallet/server";
import { Suspense } from "react";

export function DashboardView() {
  return (
    <main className="py-4">
      <Container>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <Suspense fallback={<span className="inline-block h-4 w-16 animate-pulse rounded bg-muted" />}>
          <WalletBalance />
        </Suspense>
      </Container>
    </main>
  )
}
