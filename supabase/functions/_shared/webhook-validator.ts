/**
 * Shared webhook signature validation utility
 * Implements HMAC SHA-256 signature verification for webhook security
 */

export async function validateWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    return false;
  }

  // Remove 'sha256=' prefix if present
  const cleanSignature = signature.startsWith('sha256=') 
    ? signature.substring(7) 
    : signature;

  // Create HMAC using Web Crypto API (Deno compatible)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(body);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature_buffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signature_buffer));
  const computedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Constant-time comparison
  return computedSignature === cleanSignature;
}

export function getWebhookSecret(): string {
  const secret = Deno.env.get('WEBHOOK_SECRET');
  if (!secret) {
    throw new Error('WEBHOOK_SECRET environment variable is not set');
  }
  return secret;
}
