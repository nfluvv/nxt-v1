import { getUserBalance } from "../api/get-user-balance";
import { WalletBalanceView } from "./wallet-balance-view";

export async function WalletBalance() {
  const balance = await getUserBalance().catch(() => undefined);
  if (balance === null) return null;

  return <WalletBalanceView initialData={balance} />;
}