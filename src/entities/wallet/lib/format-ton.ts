import { fromNano } from "@ton/core";

export function formatTon(nano: string | bigint, maxFractionDigits = 4): string {
  const [int, frac = ""] = fromNano(nano).split(".");
  const intPart = BigInt(int).toLocaleString("en-US");
  const fracPart = frac.slice(0, maxFractionDigits).replace(/0+$/, "");

  if (!fracPart && int === "0" && /[1-9]/.test(frac)) {
    return `<0.${"0".repeat(maxFractionDigits - 1)}1`;
  }
  return fracPart ? `${intPart}.${fracPart}` : intPart;
}