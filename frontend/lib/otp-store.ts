// Global in-memory OTP cache for Password Reset verification
// Survives across serverless executions in Node process lifetime

interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number;
  verified: boolean;
}

// Global cache instance (handles development hot-reloads and production server instances)
const globalOtpStore = globalThis as unknown as {
  _ecomOtpCache?: Map<string, OtpRecord>;
};

if (!globalOtpStore._ecomOtpCache) {
  globalOtpStore._ecomOtpCache = new Map<string, OtpRecord>();
}

const otpMap = globalOtpStore._ecomOtpCache;

/**
 * Generate and store a secure 6-digit OTP valid for 10 minutes
 */
export function createAndStoreOtp(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  // Generate a random 6-digit numerical OTP between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpMap.set(cleanEmail, {
    code: otp,
    email: cleanEmail,
    expiresAt,
    verified: false,
  });

  return otp;
}

/**
 * Verify if the submitted 6-digit code matches the stored OTP
 */
export function verifyOtpCode(email: string, code: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpMap.get(cleanEmail);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpMap.delete(cleanEmail);
    return false;
  }

  if (record.code === code.trim()) {
    record.verified = true;
    return true;
  }

  return false;
}

/**
 * Check if the email has already been OTP-verified for password reset
 */
export function isEmailOtpVerified(email: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpMap.get(cleanEmail);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpMap.delete(cleanEmail);
    return false;
  }
  return record.verified;
}

/**
 * Clear the OTP record after successful password change
 */
export function removeOtp(email: string): void {
  const cleanEmail = email.trim().toLowerCase();
  otpMap.delete(cleanEmail);
}
