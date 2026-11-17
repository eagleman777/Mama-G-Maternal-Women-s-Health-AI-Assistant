/**
 * Mama-G Network Reconnection & Sync Manager
 * --------------------------------------------------------------------------------
 * Listens for browser online events and network status transitions, automatically
 * triggering batch synchronization of pending edge encounters when connection is restored.
 */

import {
  ClinicalEncounterRow,
  fetchPendingEncountersFromSqlite,
  markEncountersSyncedInSqlite,
  recordSyncFailureInSqlite,
} from '../data/edgeSqliteStore';

export interface SyncConfig {
  hubApiUrl: string;
  deviceId: string;
  batchSize?: number;
  isOfflineFn?: () => boolean;
  onSyncStart?: () => void;
  onSyncSuccess?: (syncedCount: number) => void;
  onSyncError?: (error: unknown) => void;
}

export class MamaGSyncReconnectionManager {
  private config: SyncConfig;
  private isSyncing: boolean = false;
  private boundOnlineListener: () => void;

  constructor(config: SyncConfig) {
    this.config = {
      batchSize: 50,
      ...config,
    };

    this.boundOnlineListener = () => {
      void this.handleOnlineReconnection();
    };
    this.initListeners();
  }

  public updateOfflinePredicate(fn?: () => boolean): void {
    this.config.isOfflineFn = fn;
  }

  public initListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.boundOnlineListener);

    // Initial check on startup if already online
    const offline =
      (this.config.isOfflineFn && this.config.isOfflineFn()) || !navigator.onLine;
    if (!offline) {
      void this.triggerSyncCycle();
    }
  }

  public destroyListeners(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('online', this.boundOnlineListener);
  }

  private async handleOnlineReconnection(): Promise<void> {
    await this.triggerSyncCycle();
  }

  /**
   * Fetch pending encounters from local IndexedDB/SQLite store and push to regional hub.
   */
  public async triggerSyncCycle(): Promise<number> {
    if (this.isSyncing) {
      return 0;
    }

    const browserOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const simulatedOffline = this.config.isOfflineFn ? this.config.isOfflineFn() : false;

    if (browserOffline || simulatedOffline) {
      return 0;
    }

    let totalSynced = 0;

    try {
      this.isSyncing = true;
      if (this.config.onSyncStart) {
        this.config.onSyncStart();
      }

      // 1. Retrieve pending encounter logs from local IndexedDB / SQLite cache
      const pendingEncounters = await this.fetchPendingEncountersLocally();

      if (!pendingEncounters || pendingEncounters.length === 0) {
        return 0;
      }

      // 2. Process atomic batches up to batchSize
      const batchSize = this.config.batchSize || 50;
      const baseUrl = this.config.hubApiUrl.replace(/\/$/, '');

      for (let i = 0; i < pendingEncounters.length; i += batchSize) {
        const batch = pendingEncounters.slice(i, i + batchSize);
        const payload = {
          device_id: this.config.deviceId,
          encounters: batch,
        };

        // 3. Transmit batch to regional hub endpoint
        const response = await fetch(`${baseUrl}/api/v1/encounters/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Hub sync server responded with status: ${response.status}`);
        }

        const result = await response.json();
        const syncedCount = typeof result.synced_count === 'number' ? result.synced_count : batch.length;
        const duplicateCount = typeof result.duplicate_count === 'number' ? result.duplicate_count : 0;

        // 4. Mark successfully transmitted records as 'synced' and log audit record
        const uploadedIds = batch.map((e) => e.encounter_id);
        await this.markEncountersAsSyncedLocally(uploadedIds, syncedCount, duplicateCount);
        totalSynced += syncedCount;
      }

      if (this.config.onSyncSuccess) {
        this.config.onSyncSuccess(totalSynced);
      }

      return totalSynced;
    } catch (error: any) {
      console.error('[MamaG Sync] Error during synchronization cycle:', error);
      await recordSyncFailureInSqlite(error?.message || 'Reconnection auto-sync failed').catch(() => {});
      if (this.config.onSyncError) {
        this.config.onSyncError(error);
      }
      return totalSynced;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Interface with local IndexedDB/SQLite storage layer to get pending records.
   */
  private async fetchPendingEncountersLocally(): Promise<ClinicalEncounterRow[]> {
    return fetchPendingEncountersFromSqlite();
  }

  /**
   * Update local storage records from 'pending' to 'synced' and persist audit row.
   */
  private async markEncountersAsSyncedLocally(
    encounterIds: string[],
    syncedCount: number,
    duplicateCount: number = 0
  ): Promise<void> {
    await markEncountersSyncedInSqlite(encounterIds, syncedCount, duplicateCount);
  }
}
