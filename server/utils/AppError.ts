// Distinguishes "expected" errors we deliberately throw (bad PIN, insufficient
// balance, expired QR) from genuine bugs. The error middleware uses
// `instanceof AppError` to decide whether it's safe to show `message`
// directly to the client, or whether to hide the details and log instead.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
