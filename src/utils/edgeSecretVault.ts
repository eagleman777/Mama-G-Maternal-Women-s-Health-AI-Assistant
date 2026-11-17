/**
 * Browser Web Crypto API PBKDF2-HMAC-SHA256 + AES-256-GCM Secret Vault
 * Mirrors mamag_secret_vault.py for zero-trust field tablet provisioning verification.
 */

export interface EncryptedVaultEnvelope {
  algorithm: 'AES-256-GCM';
  kdf: 'PBKDF2-HMAC-SHA256-100000';
  salt: string;
  nonce: string;
  ciphertext: string;
  createdAt: string;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesGcmKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptEdgeSecretsInBrowser(
  passphrase: string,
  secrets: Record<string, string>
): Promise<EncryptedVaultEnvelope> {
  if (!passphrase) {
    throw new Error('Master passphrase is required.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesGcmKey(passphrase, salt);

  const plaintext = new TextEncoder().encode(JSON.stringify(secrets));
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    plaintext
  );

  return {
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-HMAC-SHA256-100000',
    salt: bytesToBase64(salt),
    nonce: bytesToBase64(nonce),
    ciphertext: bytesToBase64(new Uint8Array(ciphertextBuffer)),
    createdAt: new Date().toISOString(),
  };
}

export async function decryptEdgeSecretsInBrowser(
  passphrase: string,
  envelope: EncryptedVaultEnvelope
): Promise<Record<string, string>> {
  const salt = base64ToBytes(envelope.salt);
  const nonce = base64ToBytes(envelope.nonce);
  const ciphertext = base64ToBytes(envelope.ciphertext);
  const key = await deriveAesGcmKey(passphrase, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce as BufferSource },
    key,
    ciphertext as BufferSource
  );

  const decoded = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decoded) as Record<string, string>;
}
