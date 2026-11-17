import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  Download,
  FileCode2,
  Container,
  Terminal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  EncryptedVaultEnvelope,
  encryptEdgeSecretsInBrowser,
  decryptEdgeSecretsInBrowser,
} from '../utils/edgeSecretVault';
import secretVaultPyRaw from '../../mamag_secret_vault.py?raw';
import dockerComposeSecureRaw from '../../docker-compose.secure.yml?raw';
import provisionScriptRaw from '../../provision_tablet.sh?raw';
import masterInstallRaw from '../../install_mamag_edge.sh?raw';
import tabletEnvRaw from '../../config/tablet.env.production?raw';

type ArtifactView =
  | 'vault_sandbox'
  | 'master_install'
  | 'env_config'
  | 'docker_tmpfs'
  | 'python_vault'
  | 'provision_sh';

export const MamaGSecurityVaultPanel: React.FC<{ deviceId: string }> = ({ deviceId }) => {
  const [activeView, setActiveView] = useState<ArtifactView>('vault_sandbox');
  const [passphrase, setPassphrase] = useState<string>('');
  const [hubToken, setHubToken] = useState<string>('hub-sync-token-sample-ibeno');
  const [envelope, setEnvelope] = useState<EncryptedVaultEnvelope | null>(null);
  const [decryptPassphrase, setDecryptPassphrase] = useState<string>('');
  const [decryptedData, setDecryptedData] = useState<Record<string, string> | null>(null);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEncrypt = async () => {
    if (!passphrase.trim()) {
      setVaultError('Enter a device master passphrase to seal secrets.enc.');
      return;
    }
    setIsBusy(true);
    setVaultError(null);
    setDecryptedData(null);
    try {
      const sealed = await encryptEdgeSecretsInBrowser(passphrase, {
        DEVICE_ID: deviceId,
        DEVICE_AUTH_TOKEN: hubToken,
        ENCRYPTION_SALT_VERSION: 'v1.0',
      });
      setEnvelope(sealed);
    } catch (err: any) {
      setVaultError(err?.message || 'Encryption failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDecrypt = async () => {
    if (!envelope) return;
    if (!decryptPassphrase.trim()) {
      setVaultError('Enter the master passphrase to verify AES-GCM decryption.');
      return;
    }
    setIsBusy(true);
    setVaultError(null);
    try {
      const unlocked = await decryptEdgeSecretsInBrowser(decryptPassphrase, envelope);
      setDecryptedData(unlocked);
    } catch {
      setDecryptedData(null);
      setVaultError('AES-GCM authentication failed: invalid passphrase or tampered vault payload.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-md">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Lock className="w-4 h-4" />
            <span>Zero-Trust Edge Cryptographic Strategy</span>
            <span className="text-[10px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded">
              AES-256-GCM + tmpfs /dev/shm
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Two-Tier Tablet Secret Vault &amp; Provisioning Blueprint
          </h3>
          <p className="text-xs text-stone-400 max-w-2xl">
            Separates public operational parameters (<span className="font-mono text-stone-300">tablet.env.production</span>) from PBKDF2-encrypted credentials (<span className="font-mono text-stone-300">secrets.enc</span>) decrypted exclusively into volatile <span className="font-mono text-stone-300">/dev/shm</span> RAM at boot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => triggerDownload('mamag_secret_vault.py', secretVaultPyRaw)}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Vault (.py)</span>
          </button>
          <button
            type="button"
            onClick={() => triggerDownload('docker-compose.secure.yml', dockerComposeSecureRaw)}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Compose (.yml)</span>
          </button>
          <button
            type="button"
            onClick={() => triggerDownload('install_mamag_edge.sh', masterInstallRaw)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Master Installer (.sh)</span>
          </button>
          <button
            type="button"
            onClick={() => triggerDownload('provision_tablet.sh', provisionScriptRaw)}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Provision (.sh)</span>
          </button>
          <a
            href="/assets/aistudio/Mama-G_Field_Tablet_Deployment___Operations_Manual_f423f051.pdf"
            download="Mama-G_Field_Tablet_Deployment_Operations_Manual.pdf"
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>SOP Manual (.pdf)</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'vault_sandbox', label: 'AES-GCM Vault Sandbox', icon: KeyRound },
          { id: 'master_install', label: 'install_mamag_edge.sh', icon: Terminal },
          { id: 'python_vault', label: 'mamag_secret_vault.py', icon: FileCode2 },
          { id: 'docker_tmpfs', label: 'docker-compose.secure.yml', icon: Container },
          { id: 'provision_sh', label: 'provision_tablet.sh', icon: Terminal },
          { id: 'env_config', label: 'tablet.env.production', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id as ArtifactView)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                active
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-stone-800/70 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive AES-256-GCM Provisioning Sandbox */}
      {activeView === 'vault_sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Seal / Encrypt Panel */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Lock className="w-4 h-4" />
              <span>1. Provision &amp; Seal Encrypted Vault (secrets.enc)</span>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">
                  Regional Hub Device Sync Token (Provisioned at Uyo Hub)
                </label>
                <input
                  type="text"
                  value={hubToken}
                  onChange={(e) => setHubToken(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 font-mono text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">
                  Hardware Master Passphrase (PBKDF2 100k iterations)
                </label>
                <input
                  type="password"
                  placeholder="Enter master passphrase to derive AES-256 key..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleEncrypt}
                disabled={isBusy}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypt secrets.enc</span>
              </button>
              {envelope && (
                <button
                  type="button"
                  onClick={() => triggerDownload('secrets.enc', JSON.stringify(envelope, null, 2))}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-500/30 font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download secrets.enc</span>
                </button>
              )}
            </div>
          </div>

          {/* Verify / Decrypt into Volatile Memory Panel */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <Unlock className="w-4 h-4" />
              <span>2. Verify Decryption into Volatile RAM (/dev/shm)</span>
            </div>

            {envelope ? (
              <div className="space-y-2.5">
                <div className="bg-stone-900 border border-stone-800 rounded-lg p-2.5 font-mono text-[10px] text-stone-300 space-y-0.5 break-all">
                  <div><span className="text-stone-500">algorithm:</span> {envelope.algorithm} ({envelope.kdf})</div>
                  <div><span className="text-stone-500">nonce:</span> {envelope.nonce}</div>
                  <div><span className="text-stone-500">ciphertext:</span> {envelope.ciphertext.slice(0, 48)}...</div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter passphrase to unlock..."
                    value={decryptPassphrase}
                    onChange={(e) => setDecryptPassphrase(e.target.value)}
                    className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleDecrypt}
                    disabled={isBusy}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer shrink-0"
                  >
                    Decrypt Test
                  </button>
                </div>

                {decryptedData && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-[11px] font-mono text-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-sans font-bold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authenticated Decryption Verified in RAM</span>
                    </div>
                    <pre className="overflow-x-auto">{JSON.stringify(decryptedData, null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-stone-400 text-[11px] py-4">
                Encrypt a sample device token on the left to inspect its PBKDF2 + AES-256-GCM envelope and test volatile-memory decryption integrity.
              </p>
            )}

            {vaultError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-lg text-rose-200 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{vaultError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'master_install' && (
        <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
          {masterInstallRaw}
        </pre>
      )}

      {activeView === 'python_vault' && (
        <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-[11px] font-mono text-amber-200/90 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
          {secretVaultPyRaw}
        </pre>
      )}

      {activeView === 'docker_tmpfs' && (
        <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-[11px] font-mono text-sky-200/90 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
          {dockerComposeSecureRaw}
        </pre>
      )}

      {activeView === 'provision_sh' && (
        <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
          {provisionScriptRaw}
        </pre>
      )}

      {activeView === 'env_config' && (
        <pre className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-[11px] font-mono text-stone-200 overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
          {tabletEnvRaw}
        </pre>
      )}
    </div>
  );
};
