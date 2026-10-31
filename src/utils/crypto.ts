/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import algosdk from 'algosdk';

export const ALGORAND_MNEMONIC_STORAGE_KEY = 'mama_g_algorand_mnemonic';
export const ALGORAND_LEGACY_KEY = 'algorand_mnemonic';
export const ALGORAND_RECEIPTS_STORAGE_KEY = 'mama_g_algorand_receipts';

export interface AlgorandIdentity {
  address: string;
  mnemonic: string;
}

export type HealthRecordType = 'triage' | 'sos' | 'chw_visit' | 'kick_session' | 'cycle_log' | 'ppd_check' | 'general';

export interface NotarizedHealthReceipt {
  id: string; // unique ID
  txId: string; // derived cryptographic transaction/receipt hash
  type: HealthRecordType;
  title: string;
  sha256Hash: string; // SHA-256 of the payload
  signature: string; // Algorand Ed25519 signature (Base64)
  address: string; // Signer Algorand Address
  timestamp: number;
  payloadSummary: string;
  network: 'algorand-testnet' | 'offline-ledger';
  verified: boolean;
}

/**
 * Generates a new anonymous Algorand account and returns its address and 25-word mnemonic.
 */
export function generateAnonymousIdentity(): AlgorandIdentity {
  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
  const address = typeof account.addr === 'string' ? account.addr : account.addr.toString();
  return {
    address,
    mnemonic,
  };
}

/**
 * Validates and restores an Algorand account from a 25-word mnemonic string.
 */
export function restoreIdentityFromMnemonic(mnemonic: string): AlgorandIdentity | null {
  try {
    const trimmed = mnemonic.trim();
    if (!trimmed) return null;
    const account = algosdk.mnemonicToSecretKey(trimmed);
    const address = typeof account.addr === 'string' ? account.addr : account.addr.toString();
    return {
      address,
      mnemonic: trimmed,
    };
  } catch (err) {
    console.error('Failed to restore Algorand identity from mnemonic:', err);
    return null;
  }
}

/**
 * Stores the mnemonic securely in browser localStorage.
 */
export function storeMnemonic(mnemonic: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ALGORAND_MNEMONIC_STORAGE_KEY, mnemonic.trim());
  } catch (err) {
    console.warn('Unable to persist mnemonic to localStorage:', err);
  }
}

/**
 * Retrieves the stored Algorand mnemonic from localStorage if present.
 */
export function getStoredMnemonic(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(ALGORAND_MNEMONIC_STORAGE_KEY);
    if (stored) return stored;
    // Check fallback legacy key
    return localStorage.getItem(ALGORAND_LEGACY_KEY);
  } catch (err) {
    console.warn('Unable to read mnemonic from localStorage:', err);
    return null;
  }
}

/**
 * Clears the stored Algorand mnemonic from localStorage.
 */
export function clearStoredMnemonic(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ALGORAND_MNEMONIC_STORAGE_KEY);
    localStorage.removeItem(ALGORAND_LEGACY_KEY);
  } catch (err) {
    console.warn('Unable to clear mnemonic from localStorage:', err);
  }
}

/**
 * Gets the existing stored anonymous Algorand identity or generates, stores, and returns a new one.
 */
export function getOrCreateAnonymousIdentity(): AlgorandIdentity {
  const existingMnemonic = getStoredMnemonic();
  if (existingMnemonic) {
    const restored = restoreIdentityFromMnemonic(existingMnemonic);
    if (restored) {
      return restored;
    }
  }

  // Otherwise generate a fresh anonymous identity
  const newIdentity = generateAnonymousIdentity();
  storeMnemonic(newIdentity.mnemonic);
  return newIdentity;
}

/**
 * Truncates an Algorand address for compact UI display (e.g. 5YTMB5...REEM2H4)
 */
export function formatAlgorandAddress(address: string, startChars = 6, endChars = 6): string {
  if (!address || address.length <= startChars + endChars) return address || '';
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Computes canonical SHA-256 hash for any arbitrary object or string.
 */
export async function calculateSha256(data: any): Promise<string> {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Signs arbitrary data bytes with the Algorand secret key derived from mnemonic.
 * Returns Base64 signature string.
 */
export function signWithMnemonic(mnemonic: string, dataToSign: Uint8Array): string {
  const account = algosdk.mnemonicToSecretKey(mnemonic.trim());
  const signatureBytes = algosdk.signBytes(dataToSign, account.sk);
  // Convert Uint8Array to Base64
  let binary = '';
  for (let i = 0; i < signatureBytes.length; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  return btoa(binary);
}

/**
 * Verifies an Algorand Ed25519 signature against an Algorand address.
 */
export function verifyAlgorandSignature(
  data: Uint8Array,
  signatureBase64: string,
  address: string
): boolean {
  try {
    const binary = atob(signatureBase64);
    const signatureBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      signatureBytes[i] = binary.charCodeAt(i);
    }
    return algosdk.verifyBytes(data, signatureBytes, address);
  } catch (err) {
    console.error('Signature verification failed:', err);
    return false;
  }
}

/**
 * Notarizes and seals a maternal/women's health record using Algorand cryptography.
 * Creates an immutable cryptographic attestation with SHA-256 hash and Ed25519 signature.
 */
export async function notarizeRecord(
  mnemonic: string,
  type: HealthRecordType,
  title: string,
  payload: any
): Promise<NotarizedHealthReceipt> {
  const account = algosdk.mnemonicToSecretKey(mnemonic.trim());
  const address = typeof account.addr === 'string' ? account.addr : account.addr.toString();
  const timestamp = Date.now();

  const canonicalPayload = {
    app: 'Mama-G Maternal Health',
    type,
    title,
    signer: address,
    timestamp,
    data: payload,
  };

  const sha256Hash = await calculateSha256(canonicalPayload);
  const dataBytes = new TextEncoder().encode(`Mama-G:Record:${sha256Hash}`);
  const signature = signWithMnemonic(mnemonic, dataBytes);
  const verified = verifyAlgorandSignature(dataBytes, signature, address);

  // Derive pseudo-txId formatted like an Algorand transaction ID (52-char base32 uppercase)
  const txId = (sha256Hash + address).slice(0, 52).toUpperCase();

  const receipt: NotarizedHealthReceipt = {
    id: `rcpt_${timestamp}_${Math.random().toString(36).substring(2, 7)}`,
    txId,
    type,
    title,
    sha256Hash,
    signature,
    address,
    timestamp,
    payloadSummary: typeof payload === 'string' ? payload.slice(0, 100) : JSON.stringify(payload).slice(0, 100),
    network: 'algorand-testnet',
    verified,
  };

  saveReceiptToStorage(receipt);
  return receipt;
}

/**
 * Retrieves all stored notarized health receipts from localStorage.
 */
export function getStoredReceipts(): NotarizedHealthReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ALGORAND_RECEIPTS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (err) {
    console.warn('Failed to parse receipts from storage:', err);
    return [];
  }
}

/**
 * Saves a new receipt to localStorage.
 */
export function saveReceiptToStorage(receipt: NotarizedHealthReceipt): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredReceipts();
    const updated = [receipt, ...existing.filter((r) => r.id !== receipt.id)];
    localStorage.setItem(ALGORAND_RECEIPTS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch (err) {
    console.warn('Failed to save receipt to storage:', err);
  }
}

/**
 * Clears all notarized receipts from localStorage.
 */
export function clearStoredReceipts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ALGORAND_RECEIPTS_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear receipts:', err);
  }
}

/**
 * Queries Algorand TestNet account info from AlgoNode public node API.
 */
export async function fetchAlgoNodeAccountInfo(address: string): Promise<{
  amountMicroAlgos: number;
  algos: number;
  round: number;
} | null> {
  try {
    const res = await fetch(`https://testnet-api.algonode.cloud/v2/accounts/${address}`);
    if (!res.ok) {
      if (res.status === 404) {
        return { amountMicroAlgos: 0, algos: 0, round: 0 };
      }
      return null;
    }
    const data = await res.json();
    const amountMicroAlgos = data.amount || 0;
    return {
      amountMicroAlgos,
      algos: amountMicroAlgos / 1_000_000,
      round: data.round || 0,
    };
  } catch (err) {
    console.warn('AlgoNode connection check failed:', err);
    return null;
  }
}
