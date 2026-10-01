import { NextRequest, NextResponse } from "next/server";
import { verifyTonProof } from "@/entities/wallet/api/generate-ton-message";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, nonce, timestamp } = await request.json();

    await verifyTonProof(walletAddress, signature, nonce, timestamp);

    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: String(error) },
      { status: 400 }
    );
  }
}
