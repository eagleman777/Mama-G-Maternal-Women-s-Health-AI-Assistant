/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlgorandIdentity,
  NotarizedHealthReceipt,
  HealthRecordType,
  getOrCreateAnonymousIdentity,
  generateAnonymousIdentity,
  storeMnemonic,
  restoreIdentityFromMnemonic,
  clearStoredMnemonic,
  notarizeRecord,
  getStoredReceipts,
  clearStoredReceipts,
  fetchAlgoNodeAccountInfo,
  formatAlgorandAddress,
} from '../utils/crypto';

export interface CryptoIdentityContextType {
  identity: AlgorandIdentity | null;
  address: string | null;
  mnemonic: string | null;
  isLoading: boolean;
  isNotarizing: boolean;
  receipts: NotarizedHealthReceipt[];
  testnetInfo: { algos: number; round: number } | null;
  regenerateIdentity: () => AlgorandIdentity;
  importMnemonic: (mnemonic: string) => boolean;
  clearIdentity: () => void;
  copyAddress: () => Promise<boolean>;
  copyMnemonic: () => Promise<boolean>;
  notarizeHealthRecord: (type: HealthRecordType, title: string, payload: any) => Promise<NotarizedHealthReceipt>;
  refreshTestnetInfo: () => Promise<void>;
  clearReceipts: () => void;
  formatAddress: (addr?: string, start?: number, end?: number) => string;
}

export const CryptoIdentityContext = createContext<CryptoIdentityContextType | undefined>(undefined);

export interface CryptoProviderProps {
  children: React.ReactNode;
}

export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [identity, setIdentity] = useState<AlgorandIdentity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotarizing, setIsNotarizing] = useState<boolean>(false);
  const [receipts, setReceipts] = useState<NotarizedHealthReceipt[]>([]);
  const [testnetInfo, setTestnetInfo] = useState<{ algos: number; round: number } | null>(null);

  // Initialize or restore anonymous Algorand wallet identity & receipts from localStorage
  useEffect(() => {
    try {
      const activeIdentity = getOrCreateAnonymousIdentity();
      setIdentity(activeIdentity);
      setReceipts(getStoredReceipts());
    } catch (err) {
      console.error('Failed to initialize anonymous Algorand wallet identity:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch TestNet network balance and block round whenever address is active
  const refreshTestnetInfo = useCallback(async () => {
    if (!identity?.address) return;
    try {
      const info = await fetchAlgoNodeAccountInfo(identity.address);
      if (info) {
        setTestnetInfo({ algos: info.algos, round: info.round });
      }
    } catch (err) {
      console.warn('Could not refresh TestNet account info:', err);
    }
  }, [identity?.address]);

  useEffect(() => {
    if (identity?.address) {
      refreshTestnetInfo();
    }
  }, [identity?.address, refreshTestnetInfo]);

  // Regenerate a brand new anonymous identity and replace stored mnemonic
  const regenerateIdentity = useCallback((): AlgorandIdentity => {
    const newIdentity = generateAnonymousIdentity();
    storeMnemonic(newIdentity.mnemonic);
    setIdentity(newIdentity);
    setTestnetInfo(null);
    return newIdentity;
  }, []);

  // Import an existing identity via a 25-word mnemonic phrase
  const importMnemonic = useCallback((mnemonic: string): boolean => {
    const restored = restoreIdentityFromMnemonic(mnemonic);
    if (restored) {
      storeMnemonic(restored.mnemonic);
      setIdentity(restored);
      return true;
    }
    return false;
  }, []);

  // Clear wallet identity from memory and storage
  const clearIdentity = useCallback((): void => {
    clearStoredMnemonic();
    setIdentity(null);
    setTestnetInfo(null);
  }, []);

  // Notarize a health record on the Algorand cryptographic ledger
  const notarizeHealthRecord = useCallback(
    async (type: HealthRecordType, title: string, payload: any): Promise<NotarizedHealthReceipt> => {
      let currentMnemonic = identity?.mnemonic;
      if (!currentMnemonic) {
        const fresh = getOrCreateAnonymousIdentity();
        setIdentity(fresh);
        currentMnemonic = fresh.mnemonic;
      }

      setIsNotarizing(true);
      try {
        const receipt = await notarizeRecord(currentMnemonic, type, title, payload);
        setReceipts((prev) => [receipt, ...prev]);
        return receipt;
      } finally {
        setIsNotarizing(false);
      }
    },
    [identity?.mnemonic]
  );

  const clearReceipts = useCallback(() => {
    clearStoredReceipts();
    setReceipts([]);
  }, []);

  // Copy address to clipboard
  const copyAddress = useCallback(async (): Promise<boolean> => {
    if (!identity?.address || typeof navigator === 'undefined' || !navigator.clipboard) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(identity.address);
      return true;
    } catch (err) {
      console.warn('Failed to copy address:', err);
      return false;
    }
  }, [identity?.address]);

  // Copy mnemonic to clipboard
  const copyMnemonic = useCallback(async (): Promise<boolean> => {
    if (!identity?.mnemonic || typeof navigator === 'undefined' || !navigator.clipboard) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(identity.mnemonic);
      return true;
    } catch (err) {
      console.warn('Failed to copy mnemonic:', err);
      return false;
    }
  }, [identity?.mnemonic]);

  const formatAddress = useCallback(
    (addr?: string, start = 6, end = 6) => formatAlgorandAddress(addr || identity?.address || '', start, end),
    [identity?.address]
  );

  const value = useMemo<CryptoIdentityContextType>(
    () => ({
      identity,
      address: identity?.address || null,
      mnemonic: identity?.mnemonic || null,
      isLoading,
      isNotarizing,
      receipts,
      testnetInfo,
      regenerateIdentity,
      importMnemonic,
      clearIdentity,
      copyAddress,
      copyMnemonic,
      notarizeHealthRecord,
      refreshTestnetInfo,
      clearReceipts,
      formatAddress,
    }),
    [
      identity,
      isLoading,
      isNotarizing,
      receipts,
      testnetInfo,
      regenerateIdentity,
      importMnemonic,
      clearIdentity,
      copyAddress,
      copyMnemonic,
      notarizeHealthRecord,
      refreshTestnetInfo,
      clearReceipts,
      formatAddress,
    ]
  );

  return (
    <CryptoIdentityContext.Provider value={value}>
      {children}
    </CryptoIdentityContext.Provider>
  );
};

export function useCrypto(): CryptoIdentityContextType {
  const context = useContext(CryptoIdentityContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}

export const useCryptoIdentity = useCrypto;
