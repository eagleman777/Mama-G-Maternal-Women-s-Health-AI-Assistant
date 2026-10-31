/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  FileCheck,
  FileText,
  AlertTriangle,
  Lock,
  Plus,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useCrypto } from '../context/CryptoContext';
import { HealthRecordType } from '../utils/crypto';

interface BlockchainIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockchainIdentityModal: React.FC<BlockchainIdentityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    address,
    mnemonic,
    isLoading,
    isNotarizing,
    receipts,
    testnetInfo,
    regenerateIdentity,
    importMnemonic,
    copyAddress,
    copyMnemonic,
    notarizeHealthRecord,
    refreshTestnetInfo,
    clearReceipts,
    formatAddress,
  } = useCrypto();

  const [activeSubTab, setActiveSubTab] = useState<'keystore' | 'ledger' | 'notarize'>('keystore');
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
  const [copiedAddr, setCopiedAddr] = useState<boolean>(false);
  const [copiedMnem, setCopiedMnem] = useState<boolean>(false);
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);

  // Import phrase state
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importPhraseInput, setImportPhraseInput] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  // Manual notarize state
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customType, setCustomType] = useState<HealthRecordType>('triage');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [notarizeSuccess, setNotarizeSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyAddr = async () => {
    const ok = await copyAddress();
    if (ok) {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  const handleCopyMnem = async () => {
    const ok = await copyMnemonic();
    if (ok) {
      setCopiedMnem(true);
      setTimeout(() => setCopiedMnem(false), 2000);
    }
  };

  const handleCopyReceipt = async (receiptId: string, receiptData: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(receiptData, null, 2));
      setCopiedReceiptId(receiptId);
      setTimeout(() => setCopiedReceiptId(null), 2000);
    } catch (e) {
      console.warn('Failed to copy receipt:', e);
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    const cleaned = importPhraseInput.trim();
    const wordCount = cleaned.split(/\s+/).length;
    if (wordCount !== 25) {
      setImportError(`An Algorand mnemonic phrase must be exactly 25 words (provided ${wordCount}).`);
      return;
    }
    const success = importMnemonic(cleaned);
    if (success) {
      setIsImporting(false);
      setImportPhraseInput('');
    } else {
      setImportError('Invalid Algorand mnemonic checksum or phrase. Please check and try again.');
    }
  };

  const handleManualNotarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    try {
      await notarizeHealthRecord(customType, customTitle, {
        notes: customNotes,
        notarizedAt: new Date().toISOString(),
        client: 'Mama-G Anonymous Keystore',
      });
      setNotarizeSuccess(true);
      setCustomTitle('');
      setCustomNotes('');
      setTimeout(() => setNotarizeSuccess(false), 3000);
      setActiveSubTab('ledger');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPassport = () => {
    const exportData = {
      app: 'Mama-G Maternal & Women’s Health Assistant',
      exportedAt: new Date().toISOString(),
      algorandAddress: address,
      network: 'Algorand TestNet',
      receiptsCount: receipts.length,
      receipts,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mama-g-algorand-health-passport-${address?.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const mnemonicWords = mnemonic ? mnemonic.split(' ') : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-800/90 px-5 py-4 border-b border-stone-700/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-amber-950/40">
              <ShieldCheck className="w-6 h-6 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Algorand Anonymous Identity & Ledger
                </h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase">
                  Zero-Knowledge
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Self-custodial, client-side cryptographic keystore for maternal health privacy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-5 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveSubTab('keystore')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'keystore'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Anonymous Keystore</span>
          </button>
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'ledger'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Notarized Health Ledger ({receipts.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('notarize')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeSubTab === 'notarize'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Anchor Record</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: KEYSTORE */}
          {activeSubTab === 'keystore' && (
            <div className="space-y-4">
              {/* Address Hero Banner */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Algorand Public Address</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshTestnetInfo}
                      className="text-[11px] text-stone-400 hover:text-stone-200 flex items-center gap-1 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded cursor-pointer"
                      title="Sync with Algorand node"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sync</span>
                    </button>
                    {address && (
                      <a
                        href={`https://lora.algokit.io/testnet/account/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Explorer</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-lg flex items-center justify-between gap-3">
                  <div className="font-mono text-xs sm:text-sm text-stone-200 break-all select-all font-medium">
                    {address || (isLoading ? 'Generating anonymous identity...' : 'None')}
                  </div>
                  <button
                    onClick={handleCopyAddr}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                  >
                    {copiedAddr ? <Check className="w-3.5 h-3.5 text-stone-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAddr ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Network & Live Status Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="bg-stone-900/60 p-2 rounded-lg border border-stone-800/80">
                    <span className="text-[10px] text-stone-400 block">Ledger Network</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Algorand TestNet
                    </span>
                  </div>
                  <div className="bg-stone-900/60 p-2 rounded-lg border border-stone-800/80">
                    <span className="text-[10px] text-stone-400 block">TestNet Balance</span>
                    <span className="font-semibold text-stone-200 mt-0.5 block">
                      {testnetInfo ? `${testnetInfo.algos.toFixed(3)} ALGO` : '0.000 ALGO'}
                    </span>
                  </div>
                  <div className="bg-stone-900/60 p-2 rounded-lg border border-stone-800/80 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-stone-400 block">Node Block Round</span>
                    <span className="font-semibold text-stone-300 font-mono mt-0.5 block">
                      {testnetInfo?.round ? `#${testnetInfo.round.toLocaleString()}` : 'Live Node (AlgoNode)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 25-Word Algorand Mnemonic Phrase */}
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">25-Word Algorand Recovery Key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {showMnemonic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showMnemonic ? 'Hide' : 'Reveal'}</span>
                    </button>
                    {showMnemonic && (
                      <button
                        onClick={handleCopyMnem}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedMnem ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMnem ? 'Copied' : 'Copy Words'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {showMnemonic ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-3 bg-stone-900/90 rounded-xl border border-stone-800 font-mono text-[11px]">
                      {mnemonicWords.map((word, idx) => (
                        <div
                          key={idx}
                          className="bg-black/50 px-2 py-1 rounded border border-stone-800/80 flex items-center justify-between text-stone-300"
                        >
                          <span className="text-stone-500 text-[9px] mr-1">{idx + 1}.</span>
                          <span className="font-medium text-amber-200 truncate">{word}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-amber-400/90 leading-tight">
                      This 25-word phrase is your private key. Never share it with anyone. It guarantees that you and only you own your confidential consultations.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-900/50 rounded-xl border border-stone-800/70 text-xs text-stone-400 flex items-center justify-between">
                    <span>Mnemonic hidden for on-screen privacy. Click "Reveal" above to inspect.</span>
                    <button
                      onClick={() => setShowMnemonic(true)}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs cursor-pointer"
                    >
                      Reveal Phrase
                    </button>
                  </div>
                )}
              </div>

              {/* Identity Actions: Import or Regenerate */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-stone-200 block">Manage Keypair</span>
                  <span className="text-[11px] text-stone-400">
                    Switch to an existing Algorand wallet or generate a new anonymous identity.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImporting(!isImporting)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 transition-colors cursor-pointer"
                  >
                    Import Phrase
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Generate a brand new anonymous identity? Your current address will be replaced locally. Make sure you saved your 25-word mnemonic if you need it later.'
                        )
                      ) {
                        regenerateIdentity();
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/60 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate Key</span>
                  </button>
                </div>
              </div>

              {/* Import Phrase Modal / Form */}
              {isImporting && (
                <form
                  onSubmit={handleImportSubmit}
                  className="bg-stone-900 border border-amber-600/40 p-4 rounded-xl space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      Import 25-Word Algorand Mnemonic Phrase
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsImporting(false)}
                      className="text-stone-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={importPhraseInput}
                    onChange={(e) => setImportPhraseInput(e.target.value)}
                    rows={3}
                    placeholder="Enter your 25 words separated by spaces (e.g. apple banana chair dog ...)"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                  {importError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{importError}</span>
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsImporting(false)}
                      className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Restore Wallet
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: NOTARIZED HEALTH LEDGER */}
          {activeSubTab === 'ledger' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Tamper-Evident Attestation Receipts
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Cryptographically stamped triage, SOS, and clinical consults linked to this Algorand key.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {receipts.length > 0 && (
                    <>
                      <button
                        onClick={handleExportPassport}
                        className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
                        title="Download JSON health passport"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Export Passport</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Clear all local notarized receipts?')) {
                            clearReceipts();
                          }
                        }}
                        className="p-1.5 bg-stone-800 hover:bg-rose-950/70 text-stone-400 hover:text-rose-300 rounded-lg border border-stone-700 transition-colors"
                        title="Clear receipts"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {receipts.length === 0 ? (
                <div className="bg-stone-950 border border-dashed border-stone-800 rounded-xl p-8 text-center space-y-2">
                  <FileCheck className="w-8 h-8 text-stone-600 mx-auto" />
                  <span className="text-xs font-bold text-stone-300 block">
                    No Notarized Records Yet
                  </span>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    When you perform a symptom triage, trigger an Emergency SOS, or complete a health assessment, you can anchor the findings directly onto the Algorand ledger.
                  </p>
                  <button
                    onClick={() => setActiveSubTab('notarize')}
                    className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Anchor First Record</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {receipts.map((rcpt) => (
                    <div
                      key={rcpt.id}
                      className="bg-stone-950 border border-stone-800 hover:border-stone-700 rounded-xl p-3.5 space-y-2 text-xs transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              rcpt.type === 'sos'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : rcpt.type === 'triage'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {rcpt.type}
                          </span>
                          <span className="font-bold text-stone-200">{rcpt.title}</span>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(rcpt.timestamp).toLocaleDateString()} {new Date(rcpt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-2 rounded-lg font-mono text-[11px] space-y-1 text-stone-300">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 text-[10px]">Attestation TxID:</span>
                          <span className="text-amber-300 font-bold">{rcpt.txId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 text-[10px]">SHA-256 Digest:</span>
                          <span className="text-stone-400">{rcpt.sha256Hash.slice(0, 16)}...{rcpt.sha256Hash.slice(-8)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 text-[10px]">Ed25519 Signature:</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Verified Valid</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-stone-500 truncate mr-2">
                          Signer: {formatAddress(rcpt.address, 8, 8)}
                        </span>
                        <button
                          onClick={() => handleCopyReceipt(rcpt.id, rcpt)}
                          className="text-[11px] text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedReceiptId === rcpt.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Proof JSON</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANCHOR NEW RECORD */}
          {activeSubTab === 'notarize' && (
            <form onSubmit={handleManualNotarize} className="space-y-3.5">
              <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Anchor Custom Health Observation or Referral
                </span>
                <p className="text-xs text-stone-400">
                  Calculates an irreversible SHA-256 hash and Ed25519 digital signature with your anonymous Algorand key.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Record Category
                    </label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value as HealthRecordType)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="triage">Symptom Triage Assessment</option>
                      <option value="chw_visit">Community Health Worker (CHW) Note</option>
                      <option value="kick_session">Fetal Kick Counting Session</option>
                      <option value="ppd_check">Postpartum Wellbeing & Sleep Audit</option>
                      <option value="sos">Emergency SOS Referral Dispatch</option>
                      <option value="general">Confidential Maternal Record</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Title / Summary
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 28-Week Blood Pressure Check or Triage Finding"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-300 font-semibold mb-1">
                      Clinical Notes / Observation Data
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter confidential observation details to be hashed into the receipt..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Payload will be cryptographically signed locally
                  </span>
                  <button
                    type="submit"
                    disabled={isNotarizing || !customTitle.trim()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isNotarizing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-950" />
                        <span>Notarizing on Algorand...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-stone-950" />
                        <span>Sign & Stamp Receipt</span>
                      </>
                    )}
                  </button>
                </div>

                {notarizeSuccess && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Record successfully notarized and added to your ledger!</span>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-800/80 px-5 py-3 border-t border-stone-700/60 flex items-center justify-between shrink-0 text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Algorand Pure Proof-of-Stake Security</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-700 hover:bg-stone-600 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
