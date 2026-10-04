import { NextResponse } from "next/server";
import { getUserBalance } from "@/entities/wallet/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const balance = await getUserBalance();
    return NextResponse.json({ balance });
  } catch (e) {
    console.error("[wallet-balance]", e);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}