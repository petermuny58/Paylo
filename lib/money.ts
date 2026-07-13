/** Parse a ZMW display amount (e.g. "25.50" or "25") into integer ngwee. */
export function zmwToNgwee(zmw: string | number): number {
  const normalized = typeof zmw === "number" ? zmw.toString() : zmw.trim().replace(/,/g, "");
  if (!normalized || Number.isNaN(Number(normalized))) {
    throw new Error("Invalid amount");
  }

  const parts = normalized.split(".");
  const kwacha = Number(parts[0]);
  if (!Number.isInteger(kwacha) || kwacha < 0) {
    throw new Error("Invalid amount");
  }

  let ngweePart = 0;
  if (parts.length === 2) {
    const frac = parts[1].padEnd(2, "0").slice(0, 2);
    ngweePart = Number(frac);
    if (!Number.isInteger(ngweePart) || ngweePart < 0 || ngweePart > 99) {
      throw new Error("Invalid amount");
    }
  } else if (parts.length > 2) {
    throw new Error("Invalid amount");
  }

  return kwacha * 100 + ngweePart;
}

export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}
